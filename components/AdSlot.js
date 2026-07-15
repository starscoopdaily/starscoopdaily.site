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

export default function AdSlot({ slot, className = '' }) {
  const adConfig = getAdConfig();
  const slotConfig = adConfig.slots?.[slot];

  if (!slotConfig?.enabled || !slotConfig?.code?.trim()) return null;

  return <AdSlotRenderer html={slotConfig.code} className={className} />;
}
