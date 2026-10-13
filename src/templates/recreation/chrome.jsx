import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { mapsHref } from '../../site.js';
import { BrandLogo, StudioCredit } from '../shared.jsx';
import { Confetti, ghost, list, onP, outline, pop, pt, solid, wrap } from './ui.jsx';

/** The header, the closing band, the footer and the phone's action bar. */

export function Header({ b, ctx, section }) {
  const [open, setOpen] = useState(false);
  const stick = b.preview ? 'top-11' : 'top-0';

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`sticky ${stick} z-40 border-b border-head-line bg-head`}>
      <div className={`${wrap} flex h-[72px] items-center gap-3 lg:h-[88px] lg:gap-8`}>
        <a
          href="/"
          aria-label={`${b.name} home`}
          className="flex min-h-11 min-w-0 flex-initial items-center no-underline"
          onClick={() => setOpen(false)}
        >
          <BrandLogo b={b} textClass="font-display text-head-ink" />
        </a>

        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="m-0 flex list-none items-center gap-1 p-0 xl:gap-2">
            {ctx.nav.map(([href, label, key]) => (
              <li key={key}>
                <a
                  href={`/${href}`}
                  aria-current={section === key ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-4 font-heading text-[17px] font-semibold text-head-ink no-underline transition-colors hover:bg-[color:color-mix(in_srgb,var(--head-ink,var(--ink))_8%,transparent)] ${
                    section === key ? 'bg-[color:color-mix(in_srgb,var(--head-ink,var(--ink))_10%,transparent)]' : ''
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex flex-none items-center gap-2 lg:ml-0">
          <a
            href={ctx.tel}
            className="hidden min-h-11 items-center gap-2 whitespace-nowrap px-2 font-heading text-[17px] font-semibold text-head-ink no-underline hover:underline xl:inline-flex"
          >
            <Phone size={18} aria-hidden="true" /> {b.phone}
          </a>
          <a href={ctx.action.href} className={`${solid} hidden !min-h-12 !px-6 md:inline-flex`}>
            {ctx.action.label}
          </a>
          <a
            href={ctx.tel}
            aria-label={`Call ${b.phone}`}
            className="grid size-11 flex-none place-items-center rounded-full border border-head-line text-head-ink xl:hidden"
          >
            <Phone size={19} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="inline-flex h-11 flex-none cursor-pointer items-center gap-2 rounded-full border border-head-line bg-transparent px-4 font-heading text-[16px] font-semibold text-head-ink lg:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((was) => !was)}
          >
            {open ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <div
        id="site-menu"
        hidden={!open}
        className={`absolute inset-x-0 top-full overflow-y-auto border-b border-line bg-white shadow-[0_30px_50px_-30px_rgba(15,23,42,0.5)] lg:hidden ${
          b.preview ? 'max-h-[calc(100dvh-116px)]' : 'max-h-[calc(100dvh-72px)]'
        }`}
      >
        <nav aria-label="Mobile" className={`${wrap} pb-7 pt-2`}>
          <ul className="m-0 list-none p-0">
            {[['', 'Home', ''], ...ctx.nav].map(([href, label, key]) => (
              <li key={key || 'home'} className="border-b border-line">
                <a
                  href={`/${href}`}
                  onClick={() => setOpen(false)}
                  aria-current={section === key ? 'page' : undefined}
                  className="flex min-h-14 items-center justify-between font-heading text-[20px] font-semibold text-ink no-underline"
                >
                  {label} <ArrowRight size={19} className={pt} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href={ctx.action.href} onClick={() => setOpen(false)} className={solid}>
              {ctx.action.label}
            </a>
            <a href={ctx.tel} className={outline}>
              <Phone size={18} aria-hidden="true" /> {b.phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

/** The call to action that closes every page but the contact page. */
export function CtaBand({ b, ctx }) {
  const title = b.band?.title || ctx.k.band;
  const text = b.band?.text || `Call ${b.shortName} at ${b.phone}, or send a question from the contact page.`;
  return (
    <section className={`relative isolate overflow-hidden bg-primary ${onP}`}>
      <Confetti />
      <div className={`${wrap} flex flex-col gap-8 py-[clamp(3.5rem,7vw,5.5rem)] lg:flex-row lg:items-center lg:justify-between`}>
        <div className="min-w-0 max-w-[44rem]">
          <h2 className="break-words font-heading font-display text-[clamp(2rem,1.3rem+2.6vw,3.25rem)] leading-[1.06] [text-wrap:balance]">
            {title}
          </h2>
          <p className="mb-0 mt-4 text-[18px] leading-[1.6] opacity-90">{text}</p>
        </div>
        <div className="grid flex-none gap-3 sm:flex">
          <a href={ctx.action.href} className={pop}>
            {ctx.action.label} <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a href={ctx.tel} className={ghost}>
            <Phone size={18} aria-hidden="true" /> {b.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

const SOCIAL = [
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['tiktok', 'TikTok'],
  ['youtube', 'YouTube'],
];

export function Footer({ b, ctx }) {
  const hours = list(b.hours).filter((row) => Array.isArray(row) && row[0] && row[1]);
  const social = SOCIAL.filter(([key]) => b.social?.[key]);
  const label = 'mb-3 font-heading text-[15px] font-semibold uppercase tracking-[0.1em] text-ink';
  const link = 'inline-flex min-h-11 items-center text-[16px] text-muted no-underline hover:text-ink hover:underline';
  return (
    <footer className="bg-white pb-[84px] md:pb-0">
      <div aria-hidden="true" className="h-2 bg-primary" />
      <div
        className={`${wrap} grid gap-10 pb-10 pt-14 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:pt-20`}
      >
        <div className="min-w-0">
          <a href="/" className="inline-flex min-h-11 max-w-full items-center no-underline" aria-label={`${b.name} home`}>
            <BrandLogo b={b} ground="#ffffff" textClass="font-display text-ink" />
          </a>
          {b.tagline && <p className="mb-0 mt-4 max-w-xs text-[16px] leading-relaxed text-muted">{b.tagline}</p>}
          <a href={mapsHref(b)} className="mt-4 flex items-start gap-2.5 text-[16px] leading-relaxed text-ink no-underline hover:underline">
            <MapPin size={18} className={`mt-1 flex-none ${pt}`} aria-hidden="true" />
            <span>
              {b.address}
              <br />
              {b.town}, {b.state}
              {b.zip ? ` ${b.zip}` : ''}
            </span>
          </a>
          {social.length > 0 && (
            <ul className="m-0 mt-3 flex list-none flex-wrap gap-x-5 p-0">
              {social.map(([key, name]) => (
                <li key={key}>
                  <a href={b.social[key]} rel="noopener" className={`${link} gap-1 font-semibold !text-ink`}>
                    {name} <ArrowUpRight size={15} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <nav aria-label="Footer" className="min-w-0">
          <h2 className={label}>Explore</h2>
          <ul className="m-0 grid list-none p-0">
            {ctx.nav.map(([href, text, key]) => (
              <li key={key}>
                <a href={`/${href}`} className={link}>
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {hours.length > 0 && (
          <div className="min-w-0">
            <h2 className={label}>Hours</h2>
            <dl className="m-0 grid gap-2 text-[16px]">
              {hours.map(([day, time]) => (
                <div key={day} className="flex justify-between gap-4 sm:block lg:flex">
                  <dt className="text-muted">{day}</dt>
                  <dd className="m-0 text-right font-semibold text-ink sm:text-left lg:text-right">{time}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        <div className="min-w-0">
          <h2 className={label}>Contact</h2>
          <ul className="m-0 grid list-none p-0">
            <li>
              <a href={ctx.tel} className={`${link} gap-2.5 whitespace-nowrap font-semibold !text-ink`}>
                <Phone size={17} className={pt} aria-hidden="true" /> {b.phone}
              </a>
            </li>
            {b.email && (
              <li>
                <a href={`mailto:${b.email}`} className={`${link} gap-2.5 [overflow-wrap:anywhere]`}>
                  <Mail size={17} className={`flex-none ${pt}`} aria-hidden="true" /> {b.email}
                </a>
              </li>
            )}
            <li>
              <a href={ctx.action.href} className={`${link} gap-1.5 font-semibold !text-[color:var(--pt)]`}>
                {ctx.action.label} <ArrowRight size={16} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className={wrap}>
        <p className="m-0 border-t border-line py-6 text-[14px] text-muted">
          &copy; {new Date().getFullYear()} {b.name}
          <StudioCredit b={b} />
        </p>
      </div>
    </footer>
  );
}

/** Call and the main action, always in reach on a phone. */
export function MobileBar({ b, ctx }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-line bg-white/95 px-3 pt-3 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <a
        href={ctx.tel}
        aria-label={`Call ${b.phone}`}
        className="inline-flex min-h-[52px] flex-none items-center justify-center gap-2 rounded-full border-2 border-line px-5 font-heading text-[16px] font-semibold text-ink no-underline"
      >
        <Phone size={18} aria-hidden="true" /> Call
      </a>
      <a href={ctx.action.href} className={`${solid} flex-1 !px-4`}>
        {ctx.action.label} <ArrowRight size={18} aria-hidden="true" />
      </a>
    </div>
  );
}
