/**
 * The text color that reads on a brand color: the brand's ink on a light
 * one, white on a dark one. Read from the brand file, so a yellow roofer and
 * a navy one both get legible buttons without a color per brand.
 */
export function onColor(hex = '') {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return '#fff';
  const n = parseInt(m[1], 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.3 ? 'var(--ink)' : '#fff';
}

const rgbOf = (hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};
const lumOf = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * The accent as the charcoal grounds draw it: lightened toward white until it
 * reads there at 6 to 1. An accent that only just clears the charcoal sits
 * where neither a white nor an ink label reads on it, and a phone number set
 * in it is dim; lifted, it is bright on the charcoal and takes an ink label.
 */
export function onCharcoal(hex = '', ink = '') {
  const rgb = rgbOf(hex);
  const ground = rgbOf(ink);
  if (!rgb || !ground) return hex;
  const under = lumOf(ground);
  let out = rgb;
  for (let share = 0; share <= 1 && (lumOf(out) + 0.05) / (under + 0.05) < 6; share += 0.04) {
    out = rgb.map((v) => Math.round(v + (255 - v) * share));
  }
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** A town's name as an anchor id: "Mont Belvieu" is "mont-belvieu". */
export function townId(town = '') {
  return String(town)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
