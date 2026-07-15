'use client';

import { useEffect, useRef } from 'react';

export default function AdSlotRenderer({ html, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !html) return;

    // Clear previous content
    ref.current.innerHTML = '';

    // Parse the ad HTML and re-create script nodes so browsers actually execute them
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
  }, [html]);

  return <div ref={ref} className={`ad-slot ${className}`} />;
}
