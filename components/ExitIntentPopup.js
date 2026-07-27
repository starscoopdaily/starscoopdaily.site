'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Exit-intent only: fires on mouseleave at the top edge after 300px of scroll,
 * once per session. Never on page load, and never on touch devices (no
 * mouseleave), so it stays clear of Google's intrusive-interstitial rules.
 *
 * When SmartLink CTAs are disabled (see lib/adConfig.js) this shows internal
 * article recommendations instead — no policy risk, and it lifts pages/session
 * rather than bouncing the reader off-site.
 */
export default function ExitIntentPopup({ smartlink, articles = [] }) {
  const [show, setShow] = useState(false);

  const picks = articles.slice(0, 3);
  const hasContent = Boolean(smartlink) || picks.length > 0;

  useEffect(() => {
    if (!hasContent || sessionStorage.getItem('exit_shown')) return;

    let hasScrolled = false;

    const onScroll = () => { if (window.scrollY > 300) hasScrolled = true; };
    const onLeave = (e) => {
      if (e.clientY <= 0 && hasScrolled) {
        setShow(true);
        sessionStorage.setItem('exit_shown', '1');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [hasContent]);

  if (!show || !hasContent) return null;

  const close = () => setShow(false);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={close}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-900 px-6 pt-6 pb-5 text-center relative">
          <button
            onClick={close}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 text-xl font-bold leading-none"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="text-5xl mb-3">🎬</div>
          <h2 className="text-white font-black text-2xl leading-tight">Before You Go</h2>
          <p className="text-gray-400 text-sm mt-2">
            {smartlink ? 'More entertainment inside' : 'Stories you might have missed'}
          </p>
        </div>

        <div className="p-6">
          {smartlink ? (
            <a
              href={smartlink}
              target="_blank"
              rel="nofollow noopener noreferrer sponsored"
              onClick={close}
              className="flex items-center gap-3 w-full bg-[#cc0000] hover:bg-[#aa0000] text-white font-black py-4 px-5 rounded-xl text-base transition-colors mb-3 group"
            >
              <span className="text-2xl">▶</span>
              <span className="flex-1 text-left">See Offer (Sponsored) →</span>
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </a>
          ) : (
            <div className="flex flex-col gap-2 mb-3">
              {picks.map((a) => (
                <Link
                  key={a.slug}
                  href={`/article/${a.slug}`}
                  onClick={close}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 hover:border-[#cc0000] hover:bg-red-50 px-4 py-3 transition-colors group no-underline"
                >
                  <span className="flex-1 min-w-0 text-sm font-bold text-gray-800 group-hover:text-[#cc0000] leading-snug line-clamp-2">
                    {a.title}
                  </span>
                  <svg className="w-4 h-4 flex-shrink-0 text-gray-300 group-hover:text-[#cc0000] group-hover:translate-x-0.5 transition-all" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              ))}
            </div>
          )}

          <button
            onClick={close}
            className="block w-full text-center text-gray-400 text-sm hover:text-gray-600 transition-colors py-2"
          >
            No thanks, I&apos;ll pass
          </button>
        </div>
      </div>
    </div>
  );
}
