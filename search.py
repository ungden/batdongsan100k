import urllib.request
import urllib.parse
import re
import sys
import html

query = sys.argv[1]
url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query)
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    resp = urllib.request.urlopen(req).read().decode('utf-8')
    # Find result snippets
    results = re.findall(r'<a class="result__snippet[^>]*href="([^"]+)"[^>]*>(.*?)</a>', resp, re.IGNORECASE | re.DOTALL)
    if not results:
        results = re.findall(r'<a class="result__url" href="([^"]+)">([^<]+)</a>', resp, re.IGNORECASE)
        
    for link, text in results[:5]:
        link = html.unescape(link)
        if link.startswith('//'):
            link = 'https:' + link
        print(f"{link}")
except Exception as e:
    print(f"Error: {e}")
