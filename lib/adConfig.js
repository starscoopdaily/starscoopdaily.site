import fs from 'fs';
import path from 'path';

/**
 * SmartLink CTAs (exit popup, in-article buttons, category empty state, 404)
 * send users to an Adsterra redirect whose destination we do not control.
 * Labels like "Find Where to Watch" promise streaming info the link cannot
 * deliver, which is a deceptive-content risk while Google is still forming
 * its first quality assessment of this domain.
 *
 * Disabled until the site has meaningful traffic — at ~0 sessions these CTAs
 * earn nothing, so the trust risk buys us nothing. Flip to true once traffic
 * justifies it, and relabel the CTAs as "Sponsored" at the same time.
 *
 * Note: this flag does NOT affect the banner ad slots in data/ad-config.json.
 * Those keep running.
 */
export const SMARTLINK_CTAS_ENABLED = false;

export function getAdConfig() {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/ad-config.json'), 'utf8'));
  } catch {
    return { slots: {}, smartlink: '' };
  }
}

export function getSmartLink() {
  if (!SMARTLINK_CTAS_ENABLED) return '';
  return getAdConfig().smartlink || '';
}
