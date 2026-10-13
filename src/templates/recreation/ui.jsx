import { ArrowRight } from 'lucide-react';
import { Img } from '../shared.jsx';

/** The classes, parts and helpers every page of the recreation template shares. */

export const wrap = 'mx-auto w-full max-w-page px-gutter';
export const pad = 'py-[clamp(4rem,8vw,6.5rem)]';
export const onP = 'text-[color:var(--on-primary)]';
export const pt = 'text-[color:var(--pt)]';

export const h1 = 'break-words font-heading font-display leading-[1.03] [text-wrap:balance]';
export const h2 =
  'break-words font-heading font-display text-[clamp(2rem,1.35rem+2.5vw,3.25rem)] leading-[1.06] text-ink [text-wrap:balance]';
export const h3 = 'break-words font-heading font-display-2 leading-[1.15]';

const btn =
  'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-2 text-center font-heading text-[17px] font-semibold leading-tight no-underline transition duration-150 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2';
/** The main button on a white or pale ground. */
export const solid = `${btn} bg-primary ${onP} hover:bg-primary-deep focus-visible:outline-primary`;
/** The main button on the brand-color ground: the accent, lifted off the page. */
export const pop = `${btn} bg-accent text-[color:var(--on-accent)] shadow-[0_5px_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:shadow-[0_7px_0_rgba(0,0,0,0.2)] focus-visible:outline-[color:var(--on-primary)]`;
/** A second button on a white or pale ground. */
export const outline = `${btn} border-2 border-[color:color-mix(in_srgb,var(--pt)_35%,transparent)] ${pt} hover:border-[color:var(--pt)] focus-visible:outline-primary`;
/** A second button on the brand-color ground. */
export const ghost = `${btn} border-2 border-[color:color-mix(in_srgb,var(--on-primary)_55%,transparent)] ${onP} hover:bg-[color:color-mix(in_srgb,var(--on-primary)_12%,transparent)] focus-visible:outline-[color:var(--on-primary)]`;

export const list = (value) => (Array.isArray(value) ? value.filter((v) => v != null && v !== '') : []);
export const paras = (value) => (Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []);
const filled = (value) => value != null && String(value).trim() !== '';

/** A small label over a heading, with a dot in the brand color. */
export function Eyebrow({ children, light = false, className = '' }) {
  return (
    <p
      className={`mb-4 flex items-center gap-2.5 font-heading text-[15px] font-semibold uppercase tracking-[0.1em] ${
        light ? onP : pt
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`size-2.5 flex-none rounded-full ${light ? 'bg-accent ring-2 ring-[color:color-mix(in_srgb,var(--on-primary)_45%,transparent)]' : 'bg-primary'}`}
      />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/** The curved edge at the foot of a brand-color band, in the color of the section under it. */
export function Wave({ className = 'text-white' }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute inset-x-0 bottom-[-1px] block h-[clamp(20px,3.6vw,52px)] w-full ${className}`}
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
    >
      <path fill="currentColor" d="M0 50 C 260 6, 520 10, 760 42 S 1220 82, 1440 30 L 1440 80 L 0 80 Z" />
    </svg>
  );
}

/** Rings and dots on the brand-color grounds. Decoration only, kept clear of the words. */
export function Confetti() {
  const soft = 'color-mix(in srgb, var(--on-primary) 12%, transparent)';
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <span className="absolute -right-20 -top-28 hidden size-[18rem] rounded-full border-[22px] lg:block" style={{ borderColor: soft }} />
      <span className="absolute -bottom-56 right-[18%] hidden size-[22rem] rounded-full border-[30px] lg:block" style={{ borderColor: soft }} />
      <span
        className="absolute right-[6%] top-[18%] hidden h-40 w-56 lg:block"
        style={{ backgroundImage: `radial-gradient(${soft} 2px, transparent 2.5px)`, backgroundSize: '18px 18px' }}
      />
    </div>
  );
}

