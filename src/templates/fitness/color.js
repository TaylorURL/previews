/**
 * Colors worked out from the brand file, so one dark template dresses a lime
 * studio and a navy one without a color per brand.
 */

function luminance(hex = '') {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The text color that reads on the primary: near-black on a bright one, white on a deep one. */
export function onColor(hex) {
  const l = luminance(hex);
  return l != null && l > 0.3 ? '#0b0b0c' : '#ffffff';
}

/**
 * The primary as it is used for words and thin marks on the near-black
 * ground. A bright primary is used as it is; a deep one is lifted toward
 * white until it reads.
 */
export function hotColor(hex) {
  const l = luminance(hex);
  if (l == null || l >= 0.2) return 'var(--primary)';
  return `color-mix(in srgb, var(--primary) ${l < 0.06 ? 45 : 60}%, #ffffff)`;
}
