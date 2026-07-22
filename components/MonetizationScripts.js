'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

export default function MonetizationScripts() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <Script
        src="https://5gvci.com/act/files/tag.min.js?z=11371947"
        data-cfasync="false"
        strategy="afterInteractive"
      />
      <Script id="monetag-inpage-push" strategy="afterInteractive">
        {`(function(s){s.dataset.zone='11371954',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
      </Script>
      <Script id="monetag-vignette" strategy="afterInteractive">
        {`(function(s){s.dataset.zone='11371955',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
      </Script>
    </>
  );
}
