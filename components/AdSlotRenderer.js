'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Adsterra's `atOptions` format writes to a single global, so several banners
 * on one page overwrite each other's config before the async invoke.js runs.
 *
 * This was previously solved by rendering each banner in a sandboxed iframe.
 * That fixed the collision but broke fill: the invoke script fingerprints its
 * environment (SharedWorker, registerProtocolHandler, document.cookie,
 * location.hostname) and a srcdoc iframe fails those checks — location.hostname
 * is empty on about:srcdoc — so it bailed out and rendered nothing.
 *
 * Instead we load atOptions banners **sequentially in the main document**: set
 * the global, inject the script, wait for it to load and read the config, then
 * release the next slot. No iframe, no collision, environment checks intact.
 *
 * Note this cannot fix a shared zone key. Adsterra issues one key per
 * placement; reusing one key across slots will still under-fill regardless of
 * load order.
 */

// Module-level chain shared by every slot on the page.
let loadChain = Promise.resolve();

function queueAtOptionsAd(html, container) {
  loadChain = loadChain.then(
    () =>
      new Promise((resolve) => {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const scripts = Array.from(temp.querySelectorAll('script'));

        // Inline config script first — this sets window.atOptions.
        scripts
          .filter((s) => !s.src && s.textContent)
          .forEach((s) => {
            try {
              // eslint-disable-next-line no-new-func
              new Function(s.textContent)();
            } catch { /* malformed config — let the external script fall back */ }
          });

        // Non-script markup (container divs etc.)
        Array.from(temp.childNodes)
          .filter((n) => n.nodeName !== 'SCRIPT')
          .forEach((n) => container.appendChild(n.cloneNode(true)));

        const external = scripts.filter((s) => s.src);
        if (!external.length) { resolve(); return; }

        let pending = external.length;
        const done = () => {
          pending -= 1;
          // Give invoke.js a moment to read atOptions before the next slot
          // overwrites it.
          if (pending === 0) setTimeout(resolve, 400);
        };

        external.forEach((s) => {
          const el = document.createElement('script');
          Array.from(s.attributes).forEach((a) => el.setAttribute(a.name, a.value));
          el.onload = done;
          el.onerror = done;
          container.appendChild(el);
        });

        // Never let one stalled network request block every later slot.
        setTimeout(resolve, 6000);
      })
  );
  return loadChain;
}

export default function AdSlotRenderer({ html, className = '', height = 250 }) {
  const ref = useRef(null);
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    const container = ref.current;
    if (!container || !html || isAdmin) return;

    container.innerHTML = '';

    // Container-based formats (native banner, social bar) don't touch the
    // global, so they can render immediately.
    if (!html.includes('atOptions')) {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      Array.from(temp.childNodes).forEach((node) => {
        if (node.nodeName === 'SCRIPT') {
          const script = document.createElement('script');
          Array.from(node.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
          if (node.textContent) script.textContent = node.textContent;
          container.appendChild(script);
        } else {
          container.appendChild(node.cloneNode(true));
        }
      });
      return;
    }

    queueAtOptionsAd(html, container);
  }, [html, isAdmin]);

  if (isAdmin || !html) return null;

  return <div ref={ref} className={`ad-slot ${className}`} style={{ minHeight: height }} />;
}
