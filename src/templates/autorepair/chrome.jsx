import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Mail, MapPin, Menu, Phone, X } from 'lucide-react';
import { mapsHref } from '../../site.js';
import { StudioCredit } from '../shared.jsx';
import { DAY_NAMES, daysOf, hoursOn, isClosed, todayInHouston } from './hours.js';
import { Eyebrow, cardTitle, edgeL, edgeLlg, edgeR, ghostDark, href, iconFor, solid, wrap } from './ui.jsx';

/** Today's day of the week, known only once the page is in a browser. */
export function useToday() {
  const [today, setToday] = useState(null);
  useEffect(() => setToday(todayInHouston()), []);
  return today;
}

/** The logo sized by height, so wide and stacked marks sit the same in the plate. */
export function Mark({ b, className = '' }) {
  if (b.brand.logo) {
    return <img className={`block w-auto object-contain ${className}`} src={b.brand.logo} alt={b.name} />;
  }
  return <span className="block font-heading text-[22px] font-bold uppercase leading-none tracking-[0.02em] text-ink sm:text-[26px]">{b.shortName}</span>;
}

/**
 * Today's hours. The first row of the hours stands in until the browser
 * knows what day it is, so the prerendered page and the live one agree.
 */
export function HoursToday({ hours = [], today, className = '' }) {
  if (!hours.length) return null;
  const time = today == null ? null : hoursOn(hours, today);
  let dot = 'bg-[#3ccf6e]';
  let text = `${hours[0][0]} ${hours[0][1]}`;
  if (today != null && time) {
    if (isClosed(time)) {
      dot = 'bg-[#ff6b5e]';
      text = 'Closed Today';
    } else {
      text = `Today ${time}`;
    }
  }
  return (
    <span className={`flex min-w-0 items-center gap-2 ${className}`}>
      <span className={`h-2 w-2 flex-none rounded-full ${dot}`} aria-hidden="true" />
      <span className="truncate">{text}</span>
    </span>
  );
}

