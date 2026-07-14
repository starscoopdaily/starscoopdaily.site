'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Celebrity', href: '/category/celebrity' },
  { label: 'Hollywood', href: '/category/hollywood' },
  { label: '👑 Royals', href: '/category/british-royals' },
  { label: 'Bollywood', href: '/category/bollywood' },
  { label: 'TV Shows', href: '/category/tv-shows' },
  { label: 'Music', href: '/category/music' },
  { label: 'Fashion', href: '/category/fashion' },
  { label: 'Pop Culture', href: '/category/pop-culture' },
  { label: '🤫 Gossip', href: '/category/gossip' },
  { label: '🔥 Scandals', href: '/category/scandals' },
  { label: '💋 Dating', href: '/category/dating' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [ticker, setTicker] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch('/api/site-config')
      .then((r) => r.json())
      .then((data) => {
        if (data?.breakingTicker?.length) setTicker(data.breakingTicker);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tickerText = ticker.length
    ? ticker.join('   •   ')
    : 'Welcome to StarScoop Daily — Your #1 Source for Celebrity News';

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
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white hover:bg-white/20 px-2 py-1 rounded text-[14px] font-semibold transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Search + Mobile Toggle */}
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
          <div className="lg:hidden bg-[#aa0000] border-t border-red-800 mobile-menu">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-white hover:bg-white/20 px-3 py-2.5 rounded text-sm font-semibold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="text-red-200 hover:text-white px-3 py-2.5 rounded text-sm font-medium mt-1 transition-colors"
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
