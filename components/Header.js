'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Celebrity', href: '/category/celebrity' },
  { label: 'Hollywood', href: '/category/hollywood' },
  { label: 'Bollywood', href: '/category/bollywood' },
  { label: '👑 Royals', href: '/category/british-royals' },
  { label: 'TV & Streaming', href: '/category/tv-shows' },
  { label: 'Music', href: '/category/music' },
  {
    label: '🎥 Movies', href: '/category/movies',
    children: [
      { label: '🎥 Movie Reviews', href: '/category/movies' },
      { label: '🔍 Ending Explained', href: '/category/ending-explained' },
      { label: '📡 Where to Watch', href: '/category/where-to-watch' },
    ],
  },
  { label: 'Fashion', href: '/category/fashion' },
  { label: 'Pop Culture', href: '/category/pop-culture' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ticker, setTicker] = useState([]);

  useEffect(() => {
    fetch('/api/site-config')
      .then((r) => r.json())
      .then((data) => {
        if (data?.breakingTicker?.length) setTicker(data.breakingTicker);
      })
      .catch(() => {});
  }, []);

  const tickerText = ticker.length
    ? ticker.join('   •   ')
    : 'Welcome to StarScoop Daily — Your #1 Source for Celebrity News & Entertainment';

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Breaking Ticker */}
      <div className="bg-black text-white py-1.5 overflow-hidden">
        <div className="flex items-center">
          <span className="flex-shrink-0 bg-[#cc0000] text-white text-xs font-black uppercase px-3 py-1 mr-3 pulse-red tracking-wider">
            BREAKING
          </span>
          <div className="ticker-wrapper flex-1 min-w-0">
            <span className="ticker-content text-xs sm:text-sm font-medium">
              {tickerText}
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-[#cc0000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group">
              <div className="flex items-center gap-1.5">
                <div className="bg-white text-[#cc0000] font-black text-sm px-1.5 py-0.5 rounded leading-none">
                  ★
                </div>
                <div>
                  <div className="text-white font-black text-base sm:text-lg leading-none tracking-tight">
                    StarScoop
                  </div>
                  <div className="text-red-200 text-[10px] font-semibold tracking-widest uppercase">
                    Daily
                  </div>
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative group">
                    <Link
                      href={link.href}
                      className="flex items-center gap-0.5 text-white hover:bg-white/20 px-2 py-1 rounded text-[14px] font-semibold transition-colors whitespace-nowrap"
                    >
                      {link.label}
                      <svg className="w-3 h-3 opacity-80 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </Link>
                    {/* Dropdown */}
                    <div className="absolute left-0 top-full pt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                      <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-[#cc0000] font-medium transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-white hover:bg-white/20 px-2 py-1 rounded text-[14px] font-semibold transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Admin + Mobile Toggle */}
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="hidden sm:block text-white/80 hover:text-white text-xs font-medium transition-colors"
              >
                Admin
              </Link>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden text-white p-2 rounded hover:bg-white/20 transition-colors"
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-[#aa0000] border-t border-red-800">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-0.5">
              {NAV_LINKS.map((link) => (
                <div key={link.href || link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-white hover:bg-white/20 px-3 py-2.5 rounded text-sm font-semibold transition-colors flex items-center justify-between"
                  >
                    {link.label}
                  </Link>
                  {link.children && (
                    <div className="ml-4 mb-1 border-l-2 border-red-700 pl-3 space-y-0.5">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMenuOpen(false)}
                          className="block text-red-200 hover:text-white px-2 py-1.5 rounded text-xs font-medium transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="text-red-200 hover:text-white px-3 py-2.5 rounded text-sm font-medium mt-1 transition-colors border-t border-red-700 pt-3"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
