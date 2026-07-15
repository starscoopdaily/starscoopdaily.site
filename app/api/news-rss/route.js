import { NextResponse } from 'next/server';

// Celebrity gossip & entertainment RSS feeds — niche-matched for StarScoop Daily
const RSS_FEEDS = [
  // US gossip heavyweights
  'https://www.tmz.com/rss.xml',
  'https://pagesix.com/feed/',
  'https://radaronline.com/feed/',
  // Entertainment / People
  'https://people.com/feed/',
  'https://www.eonline.com/syndication/feeds/rssfeeds/topstories.xml',
  // UK tabs — Royal Family + British celebs
  'https://www.dailymail.co.uk/tvshowbiz/index.rss',
  'https://www.thesun.co.uk/tvandshowbiz/feed/',
  'https://www.mirror.co.uk/3am/celebrity-news/rss.xml',
  // Bollywood
  'https://news.google.com/rss/search?q=bollywood+celebrity+scandal+affair&hl=en-IN&gl=IN&ceid=IN:en',
  // Targeted Google News niche searches
  'https://news.google.com/rss/search?q=celebrity+affair+scandal+cheating&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=celebrity+dating+breakup+drama+romance&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=celebrity+exposed+caught+leaked+shocking&hl=en-US&gl=US&ceid=US:en',
  'https://news.google.com/rss/search?q=royal+family+drama+scandal&hl=en-GB&gl=GB&ceid=GB:en',
];

// Keywords that signal our niche — items containing these bubble up
const NICHE_KEYWORDS = [
  'affair', 'scandal', 'cheating', 'cheat', 'drama', 'dating', 'romance', 'breakup', 'break up',
  'divorce', 'split', 'exposed', 'caught', 'leaked', 'leaked photos', 'secret', 'shocking',
  'pregnant', 'baby', 'engaged', 'wedding', 'feud', 'fight', 'fight back', 'clap back',
  'hookup', 'fling', 'spotted together', 'flirting', 'kiss', 'steamy', 'hot', 'sexy',
  'controversy', 'fired', 'arrested', 'sued', 'revenge', 'shade', 'diss', 'beef',
  'royal', 'palace', 'meghan', 'harry', 'kate', 'william', 'charles', 'camilla',
];

function scoreItem(title) {
  const lower = title.toLowerCase();
  let score = 0;
  for (const kw of NICHE_KEYWORDS) {
    if (lower.includes(kw)) score += 2;
  }
  return score;
}

function parseRSSItem(itemText) {
  const title =
    itemText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
    itemText.match(/<title>(.*?)<\/title>/)?.[1] ||
    '';
  const link =
    itemText.match(/<link>(.*?)<\/link>/)?.[1] ||
    itemText.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1] ||
    '';
  const pubDate = itemText.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
  const source =
    itemText.match(/<source[^>]*>(.*?)<\/source>/)?.[1] ||
    itemText.match(/<dc:creator><!\[CDATA\[(.*?)\]\]><\/dc:creator>/)?.[1] ||
    '';

  return {
    title: title
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .trim(),
    link,
    pubDate,
    source,
  };
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map((url) =>
        fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; StarScoopDaily/1.0)',
            Accept: 'application/rss+xml, application/xml, text/xml, */*',
          },
          next: { revalidate: 300 },
        }).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.text();
        })
      )
    );

    const items = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status !== 'fulfilled') continue;
      const xml = result.value;
      const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
      const feedDomain = extractDomain(RSS_FEEDS[i]);
      for (const itemXml of itemMatches.slice(0, 15)) {
        const parsed = parseRSSItem(itemXml);
        if (!parsed.title || parsed.title.length < 10) continue;
        items.push({
          ...parsed,
          source: parsed.source || feedDomain,
          score: scoreItem(parsed.title),
        });
      }
    }

    // Deduplicate by normalised title
    const seen = new Set();
    const unique = items.filter((item) => {
      const key = item.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort: high-score niche items first, then everything else
    unique.sort((a, b) => b.score - a.score);

    return NextResponse.json({ items: unique.slice(0, 30) });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
