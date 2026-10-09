// Where this machine's Chromium is: the Pi's system one, or the copy
// Playwright keeps on a Mac. CHROMIUM_PATH names another.

import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export function browserPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  for (const path of ['/usr/bin/chromium-browser', '/usr/bin/chromium']) if (existsSync(path)) return path;
  const cache = join(homedir(), 'Library/Caches/ms-playwright');
  if (existsSync(cache)) {
    for (const build of readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()) {
      for (const app of ['chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
        if (existsSync(join(cache, build, app))) return join(cache, build, app);
      }
    }
  }
  throw new Error('no Chromium found; set CHROMIUM_PATH');
}