/** Small rounded labels: ages, season, and the like. */
export function Chips({ items, light = false, className = '' }) {
  const shown = items.filter((item) => item && filled(item));
  if (!shown.length) return null;
  return (
    <ul className={`m-0 flex list-none flex-wrap gap-2 p-0 ${className}`}>
      {shown.map((item) => (
        <li
          key={item}
          className={`rounded-full px-3.5 py-1.5 text-[14px] font-bold leading-tight ${
            light ? 'bg-[color:color-mix(in_srgb,var(--on-primary)_14%,transparent)] ' + onP : `bg-surface ${pt}`
          }`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Breadcrumbs on the brand-color ground. */
export function Crumbs({ trail }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className={`m-0 flex list-none flex-wrap items-center gap-x-2 p-0 text-[15px] font-semibold ${onP}`}>
        {[['/', 'Home'], ...trail].map(([href, label], i, all) => (
          <li key={`${href}-${label}`} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className="opacity-60">
                /
              </span>
            )}
            {i < all.length - 1 ? (
              <a href={href} className={`inline-flex min-h-11 items-center no-underline opacity-80 hover:underline hover:opacity-100 ${onP}`}>
                {label}
              </a>
            ) : (
              <span aria-current="page" className="inline-flex min-h-11 items-center">
                {label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** The head of every inner page: the brand color, the title, and a photo beside it when there is one. */
export function PageHero({ trail, title, lead, chips = [], image, imageAlt, position, actions, waveClass = 'text-white' }) {
  return (
    <section className={`relative isolate overflow-hidden bg-primary ${onP}`}>
      <Confetti />
      <div
        className={`${wrap} grid items-center gap-10 pb-[clamp(3.5rem,7vw,6rem)] pt-6 lg:pt-10 ${
          image ? 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14' : ''
        }`}
      >
        <div className="min-w-0 max-w-[46rem]">
          <Crumbs trail={trail} />
          <Chips items={chips} light className="mb-5" />
          <h1 className={`${h1} text-[clamp(2.4rem,1.5rem+3.6vw,4.4rem)]`}>{title}</h1>
          {lead && <p className="mb-0 mt-5 max-w-[40rem] text-[18px] leading-[1.6] opacity-90 sm:text-[20px]">{lead}</p>}
          {actions && <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>}
        </div>
        {image && (
          <div className="relative mx-auto w-full min-w-0 max-w-[620px] pb-3 pr-3 lg:max-w-none">
            <span aria-hidden="true" className="absolute inset-0 left-3 top-3 rounded-[2rem] bg-accent" />
            <Img
              className="relative aspect-[4/3] w-full rounded-[2rem] border-[5px] border-white object-cover"
              src={image}
              alt={imageAlt || ''}
              style={position ? { objectPosition: position } : undefined}
              sizes="(max-width: 1024px) 100vw, 45vw"
              eager
            />
          </div>
        )}
      </div>
      <Wave className={waveClass} />
    </section>
  );
}

/**
 * The facts of one offering, each only when the brand gives it: who it is for,
 * when it runs, and the price as the business states it.
 */
export function metaOf(p, k) {
  return [
    ['Ages', p.ages],
    [k.season, p.season],
    [k.schedule, p.schedule],
    ['Price', p.price],
  ].filter(([, value]) => filled(value));
}

export function Meta({ p, k, single = false }) {
  const rows = metaOf(p, k);
  if (!rows.length) return null;
  return (
    <dl className={`m-0 grid gap-3 ${single ? '' : 'sm:grid-cols-2'}`}>
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0 rounded-2xl bg-surface px-4 py-3">
          <dt className="text-[13px] font-bold uppercase tracking-[0.12em] text-muted">{label}</dt>
          <dd className="m-0 mt-1 break-words text-[17px] font-semibold leading-snug text-ink">
            {String(value)}
            {label === 'Price' && p.priceNote && (
              <span className="mt-0.5 block text-[15px] font-normal leading-snug text-muted">{p.priceNote}</span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** One offering as a card. The whole card opens its page, or its place on the programs page. */
export function ProgramCard({ p, k, href, tile = false, sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' }) {
  const Mark = k.mark;
  return (
    <li className="min-w-0">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-line bg-white transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_26px_44px_-30px_rgba(15,23,42,0.5)]">
        {p.image ? (
          <div className="aspect-[4/3] overflow-hidden bg-surface">
            <Img
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              src={p.image}
              alt={p.imageAlt || ''}
              sizes={sizes}
            />
          </div>
        ) : tile ? (
          // Beside cards with photos, one without has the brand color and a mark where its photo would be.
          <div aria-hidden="true" className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-primary text-[color:var(--on-primary)]">
            <span
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(color-mix(in srgb, var(--on-primary) 16%, transparent) 2px, transparent 2.5px)',
                backgroundSize: '18px 18px',
              }}
            />
            <span className="relative grid size-28 place-items-center rounded-full bg-accent text-[color:var(--on-accent)] shadow-[0_6px_0_rgba(0,0,0,0.18)]">
              <Mark size={52} strokeWidth={1.75} />
            </span>
          </div>
        ) : (
          <div aria-hidden="true" className="h-2.5 bg-primary" />
        )}
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <Chips items={[p.ages && `Ages ${p.ages}`, p.season]} className="mb-4" />
          <h3 className={`${h3} text-[24px] text-ink`}>
            <a href={href} className="text-ink no-underline after:absolute after:inset-0 after:content-['']">
              {p.title}
            </a>
          </h3>
          {p.summary && <p className="mb-0 mt-3 text-[16px] leading-[1.6] text-muted">{p.summary}</p>}
          {filled(p.price) && (
            <p className="mb-0 mt-4 font-heading text-[19px] font-semibold text-ink">
              {String(p.price)}
              {p.priceNote && <span className="mt-0.5 block font-body text-[14px] font-normal text-muted">{p.priceNote}</span>}
            </p>
          )}
          <span className={`mt-auto inline-flex items-center gap-1.5 pt-5 font-heading text-[16px] font-semibold ${pt}`}>
            {k.offering} Details{' '}
            <ArrowRight size={17} className="transition group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </article>
    </li>
  );
}

/** A tick list in rounded rows. */
export function Ticks({ items, icon: Icon }) {
  return (
    <ul className="m-0 grid list-none gap-2.5 p-0">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 rounded-2xl bg-surface px-4 py-3 text-[17px] leading-snug">
          <span className="mt-0.5 grid size-6 flex-none place-items-center rounded-full bg-primary text-[color:var(--on-primary)]">
            <Icon size={15} strokeWidth={3} aria-hidden="true" />
          </span>
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * On localhost and preview URLs the business and page are named by ?b= and
 * ?p=, so a root-relative link would lose them. Clicks are rewritten there;
 * a prerendered page has neither and its links are left alone.
 */
export function keepQuery(event) {
  const a = event.target.closest?.('a[href^="/"]');
  if (!a || event.defaultPrevented || event.metaKey || event.ctrlKey) return;
  const query = new URLSearchParams(window.location.search);
  if (!query.get('b')) return;
  const [path, hash] = a.getAttribute('href').split('#');
  const page = path.replace(/^\/+|\/+$/g, '');
  const here = query.get('p') || '';
  event.preventDefault();
  if (page === here && hash) {
    window.location.hash = hash;
    return;
  }
  query.set('p', page);
  window.location.href = `${window.location.pathname}?${query}${hash ? `#${hash}` : ''}`;
}
