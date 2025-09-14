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
TOPICS_JSON = Path(__file__).resolve().parent / 'topics.json'

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\-\s]", '', text)
    text = re.sub(r"\s+", '-', text).strip('-')
    return text[:80]

def pick_topic():
    """Pick a topic using trending sources first, fallback to topics.json rotation."""
    existing = load_existing_posts()
    existing_titles = set(p.get('title','').lower() for p in existing)
    candidates = fetch_trending_candidates()
    if not candidates:
        candidates = []
    # merge with configured topics
    configured = json.loads(TOPICS_JSON.read_text()) if TOPICS_JSON.exists() else []
    for c in configured:
        # normalize to unified dict
        if isinstance(c, dict):
            candidates.append({'topic': c.get('topic'), 'category': c.get('category','Learning Tips'), 'keywords': c.get('keywords','kana, japanese')})
        else:
            candidates.append({'topic': str(c), 'category': 'Learning Tips', 'keywords': 'kana, japanese'})

    # filter duplicates vs existing
    def is_duplicate(t):
        for et in existing_titles:
            if similarity(t.lower(), et) > 0.6:
                return True
        return False

    filtered = [c for c in candidates if c.get('topic') and not is_duplicate(c['topic'])]
    if filtered:
        return filtered[0]
    # fallback to rotation
    topics = configured if configured else [{'topic':'Hiragana stroke order guide','category':'Writing Tips','keywords':'hiragana, stroke order'}]
    idx = datetime.date.today().toordinal() % len(topics)
    t = topics[idx]
    return t if isinstance(t, dict) else {'topic': str(t), 'category': 'Learning Tips', 'keywords': 'kana, japanese'}

def load_existing_posts():
    if POSTS_JSON.exists():
        try:
            return json.loads(POSTS_JSON.read_text())
        except Exception:
            return []
    return []

def similarity(a: str, b: str) -> float:
    """Jaccard similarity on word sets."""
    ta = set(re.findall(r"[a-zA-Z']+", a.lower()))
    tb = set(re.findall(r"[a-zA-Z']+", b.lower()))
    if not ta or not tb:
        return 0.0
    inter = len(ta & tb)
    union = len(ta | tb)
    return inter / union

def fetch_trending_candidates():
    """Optionally fetch trending titles from public feeds. Best-effort; safe fallbacks."""
    import requests
    cands = []
    headers = {'User-Agent': 'kanabloom-bot/1.0 (+https://hiraganaflashcards.com.au)'}
    # Tofugu feed (Japanese learning blog)
    try:
        r = requests.get('https://www.tofugu.com/feeds/all.xml', headers=headers, timeout=10)
        if r.ok:
            import xml.etree.ElementTree as ET
            root = ET.fromstring(r.text)
            for item in root.findall('.//item')[:5]:
                title = (item.findtext('title') or '').strip()
                if title:
                    cands.append({'topic': f"What learners can take from: {title}", 'category': 'Trends', 'keywords': 'japanese learning, trends'})
    except Exception:
        pass
    # Reddit r/LearnJapanese (top weekly)
    try:
        r = requests.get('https://www.reddit.com/r/LearnJapanese/top/.json?t=week&limit=10', headers=headers, timeout=10)
        if r.ok:
            data = r.json()
            for child in data.get('data',{}).get('children',[])[:5]:
                t = child.get('data',{}).get('title','').strip()
                if t:
                    cands.append({'topic': f"Community Q&A: {t}", 'category': 'Community', 'keywords': 'learn japanese, community'})
    except Exception:
        pass
    # Seasonal awareness based on month
    month = datetime.date.today().month
    seasonal = []
    if month in (11,12,1):
        seasonal.append({'topic': 'New Year Japanese goals: a 30-day kana plan', 'category':'Study Habits','keywords':'new year goals, kana'})
    if month in (3,4):
        seasonal.append({'topic': 'Spring refresh: cherry blossom-themed kana mnemonics', 'category':'Learning Techniques','keywords':'mnemonics, spring'})
    if month in (6,7,12):
        seasonal.append({'topic': 'Prep for JLPT: Kana accuracy and speed drills', 'category':'Study Tips','keywords':'jlpt, drills'})
    cands = seasonal + cands
    # de-duplicate by topic text
    seen = set()
    uniq = []
    for c in cands:
        key = c['topic'].lower()
        if key not in seen:
            seen.add(key)
            uniq.append(c)
    return uniq

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
    try:
        r = requests.post(url, headers=headers, json=data, timeout=60)
        r.raise_for_status()
        return r.json()['choices'][0]['message']['content']
    except Exception as e:
        print(f"OpenAI text generation failed: {e}")
        return ''

