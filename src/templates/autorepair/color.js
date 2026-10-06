/**
 * Colors worked out from the brand file, so a red shop and a navy one both get
 * legible buttons and headlines without a color per brand.
 */

function rgb(hex = '') {
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

/** Text that reads on a solid fill of `hex`: the ink color on a light fill, white on a dark one. */
export function onColor(hex) {
  const c = rgb(hex);
  if (!c) return '#fff';
  return contrast(c, [255, 255, 255]) >= 3 ? '#fff' : 'var(--ink)';
}

/**
 * The brand's primary as it should be drawn as text on a dark `ground`:
 * the primary itself when it already reads there, otherwise the primary
 * lifted toward white until it does.
 */
export function liftOn(hex, ground, target = 4.5) {
  const c = rgb(hex);
  const g = rgb(ground);
  if (!c || !g) return hex || '#fff';
  for (let t = 0; t <= 1.0001; t += 0.05) {
    const mixed = c.map((v) => v + (255 - v) * t);
    if (contrast(mixed, g) >= target) return toHex(mixed);
  }
  return '#ffffff';
}
