'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Adsterra's `atOptions` banner format writes to a single global variable.
 * When more than one of those banners is on the same page, each new slot
 * overwrites the previous slot's config before the async invoke.js runs —
 * so only one banner (or none) actually renders. This is why ads showed up
 * on desktop pages with a single slot but disappeared on mobile, where the
 * sidebar, in-article and footer slots all mount together.
 *
 * Fix: render each atOptions banner inside its own sandboxed iframe so every
 * slot gets a fresh `window` and its own `atOptions`. Container-based formats
 * (native banner / social bar) don't use the global, so they render inline.
 */

function isolatedDoc(html) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  html,body{margin:0;padding:0;overflow:hidden;background:transparent;}
  body{display:flex;align-items:center;justify-content:center;}
  iframe,img{max-width:100%;border:0;display:block;}
</style></head><body>${html}</body></html>`;
}

export default function AdSlotRenderer({ html, className = '', height = 250 }) {
  const ref = useRef(null);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const isAdmin = pathname?.startsWith('/admin');

  // atOptions banners need their own window; anything else renders inline.
  const needsIsolation = typeof html === 'string' && html.includes('atOptions');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (needsIsolation || !ref.current || !html || isAdmin) return;

    ref.current.innerHTML = '';

    const temp = document.createElement('div');
    temp.innerHTML = html;

    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeName === 'SCRIPT') {
        const script = document.createElement('script');
        Array.from(node.attributes).forEach((attr) =>
          script.setAttribute(attr.name, attr.value)
        );
        if (node.textContent) script.textContent = node.textContent;
        ref.current.appendChild(script);
      } else {
        ref.current.appendChild(node.cloneNode(true));
      }
    });
  }, [html, isAdmin, needsIsolation]);

  if (isAdmin || !html) return null;

  if (needsIsolation) {
    // Render only after mount — srcDoc on the server would ship the ad markup
    // into the static HTML that Googlebot reads.
    if (!mounted) {
      return <div className={`ad-slot ${className}`} style={{ minHeight: height }} />;
    }
    return (
      <div className={`ad-slot ${className}`} style={{ minHeight: height }}>
        <iframe
          title="Advertisement"
          srcDoc={isolatedDoc(html)}
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          scrolling="no"
          style={{
            width: '100%',
            maxWidth: 320,
            height,
            border: 0,
            display: 'block',
            margin: '0 auto',
          }}
        />
      </div>
    );
  }

  return <div ref={ref} className={`ad-slot ${className}`} />;
}
