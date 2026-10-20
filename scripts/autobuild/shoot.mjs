// Every page of each named business's built site, photographed whole at
// desktop and phone size, for the review (review.py) and the agents it sends
// to fix what the review finds.
//
//   node scripts/autobuild/shoot.mjs <dir> <slug>...
//
// Serves dist/ itself, so it needs `npm run build` first. Writes
// <dir>/<slug>/<page>-desktop.png and <page>-phone.png, where <page> is
// "home" or the page's path with its slashes turned to dashes, and prints
// { "<slug>": { "<page>": { "path", "desktop", "phone" } } }. A page that does
// not open is left out and named in the slug's "errors".

import { createServer } from 'node:http';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, relative } from 'node:path';
import { chromium } from 'playwright-core';
import { browserPath } from './browser.mjs';

const [dir, ...slugs] = process.argv.slice(2);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.woff2': 'font/woff2' };

const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const file = join('dist', path);
  if (!existsSync(file) || path.endsWith('/')) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }).end(readFileSync(file));
}).listen(0);
const port = server.address().port;

/** The site's pages: its home page, then every page under its own folder. */
function pagesOf(slug) {
  const pages = [['home', `/b/${slug}.html`]];
  const walk = (folder) => {
    if (!existsSync(folder)) return;
    for (const name of readdirSync(folder).sort()) {
      const path = join(folder, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name.endsWith('.html')) {
        const rel = relative(join('dist', 'b', slug), path).replace(/\.html$/, '');
        pages.push([rel.replace(/[\\/]/g, '-'), `/b/${slug}/${rel}.html`]);
      }
    }
  };
  walk(join('dist', 'b', slug));
  return pages;
}

const browser = await chromium.launch({ executablePath: browserPath() });
const out = {};
try {
  for (const slug of slugs) {
    const folder = join(dir, slug);
    mkdirSync(folder, { recursive: true });
    const site = {};
    const errors = [];
    for (const [name, viewport, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['phone', { width: 390, height: 844 }, true]]) {
      const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 });
      const page = await context.newPage();
      for (const [key, path] of pagesOf(slug)) {
        try {
          await page.goto(`http://127.0.0.1:${port}${path}?staff`, { waitUntil: 'networkidle', timeout: 45000 });
          await page.evaluate(() => document.fonts.ready);
          // Every lazy picture is brought into view once, so each one is drawn,
          // and then every picture on the page is waited for. Without the wait
          // a picture low on a long page is still decoding when the shot is
          // taken, and the review sees an empty panel that a reader never does.
          await page.evaluate(async () => {
            for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
            window.scrollTo(0, 0);
          });
          await page.evaluate(async () => {
            const waits = [...document.images].map((img) =>
              img.complete && img.naturalWidth
                ? Promise.resolve()
                : img.decode().catch(() => {}));
            await Promise.race([Promise.all(waits), new Promise((r) => setTimeout(r, 15000))]);
          });
          await page.waitForTimeout(500);
          const file = join(folder, `${key}-${name}.png`);
          await page.screenshot({ path: file, fullPage: true });
          site[key] = { ...(site[key] || { path }), [name]: file };
        } catch (error) {
          errors.push(`${path} at ${name} size: ${String(error.message).slice(0, 160)}`);
        }
      }
      await context.close();
    }
    out[slug] = { ...site, ...(errors.length ? { errors } : {}) };
  }
} finally {
  await browser.close();
  server.close();
}
console.log(JSON.stringify(out));
