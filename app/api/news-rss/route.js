import { NextResponse } from 'next/server';

const RSS_FEEDS = [
  'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=bollywood+celebrity&hl=en-IN&gl=IN&ceid=IN:en',
];

function parseRSSItem(itemText) {
  const title = itemText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
    itemText.match(/<title>(.*?)<\/title>/)?.[1] || '';
  const link = itemText.match(/<link>(.*?)<\/link>/)?.[1] || '';
  const pubDate = itemText.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
  const source = itemText.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || '';

  return {
    title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim(),
    link,
    pubDate,
    source,
  };
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map((url) =>
        fetch(url, {
          headers: { 'User-Agent': 'StarScoopDaily/1.0' },
          next: { revalidate: 300 },
        }).then((r) => r.text())
      )
    );

    const items = [];
    for (const result of results) {
      if (result.status !== 'fulfilled') continue;
      const xml = result.value;
      const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
      for (const itemXml of itemMatches.slice(0, 12)) {
        const parsed = parseRSSItem(itemXml);
        if (parsed.title) items.push(parsed);
      }
    }

    // Deduplicate by title
    const seen = new Set();
    const unique = items.filter((item) => {
      if (seen.has(item.title)) return false;
      seen.add(item.title);
      return true;
    });

    return NextResponse.json({ items: unique.slice(0, 20) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
