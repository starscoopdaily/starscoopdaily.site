'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function AdSlotRenderer({ html, className = '' }) {
  const ref = useRef(null);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    if (!ref.current || !html || isAdmin) return;

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
  }, [html, isAdmin]);

  if (isAdmin) return null;

  return <div ref={ref} className={`ad-slot ${className}`} />;
}
