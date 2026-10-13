/**
 * Colors worked out from the brand file, so a pale brand and a dark one both
 * get legible buttons, text and bands without a color per restaurant.
 */

export function rgb(hex = '') {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]) {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const toHex = (c) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

/** `hex` when it is a #rrggbb color, `fallback` when it is not. */
export function hexOr(hex, fallback) {
  return rgb(hex) ? String(hex).trim() : fallback;
}

/** `hex` moved toward `target` by `share` (0 to 1). */
export function mix(hex, target, share) {
  const c = rgb(hex);
  const t = rgb(target);
  if (!c || !t) return hex;
  return toHex(c.map((v, i) => v + (t[i] - v) * share));
}

/** The text that reads on a solid fill of `hex`: white, or the brand's ink, whichever stands out more. */
export function onColor(hex, ink = '#1c1410') {
  const c = rgb(hex);
  const k = rgb(ink);
  if (!c || !k) return '#ffffff';
  return contrast(c, [255, 255, 255]) >= contrast(c, k) ? '#ffffff' : ink;
}

/**
 * `hex` as it should be drawn against `ground`: itself when it already reads
 * there, otherwise moved toward `toward` (black or white) until it does.
 */
export function readable(hex, ground, toward = '#000000', target = 4.5) {
  const c = rgb(hex);
  const g = rgb(ground);
  const t = rgb(toward);
  if (!c || !g || !t) return hex;
  for (let s = 0; s <= 1.0001; s += 0.04) {
    const moved = c.map((v, i) => v + (t[i] - v) * s);
    if (contrast(moved, g) >= target) return toHex(moved);
  }
  return toward;
}

/** `hex` lifted toward white until it reads on every one of the dark `grounds`. */
export function liftOn(hex, grounds, target = 4.5) {
  const c = rgb(hex);
  const gs = grounds.map(rgb).filter(Boolean);
  if (!c || !gs.length) return hex;
  for (let s = 0; s <= 1.0001; s += 0.04) {
    const moved = c.map((v) => v + (255 - v) * s);
    if (gs.every((g) => contrast(moved, g) >= target)) return toHex(moved);
  }
  return '#ffffff';
}
