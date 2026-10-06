/**
 * Which business a request is dressed as.
 *
 * The subdomain names it. A template's name (plumbing, roofing, salon...) is
 * that template's own sample business; any other label is a prospect's slug, a file in
 * src/brands, as in wedgeworthplumbing.taylorurl.com. Anywhere else - a
 * Vercel preview URL, localhost - `?b=` names it instead.
 */

const SUPABASE_URL = 'https://gujgtjqqurildqurpffh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qn4ZWB2n95HGMJm0L58I0w_ClE_Qu4M';

const brands = import.meta.glob('./brands/*.json', { import: 'default', eager: true });

export const SLUGS = Object.keys(brands).map((path) => path.slice(9, -5));

// Each template's sample business is the brand file named sample-<template>,
// and it answers at <template>.taylorurl.com.
export const SAMPLES = Object.fromEntries(
  SLUGS.filter((slug) => slug.startsWith('sample-')).map((slug) => [slug.slice(7), slug]),
);

export function resolveSlug(location = window.location) {
  if (window.__SLUG__) return window.__SLUG__;
  const label = location.hostname.split('.')[0];
  const asked = new URLSearchParams(location.search).get('b');
  const pick = SAMPLES[label] || label;
  if (brands[`./brands/${pick}.json`]) return pick;
  if (asked && brands[`./brands/${SAMPLES[asked] || asked}.json`]) return SAMPLES[asked] || asked;
  return null;
}

/**
 * Which page of the business's site is asked for, '' being the home page. A
 * prerendered page names its own; on a subdomain it is the address path; on a
 * preview URL or localhost `?p=` names it.
 */
export function resolvePath(location = window.location) {
  if (typeof window.__PATH__ === 'string') return window.__PATH__;
  const asked = new URLSearchParams(location.search).get('p');
  if (asked != null) return asked.replace(/^\/+|\/+$/g, '');
  return location.pathname.replace(/^\/+|\/+$/g, '').replace(/\.html$/, '');
}

export function loadBrand(slug) {
  const brand = brands[`./brands/${slug}.json`];
  return brand ? { slug, ...brand } : null;
}

// Set on .taylorurl.com by the studio's console and by opening any preview
// with `?staff`, so the studio's own browsers never count as a prospect.
const STAFF_COOKIE = 'tu_staff';
const BOTS = /bot|crawl|spider|slurp|preview|scan|headless|lighthouse|pagespeed|python|curl|wget|node|axios|go-http|java\//i;
// A visit counts once it has been on screen this long, or as soon as the
// reader scrolls, taps or clicks. Link scanners load a page and leave.
const LOOKED_MS = 4000;

function ours() {
  if (/(?:^|;\s*)tu_staff=1/.test(document.cookie)) return true;
  if (new URLSearchParams(location.search).has('staff')) {
    document.cookie = `${STAFF_COOKIE}=1; domain=.taylorurl.com; path=/; max-age=315360000; samesite=lax; secure`;
    return true;
  }
  return false;
}

function automated() {
  return navigator.webdriver || BOTS.test(navigator.userAgent) || !navigator.languages?.length;
}

function send(brand) {
  fetch(`${SUPABASE_URL}/rest/v1/rpc/preview_site`, {
    method: 'POST',
    keepalive: true,
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_industry: brand.template, p_slug: brand.slug }),
  }).catch(() => {});
}

/**
 * Whether this visit is one that counts as a prospect's: a preview rather than
 * a sample, not one of the studio's own browsers, and not an automated one. The
 * view count and the behaviour tracker both ask this, so they agree on who is
 * a prospect.
 */
export function counts(brand) {
  return Boolean(brand?.preview) && !ours() && !automated();
}

/**
 * Calls `then` once the page has actually been looked at: on screen for a few
 * seconds, or scrolled, tapped or clicked. Anything that loads the page and
 * leaves never reaches it.
 */
export function whenLooked(then) {
  let done = false;
  let timer = null;
  const events = ['scroll', 'pointerdown', 'keydown', 'touchstart'];
  const count = () => {
    if (done) return;
    done = true;
    clearTimeout(timer);
    events.forEach((name) => removeEventListener(name, count));
    document.removeEventListener('visibilitychange', watch);
    then();
  };
  const watch = () => {
    clearTimeout(timer);
    if (document.visibilityState === 'visible') timer = setTimeout(count, LOOKED_MS);
  };
  events.forEach((name) => addEventListener(name, count, { once: true, passive: true }));
  document.addEventListener('visibilitychange', watch);
  watch();
}

/**
 * Counts a prospect looking at their preview: once per visit, in a real
 * browser, after the page has actually been looked at. The studio's own
 * browsers, automated ones and anything that loads the page and leaves are not
 * counted. Fire and forget.
 */
const watching = new Set();

export function recordView(brand) {
  if (watching.has(brand.slug) || !counts(brand)) return;
  watching.add(brand.slug);
  const key = `viewed:${brand.slug}`;
  try {
    if (sessionStorage.getItem(key)) return;
  } catch {
    // Storage refused; count the visit anyway.
  }
  whenLooked(() => {
    try {
      sessionStorage.setItem(key, '1');
    } catch {
      // Nothing to remember it in.
    }
    send(brand);
  });
}

/**
 * The src and srcset for an image. A path under /brands/ has -800 and -1600
 * webp files beside it; an Unsplash URL is resized on request.
 */
export function pic(src) {
  if (!src) return {};
  if (src.startsWith('https://images.unsplash.com/')) {
    const at = (w) => `${src}?auto=format&fit=crop&q=65&w=${w}`;
    return { src: at(1400), srcSet: [640, 1000, 1400, 2000].map((w) => `${at(w)} ${w}w`).join(', ') };
  }
  if (/\.(webp|png|jpe?g|svg)$/.test(src)) return { src };
  return { src: `${src}-1600.webp`, srcSet: `${src}-800.webp 800w, ${src}-1600.webp 1600w` };
}

export function telHref(phone = '') {
  return `tel:+1${phone.replace(/\D/g, '').replace(/^1/, '')}`;
}

export function mapsHref(b) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name} ${b.address} ${b.town} ${b.state}`)}`;
}

export function ratingLine(b) {
  if (!b.rating || !b.reviewCount) return null;
  return `${Number(b.rating).toFixed(1)} from ${b.reviewCount.toLocaleString()} Google reviews`;
}

/** The brand's colors and fonts as custom properties on the template root. */
export function brandVars(brand) {
  const vars = {};
  for (const [key, value] of Object.entries(brand)) {
    if (typeof value === 'string' && !['fonts', 'logo'].includes(key)) vars[`--${key}`] = value;
  }
  return vars;
}
