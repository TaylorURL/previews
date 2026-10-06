import { useEffect, useState } from 'react';
import { ArrowUpRight, Clock, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { brandVars, mapsHref, ratingLine, telHref } from '../site.js';
import { Img, Logo, Stars, Facts } from './shared.jsx';
import { onColor } from './barber/color.js';

/** Primary pulled toward the ink color, so it stays readable as text on the dark ground. */
const tint = 'text-[color:color-mix(in_srgb,var(--primary)_70%,var(--ink))]';
const onPrimary = 'text-[color:var(--on-primary)]';

const eyebrow =
  'mb-4 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.24em] text-muted before:h-px before:w-7 before:flex-none before:bg-primary';
const h2 = 'font-heading text-[clamp(2.1rem,1.5rem+2.6vw,3.6rem)] font-normal leading-[1.08] [text-wrap:balance]';
const btn =
  'inline-flex min-h-12 items-center justify-center gap-2 border px-6 py-3 text-[13px] font-medium uppercase tracking-[0.14em] no-underline transition';
const ghost = `${btn} border-ink/35 text-ink hover:border-ink`;
const solid = `${btn} border-primary bg-primary ${onPrimary} hover:brightness-110`;
const wrap = 'mx-auto max-w-page px-gutter';
const pad = 'py-[clamp(4.5rem,9vw,7.5rem)]';
const label = 'text-[11px] font-medium uppercase tracking-[0.22em] text-muted';

const NAV = [
  ['#services', 'Services'],
  ['#story', 'Our Story'],
  ['#reviews', 'Reviews'],
  ['#visit', 'Visit'],
];

/** Reviews quoted on the page; a business with none has no reviews section and no link to one. */
const reviewsOf = (b) => (Array.isArray(b.reviews) ? b.reviews : []);
const navOf = (b) => NAV.filter(([href]) => href !== '#reviews' || reviewsOf(b).length > 0);

function HoursTable({ hours, className = '' }) {
  return (
    <table className={`w-full border-collapse ${className}`}>
      <tbody>
        {hours.map(([d, h]) => (
          <tr key={d}>
            <th className="py-1 pr-4 text-left align-top font-light text-muted">{d}</th>
            <td className="py-1 text-right align-top">{h}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Barber({ b }) {
  const [open, setOpen] = useState(false);
  const tel = telHref(b.phone);
  const directions = mapsHref(b);
  const rating = ratingLine(b);
  const reviews = reviewsOf(b);
  const names = b.menu.flatMap((g) => g.items.map((i) => i.name));
  const stick = b.preview ? 'top-11' : 'top-0';
  const city = `${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;
  const anchor = b.preview ? 'scroll-mt-[152px]' : 'scroll-mt-[88px]';

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [open]);

  const ctas = (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <a className={solid} href={tel}>
        <Phone size={16} aria-hidden="true" /> Call to Book
      </a>
      <a className={ghost} href={directions}>
        Get Directions <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </div>
  );

  const facts = [
    rating && {
      key: 'rating',
      half: true,
      label: 'Google Rating',
      body: (
        <>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-heading text-[1.75rem] leading-none">{Number(b.rating).toFixed(1)}</span>
            <Stars value={b.rating} size={15} />
          </span>
          <span className="text-base text-muted">{b.reviewCount.toLocaleString()} reviews</span>
        </>
      ),
    },
    b.since && {
      key: 'since',
      half: true,
      label: 'Established',
      body: <span className="font-heading text-[1.75rem] leading-none">{b.since}</span>,
    },
    {
      key: 'address',
      label: 'Find Us',
      body: (
        <a href={directions} className="block py-1 text-ink no-underline hover:underline">
          <span className="block font-heading text-xl leading-snug">{b.address}</span>
          <span className="block text-base text-muted">{city}</span>
        </a>
      ),
    },
    {
      key: 'phone',
      label: 'Call',
      body: (
        <a
          href={tel}
          className="inline-flex min-h-11 items-center whitespace-nowrap font-heading text-xl leading-snug text-ink no-underline hover:underline"
        >
          {b.phone}
        </a>
      ),
    },
  ].filter(Boolean);
  const halves = facts.filter((f) => f.half).length;
  const factCols = {
    2: 'md:grid-cols-2 lg:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[facts.length];

  return (
    <div
      className="min-w-0 overflow-x-clip bg-ground font-body font-light text-ink antialiased"
      style={{
        ...brandVars(b.brand),
        '--on-primary': onColor(b.brand.primary),
      }}
    >
      <header className={`sticky ${stick} z-30 border-b border-line bg-ground/95 backdrop-blur-md`}>
        <div className={`${wrap} flex min-h-[72px] items-center gap-6 py-2.5`}>
          <a
            href="#top"
            className="flex min-h-11 items-center"
            aria-label={`${b.name} home`}
            onClick={() => setOpen(false)}
          >
            <span className="block max-w-[38vw] sm:max-w-none">
              <Logo b={b} className="!max-w-full" />
            </span>
          </a>
          <nav aria-label="Main" className="mx-auto hidden gap-9 lg:flex">
            {navOf(b).map(([href, text]) => (
              <a
                key={href}
                href={href}
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-[13px] font-normal uppercase tracking-[0.16em] text-muted no-underline transition hover:text-ink"
              >
                {text}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:gap-6">
            <a
              href={tel}
              className="hidden min-h-11 items-center gap-2.5 whitespace-nowrap text-[15px] font-normal text-ink no-underline sm:inline-flex"
            >
              <Phone size={16} className={tint} aria-hidden="true" /> {b.phone}
            </a>
            <a href={tel} className={`${solid} hidden min-h-11 px-5 py-2.5 lg:inline-flex`}>
              Call to Book
            </a>
            <a
              href={tel}
              aria-label={`Call ${b.phone}`}
              className="inline-flex h-11 w-11 items-center justify-center border border-line text-ink sm:hidden"
            >
              <Phone size={19} aria-hidden="true" />
            </a>
            <button
              type="button"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center border border-line bg-transparent text-ink lg:hidden"
              aria-expanded={open}
              aria-controls="barber-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div
          id="barber-menu"
          hidden={!open}
          className={`absolute inset-x-0 top-full max-h-[calc(100dvh-160px)] overflow-y-auto border-b border-line bg-ground lg:hidden`}
        >
          <nav aria-label="Mobile" className={`${wrap} pt-2`}>
            {navOf(b).map(([href, text]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center border-b border-line py-4 font-heading text-[1.75rem] leading-tight text-ink no-underline"
              >
                {text}
              </a>
            ))}
          </nav>
          <div className={`${wrap} grid gap-3 py-6 sm:grid-cols-2`}>
            <a className={solid} href={tel}>
              <Phone size={16} aria-hidden="true" /> Call {b.phone}
            </a>
            <a className={ghost} href={directions}>
              Get Directions <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className={`${wrap} pb-8`}>
            <p className={`${label} mb-2`}>Hours</p>
            <HoursTable hours={b.hours} className="max-w-md text-base" />
          </div>
        </div>
      </header>

      <section
        id="top"
        className={`${wrap} grid items-center gap-x-16 gap-y-12 pb-[clamp(4rem,7vw,6rem)] pt-[clamp(2rem,5vw,4.5rem)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]`}
      >
        <div className="min-w-0">
          <p className={eyebrow}>{b.hero.eyebrow}</p>
          <h1 className="font-heading text-[clamp(2.6rem,1.7rem+3.9vw,5.25rem)] font-normal leading-[1.04] [overflow-wrap:anywhere] [text-wrap:balance]">
            {b.hero.title}
          </h1>
          <p className="mb-9 mt-6 max-w-[34rem] text-lg leading-relaxed text-muted sm:text-xl">{b.hero.lead}</p>
          {ctas}
        </div>
        <div className={`relative min-w-0 ${b.hero.inset ? 'pb-10 sm:pb-12' : ''} lg:pl-10`}>
          <Img
            className="aspect-[4/5] max-h-[78vh] w-full object-cover object-[center_30%] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)] sm:aspect-[4/3] lg:aspect-[4/5]"
            src={b.hero.image}
            alt={b.hero.imageAlt}
            sizes="(max-width: 1024px) 100vw, 45vw"
            eager
          />
          {b.hero.inset && (
            <figure className="absolute bottom-0 left-3 m-0 w-[44%] max-w-[260px] -rotate-3 bg-paper px-2 pt-2 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)] sm:px-2.5 sm:pt-2.5 lg:left-0">
              <Img
                className="aspect-[5/4] w-full object-cover sepia-[0.15]"
                src={b.hero.inset}
                alt={b.hero.insetAlt}
                sizes="260px"
              />
              {b.since ? (
                <figcaption className="py-1.5 text-center font-heading text-base text-[#2a2522] sm:py-2 sm:text-lg">
                  Est. {b.since}
                </figcaption>
              ) : (
                <span className="block h-2" />
              )}
            </figure>
          )}
        </div>
      </section>

      <div className="border-y border-line">
        <div className="mx-auto max-w-page lg:px-gutter">
          <dl className={`m-0 grid grid-cols-2 gap-px bg-line ${factCols}`}>
            {facts.map((f) => (
              <div
                key={f.key}
                className={`grid content-start gap-2 bg-ground px-gutter py-6 lg:px-8 lg:py-7 lg:first:pl-0 ${
                  f.half && halves === 2 ? 'col-span-1' : 'col-span-2'
                } md:col-span-1 md:[&:last-child:nth-child(odd)]:col-span-2 lg:[&:last-child:nth-child(odd)]:col-span-1`}
              >
                <dt className={label}>{f.label}</dt>
                <dd className="m-0 grid gap-1.5">{f.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className={`overflow-hidden bg-primary py-4 ${onPrimary}`} aria-hidden="true">
        <div className="flex w-max animate-ticker motion-reduce:animate-none">
          {[...names, ...names].map((n, i) => (
            <span key={i} className="flex items-center whitespace-nowrap px-6 font-heading text-lg">
              {n}
              <span className="ml-12 text-[10px] opacity-70">&#10022;</span>
            </span>
          ))}
        </div>
      </div>

      <section id="services" className={`border-b border-line bg-panel ${anchor}`}>
        <div className={`${wrap} ${pad}`}>
          <div className="mb-[clamp(2.5rem,5vw,3.5rem)] flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={eyebrow}>Services</p>
              <h2 className={h2}>The menu</h2>
            </div>
            <a className={`${solid} hidden self-start lg:inline-flex lg:self-auto`} href={tel}>
              <Phone size={16} aria-hidden="true" /> Call to Book
            </a>
          </div>
          {b.menu.map((g, gi) => (
            <div
              key={g.group}
              className="grid gap-x-12 gap-y-4 border-t border-line py-8 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:py-12"
            >
              <div className="flex items-baseline gap-3 lg:block">
                <span className={`font-heading text-sm ${tint} lg:mb-2 lg:block`}>
                  {String(gi + 1).padStart(2, '0')}
                </span>
                <h3 className="font-heading text-[1.65rem] font-normal leading-tight lg:text-[2rem]">{g.group}</h3>
                <p className="mt-2 hidden text-sm text-muted lg:block">
                  {g.items.length} {g.items.length === 1 ? 'service' : 'services'}
                </p>
              </div>
              <ul className="divide-y divide-line">
                {g.items.map((i) => (
                  <li
                    key={i.name}
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1.5 py-4 first:pt-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_auto] md:gap-x-8 md:py-5 lg:first:pt-1"
                  >
                    <strong className="col-start-1 row-start-1 text-lg font-normal leading-snug">{i.name}</strong>
                    {i.price != null && (
                      <span className="col-start-2 row-start-1 font-heading text-lg leading-snug md:col-start-3">
                        ${i.price}
                      </span>
                    )}
                    {i.text && (
                      <p className="col-span-2 m-0 text-base leading-relaxed text-muted md:col-span-1 md:col-start-2 md:row-start-1">
                        {i.text}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <a className={`${solid} mt-4 w-full sm:w-auto lg:hidden`} href={tel}>
            <Phone size={16} aria-hidden="true" /> Call to Book
          </a>
        </div>
      </section>

      {b.hairTypes && (
        <section className={`${wrap} ${pad}`}>
          <div className="mb-[clamp(2.5rem,5vw,3.5rem)] max-w-3xl">
            <p className={eyebrow}>Every hair type</p>
            <h2 className={h2}>Straight to coily, we know how to cut it.</h2>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {b.hairTypes.map((t) => (
              <li
                key={t.name}
                className="grid justify-items-center gap-1 bg-paper px-3 pb-6 pt-5 text-center text-[#1b1916] sm:px-4 sm:pb-7 sm:pt-6"
              >
                <Img
                  className="aspect-square w-[70%] object-contain mix-blend-multiply"
                  src={t.image}
                  alt=""
                  sizes="200px"
                />
                <strong className="font-heading text-[1.4rem] font-normal sm:text-2xl">{t.name}</strong>
                {t.code && <span className="text-sm tracking-[0.12em] opacity-70">{t.code}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="story" className={`border-t border-line ${anchor}`}>
        <div className={`${wrap} ${pad}`}>
          <div className="mb-[clamp(2.5rem,6vw,5rem)] max-w-3xl">
            <p className={eyebrow}>{b.story.eyebrow}</p>
            <h2 className={h2}>{b.story.title}</h2>
          </div>
          <ol className="m-0 grid list-none gap-[clamp(3.5rem,8vw,6.5rem)] p-0">
            {b.story.chapters.map((c, i) => (
              <li key={c.title} className="grid items-center gap-x-[clamp(2rem,6vw,6rem)] gap-y-6 md:grid-cols-2">
                <Img
                  className={`aspect-[4/3] w-full object-cover grayscale-[0.2] ${i % 2 ? 'md:order-2' : ''}`}
                  src={c.image}
                  alt={c.alt}
                  sizes="(max-width: 768px) 100vw, 45vw"
                />
                <div className="min-w-0">
                  {c.year && (
                    <span
                      className={`mb-3 block font-heading text-[clamp(2.2rem,1.6rem+2.4vw,3.5rem)] leading-none ${tint}`}
                    >
                      {c.year}
                    </span>
                  )}
                  <h3 className="font-heading text-[1.65rem] font-normal leading-tight sm:text-3xl">{c.title}</h3>
                  <p className="mt-4 max-w-md text-[17px] leading-relaxed text-muted">{c.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {reviews.length > 0 && (
        <section id="reviews" className={`border-t border-line ${anchor}`}>
          <div className={`${wrap} ${pad} grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]`}>
            <div>
              <p className={eyebrow}>From the chair</p>
              {rating ? (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3 lg:block">
                  <p className="m-0 font-heading text-[clamp(4rem,3rem+5vw,7.5rem)] leading-none">
                    {Number(b.rating).toFixed(1)}
                  </p>
                  <div className="grid gap-2 lg:mt-4">
                    <Stars value={b.rating} size={20} />
                    <p className="m-0 text-base text-muted">From {b.reviewCount.toLocaleString()} Google reviews</p>
                  </div>
                </div>
              ) : (
                <h2 className={h2}>What clients say</h2>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
              {reviews.map((r, i) => (
                <figure
                  key={r.author}
                  className={`m-0 flex flex-col border p-6 sm:p-8 ${
                    i === 0 ? `border-primary bg-primary md:col-span-2 ${onPrimary}` : 'border-line bg-panel'
                  }`}
                >
                  <blockquote
                    className={`m-0 mb-6 font-heading leading-snug ${i === 0 ? 'text-[1.35rem] sm:text-[1.65rem]' : 'text-[1.2rem] sm:text-xl'}`}
                  >
                    &ldquo;{r.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-auto text-xs font-medium uppercase tracking-[0.16em] opacity-80">
                    {r.author}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="visit" className={`grid border-t border-line md:grid-cols-2 ${anchor}`}>
        <div className="w-full min-w-0 px-gutter py-[clamp(4rem,8vw,7rem)] md:max-w-[660px] md:justify-self-end">
          <p className={eyebrow}>Visit</p>
          <h2 className={`${h2} mb-9`}>Walk in or call ahead.</h2>
          <a className="flex gap-4 border-t border-line py-4 text-[17px] text-ink no-underline" href={directions}>
            <MapPin size={18} className={`mt-1 flex-none ${tint}`} aria-hidden="true" />
            <span>
              {b.address}
              <br />
              {city}
            </span>
          </a>
          <a className="flex items-center gap-4 border-t border-line py-4 text-[17px] text-ink no-underline" href={tel}>
            <Phone size={18} className={`flex-none ${tint}`} aria-hidden="true" />
            <span>{b.phone}</span>
          </a>
          {b.email && (
            <a
              className="flex items-center gap-4 border-t border-line py-4 text-[17px] text-ink no-underline [overflow-wrap:anywhere]"
              href={`mailto:${b.email}`}
            >
              <Mail size={18} className={`flex-none ${tint}`} aria-hidden="true" />
              <span className="min-w-0">{b.email}</span>
            </a>
          )}
          <div className="mb-8 flex gap-4 border-y border-line py-4 text-[17px]">
            <Clock size={18} className={`mt-1.5 flex-none ${tint}`} aria-hidden="true" />
            <HoursTable hours={b.hours} />
          </div>
          {ctas}
        </div>
        <Img
          className="h-[320px] w-full object-cover sm:h-[420px] md:h-full md:min-h-[520px]"
          src={b.visitImage || b.hero.image}
          alt=""
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </section>

      <Facts b={b} />
      <footer className="border-t border-line bg-panel">
        <div
          className={`${wrap} grid gap-10 pb-10 pt-14 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1.1fr)] lg:gap-12 lg:pt-20`}
        >
          <div className="grid content-start gap-4">
            <span className="block max-w-[44vw] sm:max-w-none">
              <Logo b={b} className="!max-w-full" />
            </span>
            <p className="m-0 font-heading text-xl">{b.name}</p>
            <p className="m-0 text-base leading-relaxed text-muted">
              {b.address}
              <br />
              {city}
            </p>
          </div>
          <div>
            <p className={`${label} mb-3`}>Index</p>
            <ul className="m-0 grid list-none p-0">
              {navOf(b).map(([href, text]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="inline-flex min-h-11 min-w-11 items-center text-base text-ink no-underline hover:underline"
                  >
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className={`${label} mb-3`}>Hours</p>
            <HoursTable hours={b.hours} className="text-base" />
          </div>
          <div>
            <p className={`${label} mb-3`}>Contact</p>
            <ul className="m-0 grid list-none p-0">
              <li>
                <a
                  href={tel}
                  className="inline-flex min-h-11 min-w-11 items-center text-base text-ink no-underline hover:underline"
                >
                  {b.phone}
                </a>
              </li>
              {b.email && (
                <li>
                  <a
                    href={`mailto:${b.email}`}
                    className="inline-flex min-h-11 min-w-11 items-center text-base text-ink no-underline [overflow-wrap:anywhere] hover:underline"
                  >
                    {b.email}
                  </a>
                </li>
              )}
              <li>
                <a
                  href={directions}
                  className="inline-flex min-h-11 items-center gap-1.5 text-base text-ink no-underline hover:underline"
                >
                  Get Directions <ArrowUpRight size={15} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className={`${wrap} pb-28 md:pb-10`}>
          <p className="m-0 border-t border-line pt-6 text-[13px] text-muted">
            &copy; {new Date().getFullYear()} {b.name}
          </p>
        </div>
      </footer>

      <div className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 grid grid-cols-2 gap-2 md:hidden">
        <a
          href={tel}
          className={`inline-flex min-h-[52px] items-center justify-center gap-2 bg-primary font-medium uppercase tracking-[0.08em] no-underline shadow-xl ${onPrimary}`}
        >
          <Phone size={17} aria-hidden="true" /> Call
        </a>
        <a
          href={directions}
          className="inline-flex min-h-[52px] items-center justify-center gap-2 bg-paper font-medium uppercase tracking-[0.08em] text-[#1b1916] no-underline shadow-xl"
        >
          <MapPin size={17} aria-hidden="true" /> Directions
        </a>
      </div>
    </div>
  );
}
