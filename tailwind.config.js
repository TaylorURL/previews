/**
 * Every brand color and font comes from the business's file in src/brands,
 * set as custom properties on the template's root by brandVars(). These are
 * the Tailwind names for those properties, so one set of utilities dresses
 * every business. Nothing here holds a color.
 */
const token =
  (name) =>
  ({ opacityValue } = {}) =>
    opacityValue === undefined || opacityValue === '1'
      ? `var(--${name})`
      : `color-mix(in srgb, var(--${name}) calc(${opacityValue} * 100%), transparent)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: token('primary'),
        'primary-deep': token('primaryDeep'),
        accent: token('accent'),
        ink: token('ink'),
        muted: token('muted'),
        surface: token('surface'),
        cream: token('cream'),
        line: token('line'),
        panel: token('panel'),
        ground: token('bg'),
        // The header's ground and text, from the logo's own ground (site.js);
        // white and the brand's ink when a brand file gives none.
        head: 'var(--head, #ffffff)',
        'head-ink': 'var(--head-ink, var(--ink))',
        'head-soft': 'var(--head-soft, var(--muted, #5b6470))',
        'head-line': 'var(--head-line, color-mix(in srgb, var(--ink) 10%, transparent))',
        'head-hover': 'var(--head-hover, var(--primary))',
        star: '#f5b921',
        paper: '#f4efe4',
      },
      fontFamily: {
        heading: 'var(--heading)',
        body: 'var(--body)',
      },
      spacing: {
        gutter: 'clamp(16px, 4vw, 64px)',
      },
      maxWidth: {
        page: '1320px',
      },
      keyframes: {
        peek: { from: { transform: 'translateY(40%)', opacity: '0' } },
        ticker: { to: { transform: 'translateX(-50%)' } },
      },
      animation: {
        peek: 'peek 0.9s cubic-bezier(0.2, 0.9, 0.3, 1.3) 0.3s both',
        ticker: 'ticker 60s linear infinite',
      },
    },
  },
  plugins: [],
};
