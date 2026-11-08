/**
 * What stands on every page of an outdoor site: the strips above the header,
 * the header with its menu, the footer, and the phone's call bar.
 */
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Clock3, Languages, Mail, MapPin, Menu, Phone, ShieldCheck, Siren, X } from 'lucide-react';
import { mapsHref, telHref } from '../../site.js';
import { BrandLogo, StudioCredit } from '../shared.jsx';
import { areaOf, askOf, list, phonesOf } from './util.js';
import { Go, btnLine, btnMain, wrap } from './ui.jsx';

/** The business's other lines and languages, above the header, when it has any. */
export function LineStrip({ b }) {
  const phones = phonesOf(b);
  const languages = list(b.languages).filter(Boolean);
  if (phones.length < 2 && languages.length < 2) return null;
  return (
    <div className="bg-[color:var(--deep)] text-white">
      <div className={`${wrap} flex min-h-[40px] flex-wrap items-center justify-between gap-x-6 gap-y-1 py-1.5 text-[14px]`}>
        {languages.length > 1 && (
          <p className="flex items-center gap-2 text-white/80">
            <Languages size={15} className="flex-none" aria-hidden="true" /> {languages.join(' · ')}
          </p>
        )}
        {phones.length > 1 && (
          <ul className="flex flex-wrap items-center gap-x-5">
            {phones.map((p) => (
              <li key={p.number}>
                <a href={telHref(p.number)} className="inline-flex min-h-[36px] items-center gap-1.5 font-semibold text-white no-underline hover:underline">
                  {p.label && <span className="font-normal text-white/70">{p.label}</span>} {p.number}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function EmergencyStrip({ b }) {
  if (!b.emergency?.title) return null;
  return (
    <div className="bg-[color:var(--alarm)] text-[color:var(--alarm-ink)]">
      <div className={`${wrap} flex min-h-[44px] items-center justify-between gap-4 py-1.5 text-[15px]`}>
        <p className="flex min-w-0 items-center gap-2.5 font-semibold">
          <Siren size={17} className="flex-none" aria-hidden="true" />
          <span className="min-w-0 leading-[1.4]">
            {b.emergency.title}
            {b.emergency.text && <span className="hidden font-normal opacity-85 xl:inline"> &middot; {b.emergency.text}</span>}
          </span>
        </p>
        <a href={telHref(b.phone)} className="inline-flex min-h-[44px] flex-none items-center gap-1.5 font-bold text-current no-underline hover:underline">
          <Phone size={15} aria-hidden="true" /> <span className="hidden sm:inline">{b.phone}</span>
          <span className="sm:hidden">Call</span>
        </a>
      </div>
    </div>
  );
}

function ServicesMenu({ groups, current }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onDown = (e) => root.current && !root.current.contains(e.target) && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);
  const here = groups.some((g) => g.slug === current);
  return (
    <li
      ref={root}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
    >
      <button
        type="button"
        className={`flex h-[88px] cursor-pointer items-center gap-1.5 px-1 text-[16px] font-semibold text-ink transition hover:text-[color:var(--pt)] ${
          here ? 'text-[color:var(--pt)]' : ''
        }`}
        aria-expanded={open}
        aria-controls="services-menu"
        onClick={() => setOpen((v) => !v)}
      >
        Services <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <div id="services-menu" hidden={!open} className="absolute left-1/2 top-[calc(100%-12px)] w-[380px] -translate-x-1/2 pt-3">
        <ul className="grid rounded-2xl border border-line bg-white p-2 shadow-[0_30px_60px_-30px_rgba(10,20,10,0.45)]">
          {groups.map((g) => (
            <li key={g.slug}>
              <a
                href={`/${g.slug}`}
                aria-current={g.slug === current ? 'page' : undefined}
                className="group flex min-h-[52px] items-center justify-between gap-4 rounded-xl px-4 py-2.5 font-heading text-[16px] font-bold text-ink no-underline hover:bg-[color:var(--paper)] hover:text-[color:var(--pt)]"
              >
                <span className="min-w-0">{g.title}</span>
                <ArrowRight size={16} className="flex-none opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export function Header({ b, groups, current, hasWork }) {
  const [open, setOpen] = useState(false);
  const ask = askOf(b);
  const stick = b.preview ? 'top-11' : 'top-0';
  const links = [hasWork && ['/#work', 'Our Work'], b.about && ['/about', 'About'], ['/contact', 'Contact']].filter(Boolean);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <header className={`sticky ${stick} z-40 border-b border-line bg-white`}>
      <div className={`${wrap} flex h-[76px] items-center gap-6 lg:h-[88px]`}>
        <a href="/" className="flex min-h-[44px] min-w-0 flex-initial items-center lg:flex-none" aria-label={`${b.name} home`}>
          <BrandLogo b={b} textClass="font-extrabold tracking-[-0.02em] text-ink" />
        </a>
        <nav aria-label="Main" className="ml-4 hidden lg:block xl:ml-8">
          <ul className="flex items-center gap-7 xl:gap-9">
            {hasWork && (
              <li>
                <a href="/#work" className="flex h-[88px] items-center px-1 text-[16px] font-semibold text-ink no-underline hover:text-[color:var(--pt)]">
                  Our Work
                </a>
              </li>
            )}
            {groups.length > 0 && <ServicesMenu groups={groups} current={current} />}
            {links.slice(hasWork ? 1 : 0).map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  aria-current={href.slice(1) === current ? 'page' : undefined}
                  className={`flex h-[88px] items-center px-1 text-[16px] font-semibold no-underline hover:text-[color:var(--pt)] ${
                    href.slice(1) === current ? 'text-[color:var(--pt)]' : 'text-ink'
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex flex-none items-center gap-2 sm:gap-3">
          <a href={telHref(b.phone)} className="hidden min-h-[44px] items-center gap-2.5 px-2 font-heading text-[17px] font-bold text-ink no-underline hover:text-[color:var(--pt)] xl:flex">
            <Phone size={17} className="text-[color:var(--pt)]" aria-hidden="true" /> {b.phone}
          </a>
          <a href="/contact" className={`${btnMain} hidden min-h-[48px] text-[15px] md:inline-flex`}>
            <span className="pl-1">{ask.act}</span>
            <Go />
          </a>
          <a
            href={telHref(b.phone)}
            className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--cta)] text-[color:var(--cta-ink)] md:hidden"
            aria-label={`Call ${b.phone}`}
          >
            <Phone size={19} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="grid h-12 w-12 cursor-pointer place-items-center rounded-full border border-line text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <div
        id="site-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-7.5rem)] overflow-y-auto border-b border-line bg-white shadow-[0_24px_40px_-24px_rgba(10,20,10,0.35)] lg:hidden"
      >
        <nav aria-label="Mobile" className={`${wrap} pb-28 pt-4 md:pb-8`}>
          {groups.length > 0 && (
            <>
              <p className="pb-1 font-heading text-[12px] font-bold uppercase tracking-[0.16em] text-muted">Services</p>
              <ul className="mb-4">
                {groups.map((g) => (
                  <li key={g.slug} className="border-b border-line">
                    <a href={`/${g.slug}`} onClick={() => setOpen(false)} className="flex min-h-[54px] items-center justify-between gap-4 font-heading text-[18px] font-bold text-ink no-underline">
                      <span className="min-w-0">{g.title}</span> <ArrowRight size={17} className="flex-none text-[color:var(--pt)]" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          <ul>
            {links.map(([href, label]) => (
              <li key={href} className="border-b border-line">
                <a href={href} onClick={() => setOpen(false)} className="flex min-h-[54px] items-center justify-between font-heading text-[18px] font-bold text-ink no-underline">
                  {label} <ArrowRight size={17} className="text-[color:var(--pt)]" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href="/contact" onClick={() => setOpen(false)} className={btnMain}>
              <span className="pl-1">{ask.act}</span>
              <Go />
            </a>
            {phonesOf(b).map((p) => (
              <a key={p.number} href={telHref(p.number)} className={btnLine}>
                <Phone size={17} aria-hidden="true" /> {p.label && phonesOf(b).length > 1 ? `${p.label} ` : ''}
                {p.number}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

export function Footer({ b, groups, deep, hasWork }) {
  const hours = list(b.hours);
  const creds = [...list(b.licenses).map((l) => [l.label, l.number].filter(Boolean).join(' ')), ...list(b.credentials).map((c) => c.label)].filter(Boolean);
  const head = 'mb-4 font-heading text-[13px] font-bold uppercase tracking-[0.16em] text-white/55';
  const link = 'flex min-h-[44px] items-center py-1.5 leading-snug text-white/80 no-underline hover:text-white';
  const area = areaOf(b);
  return (
    <footer className="relative isolate overflow-hidden bg-[color:var(--deep)] pb-28 text-[16px] text-white/75 md:pb-0">
      <div className={`${wrap} grid gap-x-10 gap-y-12 pb-14 pt-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:pt-20`}>
        <div className="grid content-start gap-5 sm:col-span-2 lg:col-span-1">
          <a href="/" className="flex min-h-[44px] w-fit max-w-full items-center" aria-label={`${b.name} home`}>
            <BrandLogo b={b} ground={deep} textClass="font-extrabold text-white" />
          </a>
          {b.summary && <p className="max-w-sm leading-[1.65] text-white/70">{b.summary}</p>}
          {creds.length > 0 && (
            <ul className="grid gap-1.5 text-[15px]">
              {creds.map((c) => (
                <li key={c} className="flex items-start gap-2">
                  <ShieldCheck size={16} className="mt-[3px] flex-none text-white/60" aria-hidden="true" />
                  <span className="min-w-0 break-words">{c}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {groups.length > 0 && (
          <div>
            <h2 className={head}>Services</h2>
            <ul className="grid">
              {groups.map((g) => (
                <li key={g.slug}>
                  <a href={`/${g.slug}`} className={link}>
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h2 className={head}>Company</h2>
          <ul className="grid">
            {hasWork && (
              <li>
                <a href="/#work" className={link}>
                  Our Work
                </a>
              </li>
            )}
            {b.about && (
              <li>
                <a href="/about" className={link}>
                  About
                </a>
              </li>
            )}
            <li>
              <a href="/contact" className={link}>
                {askOf(b).act}
              </a>
            </li>
          </ul>
          {area.length > 0 && (
            <p className="mt-5 flex gap-2 text-[15px] leading-[1.6] text-white/60">
              <MapPin size={16} className="mt-[3px] flex-none" aria-hidden="true" />
              <span className="min-w-0">Serving {area.slice(0, 8).join(', ')}{area.length > 8 ? ' and more' : ''}</span>
            </p>
          )}
        </div>
        <div>
          <h2 className={head}>Contact</h2>
          <ul className="grid">
            {phonesOf(b).map((p) => (
              <li key={p.number}>
                <a href={telHref(p.number)} className="flex min-h-[44px] flex-wrap items-center gap-x-2 font-heading text-[20px] font-bold text-white no-underline hover:underline">
                  {p.number}
                  {p.label && phonesOf(b).length > 1 && <span className="font-body text-[14px] font-normal text-white/60">{p.label}</span>}
                </a>
              </li>
            ))}
            {b.email && (
              <li>
                {/* The address may break after its @, never inside a word, unless a part alone is wider than the column. */}
                <a href={`mailto:${b.email}`} className={`${link} gap-2 [overflow-wrap:anywhere]`}>
                  <Mail size={16} className="flex-none" aria-hidden="true" />
                  <span className="min-w-0">{b.email.split('@').flatMap((p, i) => (i ? ['@', <wbr key={i} />, p] : [p]))}</span>
                </a>
              </li>
            )}
            {(b.address || b.town) && (
              <li>
                <a href={mapsHref(b)} className="flex gap-2 py-2 leading-[1.6] text-white/80 no-underline hover:text-white">
                  <MapPin size={16} className="mt-[4px] flex-none" aria-hidden="true" />
                  <span>
                    {b.address && (
                      <>
                        {b.address}
                        <br />
                      </>
                    )}
                    {b.town}, {b.state} {b.zip}
                  </span>
                </a>
              </li>
            )}
          </ul>
          {hours.length > 0 && (
            <dl className="mt-3 grid gap-1 text-[15px]">
              {hours.map(([d, h]) => (
                <div key={d} className="flex flex-wrap gap-x-2">
                  <dt className="flex items-center gap-2 font-medium text-white/90">
                    <Clock3 size={14} className="flex-none text-white/50" aria-hidden="true" />
                    {d}
                  </dt>
                  <dd className="m-0">{h}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
      <div className={wrap}>
        <p className="border-t border-white/15 py-6 text-[15px] text-white/60">
          &copy; {new Date().getFullYear()} {b.name}
          <StudioCredit b={b} />
        </p>
      </div>
    </footer>
  );
}

/** The phone's call and estimate bar, shown once the opening's own buttons have scrolled away. */
export function MobileBar({ b }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-40 transition duration-200 md:hidden ${shown ? '' : 'invisible translate-y-4 opacity-0'}`}
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-[auto_1fr] gap-2 rounded-full bg-[color:var(--deep)] p-1.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)]">
        <a href={telHref(b.phone)} className="flex min-h-[50px] items-center justify-center gap-2 rounded-full px-5 text-[16px] font-semibold text-white no-underline">
          <Phone size={18} className="flex-none" aria-hidden="true" /> Call
        </a>
        <a
          href="/contact"
          className="flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[color:var(--cta-dark)] px-4 font-heading text-[16px] font-bold text-[color:var(--cta-dark-ink)] no-underline"
        >
          {askOf(b).act} <ArrowRight size={17} className="flex-none" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
