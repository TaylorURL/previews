/**
 * What the outdoor template reads off a brand file beyond its plain fields:
 * the photos its gallery is made of, the words its main action uses, and the
 * colors its dark grounds and buttons are painted in.
 */
import { luminance } from '../../site.js';
import { hexOr, mixHex } from '../shared.jsx';

export const list = (v) => (Array.isArray(v) ? v : []);
export const groupsOf = (b) => list(b.groups).filter((g) => g?.slug && g?.title);
const stock = (src) => /^https?:\/\/images\.unsplash\.com\//.test(String(src || ''));

/**
 * The words the site asks with. Outdoor work is priced before it starts, so
 * every button asks for an estimate; it is called free only where the
 * business's own words say so (a free estimate, quote, consultation or
 * inspection anywhere in its brand file), in the word it uses.
 */
export function askOf(b) {
  const said = JSON.stringify(b).match(/\bfree\s+(estimate|quote|consultation|inspection|assessment)s?\b/i);
  const noun = said ? said[1].toLowerCase() : 'estimate';
  const article = /^[aeiou]/.test(noun) ? 'an' : 'a';
  return said
    ? { act: `Free ${noun[0].toUpperCase()}${noun.slice(1)}`, get: `Get a free ${noun}`, noun: `free ${noun}`, free: true }
    : { act: `Get ${article} Estimate`, get: `Get ${article} estimate`, noun, free: false };
}

/**
 * The photos the home page's gallery shows: the business's own projects when
 * the brand file lists them, else the photos it already carries for its
 * service groups and its about section. Never the hero's photo, which the
 * hero shows, never one photo twice, and on a preview never a stock photo.
 * The about photo never joins it: the gallery is headed as the business's
 * work, and a tile captioned 'About us' is a menu link, not a piece of work;
 * that photo stays with the about section. A gallery of one photo is no
 * gallery: that photo is left to the about section (`spare`).
 */
export function galleryOf(b) {
  const hero = b.hero?.image;
  const seen = new Set(hero ? [hero] : []);
  const keep = (p) => p.src && !seen.has(p.src) && !(b.preview && stock(p.src)) && seen.add(p.src);
  const projects = list(b.projects)
    .map((p) => ({ src: p.image, alt: p.imageAlt || p.title || '', title: p.title, text: p.text, place: [p.scope, p.town].filter(Boolean).join(' · ') }))
    .filter(keep);
  if (projects.length) return { photos: projects.slice(0, 8), spare: null };
  const photos = groupsOf(b)
    .map((g) => ({ src: g.image, alt: g.imageAlt || g.title, title: g.title, href: `/${g.slug}` }))
    .filter(keep)
    .slice(0, 8);
  if (photos.length < 2) return { photos: [], spare: photos[0] || null };
  return { photos, spare: null };
}

/** How the home page opens: the brand's heroStyle, else beside its photo, else in type. */
export function heroStyleOf(b) {
  const photo = b.hero?.image && !(b.preview && stock(b.hero.image));
  if (b.heroStyle === 'type' || !photo) return 'type';
  return b.heroStyle === 'photo' ? 'photo' : 'split';
}

/** Every phone line the business gives, the listing's own number first and each named. */
export function phonesOf(b) {
  const extra = list(b.phones).filter((p) => p?.number && p.number.replace(/\D/g, '') !== String(b.phone || '').replace(/\D/g, ''));
  return [{ label: extra.length ? 'Main line' : null, number: b.phone }, ...extra].filter((p) => p.number);
}

/** The towns the business serves, its own first. */
export function areaOf(b) {
  const towns = list(b.serviceArea).filter(Boolean);
  return towns.length ? towns : [];
}

/** The text color that reads on a color: the ink on a light one, white on a dark one. */
export function onColor(hex, ink = 'var(--ink)') {
  const c = hexOr(hex, null);
  if (!c) return '#fff';
  return luminance(c) > 0.2 ? ink : '#fff';
}

/**
 * The dark ground the hero, the closing band and the footer stand on: the
 * brand's own deep shade when it is dark enough to carry white words, else its
 * main color taken most of the way to a warm near-black, so a bright red or a
 * sunny gold still gives a ground that reads as theirs.
 */
export function deepOf(brand) {
  const own = hexOr(brand.primaryDeep, null);
  if (own && luminance(own) < 0.045) return own;
  return mixHex(hexOr(brand.primary, '#2f4a35'), '#0d0f0c', 0.72);
}

/** A color's contrast against another, as WCAG measures it. */
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/**
 * The fill of the main button on the dark ground: the brand's accent or its
 * main color when one stands out from the ground, else white.
 */
export function darkActionOf(brand, deep) {
  for (const c of [brand.accent, brand.primary].map((v) => hexOr(v, null)).filter(Boolean)) {
    if (contrast(c, deep) >= 3) return c;
  }
  return '#ffffff';
}

/** A short stable number from a string, so each business's contour lines are its own. */
export function seedOf(text) {
  let h = 2166136261;
  for (const ch of String(text || '')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967295;
}

/** A heading with each hyphenated word held whole, so 'One-time' never breaks at its hyphen. */
export function unbrokenWords(title) {
  return String(title || '').split(/(\S+-\S+)/);
}
