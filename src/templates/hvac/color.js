function rgb(hex = '') {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}

function luminance(c) {
  const [r, g, b] = c.map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * The text color that reads on a brand color: the brand's ink on a light
 * color, white on a dark one. Read from the brand file, so a pale blue and a
 * navy both get legible buttons without a color per brand. The switch sits
 * where dark ink starts to out-contrast white (about 0.2), so a mid blue such
 * as #6b92d2 takes ink rather than a faint white label.
 */
export function onColor(hex = '') {
  const c = rgb(hex);
  if (!c) return '#fff';
  return luminance(c) > 0.2 ? 'var(--ink)' : '#fff';
}

/**
 * The fill for a button of a brand color: the color itself under a white
 * label. An accent too light to carry white - a khaki #9e906e, a sand, a pale
 * sage - makes a flat button whose label looks disabled, and lifting it toward
 * white only trades that for a tinted button with a grey smudge on it once the
 * page is seen small. Such an accent gets a white button instead, with the
 * accent's own color darkened for the label by labelOf below, which reads at
 * any size and still carries the brand.
 */
export function fillOf(hex = '') {
  return onColor(hex) === '#fff' ? hex : '#ffffff';
}

/**
 * The label color for a button filled by fillOf: white on a deep accent, and
 * on a white button the brand's own text color (--pt), the same label the
 * promo band's white button carries. A khaki or sand darkened for the label
 * still reads as a faint grey-brown beside that button, so the accent is not
 * used for the words at all.
 */
export function labelOf(hex = '') {
  return onColor(hex) === '#fff' ? '#fff' : 'var(--pt)';
}
