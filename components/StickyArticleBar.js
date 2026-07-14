'use client';

import { useState, useEffect } from 'react';

export default function StickyArticleBar({ title, slug }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 380);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const url = `https://www.starscoopdaily.site/article/${slug}`;
  const encoded = encodeURIComponent(url);
  const titleEncoded = encodeURIComponent(title);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white border-t border-gray-200 shadow-2xl transition-transform duration-300 ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <p className="flex-1 text-xs font-bold text-gray-800 leading-snug line-clamp-1 min-w-0">{title}</p>
        <div className="flex gap-2 flex-shrink-0">
          <a
            href={`https://wa.me/?text=${titleEncoded}%20${encoded}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#25d366] text-white text-xs font-bold px-3 py-2 rounded-lg"
          >
            <svg className="w-3 h-3 fill-white flex-shrink-0" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896.001-3.176-1.24-6.165-3.48-8.45z" />
            </svg>
            WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encoded}&text=${titleEncoded}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white text-xs font-bold px-3 py-2 rounded-lg"
          >
            Share
          </a>
        </div>
      </div>
    </div>
  );
}
