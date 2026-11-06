// The home page of a website as a visitor first sees it, for the comparison
// of a preview with the business's own site (versus.py): the top of the page
// on a desktop screen, the top on an iPhone 13, and the whole desktop page.
//
//   node scripts/autobuild/capture.mjs <dir> <name>=<target>...
//
// A target is a web address, or dist:<slug> for a preview built into dist/
// (served here, so it needs `npm run build` first). Writes
// <dir>/<name>-desktop-top.jpg (1440 x 900), <name>-phone-top.jpg (390 x 844
// at twice the density, as the letter's picture is taken) and
// <name>-desktop-full.jpg (the desktop page, at most FULL_MAX tall), and
// prints { "<name>": { "ok": true, "url", "final", "desktop_top", "phone_top",
// "desktop_full" } } or { "<name>": { "ok": false, "url", "error" } } for a page
// that did not open, answered an error, or ran past its time. The preview's
// own strip ("A preview, not a live site") is taken off, as the letter's
// picture leaves it out, so the two sites are seen alike.

import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright-core';
import { browserPath } from './browser.mjs';

const [dir, ...jobs] = process.argv.slice(2);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.woff2': 'font/woff2' };
// How long a page may take to start drawing, and to finish, before it counts as not loading.
const LOAD_MS = Number(process.env.PREVIEW_VERSUS_LOAD_SECONDS || 30) * 1000;
const TOTAL_MS = LOAD_MS * 4;
const FULL_MAX = 8000;
// Ordinary browsers' own names: a headless one is turned away by some sites.
const DESKTOP_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const PHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';

let port = 0;
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const file = join('dist', path);
  if (!existsSync(file) || path.endsWith('/')) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }).end(readFileSync(file));
});
if (jobs.some((job) => job.includes('=dist:'))) {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = server.address().port;
}

function address(target) {
  if (target.startsWith('dist:')) return `http://127.0.0.1:${port}/b/${target.slice(5)}.html?staff`;
  return /^https?:\/\//i.test(target) ? target : `http://${target}`;
}

function within(ms, promise, what) {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${what} took longer than ${ms / 1000}s`)), ms); })])
    .finally(() => clearTimeout(timer));
}

/** Opens a page and lets it settle the way a visitor's screen does. */
async function open(page, url) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: LOAD_MS });
  const status = response ? response.status() : 0;
  await page.waitForLoadState('load', { timeout: LOAD_MS / 2 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  if (status >= 400) {
    // A host's bot check answers 403 and lets a browser through a few seconds
    // later; a page still showing an error or the check after that did not load.
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const title = await page.title();
    const text = await page.evaluate(() => (document.body?.innerText || '').slice(0, 600));
    if (text.trim().length < 40 || /checking your browser|just a moment|access denied|attention required|verify you are human/i.test(`${title} ${text}`)
      || /forbidden|not found|error|\b(40\d|50\d)\b/i.test(title)) {
      throw new Error(`it answered ${status}`);
    }
  }
  await within(5000, page.evaluate(() => document.fonts.ready), 'the fonts').catch(() => {});
  await page.evaluate(() => {
    for (const note of document.querySelectorAll('[role="note"]')) {
      if (/^(A preview, not a live site|Rough draft by TaylorURL)/.test(note.innerText.trim())) note.remove();
    }
  });
  return response;
}

// Without this flag some hosts' bot checks never let the page through.
const browser = await chromium.launch({ executablePath: browserPath(), args: ['--disable-blink-features=AutomationControlled'] });
const out = {};
try {
  for (const job of jobs) {
    const at = job.indexOf('=');
    const name = job.slice(0, at);
    const url = address(job.slice(at + 1));
    mkdirSync(dir, { recursive: true });
    const shots = { ok: true, url };
    let state = null;
    try {
      await within(TOTAL_MS, (async () => {
        for (const [view, options] of [
          ['desktop', { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, userAgent: DESKTOP_UA }],
          ['phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: PHONE_UA }],
        ]) {
          // The phone visit carries the desktop visit's cookies, so a bot check
          // the desktop passed is not asked again.
          const context = await browser.newContext({ ...options, ignoreHTTPSErrors: true, ...(state ? { storageState: state } : {}) });
          try {
            const page = await context.newPage();
            await open(page, url);
            if (view === 'desktop') shots.final = page.url();
            state = await context.storageState().catch(() => null);
            await page.waitForTimeout(800);
            const top = join(dir, `${name}-${view}-top.jpg`);
            await page.screenshot({ path: top, type: 'jpeg', quality: 82 });
            shots[`${view}_top`] = top;
            if (view === 'desktop') {
              // Every lazy picture and every part that slides in as it is scrolled
              // to is brought into view once, so the whole page is drawn as a
              // visitor scrolling down it sees it; parts the common animation
              // kits keep hidden until then are shown outright.
              await page.addStyleTag({ content: '[data-aos],.wow,.elementor-invisible,.animate__animated{opacity:1!important;visibility:visible!important;transform:none!important}' }).catch(() => {});
              await page.evaluate(async (most) => {
                for (let y = 0; y < Math.min(document.body.scrollHeight, most); y += 450) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 140)); }
                window.scrollTo(0, 0);
              }, FULL_MAX);
              await within(8000, page.evaluate(() => Promise.all([...document.images].map((img) => (img.complete ? null : img.decode().catch(() => {}))))), 'the pictures').catch(() => {});
              await page.waitForTimeout(1000);
              const height = await page.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
              const full = join(dir, `${name}-desktop-full.jpg`);
              await page.screenshot({ path: full, type: 'jpeg', quality: 78, fullPage: true, clip: { x: 0, y: 0, width: 1440, height: Math.max(900, Math.min(height, FULL_MAX)) } });
              shots.desktop_full = full;
            }
          } finally {
            await context.close().catch(() => {});
          }
        }
      })(), 'the page');
      out[name] = shots;
    } catch (error) {
      out[name] = { ok: false, url, error: String(error.message || error).split('\n')[0].slice(0, 200) };
    }
  }
} finally {
  await browser.close();
  server.close();
}
console.log(JSON.stringify(out));
