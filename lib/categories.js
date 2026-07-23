export const CATEGORY_CONFIG = {
  celebrity:          { color: '#cc0000', icon: '⭐', description: 'The hottest celebrity gossip, scandals, red carpet moments, and A-list news from around the world.' },
  hollywood:          { color: '#b45309', icon: '🎬', description: "Hollywood's biggest movies, box office hits, actor updates, and US film industry news." },
  bollywood:          { color: '#7c3aed', icon: '🎭', description: 'Bollywood stars, film reviews, actor news, and all the drama from the Indian film industry.' },
  'british-royals':   { color: '#1e3a5f', icon: '👑', description: 'The latest Royal Family news, palace drama, British royals gossip, and inside Buckingham Palace.' },
  'tv-shows':         { color: '#1d4ed8', icon: '📺', description: 'The latest on Netflix, HBO, streaming shows, reality TV, and your favorite series.' },
  'web-series':       { color: '#e11d48', icon: '🎞️', description: 'Indian and international web series — Netflix, Prime Video, Hotstar, Zee5, SonyLIV reviews, recaps, and news.' },
  music:              { color: '#047857', icon: '🎵', description: 'New album drops, concert tours, chart-toppers, and music industry news.' },
  movies:             { color: '#d97706', icon: '🎥', description: 'In-depth movie reviews, ratings, cast interviews, and the biggest films hitting theaters and streaming.' },
  'ending-explained': { color: '#0891b2', icon: '🔍', description: 'Confused by that ending? We break down the plot twists, symbolism, and hidden meanings of every major film.' },
  'where-to-watch':   { color: '#059669', icon: '📡', description: 'Find out exactly where to stream, rent, or buy the movies and shows everyone is talking about.' },
  relationships:      { color: '#be185d', icon: '💖', description: 'Celebrity couples, secret romances, breakups, weddings, and all the dating drama you crave.' },
  fashion:            { color: '#7e22ce', icon: '👗', description: 'Celebrity fashion, red carpet looks, style trends, and the latest designer news.' },
  'pop-culture':      { color: '#0e7490', icon: '🎯', description: 'Viral moments, trending topics, memes, and everything shaping pop culture today.' },
};

export function getCategoryConfig(slug) {
  return CATEGORY_CONFIG[slug] || { color: '#cc0000', icon: '📰', description: '' };
}

export const ALL_KNOWN_CATEGORIES = Object.keys(CATEGORY_CONFIG);
