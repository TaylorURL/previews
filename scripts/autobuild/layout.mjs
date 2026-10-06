// Opens each named business's built home page at desktop and phone size and
// says what a reader would see wrong: a page wider than the screen, a picture
// that did not load, or a section with nothing in it.
//
//   node scripts/autobuild/layout.mjs <shots-dir|-> <slug>...
//
// Serves dist/ itself, so it needs `npm run build` first. Prints one JSON
// object: { "<slug>": ["problem", ...] }. With a directory, it also writes
// <slug>-desktop.png and <slug>-phone.png there.

import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright-core';

const [shots, ...slugs] = process.argv.slice(2);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.woff2': 'font/woff2' };

function browserPath() {
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
    for (const [name, viewport, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['phone', { width: 390, height: 844 }, true]]) {
      const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
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
        const found = await page.evaluate(() => {
          const issues = [];
          if (document.documentElement.scrollWidth > window.innerWidth + 1) issues.push(`wider than the screen (${document.documentElement.scrollWidth}px)`);
          for (const img of document.images) {
            if (img.closest('[aria-hidden="true"]')) continue;
            if (img.complete && img.naturalWidth === 0) issues.push(`a picture did not load: ${img.currentSrc || img.src}`);
          }
          for (const section of document.querySelectorAll('main section, section')) {
            if (!section.innerText.trim() && !section.querySelector('img')) issues.push('a section is empty');
          }
          return [...new Set(issues)];
        });
        problems.push(...found.map((f) => `${name}: ${f}`));
        if (shots !== '-') await page.screenshot({ path: join(shots, `${slug}-${name}.png`), fullPage: true });
      } catch (error) {
        problems.push(`${name}: ${String(error.message).slice(0, 160)}`);
      }
      await context.close();
    }
    out[slug] = problems;
  }
} finally {
  await browser.close();
  server.close();
}
console.log(JSON.stringify(out));
