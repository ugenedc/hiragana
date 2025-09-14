#!/usr/bin/env python3
import os, json, re, base64, sys, datetime
from pathlib import Path

"""
Auto-generate a blog post and hero image using OpenAI APIs.
Requires env var OPENAI_API_KEY. Writes:
- blog/posts/<slug>.md and <slug>.html (via template replacement)
- images/blog/<slug>.png (hero image)
- blog/posts.json (append new post metadata)
Also updates sitemap.xml and feed.xml minimally.
"""

ROOT = Path(__file__).resolve().parents[1]
POSTS_DIR = ROOT / 'blog' / 'posts'
IMAGES_DIR = ROOT / 'images' / 'blog'
POSTS_JSON = ROOT / 'blog' / 'posts.json'
TEMPLATE = POSTS_DIR / 'template.html'
SITEMAP = ROOT / 'sitemap.xml'
FEED = ROOT / 'feed.xml'

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\-\s]", '', text)
    text = re.sub(r"\s+", '-', text).strip('-')
    return text[:80]

def pick_topic():
    topics = [
        'Hiragana stroke order guide',
        'Katakana lookalikes and how to tell them apart',
        'Beginner Japanese reading drills with kana only',
        'Spaced repetition for kana mastery',
        'Common hiragana mistakes and fixes',
        'Katakana loanwords beginners should learn first',
        'Daily 15-minute kana study plan',
        'Mnemonic techniques for kana retention'
    ]
    # simple rotation by date
    idx = datetime.date.today().toordinal() % len(topics)
    return topics[idx]

def call_openai_text(prompt: str) -> str:
    import requests
    key = os.environ.get('OPENAI_API_KEY')
    if not key:
        print('OPENAI_API_KEY is not set', file=sys.stderr)
        sys.exit(1)
    url = 'https://api.openai.com/v1/chat/completions'
    headers = { 'Authorization': f'Bearer {key}', 'Content-Type': 'application/json' }
    data = {
        'model': 'gpt-4o-mini',
        'messages': [
            { 'role': 'system', 'content': 'You are an SEO copywriter for a Japanese learning app blog. Write helpful, original, non-plagiarized content. Use headings, short paragraphs, and include a brief CTA to download Kanabloom.' },
            { 'role': 'user', 'content': prompt }
        ],
        'temperature': 0.7
    }
    r = requests.post(url, headers=headers, json=data, timeout=60)
    r.raise_for_status()
    return r.json()['choices'][0]['message']['content']

def call_openai_image(prompt: str, out_path: Path):
    import requests
    key = os.environ.get('OPENAI_API_KEY')
    if not key:
        print('OPENAI_API_KEY is not set', file=sys.stderr)
        sys.exit(1)
    url = 'https://api.openai.com/v1/images'
    headers = { 'Authorization': f'Bearer {key}', 'Content-Type': 'application/json' }
    data = {
        'model': 'gpt-image-1',
        'prompt': prompt + ' minimal, clean, educational app aesthetic, soft pink accents, 1200x630',
        'size': '1200x630',
        'response_format': 'b64_json'
    }
    r = requests.post(url, headers=headers, json=data, timeout=60)
    r.raise_for_status()
    b64 = r.json()['data'][0]['b64_json']
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    with open(out_path, 'wb') as f:
        f.write(base64.b64decode(b64))

def append_posts_json(meta: dict):
    posts = []
    if POSTS_JSON.exists():
        posts = json.loads(POSTS_JSON.read_text())
    posts = [p for p in posts if p['id'] != meta['id']]
    posts.append(meta)
    POSTS_JSON.write_text(json.dumps(posts, ensure_ascii=False, indent=2))

def write_markdown(slug: str, markdown: str):
    POSTS_DIR.mkdir(parents=True, exist_ok=True)
    (POSTS_DIR / f'{slug}.md').write_text(markdown)

def generate_html_from_template(meta: dict, content_html: str):
    tpl = TEMPLATE.read_text()
    html = (tpl
        .replace('[POST_TITLE]', meta['title'])
        .replace('[POST_DESCRIPTION]', meta['description'])
        .replace('[POST_KEYWORDS]', meta.get('keywords',''))
        .replace('[POST_IMAGE]', meta['image'])
        .replace('[POST_ID]', meta['id'])
        .replace('[POST_DATE]', datetime.datetime.strptime(meta['date'], '%Y-%m-%d').strftime('%B %d, %Y'))
        .replace('[POST_CATEGORY]', meta['category'])
    )
    html = html.replace('<div class="loading">Loading blog post...</div>', content_html)
    (POSTS_DIR / f"{meta['id']}.html").write_text(html)

def markdown_to_basic_html(md: str) -> str:
    # minimal markdown conversion compatible with our template
    html = md
    html = re.sub(r'^# (.*)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    html = '\n'.join(f'<p>{line}</p>' if not re.match(r'^<h[1-3]>', line) and line.strip() else line for line in html.splitlines())
    return html

def update_sitemap_and_feed(slug: str, title: str):
    # Append to sitemap.xml if exists
    if SITEMAP.exists():
        sm = SITEMAP.read_text()
        entry = f"  <url>\n    <loc>https://hiraganaflashcards.com.au/blog/posts/{slug}.html</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n"
        if entry not in sm:
            sm = sm.replace('</urlset>', entry + '</urlset>')
            SITEMAP.write_text(sm)
    # Append to feed.xml (simple)
    if FEED.exists():
        fd = FEED.read_text()
        item = (
            '    <item>\n'
            f'      <title>{title}</title>\n'
            f'      <link>https://hiraganaflashcards.com.au/blog/posts/{slug}.html</link>\n'
            f'      <guid>https://hiraganaflashcards.com.au/blog/posts/{slug}.html</guid>\n'
            '    </item>\n'
        )
        fd = fd.replace('  </channel>\n</rss>', item + '  </channel>\n</rss>')
        FEED.write_text(fd)

def main():
    topic = pick_topic()
    today = datetime.date.today().strftime('%Y-%m-%d')
    prompt = f"Write a 900-1200 word SEO blog post about: {topic}. Include headings, short paragraphs, examples, and a small CTA to download the Kanabloom iOS app (with link https://apps.apple.com/au/app/kanabloom/id6743828727). Target beginners learning Japanese kana."
    md = call_openai_text(prompt)
    # derive title from first H1 or fallback
    m = re.search(r'^#\s+(.+)$', md, flags=re.MULTILINE)
    title = m.group(1).strip() if m else topic.title()
    slug = slugify(title)
    hero_prompt = f"Blog hero for article '{title}' about Japanese kana learning."
    image_path = IMAGES_DIR / f'{slug}.png'
    call_openai_image(hero_prompt, image_path)
    write_markdown(slug, md)
    meta = {
        'id': slug,
        'title': title,
        'description': f'Practical tips for {topic.lower()}.',
        'date': today,
        'category': 'Learning Tips',
        'keywords': 'hiragana, katakana, japanese, flashcards, learning',
        'image': f'../images/blog/{slug}.png'
    }
    append_posts_json(meta)
    html = markdown_to_basic_html(md)
    generate_html_from_template(meta, html)
    update_sitemap_and_feed(slug, title)
    print(f'Generated post: {slug}')

if __name__ == '__main__':
    main()


