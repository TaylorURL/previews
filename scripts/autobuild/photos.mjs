// Every picture a browser shows on some pages of a business's own website,
// for a site whose photos a plain fetch never sees: put on the page by
// script, loaded lazily as it is scrolled, or drawn as a CSS background
// (collect.py, drawn_images()).
//
//   node scripts/autobuild/photos.mjs <seconds> <url>...
//
// Opens each page in turn at a desktop size, scrolls it to the bottom so
// lazy pictures load, and reads what it draws: each <img>'s current source
// and the largest in its srcset, the sources a lazy loader keeps in data-
// attributes, <picture> sources, video posters, and the computed background
// image of every element at least 300px wide. Stops opening pages once the
// seconds are spent. The first page's links to a gallery of their work are
// opened next, as that is where a business keeps its photos. Prints [{ "url", "ok", "final", "images": [{ "src",
// "kind", "drawn": [w, h], "natural": [w, h], "alt", "hint", "header" }] }]
// in the order the pages were given, each page's pictures largest first.

import { chromium } from 'playwright-core';
import { browserPath } from './browser.mjs';

const [seconds, ...urls] = process.argv.slice(2);
const started = Date.now();
const budget = Number(seconds || 60) * 1000;
const left = () => budget - (Date.now() - started);
const DESKTOP_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
// How far down a page is scrolled for its lazy pictures.
const SCROLL_MAX = 14000;
// A link to the pages a business shows its work on, by what it says or where it goes.
const GALLERY = /\b(galler(y|ies)|portfolio|projects?|our work|recent work|photos?|before (and|&) after)\b/i;
const GALLERY_PAGES = 2;

function within(ms, promise) {
  let timer;
  return Promise.race([promise, new Promise((resolve) => { timer = setTimeout(resolve, Math.max(0, ms)); })]).finally(() => clearTimeout(timer));
}

