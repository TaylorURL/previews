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

/** A town's name as an anchor id: "Mont Belvieu" is "mont-belvieu". */
export function townId(town = '') {
  return String(town)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
