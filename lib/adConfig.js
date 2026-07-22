import fs from 'fs';
import path from 'path';

export function getAdConfig() {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/ad-config.json'), 'utf8'));
  } catch {
    return { slots: {}, smartlink: '' };
  }
}

export function getSmartLink() {
  return getAdConfig().smartlink || '';
}
