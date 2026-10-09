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

// Each brand file is its own chunk, fetched only by the page that is dressed in
// it, so a page carries one business rather than every business on the list.
const brands = import.meta.glob('./brands/*.json', { import: 'default' });

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

export async function loadBrand(slug) {
  const load = brands[`./brands/${slug}.json`];
  return load ? { slug, ...(await load()) } : null;
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

/** The relative luminance of a #rrggbb color, 0 for black to 1 for white. */
export function luminance(hex = '#ffffff') {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.replace(/./g, (x) => x + x) : c;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(full.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Whether the header is drawn dark: the logo was made for a dark or colored
 * ground (logoGround, written by the logo step of the build), so the header
 * takes that ground and its links turn light, rather than the mark sitting in
 * a box on white.
 */
export function headDark(brand) {
  return Boolean(brand?.logo && brand.logoGround && luminance(brand.logoGround) < 0.4);
}

/**
 * The weights display type is set in: a serif face at its regular weight, a
 * sans one bold, so a heading never reads thin at sixty pixels.
 */
export function displayVars(brand) {
  const stack = String(brand?.heading || '');
  const serif = /serif/.test(stack.replace(/sans-serif/g, ''));
  return serif
    ? { '--display-weight': 400, '--display-weight-2': 400, '--display-tracking': '-0.005em' }
    : { '--display-weight': 700, '--display-weight-2': 600, '--display-tracking': '-0.022em' };
}

/** The brand's colors and fonts as custom properties on the template root. */
export function brandVars(brand) {
  const vars = {};
  for (const [key, value] of Object.entries(brand)) {
    if (typeof value === 'string' && !['fonts', 'logo'].includes(key)) vars[`--${key}`] = value;
  }
  // The header's ground is the logo's own; a file without one keeps white.
  if (brand.logo && brand.logoGround) {
    const dark = headDark(brand);
    vars['--head'] = brand.logoGround;
    vars['--head-ink'] = dark ? '#ffffff' : 'var(--ink)';
    vars['--head-soft'] = dark ? 'rgba(255,255,255,0.72)' : 'var(--muted, #5b6470)';
    vars['--head-line'] = dark ? 'rgba(255,255,255,0.16)' : 'color-mix(in srgb, var(--ink) 10%, transparent)';
    vars['--head-hover'] = dark ? 'rgba(255,255,255,0.78)' : 'var(--primary)';
  }
  return vars;
}
