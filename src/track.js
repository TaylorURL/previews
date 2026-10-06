/**
 * How a prospect uses their preview: the pages they open, how far they scroll,
 * which sections hold them, what they click, tap and linger over, and where
 * they get stuck. Loaded on its own after the page is idle, so it never stands
 * between a reader and the first frame.
 *
 * It runs only for a visit `counts()` accepts - a preview, not the studio's own
 * browser, not an automated one - and sends nothing until `whenLooked()` has
 * fired, the same gate the view count waits on, so a link scanner that loads
 * the page and leaves is never recorded. The endpoint then drops anything from
 * the studio's own connections or a preview whose letter has not gone.
 *
 * Form fields are named, never read: no value, keystroke or field content is
 * touched anywhere in this file.
 */

import { counts, whenLooked } from './site.js';

const ENDPOINT = 'https://www.taylorurl.com/api/preview-events';
const SESSION_GAP_MS = 30 * 60 * 1000;
const IDLE_MS = 30 * 1000;
const HOVER_MS = 600;
const FLUSH_MS = 10 * 1000;
const BATCH = 100;
const MILESTONES = [25, 50, 75, 90, 100];

/** Sections are named by id first, then by what their heading is about. */
const BUCKETS = [
  ['reviews', /review|testimonial|say about|customers say|rating|stars/],
  ['faq', /faq|question/],
  ['areas', /area|neighbo|cities|communit|where we/],
  ['hours', /hours|open (?:daily|today|mon|7)/],
  ['contact', /contact|get in touch|reach us|quote|estimate|book|appointment|schedule|visit us/],
  ['gallery', /gallery|photo|our work|recent (?:work|job|project)|projects|portfolio/],
  ['team', /team|stylist|barber|agent|staff|meet /],
  ['listings', /listing|homes for|for sale|propert/],
  ['about', /about|story|who we|why choose|why us|family|since \d/],
  ['services', /service|what we|repair|install|offer|specialt|menu|pric|treatment|class|program|solution/],
];