function ServicesMenu({ b, active }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const button = useRef(null);
  const hovering = useRef(false);
  const dismissed = useRef(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        dismissed.current = true;
        button.current?.focus();
        setTimeout(() => {
          dismissed.current = false;
        }, 0);
      }
    };
    const onDown = (event) => {
      if (!box.current?.contains(event.target)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div
      ref={box}
      className="relative flex items-stretch"
      onMouseEnter={() => {
        hovering.current = true;
        setOpen(true);
      }}
      onMouseLeave={() => {
        hovering.current = false;
        setOpen(false);
      }}
      onFocus={() => {
        if (dismissed.current) dismissed.current = false;
        else setOpen(true);
      }}
      onBlur={(event) => {
        if (!box.current?.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="services-menu"
        onClick={() => setOpen((was) => (hovering.current ? true : !was))}
        className={`flex cursor-pointer items-center gap-1.5 border-b-[3px] bg-transparent pt-[3px] font-heading text-[16px] font-semibold uppercase tracking-[0.06em] text-white transition ${
          active || open ? 'border-primary' : 'border-transparent text-white/85 hover:text-white'
        }`}
      >
        Services
        <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <div
        id="services-menu"
        hidden={!open}
        className="absolute left-0 top-full z-50 w-[min(680px,calc(100vw-2rem))] border-t-[3px] border-primary bg-white text-ink shadow-[0_30px_60px_-24px_rgba(0,0,0,0.45)]"
      >
        <ul className="grid grid-cols-2 gap-px bg-line p-px">
          {b.services.map((s) => {
            const Icon = iconFor(s.icon);
            return (
              <li key={s.slug} className="bg-white">
                <a
                  href={href(`services/${s.slug}`)}
                  className="group flex min-h-[64px] items-start gap-3.5 px-5 py-4 text-ink no-underline transition hover:bg-surface focus-visible:bg-surface focus-visible:outline-none"
                >
                  <Icon size={22} className="mt-0.5 flex-none text-primary" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className={`block text-[16px] ${cardTitle} group-hover:text-primary`}>{s.title}</span>
                    {s.summary && <span className="mt-1 block text-[14px] leading-snug text-muted">{s.summary}</span>}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 bg-surface px-5 py-2">
          <a href={href('services')} className="inline-flex min-h-[44px] items-center gap-2 font-heading text-[15px] font-bold uppercase tracking-[0.06em] text-primary no-underline hover:underline">
            All Services <ArrowRight size={16} aria-hidden="true" />
          </a>
          {b.makes?.length > 0 && (
            <a href={href('makes')} className="inline-flex min-h-[44px] items-center text-[15px] font-semibold text-ink no-underline hover:text-primary">
              Makes We Service
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function Header({ b, section, today, tel }) {
  const [open, setOpen] = useState(false);
  const [svcOpen, setSvcOpen] = useState(section === 'services');
  const stick = b.preview ? 'top-11' : 'top-0';
  const links = [
    b.makes?.length > 0 && ['makes', 'Makes', 'makes'],
    ['about', 'About', 'about'],
    b.reviews?.length > 0 && ['#reviews', 'Reviews', 'reviews'],
  ].filter(Boolean);
  const linkHref = (to) => (to.startsWith('#') ? `/${to}` : href(to));

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`sticky ${stick} z-40 bg-panel text-white shadow-[0_1px_0_rgba(255,255,255,0.06)]`}>
      <div className="flex h-[72px] items-stretch lg:h-[84px]">
        <a
          href={href()}
          aria-label={`${b.name} home`}
          className={`flex min-w-0 flex-none items-center bg-white pr-9 [clip-path:polygon(0_0,100%_0,calc(100%_-_18px)_100%,0_100%)] lg:pr-12 ${edgeL}`}
          onClick={() => setOpen(false)}
        >
          <Mark b={b} className="h-9 max-w-[44vw] sm:h-10 lg:h-12 lg:max-w-[230px]" />
        </a>

        <nav aria-label="Main" className="ml-7 hidden items-stretch gap-6 lg:flex xl:ml-10 xl:gap-8">
          <ServicesMenu b={b} active={section === 'services'} />
          {links.map(([to, label, key]) => (
            <a
              key={key}
              href={linkHref(to)}
              aria-current={section === key ? 'page' : undefined}
              className={`items-center border-b-[3px] pt-[3px] font-heading text-[16px] font-semibold uppercase tracking-[0.06em] no-underline transition ${
                key === 'reviews' ? 'hidden xl:flex' : 'flex'
              } ${section === key ? 'border-primary text-white' : 'border-transparent text-white/85 hover:text-white'}`}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-stretch">
          <a
            href={href('appointment')}
            className={`my-auto mr-6 hidden min-h-[44px] items-center border-[1.5px] px-4 font-heading text-[15px] font-bold uppercase tracking-[0.06em] no-underline transition lg:flex ${
              section === 'appointment' ? 'border-white bg-white text-ink' : 'border-white/45 text-white hover:border-white'
            }`}
          >
            Book a Visit
          </a>
          <a
            href={tel}
            className={`hidden items-center gap-3.5 bg-primary pl-6 text-[color:var(--on-primary)] no-underline transition hover:brightness-110 lg:flex ${edgeR}`}
          >
            <Phone size={24} className="flex-none" aria-hidden="true" />
            <span className="grid gap-0.5 leading-none">
              <HoursToday hours={b.hours} today={today} className="text-[12px] font-semibold uppercase tracking-[0.08em] opacity-90" />
              <span className="whitespace-nowrap font-heading text-[23px] font-bold">{b.phone}</span>
              <span className="sr-only">Call Now</span>
            </span>
          </a>
          <a
            href={tel}
            aria-label={`Call ${b.phone}`}
            className="flex w-[60px] items-center justify-center bg-primary text-[color:var(--on-primary)] sm:w-[68px] lg:hidden"
          >
            <Phone size={22} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="flex w-[60px] cursor-pointer items-center justify-center bg-transparent text-white sm:w-[68px] lg:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="site-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-7.5rem)] overflow-y-auto border-t border-white/10 bg-panel shadow-[0_30px_50px_-20px_rgba(0,0,0,0.6)] lg:hidden"
      >
        <nav aria-label="Mobile" className={`${wrap} py-2`}>
          <ul>
            <li className="border-b border-white/10">
              <button
                type="button"
                aria-expanded={svcOpen}
                aria-controls="mobile-services"
                onClick={() => setSvcOpen((v) => !v)}
                className="flex min-h-[60px] w-full cursor-pointer items-center justify-between bg-transparent font-heading text-[22px] font-bold uppercase tracking-[0.03em] text-white"
              >
                Services
                <ChevronDown size={22} className={`text-[color:var(--primary-lit)] transition ${svcOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <ul id="mobile-services" hidden={!svcOpen} className="pb-3">
                {b.services.map((s) => {
                  const Icon = iconFor(s.icon);
                  return (
                    <li key={s.slug}>
                      <a
                        href={href(`services/${s.slug}`)}
                        onClick={() => setOpen(false)}
                        className="flex min-h-[48px] items-center gap-3 pl-1 text-[17px] font-medium text-white/90 no-underline"
                      >
                        <Icon size={20} className="flex-none text-[color:var(--primary-lit)]" aria-hidden="true" />
                        {s.title}
                      </a>
                    </li>
                  );
                })}
                <li>
                  <a href={href('services')} onClick={() => setOpen(false)} className="flex min-h-[48px] items-center gap-2 pl-1 text-[16px] font-bold text-white no-underline">
                    All Services <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </li>
            {links.map(([to, label, key]) => (
              <li key={key} className="border-b border-white/10">
                <a
                  href={linkHref(to)}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[60px] items-center justify-between font-heading text-[22px] font-bold uppercase tracking-[0.03em] text-white no-underline"
                >
                  {label} <ArrowRight size={20} className="text-[color:var(--primary-lit)]" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <div className="grid gap-3 py-5 sm:grid-cols-2">
            <a href={href('appointment')} onClick={() => setOpen(false)} className={solid}>
              Book a Visit
            </a>
            <a href={tel} className={ghostDark}>
              <Phone size={18} aria-hidden="true" /> {b.phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

/** The strip under the header on phones, where the header has no room for today's hours. */
export function HoursStrip({ b, today }) {
  if (!b.hours?.length) return null;
  return (
    <div className="bg-[color-mix(in_srgb,var(--panel)_82%,#000)] text-[15px] font-medium text-white/85 lg:hidden">
      <div className={`${wrap} flex min-h-[44px] items-center justify-between gap-4`}>
        <HoursToday hours={b.hours} today={today} />
        <a href={mapsHref(b)} className="hidden min-h-[44px] flex-none items-center gap-1.5 text-white/75 no-underline sm:flex">
          <MapPin size={15} aria-hidden="true" /> {b.address}
        </a>
      </div>
    </div>
  );
}

export function CtaBand({ b, tel, service }) {
  const title = b.band?.title || 'Book your next visit';
  const text = b.band?.text || `Call ${b.phone} or ask for a time online, and we call back to confirm.`;
  return (
    <section className="relative isolate overflow-hidden bg-primary text-[color:var(--on-primary)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[repeating-linear-gradient(135deg,transparent_0_26px,rgba(255,255,255,0.07)_26px_52px)]"
      />
      <div className={`${wrap} flex flex-col gap-8 py-[clamp(3.5rem,6vw,4.5rem)] lg:flex-row lg:items-center lg:justify-between`}>
        <div className="max-w-[44rem]">
          <h2 className="font-heading text-[clamp(1.9rem,1.3rem+2.2vw,2.9rem)] font-bold leading-[1.05] [text-wrap:balance]">{title}</h2>
          <p className="mt-3 text-[17px] leading-[1.6] opacity-90 sm:text-[18px]">{text}</p>
        </div>
        <div className="grid flex-none gap-3 sm:flex">
          <a
            href={service ? `${href('appointment')}?service=${encodeURIComponent(service)}` : href('appointment')}
            className="inline-flex min-h-[52px] items-center justify-center gap-2.5 bg-white px-6 font-heading text-[16px] font-bold uppercase tracking-[0.06em] text-ink no-underline transition hover:bg-surface"
          >
            Book an Appointment
          </a>
          <a
            href={tel}
            className="inline-flex min-h-[52px] items-center justify-center gap-2.5 bg-panel px-6 font-heading text-[16px] font-bold tracking-[0.04em] text-white no-underline transition hover:brightness-125"
          >
            <Phone size={18} aria-hidden="true" /> {b.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer({ b, tel, today }) {
  const hours = b.hours || [];
  const place = `${b.address}, ${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;
  const map = `https://maps.google.com/maps?q=${encodeURIComponent(b.mapQuery || place)}&z=14&output=embed`;
  const shop = [
    ['services', 'All Services'],
    b.makes?.length > 0 && ['makes', 'Makes We Service'],
    ['about', 'About the Shop'],
    ['appointment', 'Book an Appointment'],
  ].filter(Boolean);

  return (
    <footer id="visit" className="scroll-mt-28 bg-panel pb-[72px] text-white md:pb-0">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className={`px-gutter py-[clamp(3.5rem,7vw,5.5rem)] lg:pr-14 ${edgeLlg}`}>
          <Eyebrow dark>Shop hours</Eyebrow>
          <h2 className="font-heading text-[clamp(1.9rem,1.4rem+1.8vw,2.6rem)] font-bold leading-[1.05]">Visit the shop</h2>
          {hours.length > 0 && (
            <table className="mt-7 w-full border-collapse">
              <caption className="sr-only">Opening hours</caption>
              <tbody>
                {hours.map(([day, time]) => {
                  const now = today != null && daysOf(day).includes(today);
                  return (
                    <tr key={day} className={`border-b border-white/15 ${now ? 'bg-white/[0.06]' : ''}`}>
                      <th
                        scope="row"
                        className={`py-4 pr-4 text-left align-top font-heading text-[clamp(1.05rem,0.9rem+0.6vw,1.35rem)] font-semibold uppercase ${
                          now ? 'border-l-[3px] border-primary pl-4 text-white' : 'text-white/70'
                        }`}
                      >
                        {day}
                        {now && <span className="ml-2 align-middle text-[12px] tracking-[0.1em] text-[color:var(--primary-lit)]">Today</span>}
                      </th>
                      <td className={`py-4 text-right align-top font-heading text-[clamp(1.05rem,0.9rem+0.6vw,1.35rem)] font-semibold ${now ? 'pr-4' : ''}`}>
                        {time}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {today != null && hours.length > 0 && hoursOn(hours, today) == null && (
            <p className="mt-3 text-[15px] text-white/60">Call for {DAY_NAMES[today]} hours.</p>
          )}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-[0.14em] text-white/60">Visit</h3>
              <a href={mapsHref(b)} className="flex min-h-[44px] items-start gap-2 text-[17px] leading-[1.5] text-white no-underline hover:underline">
                <MapPin size={18} className="mt-1 flex-none text-[color:var(--primary-lit)]" aria-hidden="true" />
                <span>
                  {b.address}
                  <br />
                  {b.town}, {b.state} {b.zip}
                </span>
              </a>
            </div>
            <div>
              <h3 className="mb-2 text-[12px] font-bold uppercase tracking-[0.14em] text-white/60">Call</h3>
              <a href={tel} className="flex min-h-[44px] items-center whitespace-nowrap font-heading text-[26px] font-bold text-white no-underline hover:underline">
                {b.phone}
              </a>
            </div>
            {b.email && (
              <a
                href={`mailto:${b.email}`}
                className="flex min-h-[44px] items-center gap-2 text-[16px] text-white/80 no-underline [overflow-wrap:anywhere] hover:text-white sm:col-span-2"
              >
                <Mail size={17} className="flex-none text-[color:var(--primary-lit)]" aria-hidden="true" /> {b.email}
              </a>
            )}
          </div>
        </div>
        <div className="relative min-h-[320px] bg-[#c9cfd5] sm:min-h-[400px]">
          <iframe
            title={`Map to ${b.name}`}
            src={map}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0 grayscale-[35%]"
          />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className={`${wrap} grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr]`}>
          <div className="min-w-0">
            <span className="inline-flex bg-white px-4 py-3 [clip-path:polygon(0_0,100%_0,calc(100%_-_12px)_100%,0_100%)] pr-8">
              <Mark b={b} className="h-10 max-w-[220px]" />
            </span>
            <p className="mt-5 max-w-xs leading-[1.6] text-white/70">
              Auto repair in {b.town}, {b.state}
              {b.since ? `, since ${b.since}` : ''}.
            </p>
          </div>
          <nav aria-label="Shop">
            <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.14em] text-[color:var(--primary-lit)]">Shop</h2>
            <ul>
              {shop.map(([to, label]) => (
                <li key={to}>
                  <a href={href(to)} className="flex min-h-[44px] items-center text-white/80 no-underline hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className={wrap}>
          <p className="border-t border-white/10 py-6 text-[14px] text-white/55">
            &copy; {new Date().getFullYear()} {b.name}
            <StudioCredit b={b} />
          </p>
        </div>
      </div>
    </footer>
  );
}

export function MobileBar({ b, tel }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 bg-panel shadow-[0_-10px_30px_-12px_rgba(0,0,0,0.45)] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <a href={tel} className="flex min-h-[60px] items-center justify-center gap-2 px-2 font-heading text-[16px] font-bold uppercase tracking-[0.05em] text-white no-underline">
        <Phone size={18} className="flex-none" aria-hidden="true" /> Call Now
      </a>
      <a
        href={href('appointment')}
        className="flex min-h-[60px] items-center justify-center bg-primary px-2 font-heading text-[16px] font-bold uppercase tracking-[0.05em] text-[color:var(--on-primary)] no-underline"
      >
        Book a Visit
      </a>
    </div>
  );
}
