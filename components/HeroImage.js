'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function HeroImage({ src, alt }) {
  const [portrait, setPortrait] = useState(true);

  return (
    <div
      className="relative w-full bg-gray-900 overflow-hidden"
      style={{ height: 'min(60vh, 420px)', minHeight: '260px' }}
    >
      {portrait && (
        <Image
          src={src}
          alt=""
          fill
          aria-hidden="true"
          className="object-cover scale-110 blur-2xl brightness-90 opacity-80"
          sizes="100vw"
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className={`z-10 ${portrait ? 'object-contain' : 'object-cover'}`}
        sizes="100vw"
        onLoad={(e) => setPortrait(e.target.naturalHeight > e.target.naturalWidth)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-20" />
    </div>
  );
}
