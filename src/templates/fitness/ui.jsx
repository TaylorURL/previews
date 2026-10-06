import { ArrowRight } from 'lucide-react';
import { Img } from '../shared.jsx';

/** The classes, styles and helpers every page of the fitness template shares. */

export const wrap = 'mx-auto w-full max-w-page px-gutter';
export const pad = 'py-[clamp(4.5rem,10vw,8rem)]';
export const hot = 'text-[color:var(--hot)]';
export const onPrimary = 'text-[color:var(--on-primary)]';

/** Oversized condensed display type. Brand copy stays sentence case in the file; the page sets it in capitals. */
export const display = 'font-heading font-normal uppercase leading-[0.9] tracking-[0.005em] [overflow-wrap:anywhere]';
export const h2 = `${display} text-[clamp(3rem,1.6rem+5.6vw,7rem)] [text-wrap:balance]`;
export const h3 = `${display} text-[clamp(1.9rem,1.5rem+1.2vw,2.6rem)]`;

/** The angled cut used on buttons, cards and photos: the top-right and bottom-left corners clipped. */
export const cut = (size) => ({
  clipPath: `polygon(0 0, calc(100% - ${size}px) 0, 100% ${size}px, 100% 100%, ${size}px 100%, 0 calc(100% - ${size}px))`,
});

const btn =
  'inline-flex min-h-[52px] items-center justify-center gap-2.5 px-7 text-[15px] font-bold uppercase tracking-[0.08em] no-underline transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--hot)]';
export const solid = `${btn} bg-primary ${onPrimary} hover:brightness-110`;
export const ghost = `${btn} border-2 border-ink/35 text-ink hover:border-ink`;

export function Btn({ href, children, ghost: isGhost = false, className = '', arrow = false }) {
  return (
    <a href={href} className={`${isGhost ? ghost : solid} ${className}`} style={isGhost ? undefined : cut(12)}>
      {children}
      {arrow && <ArrowRight size={18} aria-hidden="true" />}
    </a>
  );
}

