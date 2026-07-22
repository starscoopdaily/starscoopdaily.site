'use client';

import { useEffect, useState } from 'react';

export default function ExitIntentPopup({ smartlink }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!smartlink) return;
    const KEY = 'ssd_popup_last';
    const COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours
    const last = parseInt(localStorage.getItem(KEY) || '0');
    if (Date.now() - last < COOLDOWN) return;

    let hasScrolled = false;

    const onScroll = () => { if (window.scrollY > 300) hasScrolled = true; };
    const onLeave = (e) => {
      if (e.clientY <= 0 && hasScrolled) {
        setShow(true);
        localStorage.setItem(KEY, String(Date.now()));
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [smartlink]);

  if (!show || !smartlink) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={() => setShow(false)}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-900 px-6 pt-6 pb-5 text-center relative">
          <button
            onClick={() => setShow(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 text-xl font-bold leading-none"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="text-5xl mb-3">🎬</div>
          <h2 className="text-white font-black text-2xl leading-tight">Wait! Don&apos;t Leave Yet</h2>
          <p className="text-gray-400 text-sm mt-2">Exclusive content is waiting for you right now</p>
        </div>
        <div className="p-6">
          <a
            href={smartlink}
            target="_blank"
            rel="nofollow noopener noreferrer"
            onClick={() => setShow(false)}
            className="flex items-center gap-3 w-full bg-[#cc0000] hover:bg-[#aa0000] text-white font-black py-4 px-5 rounded-xl text-base transition-colors mb-3 group"
          >
            <span className="text-2xl">▶</span>
            <span className="flex-1 text-left">Watch Now — See Exclusive Content</span>
            <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </a>
          <button
            onClick={() => setShow(false)}
            className="block w-full text-center text-gray-400 text-sm hover:text-gray-600 transition-colors py-2"
          >
            No thanks, I&apos;ll pass
          </button>
        </div>
      </div>
    </div>
  );
}
