/**
 * Which template a request is for, and whose business it is dressed as.
 *
 * The subdomain names the template: plumbing.taylorurl.com,
 * barber.taylorurl.com, realestate.taylorurl.com. Anywhere else - a Vercel
 * preview URL, localhost - `?t=` names it instead. The first path segment is
 * the slug of a row in `preview_sites`; no slug shows the template's own
 * sample business.
 */

import plumbing from './industries/plumbing.js';
import barber from './industries/barber.js';
import realestate from './industries/realestate.js';

export const INDUSTRIES = { plumbing, barber, realestate };

const SUPABASE_URL = 'https://gujgtjqqurildqurpffh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qn4ZWB2n95HGMJm0L58I0w_ClE_Qu4M';

export function resolveIndustry(location = window.location) {
  const label = location.hostname.split('.')[0];
  if (INDUSTRIES[label]) return label;
  const asked = new URLSearchParams(location.search).get('t');
  return INDUSTRIES[asked] ? asked : 'plumbing';
}

export function resolveSlug(location = window.location) {
  const first = location.pathname.split('/').filter(Boolean)[0] || '';
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(first) ? first : null;
}

/** The stored business for a slug, or null when there is none. */
export async function fetchBusiness(industry, slug) {
  if (window.__preview) return window.__preview;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/preview_site`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_industry: industry, p_slug: slug }),
  });
  if (!response.ok) return null;
  return response.json();
}

/**
 * The business a page is dressed as. A real one never borrows a fact from the
 * sample: its own reviews, hours, staff and service area or none at all, so a
 * preview never puts words in a real owner's mouth. The template decides what
 * to show in a gap.
 */
export function mergeBusiness(sample, real) {
  if (!real) return { ...sample, isPreview: false };
  return {
    ...real,
    state: real.state || 'TX',
    reviews: Array.isArray(real.reviews) ? real.reviews : [],
    shortName: real.shortName || shorten(real.name),
    isPreview: true,
  };
}

function shorten(name = '') {
  return name
    .replace(/,?\s+(llc|inc|co|corp|ltd|pllc)\.?$/i, '')
    .trim();
}

export function telHref(phone = '') {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** An Unsplash photo at the width it is drawn at. */
export function photo(id, width = 1600) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=70`;
}

/** The srcset the boot script in index.html preloads, so the two must match. */
export function heroSrcSet(id) {
  return [640, 960, 1400, 2000]
    .map((w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=60&w=${w} ${w}w`)
    .join(', ');
}

export function loadFonts(href) {
  if ([...document.styleSheets].some((sheet) => sheet.href === href) || document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}
