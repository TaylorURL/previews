/**
 * Small helpers the health template shares between its sections: reading the
 * brand file's optional fields, trimming a long paragraph to whole sentences,
 * and the colors the template derives from the brand's own.
 */
import { luminance } from '../../site.js';
import { hexOr, mixHex } from '../shared.jsx';

export const list = (value) => (Array.isArray(value) ? value.filter((v) => v !== null && v !== undefined && v !== '') : []);
export const paras = (value) => (Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []);

/** The contrast ratio between two #rrggbb colors. */
export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** `hex` darkened just enough to read at `min` contrast on every one of `grounds`. */
export function readableOn(hex, grounds, min = 4.5) {
  for (let s = 0; s <= 1; s += 0.03) {
    const shade = mixHex(hex, '#000000', s);
    if (grounds.every((g) => contrast(shade, g) >= min)) return shade;
  }
  return '#000000';
}

/**
 * The template's colors, all taken from the brand's: the primary for buttons
 * and links (darkened only when white type would not read on it), pale washes
 * of it for the light grounds, and the accent for small labels and icons.
 */
export function palette(brand) {
  const raw = hexOr(brand.primary, '#1f5f8b');
  // A near-black primary washes out to grey; its accent tints the grounds instead.
  const tintFrom = luminance(raw) < 0.02 && hexOr(brand.accent, null) ? brand.accent : raw;
  const tint = mixHex(tintFrom, '#ffffff', 0.94);
  const tint2 = mixHex(tintFrom, '#ffffff', 0.86);
  const warm = luminance(hexOr(brand.cream, '#faf8f4')) > 0.86 ? hexOr(brand.cream, '#faf8f4') : '#faf8f4';
  const primary = readableOn(raw, ['#ffffff', tint], 4.5);
  const accent = readableOn(hexOr(brand.accent, raw), ['#ffffff', tint, tint2, warm], 4.5);
  const deep = mixHex(primary, '#000000', 0.28);
  return { primary, accent, tint, tint2, warm, deep, soft: mixHex(tintFrom, '#ffffff', 0.72) };
}

// Words after which a full stop does not end the sentence: titles, initials, degrees.
const ABBR = /(?:^|[\s(])(?:Dr|Mr|Mrs|Ms|Mx|Jr|Sr|St|Mt|Ft|Inc|Ltd|Co|Corp|vs|No|Ave|Blvd|Rd|Ste|approx|etc|[A-Z]|D\.C|D\.D\.S|D\.M\.D|Ph\.D|M\.D|U\.S|e\.g|i\.e|a\.m|p\.m)\.$/i;

/** A paragraph split into its sentences, keeping "Dr. Le" and "D.D.S." whole. */
export function sentences(text) {
  const out = [];
  let rest = String(text || '').trim();
  const end = /[.!?]["”’)]?\s+(?=["“(]?[A-Z0-9])/g;
  let start = 0;
  let m;
  while ((m = end.exec(rest))) {
    const head = rest.slice(start, m.index + 1);
    if (ABBR.test(head.replace(/["”’)]$/, ''))) continue;
    out.push(rest.slice(start, m.index + m[0].trimEnd().length).trim());
    start = m.index + m[0].length;
  }
  if (start < rest.length) out.push(rest.slice(start).trim());
  return out.filter(Boolean);
}

/** The opening whole sentences of `text`, as many as fit in about `max` characters (always at least one). */
export function opening(text, max = 320) {
  const all = sentences(text);
  let out = '';
  for (const s of all) {
    if (out && out.length + s.length + 1 > max) break;
    out = out ? `${out} ${s}` : s;
  }
  return out;
}

/** A button label in title case with its small words lowered: "Book An Appointment" reads "Book an Appointment". */
export function labelCase(label) {
  return String(label || '')
    .split(' ')
    .map((w, i) => (i && /^(a|an|the|of|for|to|and|or|in|on|at|with|your)$/i.test(w) ? w.toLowerCase() : w))
    .join(' ');
}

/** A name with a title or a degree is a doctor's: "Dr. Jue Sea", "Alexandra Aldridge, D.C.", "Thomas Friedt, DDS". */
export function isDoctor(person) {
  const name = String(person?.name || '');
  const role = String(person?.role || '');
  return /^dr\.?\s/i.test(name) || /\b(D\.?C|D\.?D\.?S|D\.?M\.?D|M\.?D|D\.?O)\.?$/i.test(name.replace(/,?\s*$/, '')) || /\b(dentist|chiropractor|doctor|orthodontist|periodontist|endodontist|prosthodontist|oral surgeon|physician)\b/i.test(role);
}

/**
 * Whether their own words say the practice takes new patients: a brand file
 * may say so with `newPatients`, and otherwise any mention of new patients in
 * the copy taken from their site (forms, a first visit, a welcome) counts,
 * unless it says they are not taking them.
 */
export function welcomesNew(b) {
  if (b.newPatients === false) return false;
  if (b.newPatients) return true;
  const words = [
    b.hero?.eyebrow,
    b.hero?.lead,
    ...list(b.hero?.points),
    ...list(b.highlights).flatMap((h) => [h.title, h.text]),
    b.cta?.text,
    b.process?.title,
    b.process?.text,
    ...list(b.process?.steps).flatMap((s) => [s.title, s.text]),
    ...list(b.steps).flatMap((s) => [s.title, s.text]),
    ...list(b.facts).flatMap((f) => [f.heading, f.text, ...list(f.items)]),
  ]
    .filter(Boolean)
    .join(' \n ');
  if (/\b(?:not|no longer)\s+(?:currently\s+)?(?:accepting|taking|seeing)\s+new\s+patients\b/i.test(words)) return false;
  return /\bnew[- ]patients?\b/i.test(words);
}

/** The days a practice is open, read off its hours: "Monday – Friday" when the open rows are named days in a run. */
export function openDays(hours) {
  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const open = list(hours).filter(([, time]) => time && !/closed/i.test(time));
  if (!open.length) return null;
  const idx = open.map(([day]) => DAYS.indexOf(String(day).trim().toLowerCase()));
  if (idx.some((i) => i < 0)) return null;
  for (let i = 1; i < idx.length; i++) if (idx[i] !== idx[i - 1] + 1) return null;
  const name = (i) => DAYS[i][0].toUpperCase() + DAYS[i].slice(1);
  return idx.length === 1 ? name(idx[0]) : `${name(idx[0])} – ${name(idx[idx.length - 1])}`;
}
