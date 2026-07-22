'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroCarousel({ articles }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [portraits, setPortraits] = useState(() => new Array(articles.length).fill(true));
  const touchStartX = useRef(null);
  const total = articles.length;

  const markOrientation = (i, imgEl) => {
    if (!imgEl) return;
    const isPortrait = imgEl.naturalHeight > imgEl.naturalWidth;
    setPortraits((prev) => {
      if (prev[i] === isPortrait) return prev;
      const next = [...prev];
      next[i] = isPortrait;
      return next;
    });
  };

  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next, total]);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  if (!articles.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
      <div
        className="relative rounded-xl overflow-hidden h-64 sm:h-[26rem] lg:h-[30rem] bg-gray-900 shadow-xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {articles.map((article, i) => (
          <div
            key={article.slug}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0, pointerEvents: i === current ? 'auto' : 'none' }}
          >
            <Link href={`/article/${article.slug}`} className="group block w-full h-full">
              {article.image && (
                <>
                  {/* Blur backdrop — always shown, fills dead space for portrait images */}
                  <Image
                    src={article.image}
                    alt=""
                    fill
                    aria-hidden="true"
                    className="object-cover scale-110 blur-2xl brightness-90 opacity-80"
                    priority={i === 0}
                    sizes="100vw"
                  />
                  {/* Main image — contain for portrait, cover for landscape */}
                  <Image
                    src={article.image}
                    alt={article.imageAlt || article.title}
                    fill
                    className={`z-10 transition-transform duration-700 group-hover:scale-105 ${portraits[i] ? 'object-contain' : 'object-cover'}`}
                    priority={i === 0}
                    sizes="100vw"
                    onLoad={(e) => markOrientation(i, e.target)}
                  />
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent z-20" />

              {/* Badges */}
              <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-30 flex items-center gap-2">
                {i === 0 && (
                  <span style={{ background: '#cc0000', color: '#fff', fontWeight: 700, padding: '3px 10px', borderRadius: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Featured
                  </span>
                )}
                {article.category && (
                  <span style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', fontWeight: 700, padding: '3px 10px', borderRadius: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {article.category}
                  </span>
                )}
              </div>

              {/* Title + meta */}
              <div className="absolute bottom-10 sm:bottom-12 left-0 right-0 px-4 sm:px-7 z-30">
                <h2 className="text-white font-black text-lg sm:text-2xl lg:text-[2rem] leading-snug mb-2 max-w-3xl line-clamp-3 group-hover:text-red-100 transition-colors" style={{ textWrap: 'balance' }}>
                  {article.title}
                </h2>
                <div className="flex items-center gap-2 text-gray-300 text-[11px] sm:text-xs">
                  <span>{article.author}</span>
                  <span>·</span>
                  <span>
                    {article.date && new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {/* Prev / Next arrows — hidden on very small screens */}
        <button
          onClick={(e) => { e.preventDefault(); prev(); }}
          className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full items-center justify-center text-xl transition-colors"
          aria-label="Previous article"
        >‹</button>
        <button
          onClick={(e) => { e.preventDefault(); next(); }}
          className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/70 text-white w-9 h-9 rounded-full items-center justify-center text-xl transition-colors"
          aria-label="Next article"
        >›</button>

        {/* Dots */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-30">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); setCurrent(i); }}
              aria-label={`Go to slide ${i + 1}`}
              className="transition-all duration-300"
              style={{
                height: '5px',
                width: i === current ? '22px' : '6px',
                borderRadius: '3px',
                background: i === current ? '#fff' : 'rgba(255,255,255,0.45)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
