/**
 * The text color that reads on a brand color: the brand's ink on a light
 * color, white on a dark one. Read from the brand file, so a pale blue and a
 * navy both get legible buttons without a color per brand. The switch sits
 * where dark ink starts to out-contrast white (about 0.2), so a mid blue such
 * as #6b92d2 takes ink rather than a faint white label.
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
  return luminance > 0.2 ? 'var(--ink)' : '#fff';
}