const store = (kind) => {
  try {
    return window[kind];
  } catch {
    return null;
  }
};
const read = (kind, key) => {
  try {
    return store(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
};
const write = (kind, key, value) => {
  try {
    store(kind)?.setItem(key, value);
  } catch {
    // Storage refused; the visit is still recorded, just not joined up.
  }
};

const uuid = () =>
  crypto.randomUUID?.() ??
  '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
  );

const clip = (text, n = 80) => String(text ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

function device() {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const w = Math.min(screen.width || innerWidth, innerWidth || screen.width);
  if (coarse && w < 768) return 'mobile';
  if (coarse && w < 1280) return 'tablet';
  return 'desktop';
}

function system(ua = navigator.userAgent) {
  const os = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
    ? 'iOS'
    : /Android/.test(ua) ? 'Android'
    : /Windows/.test(ua) ? 'Windows'
    : /CrOS/.test(ua) ? 'ChromeOS'
    : /Mac OS X|Macintosh/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Other';
  const browser = /Edg\//.test(ua) ? 'Edge'
    : /SamsungBrowser/.test(ua) ? 'Samsung'
    : /OPR\//.test(ua) ? 'Opera'
    : /Firefox|FxiOS/.test(ua) ? 'Firefox'
    : /Chrome|CriOS/.test(ua) ? 'Chrome'
    : /Safari/.test(ua) ? 'Safari'
    : 'Other';
  return { os, browser };
}

/** Where the visit came from: a tagged link, a mail client, or nowhere said. */
function arrival() {
  const params = new URLSearchParams(location.search);
  const utm = {};
  for (const [key, value] of params) if (key.startsWith('utm_')) utm[key.slice(0, 20)] = clip(value, 60);
  let referrer = '';
  try {
    const from = document.referrer && new URL(document.referrer);
    if (from && from.host !== location.host) referrer = from.host;
  } catch {
    // An unreadable referrer is the same as none.
  }
  const mail = /mail\.google|outlook|mail\.yahoo|icloud|aol\.com|proton/.exec(referrer)?.[0];
  const source =
    utm.utm_source || params.get('src') || params.get('ref') || (mail ? `mail:${mail}` : referrer || 'direct');
  return { referrer, source: clip(source, 64), utm: Object.keys(utm).length ? utm : null };
}

function sectionName(el, index) {
  if (el.tagName === 'FOOTER') return 'footer';
  if (el.id && !/^top$/.test(el.id)) return el.id.slice(0, 40);
  if (el.querySelector('h1')) return 'hero';
  const heading = el.getAttribute('aria-label') || el.querySelector('h2, h3')?.textContent || '';
  const text = heading.toLowerCase();
  for (const [name, test] of BUCKETS) if (test.test(text)) return name;
  return clip(heading, 40) || `section-${index + 1}`;
}

function linkKind(el) {
  const href = el.getAttribute('href') || '';
  if (href.startsWith('tel:')) return 'call';
  if (href.startsWith('mailto:')) return 'email';
  if (/sms:/.test(href)) return 'text';
  if (/taylorurl\.com\/start/.test(href)) return 'claim';
  if (/google\.[a-z.]+\/maps|maps\.apple|goo\.gl\/maps/.test(href)) return 'map';
  const styled = el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || (() => {
    const bg = getComputedStyle(el).backgroundColor;
    return bg && bg !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(bg);
  })();
  if (styled) return 'cta';
  if (href && (href.startsWith('/') || href.startsWith('#') || el.host === location.host)) return 'nav';
  return href ? 'link' : 'button';
}

function linkTarget(el) {
  const href = el.getAttribute('href');
  if (!href) return '';
  if (/^(tel|mailto|sms):/.test(href)) return clip(href, 120);
  try {
    const url = new URL(href, location.href);
    return clip(url.host === location.host ? url.pathname + url.hash : url.host + url.pathname, 200);
  } catch {
    return clip(href, 120);
  }
}

const labelOf = (el) =>
  clip(
    el.getAttribute('aria-label') ||
      el.innerText ||
      el.getAttribute('title') ||
      el.querySelector?.('img[alt]')?.getAttribute('alt') ||
      el.tagName.toLowerCase(),
  );

const fieldName = (el) =>
  clip(el.getAttribute('name') || el.id || el.getAttribute('autocomplete') || el.getAttribute('aria-label') || el.type || el.tagName.toLowerCase(), 60);

const formName = (form) =>
  clip(form?.getAttribute('name') || form?.id || form?.getAttribute('aria-label') || 'form', 60);

let started = false;

export function track(brand, path = '') {
  // Only the real subdomains send. `npm run dev` prints each batch instead.
  const dev = import.meta.env.DEV;
  if (started || !counts(brand) || !(dev || /\.taylorurl\.com$/.test(location.hostname))) return;
  started = true;

  const now = Date.now();
  let session = null;
  try {
    session = JSON.parse(read('sessionStorage', 'tu_t') || 'null');
  } catch {
    session = null;
  }
  if (!session?.sid || now - (session.last || 0) > SESSION_GAP_MS) session = { sid: uuid(), last: now };
  let vid = read('localStorage', 'tu_v');
  if (!vid || !/^[0-9a-f-]{36}$/.test(vid)) {
    vid = uuid();
    write('localStorage', 'tu_v', vid);
  }
  const from = read('sessionStorage', 'tu_p');
  const ctx = { device: device(), viewport: `${innerWidth}x${innerHeight}`, ...system(), ...arrival() };

  let live = read('sessionStorage', 'tu_live') === session.sid;
  const queue = [];
  const push = (event) => {
    if (queue.length < 400) queue.push({ at: Date.now(), path, ...event });
    session.last = Date.now();
  };

  function flush() {
    write('sessionStorage', 'tu_t', JSON.stringify(session));
    if (!live || !queue.length) return;
    // Read late: a page opened in a background tab has no size until it is shown.
    if (innerWidth) Object.assign(ctx, { device: device(), viewport: `${innerWidth}x${innerHeight}` });
    while (queue.length) {
      const body = JSON.stringify({
        v: 1,
        slug: brand.slug,
        template: brand.template,
        sid: session.sid,
        vid,
        path,
        ctx,
        ev: queue.splice(0, BATCH),
      });
      if (dev) {
        console.debug('preview events', JSON.parse(body));
        continue;
      }
      const blob = new Blob([body], { type: 'text/plain' });
      if (!(navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, blob))) {
        fetch(ENDPOINT, { method: 'POST', body, keepalive: true, mode: 'no-cors' }).catch(() => {});
      }
    }
  }

  push({ t: 'page', name: from ?? '', target: path });
  write('sessionStorage', 'tu_p', path);

  // Active, hidden and idle time.
  let activeSince = document.visibilityState === 'visible' ? Date.now() : null;
  let activeMs = 0;
  let hiddenAt = document.visibilityState === 'visible' ? null : Date.now();
  let idleAt = null;
  let idleTimer = null;
  // Section timers follow the same clock: they run only while the reader is
  // active, so a tab left open behind another counts for nothing.
  const pauseActive = () => {
    if (activeSince) activeMs += Date.now() - activeSince;
    activeSince = null;
    settle();
  };
  const resumeActive = () => {
    if (activeSince || idleAt || hiddenAt) return;
    activeSince = Date.now();
    resumeSections();
  };
  const reportActive = () => {
    pauseActive();
    if (activeMs >= 500) push({ t: 'end', value: activeMs });
    activeMs = 0;
  };
  const activity = () => {
    if (idleAt) {
      push({ t: 'idle', value: Date.now() - idleAt });
      idleAt = null;
      resumeActive();
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      pauseActive();
      idleAt = Date.now();
    }, IDLE_MS);
  };
  ['pointermove', 'pointerdown', 'scroll', 'keydown', 'touchstart', 'wheel'].forEach((name) =>
    addEventListener(name, activity, { passive: true, capture: true }),
  );
  activity();

  // Time each section spends on screen while the reader is actually there.
  const sections = [...document.querySelectorAll('#root section, #root footer')];
  const names = new Map(sections.map((el, i) => [el, sectionName(el, i)]));
  const inView = new Map();
  const sectionMs = new Map();
  function settle() {
    const t = Date.now();
    for (const [el, since] of inView) {
      if (since == null) continue;
      const name = names.get(el);
      sectionMs.set(name, (sectionMs.get(name) || 0) + (t - since));
      inView.set(el, activeSince ? t : null);
    }
  }
  function resumeSections() {
    for (const el of inView.keys()) inView.set(el, Date.now());
  }
  const reportSections = () => {
    settle();
    for (const [name, ms] of sectionMs) if (ms >= 500) push({ t: 'section', name, value: Math.round(ms) });
    sectionMs.clear();
  };
  if ('IntersectionObserver' in window && sections.length) {
    const seen = new IntersectionObserver(
      (entries) => {
        settle();
        for (const entry of entries) {
          const half = Math.min(entry.boundingClientRect.height, innerHeight) / 2;
          if (entry.isIntersecting && entry.intersectionRect.height >= half) {
            if (!inView.has(entry.target)) inView.set(entry.target, activeSince ? Date.now() : null);
          } else {
            inView.delete(entry.target);
          }
        }
      },
      { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((el) => seen.observe(el));
  }

  // Scroll depth milestones on this page.
  const reached = new Set();
  let ticking = false;
  addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const depth = ((scrollY + innerHeight) / Math.max(document.documentElement.scrollHeight, 1)) * 100;
        for (const mark of MILESTONES) {
          if (depth >= mark - 0.5 && !reached.has(mark)) {
            reached.add(mark);
            push({ t: 'scroll', value: mark });
          }
        }
      });
    },
    { passive: true },
  );

  // Clicks and taps, with rage and dead clicks.
  const INTERACTIVE = 'a, button, [role="button"], summary, input, select, textarea, label';
  let burst = [];
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const section = names.get(target.closest('#root section, #root footer')) || '';
      const t = Date.now();
      burst = burst.filter((c) => t - c.t < 800 && Math.hypot(c.x - event.clientX, c.y - event.clientY) < 40);
      burst.push({ t, x: event.clientX, y: event.clientY });
      const el = target.closest(INTERACTIVE);
      if (burst.length === 3) push({ t: 'rage', name: el ? labelOf(el) : clip(target.innerText, 60), target: section });

      if (el) {
        if (/^(INPUT|SELECT|TEXTAREA|LABEL)$/.test(el.tagName)) return;
        push({ t: 'click', name: labelOf(el), kind: linkKind(el), target: linkTarget(el) || section });
        return;
      }
      const looksClickable =
        getComputedStyle(target).cursor === 'pointer' || target.closest('img, svg, figure, article, li');
      if (!looksClickable || String(getSelection?.() || '')) return;
      const before = location.href;
      let changed = false;
      const watch = new MutationObserver(() => {
        changed = true;
      });
      watch.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
      setTimeout(() => {
        watch.disconnect();
        if (!changed && location.href === before) {
          push({ t: 'dead', name: clip(target.innerText || target.getAttribute('alt') || target.tagName.toLowerCase(), 60), target: section });
        }
      }, 1000);
    },
    { capture: true, passive: true },
  );

  // Hovers that linger over a call to action or a card.
  let hovered = null;
  let hoverAt = 0;
  document.addEventListener(
    'pointerover',
    (event) => {
      if (event.pointerType !== 'mouse' || !(event.target instanceof Element)) return;
      const el = event.target.closest('a, button, [role="button"], article, figure');
      if (el === hovered) return;
      if (hovered && Date.now() - hoverAt >= HOVER_MS) {
        const card = /^(ARTICLE|FIGURE)$/.test(hovered.tagName);
        push({ t: 'hover', name: labelOf(hovered), kind: card ? 'card' : linkKind(hovered), value: Date.now() - hoverAt });
      }
      hovered = el;
      hoverAt = Date.now();
    },
    { passive: true },
  );

  // Form fields by name only, and the submit.
  const focusedAt = new WeakMap();
  document.addEventListener('focusin', (event) => {
    const el = event.target;
    if (!(el instanceof Element) || !el.matches('input, select, textarea')) return;
    focusedAt.set(el, Date.now());
    push({ t: 'focus', name: fieldName(el), target: formName(el.form) });
  });
  document.addEventListener('focusout', (event) => {
    const el = event.target;
    if (!(el instanceof Element) || !focusedAt.has(el)) return;
    push({ t: 'blur', name: fieldName(el), target: formName(el.form), value: Date.now() - focusedAt.get(el) });
    focusedAt.delete(el);
  });
  document.addEventListener(
    'submit',
    (event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;
      const fields = [...form.elements].filter((el) => el.matches('input, select, textarea')).map(fieldName);
      push({ t: 'submit', name: formName(form), target: clip(fields.join(','), 200) });
      flush();
    },
    { capture: true },
  );

  // Hidden tabs, and the end of the page.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      reportActive();
      reportSections();
      hiddenAt = Date.now();
      flush();
    } else {
      if (hiddenAt) push({ t: 'hidden', value: Date.now() - hiddenAt });
      hiddenAt = null;
      resumeActive();
    }
  });
  addEventListener('pagehide', () => {
    if (hiddenAt) {
      push({ t: 'hidden', value: Date.now() - hiddenAt });
      hiddenAt = Date.now();
    }
    reportActive();
    reportSections();
    flush();
  });

  setInterval(flush, FLUSH_MS);

  if (live) flush();
  else {
    whenLooked(() => {
      live = true;
      write('sessionStorage', 'tu_live', session.sid);
      flush();
    });
  }
}