def call_openai_image(prompt: str, out_path: Path):
    import requests
    key = os.environ.get('OPENAI_API_KEY')
    if not key:
        print('OPENAI_API_KEY is not set', file=sys.stderr)
        sys.exit(1)
    # Generate image using the correct generations endpoint
    url = 'https://api.openai.com/v1/images/generations'
    headers = { 'Authorization': f'Bearer {key}', 'Content-Type': 'application/json' }
    style = 'cute kawaii illustration, soft pastel palette, clean vector, minimal background, relevant to Japanese kana learning, no text overlays, friendly character, cherry blossom accents'
    data = {
        'model': 'gpt-image-1',
        'prompt': f"{prompt}. {style}.",
        'size': '1200x630',
        'n': 1,
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
    # remove any existing with same id, keep only one
    posts = [p for p in posts if p.get('id') != meta['id']]
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
    # Insert internal links and CTA before replacing loading placeholder
    related = build_related_links(meta)
    internal_links = '<h2>Keep Learning</h2>' + related
    cta = (
        '<p><a class="download-btn-black" href="https://apps.apple.com/au/app/kanabloom/id6743828727" target="_blank" rel="noopener">Download Kanabloom Flashcards</a></p>'
    )
    enriched = content_html + internal_links + cta
    # First try direct placeholder replacement
    before = html
    html = html.replace('<!-- SERVER_INJECTED_CONTENT -->', enriched)
    html = html.replace('<div class="loading">Loading blog post...</div>', enriched)
    # If not replaced, inject robustly by replacing the inner HTML of the content container
    if html == before:
        pattern = r'(<div class="blog-post-content-full"[^>]*>)([\s\S]*?)(</div>)'
        html = re.sub(pattern, r"\1" + enriched + r"\3", html, count=1)
    (POSTS_DIR / f"{meta['id']}.html").write_text(html)

def build_related_links(meta: dict) -> str:
    posts = load_existing_posts()
    # score by category match and title similarity
    scored = []
    for p in posts:
        if p.get('id') == meta['id']:
            continue
        score = 0
        if p.get('category') == meta.get('category'):
            score += 1
        score += similarity(p.get('title',''), meta.get('title',''))
        scored.append((score, p))
    scored.sort(key=lambda x: x[0], reverse=True)
    items = scored[:3]
    if not items:
        return ''
    html = '<ul>' + ''.join(f'<li><a href="/blog/posts/{p[1]["id"]}.html">{p[1]["title"]}</a></li>' for p in items) + '</ul>'
    return html

def markdown_to_basic_html(md: str) -> str:
    # minimal markdown conversion compatible with our template
    html = md.strip()
    if not html:
        return ''
    html = re.sub(r'^# (.*)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    # Lists (basic) - convert lines starting with - or * to <li>
    lines = []
    in_ul = False
    for line in html.splitlines():
        if re.match(r'^\s*[-*]\s+.+', line):
            if not in_ul:
                lines.append('<ul>')
                in_ul = True
            item = re.sub(r'^\s*[-*]\s+(.*)$', r'<li>\1</li>', line)
            lines.append(item)
        else:
            if in_ul:
                lines.append('</ul>')
                in_ul = False
            lines.append(line)
    if in_ul:
        lines.append('</ul>')
    html = '\n'.join(lines)
    # Paragraphs for plain lines
    html = '\n'.join(
        (f'<p>{line}</p>' if (line.strip() and not re.match(r'^<(/)?(h1|h2|h3|ul|li|img|p)>', line.strip())) else line)
        for line in html.splitlines()
    )
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
    topic_entry = pick_topic()
    topic = topic_entry['topic'] if isinstance(topic_entry, dict) else str(topic_entry)
    today = datetime.date.today().strftime('%Y-%m-%d')
    prompt = (
        "You are a senior SEO content writer. Create a 1000-1300 word ORIGINAL post for Kanabloom's blog.\n"
        f"Topic focus: {topic}.\n"
        "Requirements: include H2/H3 headings, an intro, skimmable paragraphs (max 3-4 sentences each), bullet lists, and a short conclusion.\n"
        "Avoid generic fluff. Provide practical steps, examples, and a short practice section with kana-focused exercises.\n"
        "Write for beginners learning Japanese kana (Hiragana/Katakana). Use simple English.\n"
        "Add 3-5 suggested internal link anchor texts (do not insert actual links).\n"
        "End with a one-line CTA to download Kanabloom with the text 'Download Kanabloom on iOS' (no URL).\n"
        f"Primary keywords: {topic_entry.get('keywords','hiragana, katakana, japanese')}."
    )
    md = call_openai_text(prompt)
    if not md.strip():
        # Fallback content if API returns empty
        md = f"# {topic}\n\nHere is a practical guide to {topic.lower()} for beginners.\n\n- What it is and why it matters\n- Step-by-step approach\n- Common mistakes to avoid\n- Quick practice ideas\n\nDownload Kanabloom to practice kana effectively."
    # derive title from first H1 or fallback
    m = re.search(r'^#\s+(.+)$', md, flags=re.MULTILINE)
    title = m.group(1).strip() if m else topic.title()
    base_slug = slugify(title)
    slug = base_slug
    # Ensure uniqueness; if exists, add date suffix
    i = 0
    while (POSTS_DIR / f'{slug}.html').exists() or (POSTS_DIR / f'{slug}.md').exists():
        i += 1
        slug = f"{base_slug}-{today}" if i == 1 else f"{base_slug}-{today}-{i}"
    hero_prompt = f"Blog hero for article '{title}' about Japanese kana learning, cute and relevant illustration"
    image_path = IMAGES_DIR / f'{slug}.png'
    try:
        call_openai_image(hero_prompt, image_path)
    except Exception as e:
        print(f"Image generation failed: {e}")
    write_markdown(slug, md)
    meta = {
        'id': slug,
        'title': title,
        'description': f'Practical tips for {topic.lower()}.',
        'date': today,
        'category': topic_entry.get('category','Learning Tips'),
        'keywords': topic_entry.get('keywords','hiragana, katakana, japanese, flashcards, learning'),
        'image': f'../images/blog/{slug}.png'
    }
    if not image_path.exists():
        # Fallback to an existing image so the card doesn't 404
        meta['image'] = '../images/blog/hiragana-tips.png'
    # Generate an excerpt from markdown
    excerpt = re.sub(r'[#>*`\-\[\]]', '', md)
    excerpt = ' '.join(excerpt.split())[:220]
    meta['excerpt'] = excerpt if excerpt else meta['description']
    append_posts_json(meta)
    html = markdown_to_basic_html(md)
    generate_html_from_template(meta, html)
    update_sitemap_and_feed(slug, title)
    print(f'Generated post: {slug}')

if __name__ == '__main__':
    main()