export function Eyebrow({ children, className = '' }) {
  return (
    <p className={`mb-5 flex items-center gap-3 text-[13px] font-semibold uppercase tracking-[0.2em] ${hot} ${className}`}>
      <span className="h-1 w-8 flex-none -skew-x-[24deg] bg-[color:var(--hot)]" aria-hidden="true" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/** Five rising bars, filled to the class's intensity. */
export function Intensity({ value = 3, size = 'sm' }) {
  const v = Math.max(1, Math.min(5, Math.round(Number(value) || 3)));
  const big = size === 'lg';
  return (
    <span className="inline-flex items-end gap-[3px]" role="img" aria-label={`Intensity ${v} of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`${big ? 'w-2.5' : 'w-[7px]'} -skew-x-[14deg] ${i < v ? 'bg-[color:var(--hot)]' : 'bg-line'}`}
          style={{ height: `${(big ? 10 : 7) + i * (big ? 5 : 3)}px` }}
        />
      ))}
    </span>
  );
}

export function ClassMeta({ c, size }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] font-semibold uppercase tracking-[0.1em] text-muted">
      <Intensity value={c.intensity} size={size} />
      <span>Intensity {Math.max(1, Math.min(5, Math.round(Number(c.intensity) || 3)))}/5</span>
      {c.duration && (
        <>
          <span aria-hidden="true">/</span>
          <span>{c.duration} min</span>
        </>
      )}
    </span>
  );
}

/** One class as an angled card, linking to its own page. */
export function ClassCard({ c, index, sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' }) {
  return (
    <li className="min-w-0">
      <a
        href={`/classes/${c.slug}`}
        className="group flex h-full flex-col bg-panel text-ink no-underline transition-colors hover:bg-[color-mix(in_srgb,var(--panel)_80%,var(--primary))]"
        style={cut(28)}
      >
        <span className="relative block aspect-[4/3] overflow-hidden bg-line">
          {c.image && (
            <Img
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              src={c.image}
              alt={c.imageAlt || ''}
              sizes={sizes}
            />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-ground/85 via-ground/10 to-transparent" aria-hidden="true" />
          {index != null && (
            <span className={`absolute bottom-3 left-5 font-heading text-[3.5rem] leading-none ${hot}`} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
          )}
        </span>
        <span className="flex flex-1 flex-col gap-3 px-6 pb-8 pt-5 sm:px-7">
          <ClassMeta c={c} />
          <span className={`${h3} block`}>{c.name}</span>
          {c.summary && <span className="block text-base leading-relaxed text-muted">{c.summary}</span>}
          <span
            className={`mt-auto inline-flex min-h-11 items-center gap-2 pt-2 text-sm font-bold uppercase tracking-[0.1em] ${hot}`}
          >
            Class Details <ArrowRight size={16} aria-hidden="true" className="transition group-hover:translate-x-1" />
          </span>
        </span>
      </a>
    </li>
  );
}

/** A class's name scrolling past on the brand color. */
export function Marquee({ items }) {
  if (!items.length) return null;
  const run = [...items, ...items, ...items, ...items].slice(0, Math.max(8, items.length * 2));
  return (
    <div className="relative z-10 -my-6 overflow-hidden py-6" aria-hidden="true">
      <div className={`-mx-[5%] w-[110%] -rotate-[2deg] bg-primary py-3.5 ${onPrimary} sm:py-4`}>
        <div className="flex w-max animate-ticker motion-reduce:animate-none">
          {[...run, ...run].map((name, i) => (
            <span
              key={i}
              className="flex items-center gap-8 whitespace-nowrap pr-8 font-heading text-[clamp(1.75rem,1.3rem+1.6vw,2.9rem)] uppercase leading-none"
            >
              {name}
              <span className="inline-block h-[0.7em] w-2 -skew-x-[24deg] bg-current opacity-80" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** The heading block at the top of every inner page. */
export function PageHead({ crumbs, title, lead, children }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className={`${wrap} relative z-10 pb-[clamp(3.5rem,7vw,6rem)] pt-[clamp(3rem,7vw,6.5rem)]`}>
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 p-0 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
            {[['/', 'Home'], ...crumbs].map(([href, label], i, all) => (
              <li key={label} className="flex list-none items-center gap-2">
                {i < all.length - 1 ? (
                  <>
                    <a href={href} className="inline-flex min-h-11 items-center text-muted no-underline hover:text-ink">
                      {label}
                    </a>
                    <span aria-hidden="true">/</span>
                  </>
                ) : (
                  <span aria-current="page" className="inline-flex min-h-11 items-center text-ink">
                    {label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className={`${display} max-w-[15ch] text-[clamp(3.4rem,1.6rem+7.6vw,10rem)] [text-wrap:balance]`}>{title}</h1>
        {lead && <p className="mt-7 max-w-[40rem] text-lg leading-relaxed text-muted sm:text-xl">{lead}</p>}
        {children}
      </div>
      <span
        className="pointer-events-none absolute -right-24 bottom-0 h-3 w-[70%] -skew-x-[30deg] bg-primary sm:h-4"
        aria-hidden="true"
      />
    </section>
  );
}

/** Minutes past midnight for a time written "5:30 AM", so sessions sort and compare. */
export function minutes(time = '') {
  const m = /(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m?\.?/i.exec(time);
  if (!m) return 0;
  const h = Number(m[1]) % 12;
  return (m[3].toLowerCase() === 'p' ? h + 12 : h) * 60 + Number(m[2] || 0);
}

/** The schedule with each day's sessions in time order and each session's class looked up. */
export function weekOf(b) {
  const bySlug = Object.fromEntries((b.classes || []).map((c) => [c.slug, c]));
  return (Array.isArray(b.schedule) ? b.schedule : [])
    .map((d) => ({
      day: d.day,
      sessions: (d.sessions || [])
        .map((s) => ({ ...s, info: bySlug[s.class], name: bySlug[s.class]?.name || s.class }))
        .sort((x, y) => minutes(x.time) - minutes(y.time)),
    }))
    .filter((d) => d.day);
}
