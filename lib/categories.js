export const CATEGORY_CONFIG = {
  celebrity:     { color: '#cc0000', icon: '⭐', description: 'The hottest celebrity gossip, red carpet moments, and A-list news from around the world.' },
  hollywood:     { color: '#b45309', icon: '🎬', description: "Hollywood's biggest movies, box office hits, actor updates, and film industry news." },
  bollywood:     { color: '#7c3aed', icon: '🎭', description: 'Bollywood gossip, film reviews, actor news, and all the drama from the Indian film industry.' },
  'tv-shows':    { color: '#1d4ed8', icon: '📺', description: 'The latest on Netflix, HBO, streaming shows, reality TV, and your favorite series.' },
  music:         { color: '#047857', icon: '🎵', description: 'New album drops, concert tours, chart-toppers, and music industry gossip.' },
  relationships: { color: '#be185d', icon: '💖', description: 'Celebrity couples, breakups, weddings, and all the romance news you crave.' },
  sports:        { color: '#c2410c', icon: '🏆', description: 'Celebrity athletes, sports drama, scandals, and off-field stories.' },
  fashion:       { color: '#7e22ce', icon: '👗', description: 'Celebrity fashion, red carpet looks, style trends, and the latest designer news.' },
  fitness:       { color: '#15803d', icon: '💪', description: 'Celebrity fitness routines, wellness trends, health news, and body transformations.' },
  'pop-culture': { color: '#0e7490', icon: '🎯', description: 'Viral moments, trending topics, memes, and everything shaping pop culture today.' },
  gossip:        { color: '#db2777', icon: '🤫', description: 'The juiciest celebrity secrets, whispers, and insider stories you won\'t find anywhere else.' },
  scandals:      { color: '#dc2626', icon: '🔥', description: 'Celebrity scandals, controversies, exposed secrets, and the drama keeping Hollywood talking.' },
  dating:        { color: '#f472b6', icon: '💋', description: 'Celebrity dating rumors, new couples, secret romances, breakups, and who\'s spotted with who.' },
  'british-royals': { color: '#1e3a5f', icon: '👑', description: 'The latest Royal Family news, palace drama, British royals gossip, and inside Buckingham Palace.' },
};

export function getCategoryConfig(slug) {
  return CATEGORY_CONFIG[slug] || { color: '#cc0000', icon: '📰', description: '' };
}

export const ALL_KNOWN_CATEGORIES = Object.keys(CATEGORY_CONFIG);
