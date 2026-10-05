/**
 * Which business a request is dressed as.
 *
 * The subdomain names it. plumbing, barber and realestate are the templates'
 * own sample businesses; any other label is a prospect's slug, a file in
 * src/brands, as in wedgeworthplumbing.taylorurl.com. Anywhere else - a
 * Vercel preview URL, localhost - `?b=` names it instead.
 */

const SUPABASE_URL = 'https://gujgtjqqurildqurpffh.supabase.co';
const SUPABASE_KEY = 'sb_publishable_qn4ZWB2n95HGMJm0L58I0w_ClE_Qu4M';

export const SAMPLES = { plumbing: 'sample-plumbing', barber: 'sample-barber', realestate: 'sample-realestate' };

const brands = import.meta.glob('./brands/*.json', { import: 'default' });

export function resolveSlug(location = window.location) {
  const label = location.hostname.split('.')[0];
  const asked = new URLSearchParams(location.search).get('b');
  const pick = SAMPLES[label] || label;
  if (brands[`./brands/${pick}.json`]) return pick;
  if (asked && brands[`./brands/${SAMPLES[asked] || asked}.json`]) return SAMPLES[asked] || asked;
  return null;
}

export async function loadBrand(slug) {
  const load = brands[`./brands/${slug}.json`];
  return load ? { slug, ...(await load()) } : null;
}

/** Counts a view of a prospect's preview. Fire and forget. */
export function recordView(brand) {
  if (!brand.preview) return;
  fetch(`${SUPABASE_URL}/rest/v1/rpc/preview_site`, {
    method: 'POST',
    keepalive: true,
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_industry: brand.template, p_slug: brand.slug }),
  }).catch(() => {});
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
