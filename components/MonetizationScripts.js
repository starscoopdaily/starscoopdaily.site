'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';

/**
 * Monetag zones, each behind its own flag so they can be isolated.
 *
 * POPUNDER (zone 11371947) — DISABLED.
 * This was redirecting readers away from articles on tap. That is the single
 * most damaging thing that can run on a content site:
 *   - Google treats unexpected redirects as deceptive behaviour, which carries
 *     manual-action exposure, not just a ranking adjustment
 *   - It destroys pages/session — a reader thrown off-site does not come back
 *   - It makes the content work pointless, since arriving readers never reach
 *     the article they clicked
 * Do not re-enable on a site that is trying to build a search audience.
 *
 * IN-PAGE PUSH (zone 11371954) — enabled. Renders a notification-style banner
 * in the page. Does not redirect. Turn off here if it ever starts to.
 *
 * VIGNETTE (zone 11371955) — disabled. Full-screen interstitials risk mobile
 * ranking penalties under Google's intrusive-interstitial policy.
 */
const POPUNDER_ENABLED = false;
const INPAGE_PUSH_ENABLED = true;
const VIGNETTE_ENABLED = false;

export default function MonetizationScripts() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      {POPUNDER_ENABLED && (
        <Script
          src="https://5gvci.com/act/files/tag.min.js?z=11371947"
          data-cfasync="false"
          strategy="afterInteractive"
        />
      )}
      {INPAGE_PUSH_ENABLED && (
        <Script id="monetag-inpage-push" strategy="afterInteractive">
          {`(function(s){s.dataset.zone='11371954',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
        </Script>
      )}
      {VIGNETTE_ENABLED && (
        <Script id="monetag-vignette" strategy="afterInteractive">
          {`(function(s){s.dataset.zone='11371955',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`}
        </Script>
      )}
    </>
  );
}
