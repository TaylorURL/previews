// One page of a business's own website as a browser draws it, for a site
// whose words are put on the page by script and so are missing from what a
// plain fetch reads (collect.py, copy()).
//
//   node scripts/autobuild/fetchpage.mjs <url>
//
// Prints the drawn page's HTML; exits 1 when it would not open.

import { chromium } from 'playwright-core';
import { browserPath } from './browser.mjs';

const [url] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: browserPath() });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  process.stdout.write(await page.content());
} catch (error) {
  console.error(String(error).slice(0, 300));
  process.exitCode = 1;
} finally {
  await browser.close();
}