// Read inside the page: everything it shows as a picture.
function pictures() {
  const out = [];
  const seen = new Set();
  const abs = (value) => {
    if (!value || typeof value !== 'string') return null;
    const v = value.trim();
    if (!v || v.startsWith('data:') || v.startsWith('blob:')) return null;
    try { return new URL(v, document.baseURI).href; } catch { return null; }
  };
  // The largest entry of a srcset; a URL runs to the next space, so one with
  // commas in it (an image service's resize options) stays whole.
  const largest = (value) => {
    if (!value) return null;
    let best = null; let most = -1; let i = 0;
    const n = value.length;
    while (i < n) {
      while (i < n && (/\s/.test(value[i]) || value[i] === ',')) i += 1;
      let j = i;
      while (j < n && !/\s/.test(value[j])) j += 1;
      let url = value.slice(i, j); let descriptor = '';
      i = j;
      if (url.endsWith(',')) url = url.replace(/,+$/, '');
      else {
        let k = value.indexOf(',', i);
        if (k < 0) k = n;
        descriptor = value.slice(i, k).trim();
        i = k + 1;
      }
      const size = parseFloat(descriptor.replace(/[^\d.]/g, '')) || 0;
      if (url && size >= most) { most = size; best = url; }
    }
    return best;
  };
  const hintOf = (el) => [typeof el.className === 'string' ? el.className : '', el.id || '', el.getAttribute('data-aid') || '', el.getAttribute('data-ux') || ''].join(' ');
  const inHeader = (el) => !!el.closest('header, nav');
  const add = (src, kind, el, rect, natural) => {
    const url = abs(src);
    if (!url || seen.has(url) || /\.svg(\?|#|$)/i.test(url)) return;
    seen.add(url);
    out.push({
      src: url, kind,
      drawn: [Math.round(rect.width), Math.round(rect.height)],
      natural: natural || [0, 0],
      alt: (el.getAttribute('alt') || el.getAttribute('aria-label') || el.getAttribute('title') || '').slice(0, 200),
      hint: hintOf(el).slice(0, 200),
      header: inHeader(el),
    });
  };
  const LAZY = ['data-src', 'data-lazy-src', 'data-srclazy', 'data-original', 'data-orig-src', 'data-lazy', 'data-full-url',
    'data-large_image', 'data-bg', 'data-background', 'data-background-image', 'data-bg-src', 'data-image', 'data-img'];
  const LAZY_SETS = ['data-srcset', 'data-lazy-srcset', 'data-srcsetlazy'];
  // A picture's address, not a flag ("true") or a setting a loader keeps there.
  const ADDRESS = /^[^\s"'<>{}]*[/.][^\s"'<>{}]*$/;
  for (const img of document.querySelectorAll('img')) {
    const rect = img.getBoundingClientRect();
    const natural = [img.naturalWidth || 0, img.naturalHeight || 0];
    const set = largest(img.getAttribute('srcset')) || LAZY_SETS.map((a) => largest(img.getAttribute(a))).find(Boolean);
    if (set) add(set, 'srcset', img, rect, natural);
    add(img.currentSrc || img.src, 'img', img, rect, natural);
    for (const name of LAZY) if (ADDRESS.test(img.getAttribute(name) || '')) add(img.getAttribute(name), 'lazy', img, rect, natural);
  }
  for (const source of document.querySelectorAll('picture source')) {
    const img = source.parentElement.querySelector('img') || source.parentElement;
    add(largest(source.getAttribute('srcset') || source.getAttribute('data-srcset')), 'picture', img, img.getBoundingClientRect());
  }
  for (const video of document.querySelectorAll('video[poster]')) add(video.getAttribute('poster'), 'poster', video, video.getBoundingClientRect());
  for (const el of document.querySelectorAll('body *')) {
    const rect = el.getBoundingClientRect();
    if (rect.width < 300 || rect.height < 120) continue;
    for (const pseudo of [null, '::before', '::after']) {
      const background = getComputedStyle(el, pseudo).backgroundImage;
      if (!background || background === 'none') continue;
      for (const match of background.matchAll(/url\((['"]?)(.*?)\1\)/g)) add(match[2], 'background', el, rect);
    }
    if (el.tagName !== 'IMG') for (const name of LAZY) if (ADDRESS.test(el.getAttribute(name) || '')) add(el.getAttribute(name), 'lazy', el, rect);
  }
  return out;
}

const browser = await chromium.launch({ executablePath: browserPath(), args: ['--disable-blink-features=AutomationControlled'] });
const results = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, userAgent: DESKTOP_UA, ignoreHTTPSErrors: true });
  // Video and fonts say nothing of the pictures and are slow on a small machine.
  await context.route('**/*', (route) => (['media', 'font'].includes(route.request().resourceType()) ? route.abort() : route.continue()));
  const queue = [...urls];
  for (let at = 0; at < queue.length; at += 1) {
    const url = queue[at];
    // A page needs about this long to open and be scrolled; one not started
    // in time is left out rather than run past the budget.
    if (left() < 12000) { results.push({ url, ok: false, error: 'out of time' }); continue; }
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: Math.min(25000, left() - 5000) });
      await within(Math.min(8000, left() - 6000), page.waitForLoadState('load').catch(() => {}));
      await within(Math.min(4000, left() - 6000), page.waitForLoadState('networkidle').catch(() => {}));
      // Parts the common animation kits keep hidden until scrolled to are shown outright.
      await page.addStyleTag({ content: '[data-aos],.wow,.elementor-invisible,.animate__animated{opacity:1!important;visibility:visible!important;transform:none!important}' }).catch(() => {});
      await within(Math.min(10000, left() - 4000), page.evaluate(async (most) => {
        for (let y = 0; y < Math.min(document.body.scrollHeight, most); y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      }, SCROLL_MAX).catch(() => {}));
      await within(Math.min(3000, left() - 3000), page.waitForLoadState('networkidle').catch(() => {}));
      const images = await page.evaluate(pictures);
      images.sort((a, b) => b.drawn[0] * b.drawn[1] - a.drawn[0] * a.drawn[1]);
      results.push({ url, ok: true, final: page.url(), images });
      if (at === 0) {
        const host = new URL(page.url()).hostname.replace(/^www\./, '');
        const known = new Set(queue.map((u) => u.replace(/\/$/, '')));
        const galleries = await page.evaluate((pattern) => [...document.querySelectorAll('a[href]')]
          .filter((a) => new RegExp(pattern, 'i').test(`${a.innerText} ${new URL(a.href, document.baseURI).pathname.replace(/[-_/]/g, ' ')}`))
          .map((a) => new URL(a.href, document.baseURI).href.split('#')[0]), GALLERY.source).catch(() => []);
        const more = [...new Set(galleries)].filter((u) => /^https?:/.test(u) && new URL(u).hostname.replace(/^www\./, '') === host
          && !known.has(u.replace(/\/$/, '')) && !/\.(jpe?g|png|webp|gif|pdf)$/i.test(u)).slice(0, GALLERY_PAGES);
        queue.splice(1, 0, ...more);
      }
    } catch (error) {
      results.push({ url, ok: false, error: String(error.message || error).split('\n')[0].slice(0, 200) });
    } finally {
      await page.close().catch(() => {});
    }
  }
} finally {
  await browser.close();
}
process.stdout.write(JSON.stringify(results));
