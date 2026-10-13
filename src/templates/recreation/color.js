/**
 * Colors worked out from the brand file, so a navy club and a lime kart track
 * both get legible buttons, links and stickers without a color per brand.
 */

function rgb(hex = '') {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const full = m[1].length === 3 ? m[1].replace(/./g, (x) => x + x) : m[1];
  const n = parseInt(full, 16);
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

const INK = [17, 24, 39];

/** The text color that reads best on a fill of `hex`: white, or near-black. */
export function onColor(hex) {
  const c = rgb(hex);
  if (!c) return '#ffffff';
  return contrast(c, [255, 255, 255]) >= contrast(c, INK) ? '#ffffff' : '#111827';
}

/**
 * `hex` as it is drawn for words on a white ground: the color itself when it
 * already reads there, otherwise darkened until it does.
 */
export function readableOnWhite(hex, target = 4.5) {
  const c = rgb(hex);
  if (!c) return hex || '#111827';
  for (let t = 0; t <= 1.0001; t += 0.05) {
    const mixed = c.map((v) => v * (1 - t));
    if (contrast(mixed, [255, 255, 255]) >= target) return toHex(mixed);
  }
  return '#111827';
}
