// Draws an SVG logo as a PNG on nothing, for a machine with no rsvg-convert.
// The same Chromium the layout check opens does the drawing, so an SVG reads
// the way a browser would show it.
//
//   node scripts/autobuild/raster.mjs <in.svg> <out.png> <width>

import { readFileSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { browserPath } from './browser.mjs';

const [input, output, width] = process.argv.slice(2);
const svg = readFileSync(input).toString('base64');
const browser = await chromium.launch({ executablePath: browserPath() });
try {
  const page = await browser.newPage({ viewport: { width: Number(width) + 40, height: 1200 } });
  await page.setContent(
    `<html><body style="margin:0;background:transparent"><img id="mark" style="display:block;width:${Number(width)}px;height:auto" src="data:image/svg+xml;base64,${svg}"></body></html>`,
  );
  await page.waitForFunction(() => document.getElementById('mark').complete);
  const ok = await page.evaluate(() => document.getElementById('mark').naturalWidth > 0);
  if (!ok) throw new Error('the SVG did not draw');
  await page.locator('#mark').screenshot({ path: output, omitBackground: true });
} finally {
  await browser.close();
}
