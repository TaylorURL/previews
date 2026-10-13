import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Mail, MapPin, Menu, Navigation, Phone, X } from 'lucide-react';
import { mapsHref } from '../../site.js';
import { BrandLogo, StudioCredit } from '../shared.jsx';
import { list } from './menu.js';
import { Eyebrow, HoursTable, Socials, away, ghost, h2, label, light, outline, solid, wrap } from './ui.jsx';

/** The phone number on a narrow screen is just "Call"; wider, the number itself. */
export function CallLabel({ b }) {
  return (
    <>
      <span className="sm:hidden">Call</span>
      <span className="hidden sm:inline">Call {b.phone}</span>
    </>
  );
}

export function Header({ b, nav, current, tel, actions, hasMenu, today }) {
  const [open, setOpen] = useState(false);
  const stick = b.preview ? 'top-11' : 'top-0';
  const lead = actions[0];

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    const onWide = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onWide);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onWide);
    };
  }, [open]);

  return (
    <header className={`sticky ${stick} z-40 border-b border-head-line bg-head`}>
      <div className={`${wrap} flex h-[72px] items-center gap-3 lg:h-[88px] lg:gap-6`}>
        <a href="/" aria-label={`${b.name} home`} className="mr-auto flex min-h-11 min-w-0 items-center no-underline lg:flex-none">
          <BrandLogo b={b} textClass="text-head-ink" />
        </a>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1 xl:gap-2">
            {nav.map(([href, text, key]) => (
              <li key={href}>
                <a
                  href={href}
                  aria-current={key === current ? 'page' : undefined}
                  className="relative inline-flex min-h-11 items-center whitespace-nowrap px-3 text-[16px] font-medium text-head-ink no-underline transition-colors after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-accent after:transition-transform hover:text-head-hover hover:after:scale-x-100 aria-[current=page]:after:scale-x-100"
                >
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-none items-center gap-2 lg:gap-3">
          {lead && (
            <a
              href={tel}
              aria-label={`Call ${b.phone}`}
              className="hidden min-h-11 min-w-11 items-center justify-center gap-2 whitespace-nowrap px-2 text-[16px] font-semibold text-head-ink no-underline hover:text-head-hover lg:inline-flex"
            >
              <Phone size={17} aria-hidden="true" />
              <span className="hidden xl:inline">{b.phone}</span>
            </a>
          )}
          {lead ? (
            <a href={lead.href} {...away} className={`${solid} hidden min-h-[46px] px-5 text-[15px] lg:inline-flex`}>
              <lead.Icon size={17} aria-hidden="true" /> {lead.label}
            </a>
          ) : (
            <a href={tel} className={`${solid} hidden min-h-[46px] px-5 text-[15px] lg:inline-flex`}>
              <Phone size={17} aria-hidden="true" /> Call {b.phone}
            </a>
          )}
          <a
            href={tel}
            aria-label={`Call ${b.phone}`}
            className="grid h-11 w-11 place-items-center rounded-full bg-primary text-[color:var(--on-primary)] lg:hidden"
          >
            <Phone size={19} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-head-line bg-transparent text-head-ink lg:hidden"
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="site-nav"
        hidden={!open}
        className={`absolute inset-x-0 top-full overflow-y-auto border-b border-line bg-ground text-ink shadow-[0_30px_50px_-30px_rgba(30,20,10,0.45)] lg:hidden ${
          b.preview ? 'max-h-[calc(100dvh-116px)]' : 'max-h-[calc(100dvh-72px)]'
        }`}
      >
        <nav aria-label="Mobile" className={`${wrap} pb-8 pt-2`}>
          <ul>
            {[['/', 'Home', ''], ...nav].map(([href, text, key]) => (
              <li key={href} className="border-b border-line">
                <a
                  href={href}
                  aria-current={key === current ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center justify-between py-2 font-heading font-display-2 text-[1.6rem] leading-tight text-ink no-underline"
                >
                  {text} <ArrowRight size={20} className="text-muted" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {actions.map((a) => (
              <a key={a.href} href={a.href} {...away} className={solid}>
                <a.Icon size={18} aria-hidden="true" /> {a.label}
              </a>
            ))}
            {hasMenu && current !== 'menu' && (
              <a href="/menu" onClick={() => setOpen(false)} className={actions.length ? outline : solid}>
                <BookOpen size={18} aria-hidden="true" /> View Menu
              </a>
            )}
          </div>
          <div className="mt-8">
            <p className={`${label} text-muted`}>Hours</p>
            <HoursTable hours={b.hours} today={today} className="text-[16px]" />
          </div>
        </nav>
      </div>
    </header>
  );
}

/**
 * The closing call to action, on every page but contact: the restaurant's own
 * words when the brand gives them, its address when it does not.
 */
export function Band({ b, tel, actions }) {
  const title = b.band?.title || 'Come hungry';
  const text = b.band?.text || `${b.address}, ${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;
  const [first, ...rest] = actions;
  return (
    <section id="cta" className="bg-[color:var(--deep)] text-white">
      <div className={`${wrap} grid gap-9 py-[clamp(3.5rem,7vw,5.5rem)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16`}>
        <div className="max-w-[42rem]">
          <Eyebrow dark>{b.shortName}</Eyebrow>
          <h2 className={h2}>{title}</h2>
          <p className="mt-4 text-[18px] leading-relaxed text-white/85">{text}</p>
        </div>
        <div className="grid gap-3 sm:flex sm:flex-wrap lg:max-w-[30rem] lg:justify-end">
          {first && (
            <a href={first.href} {...away} className={light}>
              <first.Icon size={18} aria-hidden="true" /> {first.label}
            </a>
          )}
          {rest.map((a) => (
            <a key={a.href} href={a.href} {...away} className={ghost}>
              <a.Icon size={18} aria-hidden="true" /> {a.label}
            </a>
          ))}
          <div className="grid grid-cols-2 gap-3 sm:contents">
            <a href={tel} className={first ? ghost : light}>
              <Phone size={18} aria-hidden="true" /> <CallLabel b={b} />
            </a>
            <a href={mapsHref(b)} {...away} className={ghost}>
              <Navigation size={18} aria-hidden="true" /> Directions
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer({ b, nav, tel, actions, ink }) {
  const head = `${label} text-white/60`;
  const linkCls = 'inline-flex min-h-11 items-center text-white/85 no-underline hover:text-white';
  const hours = list(b.hours).filter((row) => Array.isArray(row) && row[0] && row[1]);
  return (
    <footer className="bg-ink pb-28 text-[16px] text-white/80 md:pb-0">
      <div className={`${wrap} grid gap-x-10 gap-y-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_0.8fr] lg:py-20`}>
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <a href="/" aria-label={`${b.name} home`} className="inline-flex min-h-11 max-w-full items-center no-underline">
            <BrandLogo b={b} ground={ink} textClass="text-white" />
          </a>
          <p className="mt-4 max-w-xs leading-relaxed">
            {b.cuisine} in {b.town}, {b.state}
            {b.since ? `, since ${b.since}` : ''}.
          </p>
          <Socials b={b} dark className="mt-6" />
        </div>
        <div className="min-w-0">
          <h2 className={head}>Visit</h2>
          <a href={mapsHref(b)} {...away} className="flex gap-2.5 py-2 leading-relaxed text-white/85 no-underline hover:text-white">
            <MapPin size={18} className="mt-1 flex-none text-[color:var(--accent-lit)]" aria-hidden="true" />
            <span>
              {b.address}
              <br />
              {b.town}, {b.state} {b.zip}
            </span>
          </a>
          <a href={tel} className={`${linkCls} gap-2.5 font-semibold text-white`}>
            <Phone size={18} className="flex-none text-[color:var(--accent-lit)]" aria-hidden="true" /> {b.phone}
          </a>
          {b.email && (
            <a href={`mailto:${b.email}`} className={`${linkCls} gap-2.5 [overflow-wrap:anywhere]`}>
              <Mail size={18} className="flex-none text-[color:var(--accent-lit)]" aria-hidden="true" />
              <span className="min-w-0">{b.email}</span>
            </a>
          )}
        </div>
        {hours.length > 0 && (
          <div className="min-w-0">
            <h2 className={head}>Hours</h2>
            <dl className="grid gap-2 text-[15px]">
              {hours.map(([day, time]) => (
                <div key={day}>
                  <dt className="font-medium text-white">{day}</dt>
                  <dd className="m-0">{time}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        <nav aria-label="Footer" className="min-w-0">
          <h2 className={head}>Explore</h2>
          <ul>
            {[['/', 'Home'], ...nav].map(([href, text]) => (
              <li key={href}>
                <a href={href} className={linkCls}>
                  {text}
                </a>
              </li>
            ))}
            {actions.map((a) => (
              <li key={a.href}>
                <a href={a.href} {...away} className={linkCls}>
                  {a.label}
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
    </footer>
  );
}

/** The two things a phone reader wants most, kept in reach at the foot of the screen. */
export function MobileBar({ b, tel, actions, hasMenu, current }) {
  const lead = actions[0];
  const second = lead
    ? { href: lead.href, text: lead.label, Icon: lead.Icon, out: true }
    : hasMenu && current !== 'menu'
      ? { href: '/menu', text: 'View Menu', Icon: BookOpen }
      : { href: mapsHref(b), text: 'Directions', Icon: Navigation, out: true };
  return (
    <div
      className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-[auto_minmax(0,1fr)] gap-1.5 rounded-full bg-ink p-1.5 shadow-[0_18px_40px_-12px_rgba(20,12,8,0.55)] md:hidden"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <a href={tel} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-[16px] font-semibold text-white no-underline">
        <Phone size={18} aria-hidden="true" /> Call
      </a>
      <a
        href={second.href}
        {...(second.out ? away : {})}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-4 text-[16px] font-semibold text-[color:var(--on-primary)] no-underline"
      >
        <second.Icon size={18} aria-hidden="true" /> {second.text}
      </a>
    </div>
  );
}
