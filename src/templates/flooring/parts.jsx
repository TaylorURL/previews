/** Small pieces every page of the flooring template shares. */

import { BrandLogo, hexOr, mixHex } from '../shared.jsx';

export const wrap = 'mx-auto w-full max-w-page px-gutter';
export const pad = 'py-[clamp(4rem,9vw,7.5rem)]';
export const h2 =
  'font-heading text-[clamp(2.05rem,1.45rem+2.2vw,3.35rem)] font-normal leading-[1.07] tracking-[-0.015em] [text-wrap:balance] break-words';
export const btn =
  'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 text-[16px] font-medium no-underline transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
export const solid = `${btn} bg-primary text-white hover:bg-primary-deep`;
export const outline = `${btn} border border-ink/30 text-ink hover:border-ink hover:bg-ink/5`;
export const light = `${btn} bg-cream text-ink hover:bg-white`;

export function Eyebrow({ children, dark = false }) {
  return (
    <p
      className={`mb-4 flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.16em] ${
        dark ? 'text-white/80' : 'text-primary'
      }`}
    >
      <span aria-hidden="true" className="h-px w-7 flex-none bg-accent" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/** The logo on the cream bar, or on the deep footer, sized by its shape. */
export function BrandMark({ b, className = '', light: onDark = false }) {
  if (b.brand.logo) {
    const ground = onDark
      ? hexOr(b.brand.primaryDeep, mixHex(hexOr(b.brand.primary, '#7a4a2b'), '#000000', 0.55))
      : hexOr(b.brand.cream, '#f8f4ec');
    return <BrandLogo b={b} ground={ground} className={className} />;
  }
  return (
    <span className={`block font-heading text-[24px] leading-none sm:text-[28px] ${onDark ? 'text-white' : 'text-ink'}`}>
      {b.shortName || b.name}
    </span>
  );
}

/** Pick one of a few heights by position, so a column of photos reads as a wall rather than a grid. */
export const MASONRY = ['aspect-[4/5]', 'aspect-[4/3]', 'aspect-square', 'aspect-[3/4]', 'aspect-[3/2]', 'aspect-[5/6]'];
