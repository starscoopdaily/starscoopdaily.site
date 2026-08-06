/**
 * Post-publish social kit — generated from the article itself so no AI call
 * is needed. Matters after Claude Code access ends: the admin panel has to
 * produce these on its own, otherwise every publish needs a separate chat.
 */

export const PINTEREST_BOARDS = {
  'british-royals': 'British Royal Family News',
  celebrity: 'Celebrity Scandals & Drama',
  relationships: 'Celebrity Dating & Relationships',
  hollywood: 'Hollywood Gossip',
  movies: 'Hollywood Gossip',
  'ending-explained': 'Hollywood Gossip',
  'where-to-watch': 'Hollywood Gossip',
  'tv-shows': 'TV Show Updates',
  'web-series': 'TV Show Updates',
  music: 'Music & Pop Culture',
  'pop-culture': 'Music & Pop Culture',
  bollywood: 'Bollywood Celebrities',
  fashion: 'Celebrity Style & Fashion',
};

const CATEGORY_EMOJI = {
  celebrity: '📸', hollywood: '🎬', bollywood: '🎭', 'british-royals': '👑',
  'tv-shows': '📺', 'web-series': '🎞️', music: '🎵', movies: '🎥',
  'ending-explained': '🔍', 'where-to-watch': '📡', relationships: '💖',
  fashion: '👗', 'pop-culture': '🔥',
};

const articleUrl = (slug) => `https://www.starscoopdaily.site/article/${slug}`;

const hashtags = (tags, n) =>
  (tags || []).slice(0, n).map((t) => `#${String(t).replace(/[^a-zA-Z0-9]/g, '')}`).join(' ');

/** First sentence of the excerpt, used as the tweet's hook. */
function hook(excerpt, title) {
  const first = String(excerpt || '').split(/(?<=[.!?])\s/)[0]?.trim();
  if (first && first.length >= 20 && first.length <= 120) return first;
  return title;
}

export function buildTwitterPost({ title, slug, category, excerpt, tags }) {
  const emoji = CATEGORY_EMOJI[category] || '🚨';
  const url = articleUrl(slug);
  const ht = `${hashtags(tags, 3)} #Entertainment`.trim();

  // Twitter counts every URL as 23 chars regardless of real length.
  const budget = 280 - 23 - ht.length - 20;
  let line = hook(excerpt, title);
  if (line.length > budget) line = line.slice(0, Math.max(0, budget - 1)).trim() + '…';

  return `${emoji} ${line}\n\nFull story 👇\n${url}\n\n${ht}`;
}

export function buildPinterestCaption({ title, slug, category, excerpt, tags }) {
  const url = articleUrl(slug);
  const board = PINTEREST_BOARDS[category] || 'Hollywood Gossip';
  const ht = `${hashtags(tags, 7)} #StarScoopDaily`.trim();
  const pinTitle = title.length > 100 ? title.slice(0, 97).trim() + '…' : title;

  return [
    `⚠ Pinterest skews heavily female (roughly 70%+ of users) and is a planning`,
    `  and saving platform, not a news feed. Pins that get SAVED perform far`,
    `  better than pins that get clicked once. Lean into: style, relationships,`,
    `  what-to-watch lists, and "before you watch" guides.`,
    ``,
    `Title:`,
    pinTitle,
    ``,
    `Description:`,
    `${excerpt || ''}`,
    `Read the full story 👇 starscoopdaily.site`,
    ht,
    ``,
    `Link: ${url}`,
    `Board: ${board}`,
    `Alt Text: ${title}`,
    `Mark as AI-Modified: ON`,
  ].join('\n');
}

/**
 * Three-tweet thread. A single tweet gets one impression; a thread gets the
 * algorithm a reason to keep showing it, and gives the reply slot for the link
 * rather than spending characters on it in the hook.
 */
export function buildTwitterThread({ title, slug, category, excerpt, tags }) {
  const emoji = CATEGORY_EMOJI[category] || '🚨';
  const url = articleUrl(slug);
  const ht = hashtags(tags, 3);

  return [
    `${emoji} ${hook(excerpt, title)}\n\n${ht}\n\n🧵`,
    `What the piece covers:\n\n• ${(tags || []).slice(0, 3).join('\n• ')}\n\nPlus the part most coverage skips.`,
    `Full breakdown 👇\n${url}`,
  ];
}

export function buildSocialKit(article) {
  const a = {
    title: article.title,
    slug: article.slug,
    category: (article.category || '').toLowerCase().replace(/\s+/g, '-'),
    excerpt: article.metaDescription || article.excerpt,
    tags: article.tags,
  };
  return {
    url: articleUrl(a.slug),
    pinImage: `https://www.starscoopdaily.site/api/pin?slug=${a.slug}`,
    twitter: buildTwitterPost(a),
    thread: buildTwitterThread(a),
    pinterest: buildPinterestCaption(a),
    board: PINTEREST_BOARDS[a.category] || 'Hollywood Gossip',
  };
}
