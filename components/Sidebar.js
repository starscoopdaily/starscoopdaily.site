'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  { label: 'Celebrity', href: '/category/celebrity', icon: '⭐' },
  { label: 'Hollywood', href: '/category/hollywood', icon: '🎬' },
  { label: 'Bollywood', href: '/category/bollywood', icon: '🎭' },
  { label: '👑 British Royals', href: '/category/british-royals', icon: '' },
  { label: 'TV & Streaming', href: '/category/tv-shows', icon: '📺' },
  { label: 'Music', href: '/category/music', icon: '🎵' },
  { label: 'Movies', href: '/category/movies', icon: '🎥' },
  { label: 'Ending Explained', href: '/category/ending-explained', icon: '🔍' },
  { label: 'Where to Watch', href: '/category/where-to-watch', icon: '📡' },
  { label: 'Relationships', href: '/category/relationships', icon: '💖' },
  { label: 'Fashion', href: '/category/fashion', icon: '👗' },
  { label: 'Pop Culture', href: '/category/pop-culture', icon: '🎯' },
];

export default function Sidebar({ adContent = null }) {
  const [trending, setTrending] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  useEffect(() => {
    fetch('/api/articles')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTrending(data.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  const handleNewsletter = (e) => {
    e.preventDefault();
    setNewsletterDone(true);
  };

  return (
    <aside className="space-y-6">
      {/* Trending Now */}
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-[#cc0000] px-4 py-3">
          <h2 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-2">
            <span>🔥</span> Trending Now
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {trending.length === 0 ? (
            <div className="p-4 text-sm text-gray-400">Loading trending...</div>
          ) : (
            trending.map((article, idx) => (
              <Link
                key={article.slug}
                href={`/article/${article.slug}`}
                className="flex gap-3 p-3 hover:bg-gray-50 transition-colors group"
              >
                <span className="flex-shrink-0 w-7 h-7 bg-[#cc0000] text-white text-xs font-black rounded-full flex items-center justify-center">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-[#cc0000] transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </p>
                  <span className="text-xs text-gray-400 mt-0.5 block">{article.category}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Sidebar Ad */}
      {adContent}

      {/* Categories */}
      <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
        <div className="bg-gray-900 px-4 py-3">
          <h2 className="text-white font-black text-sm uppercase tracking-wider">Browse Topics</h2>
        </div>
        <div className="p-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="flex items-center gap-2 px-3 py-2.5 rounded hover:bg-red-50 hover:text-[#cc0000] text-gray-700 text-sm font-medium transition-colors group"
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <svg
                className="w-4 h-4 ml-auto text-gray-300 group-hover:text-[#cc0000] transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Newsletter Mini */}
      <div className="bg-gradient-to-br from-[#cc0000] to-[#880000] rounded-lg p-5 text-white">
        <h3 className="font-black text-lg mb-1">Stay in the Loop</h3>
        <p className="text-red-200 text-xs mb-4">Get the latest scoops in your inbox daily.</p>
        {newsletterDone ? (
          <p className="text-white font-semibold text-sm">🎉 Thanks for subscribing!</p>
        ) : (
          <form onSubmit={handleNewsletter} className="space-y-2">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full px-3 py-2 rounded text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="w-full bg-white text-[#cc0000] font-bold py-2 rounded text-sm hover:bg-gray-100 transition-colors"
            >
              Subscribe Free
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
