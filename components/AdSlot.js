'use client';

import { useEffect, useRef } from 'react';

export function NativeBannerAd({ className = '' }) {
  const ref = useRef(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !ref.current) return;
    loaded.current = true;

    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src =
      'https://pl29878174.effectivecpmnetwork.com/3cad9852f5b47b92edea689177a42e75/invoke.js';
    ref.current.appendChild(script);
  }, []);

  return (
    <div className={`ad-slot ${className}`} ref={ref}>
      <div id="container-3cad9852f5b47b92edea689177a42e75"></div>
    </div>
  );
}

export function AdPlaceholder({ label = 'Advertisement', className = '' }) {
  return (
    <div className={`ad-slot my-4 ${className}`}>
      <div className="border border-dashed border-gray-200 rounded bg-gray-50 text-center py-8 px-4">
        <p className="text-xs text-gray-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}
