import fs from 'fs';
import path from 'path';
import AdSlotRenderer from './AdSlotRenderer';

function getAdConfig() {
  try {
    const filePath = path.join(process.cwd(), 'data/ad-config.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return { slots: {} };
  }
}

/**
 * Per-device visibility is driven by the slot config rather than hardcoded in
 * each page, so it can be changed from Admin → Ads Manager without a code edit.
 *
 * Breakpoint is `sm` (640px). Slots missing the flags default to visible on
 * both, which keeps older configs working.
 */
function visibilityClass(slot) {
  const desktop = slot.desktop !== false;
  const mobile = slot.mobile !== false;
  if (desktop && mobile) return '';
  if (desktop) return 'hidden sm:block';
  if (mobile) return 'block sm:hidden';
  return null; // off on both — render nothing
}

export default function AdSlot({ slot, className = '' }) {
  const adConfig = getAdConfig();
  const slotConfig = adConfig.slots?.[slot];

  if (!slotConfig?.enabled || !slotConfig?.code?.trim()) return null;

  const vis = visibilityClass(slotConfig);
  if (vis === null) return null;

  return (
    <div className={vis}>
      <AdSlotRenderer html={slotConfig.code} className={className} />
    </div>
  );
}
