// Opens each named business's built home page at desktop and phone size and
// says what a reader would see wrong: a page wider than the screen, a header
// button pushed off it, a picture that did not load, a section with nothing in
// it, a logo drawn too small or larger than its file, and a photo stretched
// past its pixels or cropped to a sliver of itself.
//
//   node scripts/autobuild/layout.mjs <shots-dir|-> <slug>...
//
// Serves dist/ itself, so it needs `npm run build` first. Prints one JSON
// object: { "<slug>": { "problems": [...], "logo": {...}, "shots": {...} } }.
// With a directory it also writes, for each viewport, the top of the page
// (<slug>-<viewport>-top.png), the whole page (<slug>-<viewport>.png) and the
// logo's box in that picture's pixels, which visual.py reads to see whether
// the logo sits in a box or fades into its ground.

import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright-core';
import { browserPath } from './browser.mjs';

const [shots, ...slugs] = process.argv.slice(2);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.woff2': 'font/woff2' };

// The logo's drawn height, in CSS px, below which a reader cannot make it out.
const LOGO_MIN = { desktop: 30, phone: 26 };
// A photo may be drawn at most this much larger than its file before it softens.
const STRETCH_MAX = 1.25;
// The share of a photo a cropped frame must still show.
const CROP_KEEP_MIN = 0.5;

const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const file = join('dist', path);
  if (!existsSync(file) || path.endsWith('/')) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }).end(readFileSync(file));
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch({ executablePath: browserPath() });
const out = {};
try {
  for (const slug of slugs) {
    const problems = [];
    const result = { problems, logo: {}, shots: {} };
    for (const [name, viewport, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['phone', { width: 390, height: 844 }, true]]) {
      const scale = mobile ? 2 : 1;
      const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: scale });
      const page = await context.newPage();
      try {
        await page.goto(`http://127.0.0.1:${port}/b/${slug}.html?staff`, { waitUntil: 'networkidle', timeout: 45000 });
        await page.evaluate(() => document.fonts.ready);
        // Every lazy picture is brought into view once, so each one is asked for.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(700);
        const found = await page.evaluate(({ name, scale, LOGO_MIN, STRETCH_MAX, CROP_KEEP_MIN }) => {
          const issues = [];
          if (document.documentElement.scrollWidth > window.innerWidth + 1) issues.push(`wider than the screen (${document.documentElement.scrollWidth}px)`);
          for (const img of document.images) {
            if (img.closest('[aria-hidden="true"]')) continue;
            if (img.complete && img.naturalWidth === 0) issues.push(`a picture did not load: ${img.currentSrc || img.src}`);
          }
          for (const section of document.querySelectorAll('main section, section')) {
            if (!section.innerText.trim() && !section.querySelector('img')) issues.push('a section is empty');
          }

          const header = document.querySelector('header');
          for (const control of header ? header.querySelectorAll('a, button') : []) {
            const box = control.getBoundingClientRect();
            if (box.width && box.height && getComputedStyle(control).visibility !== 'hidden' && (box.right > window.innerWidth + 1 || box.left < -1)) {
              issues.push(`the header's "${control.textContent.trim().slice(0, 24) || control.getAttribute('aria-label') || 'control'}" runs off the screen`);
            }
          }
          const mark = document.querySelector('header img[data-logo]') || header?.querySelector('img');
          let logo = null;
          if (!mark) issues.push('the header has no logo');
          else {
            const box = mark.getBoundingClientRect();
            logo = { x: box.left, y: box.top, width: box.width, height: box.height, naturalWidth: mark.naturalWidth, naturalHeight: mark.naturalHeight };
            if (box.height < LOGO_MIN[name]) issues.push(`the logo is drawn ${Math.round(box.height)}px tall, too small to read`);
            if (mark.naturalWidth && mark.naturalWidth < box.width * Math.min(scale, 1.5)) issues.push(`the logo is drawn wider (${Math.round(box.width)}px) than its file can fill sharply (${mark.naturalWidth}px)`);
            const drawn = box.width / Math.max(box.height, 1);
            const own = mark.naturalWidth / Math.max(mark.naturalHeight, 1);
            if (mark.naturalWidth && getComputedStyle(mark).objectFit === 'fill' && Math.abs(drawn / own - 1) > 0.06) issues.push('the logo is squashed out of its shape');
          }

          for (const img of document.images) {
            if (img === mark || img.dataset.logo !== undefined || img.closest('[aria-hidden="true"]') || !img.naturalWidth) continue;
            const box = img.getBoundingClientRect();
            if (box.width < 120 || box.height < 90) continue;
            const src = (img.currentSrc || img.src).split('/').pop();
            const fit = getComputedStyle(img).objectFit;
            const nw = img.naturalWidth, nh = img.naturalHeight;
            const frame = box.width / box.height, own = nw / nh;
            const keep = fit === 'cover' ? Math.min(frame / own, own / frame) : 1;
            // The pixels the frame draws from: a cropped photo spends fewer of its own across the frame.
            // Measured in CSS pixels: a photo is enlarged when it has fewer pixels than the page draws it,
            // whatever the screen's own density.
            const across = fit === 'cover' ? (frame > own ? nw : nh * frame) : nw;
            const stretch = box.width / across;
            if (stretch > STRETCH_MAX) issues.push(`${src} is drawn ${stretch.toFixed(1)}x larger than its pixels`);
            if (keep < CROP_KEEP_MIN && img.dataset.backdrop === undefined) issues.push(`${src} is cropped to ${Math.round(keep * 100)}% of itself`);
            if (fit === 'fill' && Math.abs(frame / own - 1) > 0.06) issues.push(`${src} is stretched out of its shape`);
          }
          return { issues: [...new Set(issues)], logo };
        }, { name, scale, LOGO_MIN, STRETCH_MAX, CROP_KEEP_MIN });
        problems.push(...found.issues.map((f) => `${name}: ${f}`));
        if (found.logo) result.logo[name] = { ...found.logo, scale };
        if (shots !== '-') {
          const top = join(shots, `${slug}-${name}-top.png`);
          const full = join(shots, `${slug}-${name}.png`);
          await page.screenshot({ path: top });
          await page.screenshot({ path: full, fullPage: true });
          result.shots[name] = { top, full };
        }
      } catch (error) {
        problems.push(`${name}: ${String(error.message).slice(0, 160)}`);
      }
      await context.close();
    }
    out[slug] = result;
  }
} finally {
  await browser.close();
  server.close();
}
console.log(JSON.stringify(out));
