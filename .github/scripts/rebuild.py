#!/usr/bin/env python3
import os, glob

BASE = 'https://hiragana.com.au'

def write_sitemap():
    urls = [
        ('/', 'weekly', '1.0'),
        ('/index.html', 'weekly', '0.9'),
        ('/privacy-policy.html', 'yearly', '0.3'),
        ('/terms.html', 'yearly', '0.3'),
        ('/blog/', 'weekly', '0.7'),
    ]
    posts = sorted(glob.glob('blog/posts/*.html'))
    for p in posts:
        if os.path.basename(p) == 'template.html':
            continue
        urls.append((f'/blog/posts/{os.path.basename(p)}', 'monthly', '0.5'))
    with open('sitemap.xml','w') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')
        for path, cf, pr in urls:
            f.write('  <url>\n')
            f.write(f'    <loc>{BASE}{path}</loc>\n')
            f.write(f'    <changefreq>{cf}</changefreq>\n')
            f.write(f'    <priority>{pr}</priority>\n')
            f.write('  </url>\n')
        f.write('</urlset>\n')

def write_feed():
    items = []
    for p in sorted(glob.glob('blog/posts/*.html')):
        if os.path.basename(p) == 'template.html':
            continue
        url = f'{BASE}/blog/posts/{os.path.basename(p)}'
        title = os.path.splitext(os.path.basename(p).replace('-', ' ').title())[0]
        items.append((title, url))
    with open('feed.xml','w') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
        f.write('<rss version="2.0">\n  <channel>\n')
        f.write('    <title>Kanabloom Blog</title>\n')
        f.write('    <link>https://hiragana.com.au/blog/</link>\n')
        f.write('    <description>Tips for learning Japanese, Hiragana & Katakana with Kanabloom.</description>\n')
        f.write('    <language>en-au</language>\n')
        for title, url in items:
            f.write('    <item>\n')
            f.write(f'      <title>{title}</title>\n')
            f.write(f'      <link>{url}</link>\n')
            f.write(f'      <guid>{url}</guid>\n')
            f.write('    </item>\n')
        f.write('  </channel>\n</rss>\n')

if __name__ == '__main__':
    write_sitemap()
    write_feed()


