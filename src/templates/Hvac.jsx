/**
 * HVAC and electrical: one template for heating and air contractors,
 * electricians, and shops that do both. A site of several pages: home, one
 * page per service group, a maintenance-plan page when the business sells a
 * plan, about, and contact. The header carries a mega menu with a column per
 * service group.
 *
 * Brand file shape (src/brands/<slug>.json). Required fields are marked (req);
 * every other field is optional and its section is left out when it is absent.
 *
 *   template     (req) "hvac"
 *   preview            true on a prospect's preview; leave it out on a sample
 *   name         (req) Full business name, used in the footer and the title
 *   shortName    (req) The name as people say it; used in copy and buttons
 *   summary      (req) One sentence on what the business does and where. Shown
 *                      under the home services heading
 *   phone        (req) "(281) 555-0187"
 *   email              Shown on the contact page and in the footer
 *   address      (req) Street line, "4810 Garth Rd, Suite 6"
 *   town         (req) "Baytown"
 *   state        (req) "TX"
 *   zip                "77521"
 *   rating             Google rating, 4.9. Shown only with reviewCount
 *   reviewCount        Number of Google reviews, 318
 *   since              Year founded, 2009. Shown on the about page and teaser
 *   hours              [["Mon – Fri", "7 AM – 6 PM"], ...] day label, hours
 *
 *   brand        (req) Colors and type, set as CSS custom properties:
 *     primary    (req) Cool main color: buttons, icons, the promo band. Dark
 *                      enough for white text reads best; on a light one the
 *                      buttons take ink text and text-colored uses take
 *                      primaryDeep
 *     primaryDeep      Darker shade for hovers and the closing band. Derived
 *                      from primary when absent
 *     accent           Warm highlight: the emergency strip, the price chip,
 *                      small marks. Falls back to primary
 *     ink              Body text color. Defaults to a near-black slate
 *     muted            Secondary text. Derived from ink when absent
 *     surface          Pale tinted ground for alternating sections. Derived
 *                      from primary when absent
 *     line             Hairlines and card borders. Derived from ink when absent
 *     heading    (req) CSS font stack for headings
 *     body       (req) CSS font stack for body text
 *     fonts      (req) Google Fonts stylesheet URL loading both faces
 *     logo             Path to the logo, "/brands/<slug>/logo.webp", or null
 *                      to set shortName in type. Sized by height in the header
 *     logoWidth        Natural display width in px (kept for the boot script)
 *
 *   emergency          Present only when the business answers 24/7. Turns on
 *                      the emergency strip above the header and the
 *                      emergency card on the contact page.
 *     title      (req) "24/7 emergency service"
 *     text       (req) One sentence on what counts and how to reach them
 *   sameDay            One sentence on same-day service. Trust row item
 *   licenses           [{ label: "TDLR HVAC", number: "TACLA 00045821C" }]
 *                      State license numbers. Trust row, about page, footer
 *   financing          { text: "Monthly payments on new systems..." }. One
 *                      sentence on the financing offered. Trust row item
 *
 *   hero         (req) Home page hero, split with the booking card:
 *     eyebrow    (req) Short line above the headline, "Heating, cooling and
 *                      electrical in Baytown"
 *     title      (req) Headline
 *     titleAccent      Second half of the headline, set in the primary color
 *     lead       (req) One or two sentences under the headline
 *     image      (req) "/brands/<slug>/hero" (with -800/-1600.webp beside it)
 *                      or an images.unsplash.com URL
 *     imageAlt   (req) What the photo shows
 *
 *   groups       (req) Service groups, one page each and one mega menu
 *                      column each. An HVAC-only shop might have Cooling,
 *                      Heating and Indoor Air Quality; an electrician
 *                      Residential, Commercial and Generators. 2 to 5 reads
 *                      best. Each:
 *     slug       (req) Page address, lowercase-hyphenated: "cooling"
 *     title      (req) "Cooling"
 *     icon             One of the ICONS keys below. Defaults to wrench
 *     summary    (req) One sentence for the home card and menu
 *     intro      (req) Two or three sentences at the top of the group page
 *     image            Group page photo; "/brands/<slug>/<name>" or Unsplash
 *     imageAlt         What it shows (required when image is set)
 *     services   (req) The services in the group. Each:
 *       slug     (req) Anchor on the group page, "ac-repair"
 *       title    (req) "AC Repair"
 *       icon             An ICONS key. Defaults to the group's icon
 *       text     (req) One or two sentences
 *       points           Short list of specifics, ["Repairs guaranteed..."]
 *
 *   promo              Seasonal tune-up band on the home page:
 *     eyebrow    (req) "Spring tune-up"
 *     title      (req) Headline
 *     text       (req) One sentence on what the visit includes
 *     price            "$89" as the business advertises it. Never invent one
 *     priceNote        "per system"
 *     image            Photo for the band (a thermostat, a unit)
 *     imageAlt         What it shows
 *
 *   plan               Maintenance plan. Its page exists only when present,
 *                      and tiers are copied from the business, never invented:
 *     name       (req) "Bayline Comfort Club"
 *     intro      (req) One or two sentences
 *     tiers      (req) [{ name, price: "$19", period: "per month",
 *                      features: ["..."], featured: true }] featured marks
 *                      the one tier the business recommends
 *     note             Small print under the tiers
 *
 *   about        (req) About page and home teaser:
 *     eyebrow          "About us"
 *     title      (req) Headline
 *     text       (req) Array of paragraphs
 *     image      (req) Photo of the team, van or shop
 *     imageAlt   (req) What it shows
 *     values           [{ title, text }] three short promises
 *
 *   faqs               [{ q, a }] home FAQ accordion and the plan page
 *   serviceArea        ["Baytown", "Mont Belvieu", ...] towns served
 *   reviews            [{ author, text }] Google reviews, quoted as written
 */
import { useEffect, useRef, useState } from 'react';
import {
  AirVent,
  ArrowRight,
  BadgeCheck,
  BatteryCharging,
  Building2,
  Cable,
  CalendarCheck,
  Car,
  Check,
  ChevronDown,
  ChevronRight,
  CircuitBoard,
  Clock3,
  CreditCard,
  Droplets,
  Fan,
  Filter,
  Flame,
  Gauge,
  Heater,
  House,
  Leaf,
  Lightbulb,
  Mail,
  MapPin,
  Menu,
  Phone,
  Plug,
  PlugZap,
  Plus,
  Power,
  Quote,
  Settings,
  ShieldCheck,
  Siren,
  Snowflake,
  Star,
  Sun,
  Thermometer,
  Timer,
  Waves,
  Wind,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { brandVars, mapsHref, ratingLine, telHref } from '../site.js';
import { EnquiryForm, Img, Stars, Facts } from './shared.jsx';
import { onColor } from './hvac/color.js';

const ICONS = {
  snowflake: Snowflake,
  flame: Flame,
  wind: Wind,
  zap: Zap,
  wrench: Wrench,
  'air-vent': AirVent,
  thermometer: Thermometer,
  fan: Fan,
  heater: Heater,
  gauge: Gauge,
  filter: Filter,
  droplets: Droplets,
  waves: Waves,
  circuit: CircuitBoard,
  plug: Plug,
  power: Power,
  ev: PlugZap,
  lightbulb: Lightbulb,
  shield: ShieldCheck,
  sun: Sun,
  home: House,
  building: Building2,
  cable: Cable,
  settings: Settings,
  leaf: Leaf,
  battery: BatteryCharging,
  car: Car,
  timer: Timer,
};

const list = (v) => (Array.isArray(v) ? v : []);
const groupsOf = (b) => list(b.groups).filter((g) => g?.slug && g?.title);

/** The pages beyond home: one per service group, the plan, about, contact. */
export function pages(b) {
  return [
    ...groupsOf(b).map((g) => g.slug),
    b.plan?.tiers?.length ? 'maintenance-plan' : null,
    b.about ? 'about' : null,
    'contact',
  ].filter(Boolean);
}

const wrap = 'mx-auto w-full max-w-page px-gutter';
const pad = 'py-[clamp(4rem,8vw,6.5rem)]';
const h2 =
  'font-heading text-[clamp(1.9rem,1.35rem+2.1vw,2.85rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-ink [text-wrap:balance] break-words';
const lead = 'text-[17px] leading-[1.65] text-muted sm:text-[18px]';
const btn =
  'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl px-6 font-heading text-[16px] font-bold no-underline transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const btnPrimary = `${btn} bg-primary text-[color:var(--on-primary)] hover:bg-primary-deep hover:text-white`;
const btnOutline = `${btn} border border-line bg-white text-ink hover:border-primary hover:text-[color:var(--pt)]`;
const btnAccent = `${btn} bg-accent text-[color:var(--on-accent)] hover:brightness-105`;
const iconTile = 'grid flex-none place-items-center rounded-xl bg-primary/10 text-[color:var(--pt)]';
const gridBg =
  'bg-[linear-gradient(to_right,color-mix(in_srgb,var(--primary)_9%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--primary)_9%,transparent)_1px,transparent_1px)] bg-[size:44px_44px]';

function Eyebrow({ children, light = false }) {
  return (
    <p
      className={`mb-4 inline-flex items-center gap-2 font-heading text-[13px] font-bold uppercase tracking-[0.14em] ${
        light ? 'text-white/85' : 'text-[color:var(--pt)]'
      }`}
    >
      <span className={`h-1.5 w-1.5 flex-none rounded-full ${light ? 'bg-accent' : 'bg-primary'}`} aria-hidden="true" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

function Mark({ b, className = '', light = false }) {
  if (b.brand.logo) {
    return <img className={`block w-auto max-w-[46vw] object-contain ${className}`} src={b.brand.logo} alt={b.name} />;
  }
  return (
    <span className={`block truncate font-heading text-[19px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[22px] ${light ? 'text-white' : 'text-ink'}`}>
      {b.shortName}
    </span>
  );
}

function GroupIcon({ name, fallback = Wrench, size = 22, className = '' }) {
  const Icon = ICONS[name] || fallback;
  return <Icon size={size} className={className} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ header */

function EmergencyStrip({ b, tel }) {
  if (!b.emergency) return null;
  return (
    <div className="bg-accent text-[color:var(--on-accent)]">
      <div className={`${wrap} flex min-h-[44px] items-center justify-between gap-4 py-1.5 text-[14px]`}>
        <p className="flex min-w-0 items-center gap-2.5 font-semibold">
          <Siren size={17} className="flex-none" aria-hidden="true" />
          <span className="truncate">
            {b.emergency.title}
            <span className="hidden font-normal opacity-85 xl:inline"> &middot; {b.emergency.text}</span>
          </span>
        </p>
        <a href={tel} className="inline-flex min-h-[44px] flex-none items-center gap-1.5 font-bold text-current no-underline hover:underline">
          <Phone size={15} aria-hidden="true" /> <span className="hidden sm:inline">Call</span> {b.phone}
        </a>
      </div>
    </div>
  );
}

const COLS = ['', 'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4', 'lg:grid-cols-5'];

function MegaMenu({ b, groups, tel, current }) {
  const [open, setOpen] = useState(false);
  const opened = useRef(0);
  const root = useRef(null);
  const button = useRef(null);

  const quiet = useRef(false);
  const show = () => {
    if (quiet.current) {
      quiet.current = false;
      return;
    }
    if (!open) opened.current = Date.now();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        opened.current = 0;
        setOpen(false);
        if (document.activeElement !== button.current) {
          quiet.current = true;
          button.current?.focus();
        }
      }
    };
    const onDown = (event) => {
      if (root.current && !root.current.contains(event.target)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <li
      ref={root}
      className="flex"
      onMouseEnter={show}
      onMouseLeave={() => setOpen(false)}
      onFocus={show}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={button}
        type="button"
        className={`flex h-[76px] cursor-pointer items-center gap-1.5 px-1 text-[16px] md:text-[15px] font-semibold transition hover:text-[color:var(--pt)] ${
          open || groups.some((g) => g.slug === current) ? 'text-[color:var(--pt)]' : 'text-ink'
        }`}
        aria-expanded={open}
        aria-controls="mega-menu"
        onClick={() => {
          if (Date.now() - opened.current < 400) return;
          setOpen((v) => !v);
        }}
      >
        Services
        <ChevronDown size={16} className={`transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <div
        id="mega-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full border-y border-line bg-white shadow-[0_30px_50px_-30px_rgba(11,27,43,0.35)]"
      >
        <div className={`${wrap} grid gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_280px]`}>
          <div className={`grid gap-x-8 gap-y-8 ${COLS[Math.min(groups.length, 5)]}`}>
            {groups.map((g) => (
              <div key={g.slug} className="min-w-0">
                <a
                  href={`/${g.slug}`}
                  className="group flex min-h-[44px] items-center gap-3 border-b border-line pb-3 font-heading text-[17px] font-bold text-ink no-underline hover:text-[color:var(--pt)]"
                  aria-current={g.slug === current ? 'page' : undefined}
                >
                  <span className={`${iconTile} h-10 w-10`}>
                    <GroupIcon name={g.icon} size={19} />
                  </span>
                  <span className="min-w-0">{g.title}</span>
                </a>
                <ul className="mt-2 grid">
                  {list(g.services).map((s) => (
                    <li key={s.slug}>
                      <a
                        href={`/${g.slug}#${s.slug}`}
                        className="flex min-h-[40px] items-start gap-2 py-2 text-[16px] leading-snug text-muted no-underline transition hover:translate-x-0.5 hover:text-[color:var(--pt)] md:text-[15px]"
                      >
                        <ChevronRight size={14} className="mt-[3px] flex-none text-primary/60" aria-hidden="true" />
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="hidden flex-col justify-between gap-5 rounded-2xl bg-surface p-6 xl:flex">
            <div>
              <p className="font-heading text-[18px] font-bold leading-snug text-ink">
                {b.emergency ? b.emergency.title : `Book with ${b.shortName}`}
              </p>
              <p className="mt-2 text-[16px] md:text-[15px] leading-[1.55] text-muted">{b.emergency ? b.emergency.text : b.summary}</p>
            </div>
            <div className="grid gap-2.5">
              <a href="/contact" className={`${btnPrimary} min-h-[48px] text-[16px] md:text-[15px]`}>
                Schedule Service
              </a>
              <a href={tel} className={`${btnOutline} min-h-[48px] text-[16px] md:text-[15px]`}>
                <Phone size={16} aria-hidden="true" /> {b.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function MobileMenu({ b, groups, tel, links, onClose }) {
  const [section, setSection] = useState(null);
  return (
    <nav aria-label="Mobile" className={`${wrap} pb-28 pt-2 md:pb-6`}>
      <p className="pb-1 pt-3 font-heading text-[12px] font-bold uppercase tracking-[0.14em] text-muted">Services</p>
      <ul className="border-b border-line">
        {groups.map((g) => {
          const isOpen = section === g.slug;
          return (
            <li key={g.slug} className="border-t border-line">
              <button
                type="button"
                className="flex min-h-[56px] w-full cursor-pointer items-center gap-3 text-left font-heading text-[18px] font-bold text-ink"
                aria-expanded={isOpen}
                aria-controls={`m-${g.slug}`}
                onClick={() => setSection(isOpen ? null : g.slug)}
              >
                <span className={`${iconTile} h-9 w-9`}>
                  <GroupIcon name={g.icon} size={18} />
                </span>
                <span className="min-w-0 flex-1">{g.title}</span>
                <ChevronDown size={18} className={`flex-none text-[color:var(--pt)] transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <ul id={`m-${g.slug}`} hidden={!isOpen} className="pb-3 pl-12">
                <li>
                  <a href={`/${g.slug}`} onClick={onClose} className="flex min-h-[44px] items-center gap-1.5 font-semibold text-[color:var(--pt)] no-underline">
                    All {g.title} <ArrowRight size={15} aria-hidden="true" />
                  </a>
                </li>
                {list(g.services).map((s) => (
                  <li key={s.slug}>
                    <a href={`/${g.slug}#${s.slug}`} onClick={onClose} className="flex min-h-[44px] items-center text-[16px] text-muted no-underline">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
      <ul className="mt-2">
        {links.map(([href, label]) => (
          <li key={href} className="border-b border-line">
            <a href={href} onClick={onClose} className="flex min-h-[56px] items-center justify-between font-heading text-[18px] font-bold text-ink no-underline">
              {label} <ArrowRight size={17} className="text-[color:var(--pt)]" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <a href="/contact" onClick={onClose} className={btnPrimary}>
          Schedule Service
        </a>
        <a href={tel} className={btnOutline}>
          <Phone size={17} aria-hidden="true" /> {b.phone}
        </a>
      </div>
    </nav>
  );
}

function Header({ b, groups, tel, current }) {
  const [open, setOpen] = useState(false);
  const stick = b.preview ? 'top-11' : 'top-0';
  const links = [b.plan?.tiers?.length && ['/maintenance-plan', 'Maintenance Plan'], b.about && ['/about', 'About'], ['/contact', 'Contact']].filter(
    Boolean,
  );

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`sticky ${stick} z-40 border-b border-line bg-white/95 backdrop-blur-md`}>
      <div className={`${wrap} flex h-[68px] items-center gap-5 lg:h-[76px]`}>
        <a href="/" className={`flex min-h-[44px] min-w-0 items-center ${b.brand.logo ? 'flex-none' : 'flex-1 lg:flex-none'}`} aria-label={`${b.name} home`}>
          <Mark b={b} className="h-10 lg:h-11" />
        </a>

        <nav aria-label="Main" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-9">
            {groups.length > 0 && <MegaMenu b={b} groups={groups} tel={tel} current={current} />}
            {links.map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  aria-current={href.slice(1) === current ? 'page' : undefined}
                  className={`flex h-[76px] items-center whitespace-nowrap px-2 text-[15px] font-semibold no-underline transition hover:text-[color:var(--pt)] ${
                    href.slice(1) === current ? 'text-[color:var(--pt)]' : 'text-ink'
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex flex-none items-center gap-2 sm:gap-3 lg:ml-0">
          <a href={tel} className="hidden min-h-[44px] items-center gap-3 pr-2 text-ink no-underline xl:flex">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-surface text-[color:var(--pt)]">
              <Phone size={17} aria-hidden="true" />
            </span>
            <span className="grid leading-tight">
              <span className="text-[12px] font-medium text-muted">{b.emergency ? 'Call 24/7' : 'Call Us'}</span>
              <strong className="whitespace-nowrap font-heading text-[17px] font-bold">{b.phone}</strong>
            </span>
          </a>
          <a href="/contact" className={`${btnPrimary} hidden min-h-[46px] px-5 text-[16px] md:text-[15px] md:inline-flex`}>
            <CalendarCheck size={17} aria-hidden="true" /> Book Service
          </a>
          <a href={tel} className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-[color:var(--on-primary)] md:hidden" aria-label={`Call ${b.phone}`}>
            <Phone size={19} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-line px-3.5 font-semibold text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
            <span>{open ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>

      <div
        id="site-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-7.5rem)] overflow-y-auto border-b border-line bg-white shadow-[0_24px_40px_-24px_rgba(11,27,43,0.35)] lg:hidden"
      >
        <MobileMenu b={b} groups={groups} tel={tel} links={links} onClose={() => setOpen(false)} />
      </div>
    </header>
  );
}

/* ------------------------------------------------------------- shared bits */

function BookingCard({ b, groups, heading = 'h2', title = 'Book a Visit', service }) {
  const H = heading;
  const options = [...groups.flatMap((g) => list(g.services).map((s) => s.title)), 'Something else'];
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_30px_60px_-30px_rgba(11,27,43,0.45)] sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <H className="font-heading text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-ink">{title}</H>
          <p className="mt-1.5 text-[16px] md:text-[15px] leading-[1.5] text-muted">
            {service ? `Tell us about your ${service.toLowerCase()} job.` : 'Choose a service and we will call to confirm a time.'}
          </p>
        </div>
        <span className={`${iconTile} h-11 w-11`}>
          <CalendarCheck size={20} aria-hidden="true" />
        </span>
      </div>
      <EnquiryForm
        b={b}
        submitLabel="Check Availability"
        styles={{
          form: 'gap-3.5',
          label: 'text-[14px] font-semibold text-ink',
          field:
            'min-h-[50px] rounded-xl border border-line bg-surface/60 px-3.5 py-3 text-[16px] font-normal text-ink focus:border-primary focus:bg-white focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-primary/25',
          button:
            'mt-1 min-h-[54px] rounded-xl bg-primary py-3.5 font-heading text-[16px] font-bold text-[color:var(--on-primary)] transition hover:bg-primary-deep hover:text-white',
          done: 'rounded-xl bg-surface p-4 text-[16px] md:text-[15px] text-ink',
        }}
        fields={[
          { name: 'service', label: 'Service Type', type: 'select', required: true, wide: true, options },
          { name: 'zip', label: 'ZIP Code', required: true, autoComplete: 'postal-code' },
          { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
        ]}
      />
      <p className="mt-4 border-t border-line pt-4 text-center text-[16px] md:text-[15px] text-muted">
        Rather talk?{' '}
        <a href={telHref(b.phone)} className="inline-flex min-h-[44px] items-center font-semibold text-[color:var(--pt)] no-underline hover:underline">
          Call {b.phone}
        </a>
      </p>
    </div>
  );
}

function TrustRow({ b }) {
  const rating = ratingLine(b);
  const items = [
    b.sameDay && [Clock3, 'Same-Day Service', b.sameDay],
    list(b.licenses).length > 0 && [
      BadgeCheck,
      'Licensed',
      list(b.licenses)
        .map((l) => `${l.label} ${l.number}`)
        .join(' · '),
    ],
    b.financing?.text && [CreditCard, 'Financing', b.financing.text],
    rating && [Star, `${Number(b.rating).toFixed(1)} on Google`, `From ${b.reviewCount.toLocaleString()} customer reviews.`],
  ].filter(Boolean);
  if (!items.length) return null;
  const cols = ['', 'md:grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3', 'md:grid-cols-2 xl:grid-cols-4'][items.length];
  return (
    <section aria-label="Why customers choose us" className="border-y border-line bg-surface">
      <ul className={`${wrap} grid divide-y divide-line md:gap-x-10 md:divide-y-0 ${cols}`}>
        {items.map(([Icon, title, text]) => (
          <li key={title} className="flex gap-4 py-6 md:py-8">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white text-[color:var(--pt)] shadow-[0_0_0_1px_var(--line)]">
              <Icon size={19} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-heading text-[16px] font-bold leading-snug text-ink">{title}</p>
              <p className="mt-1 break-words text-[16px] md:text-[15px] leading-[1.55] text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Reviews({ b, surface = false }) {
  const reviews = list(b.reviews);
  if (!reviews.length) return null;
  return (
    <section id="reviews" className={`${pad} ${surface ? 'bg-surface' : 'bg-white'}`}>
      <div className={wrap}>
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-12">
          <div className="max-w-2xl">
            <Eyebrow>Reviews</Eyebrow>
            <h2 className={h2}>What customers say</h2>
          </div>
          {b.rating && b.reviewCount && (
            <div className="flex items-center gap-4 rounded-2xl border border-line bg-white px-5 py-4">
              <strong className="font-heading text-[44px] font-extrabold leading-none tracking-[-0.03em] text-ink">
                {Number(b.rating).toFixed(1)}
              </strong>
              <div className="grid gap-1">
                <Stars value={b.rating} size={17} />
                <span className="text-[14px] font-medium text-muted">{b.reviewCount.toLocaleString()} Google reviews</span>
              </div>
            </div>
          )}
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((r, i) => (
            <figure key={i} className="m-0 flex flex-col rounded-2xl border border-line bg-white p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <Quote size={26} className="text-primary/25" aria-hidden="true" />
                <Stars value={5} size={14} />
              </div>
              <blockquote className="m-0 mb-6 mt-4 text-[16px] leading-[1.65] text-ink">{r.text}</blockquote>
              <figcaption className="mt-auto border-t border-line pt-4 text-[16px] md:text-[15px] font-semibold text-muted">{r.author}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faqs({ b, tel }) {
  const faqs = list(b.faqs);
  if (!faqs.length) return null;
  return (
    <section id="faq" className={`${pad} bg-white`}>
      <div className={`${wrap} grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20`}>
        <div className="lg:sticky lg:top-40 lg:self-start">
          <Eyebrow>Questions</Eyebrow>
          <h2 className={h2}>Answers before you call</h2>
          <p className={`mt-4 ${lead}`}>Anything not covered here, ask us on the phone.</p>
          <a href={tel} className="mt-4 inline-flex min-h-[44px] items-center gap-2 font-heading text-[18px] font-bold text-[color:var(--pt)] no-underline hover:underline">
            <Phone size={18} aria-hidden="true" /> {b.phone}
          </a>
        </div>
        <div className="grid gap-3">
          {faqs.map((f, i) => (
            <details key={i} className="group rounded-2xl border border-line bg-white transition open:border-primary/40 open:bg-surface/50">
              <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-heading text-[17px] font-bold leading-snug text-ink sm:px-6 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">{f.q}</span>
                <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-surface text-[color:var(--pt)] transition group-open:rotate-45 group-open:bg-primary group-open:text-[color:var(--on-primary)]">
                  <Plus size={17} aria-hidden="true" />
                </span>
              </summary>
              <p className="px-5 pb-5 text-[16px] leading-[1.65] text-muted sm:px-6">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingBand({ b, tel, title, text, flush = false }) {
  const area = list(b.serviceArea);
  return (
    <section className={`bg-white pb-[clamp(4rem,8vw,6.5rem)] ${flush ? '' : 'pt-[clamp(2.5rem,5vw,4rem)]'}`}>
      <div className={wrap}>
        <div className="relative isolate overflow-hidden rounded-[28px] bg-primary-deep px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
          <div className={`absolute inset-0 -z-10 opacity-60 ${gridBg} [mask-image:linear-gradient(90deg,transparent,black)]`} aria-hidden="true" />
          <div
            className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-primary opacity-60 blur-3xl"
            aria-hidden="true"
          />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
            <div>
              <Eyebrow light>{b.emergency ? b.emergency.title : 'Schedule service'}</Eyebrow>
              <h2 className="font-heading text-[clamp(1.9rem,1.35rem+2.1vw,2.85rem)] font-extrabold leading-[1.08] tracking-[-0.025em] [text-wrap:balance]">
                {title}
              </h2>
              <p className="mt-4 max-w-xl text-[17px] leading-[1.65] text-white/80 sm:text-[18px]">{text}</p>
              {area.length > 0 && (
                <ul aria-label="Service area" className="mt-7 flex flex-wrap gap-2">
                  {area.map((t) => (
                    <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[14px] font-medium text-white/90">
                      <MapPin size={13} className="flex-none text-accent" aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <a href="/contact" className={btnAccent}>
                Schedule Service <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a href={tel} className={`${btn} border border-white/30 text-white hover:bg-white/10`}>
                <Phone size={17} aria-hidden="true" /> {b.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PageHero({ b, crumbs, eyebrow, title, text, image, imageAlt, icon, children }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-surface">
      <div className={`absolute inset-0 -z-10 ${gridBg} [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]`} aria-hidden="true" />
      <div
        className={`${wrap} grid gap-10 py-12 sm:py-14 lg:py-20 ${image ? 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16' : ''}`}
      >
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-[14px] text-muted">
              <li>
                <a href="/" className="inline-flex min-h-[32px] items-center text-muted no-underline hover:text-[color:var(--pt)]">
                  Home
                </a>
              </li>
              {crumbs.map((c) => (
                <li key={c} className="flex items-center gap-1.5">
                  <ChevronRight size={14} aria-hidden="true" />
                  <span aria-current="page" className="font-medium text-ink">
                    {c}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
          {icon ? (
            <span className={`${iconTile} mb-5 h-14 w-14 bg-white shadow-[0_0_0_1px_var(--line)]`}>
              <GroupIcon name={icon} size={26} />
            </span>
          ) : (
            eyebrow && <Eyebrow>{eyebrow}</Eyebrow>
          )}
          <h1 className="font-heading text-[clamp(2.2rem,1.3rem+3.2vw,3.6rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-ink [text-wrap:balance] break-words">
            {title}
          </h1>
          {text && <p className={`mt-5 max-w-[38rem] ${lead}`}>{text}</p>}
          {children}
        </div>
        {image && (
          <Img
            className="aspect-[16/11] w-full rounded-[24px] object-cover shadow-[0_30px_60px_-35px_rgba(11,27,43,0.55)]"
            src={image}
            alt={imageAlt}
            sizes="(min-width: 1024px) 45vw, 100vw"
            eager
          />
        )}
      </div>
    </section>
  );
}

function CtaPair({ b, tel, className = '' }) {
  return (
    <div className={`mt-8 grid gap-3 sm:flex sm:flex-wrap ${className}`}>
      <a href="/contact" className={btnPrimary}>
        Schedule Service <ArrowRight size={18} aria-hidden="true" />
      </a>
      <a href={tel} className={btnOutline}>
        <Phone size={17} aria-hidden="true" /> {b.phone}
      </a>
    </div>
  );
}

function Footer({ b, groups, tel }) {
  const licenses = list(b.licenses);
  const hours = list(b.hours);
  const head = 'mb-3 font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-ink';
  return (
    <footer className="border-t border-line bg-surface pb-28 text-[16px] md:text-[15px] text-muted md:pb-0">
      <div className={`${wrap} grid grid-cols-2 gap-x-6 gap-y-10 pb-12 pt-14 lg:grid-cols-[1.4fr_1fr_1.2fr] lg:gap-12`}>
        <div className="col-span-2 grid content-start gap-4 lg:col-span-1">
          <a href="/" className="flex min-h-[44px] w-fit max-w-full items-center" aria-label={`${b.name} home`}>
            <Mark b={b} className="h-12" />
          </a>
          {licenses.length > 0 && (
            <ul className="grid gap-1 text-[14px]">
              {licenses.map((l) => (
                <li key={l.number} className="flex items-center gap-2">
                  <ShieldCheck size={15} className="flex-none text-[color:var(--pt)]" aria-hidden="true" />
                  <span className="min-w-0 break-words">
                    {l.label} {l.number}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className={head}>Services</h2>
          <ul className="grid">
            {groups.slice(0, 4).map((g) => (
              <li key={g.slug}>
                <a href={`/${g.slug}`} className="flex min-h-[44px] items-center text-muted no-underline hover:text-[color:var(--pt)]">
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-2 lg:col-span-1">
          <h2 className={head}>Contact</h2>
          <a href={tel} className="flex min-h-[44px] items-center font-heading text-[20px] font-bold text-ink no-underline hover:text-[color:var(--pt)]">
            {b.phone}
          </a>
          {b.email && (
            <a href={`mailto:${b.email}`} className="flex min-h-[44px] items-center break-all text-muted no-underline hover:text-[color:var(--pt)]">
              {b.email}
            </a>
          )}
          <a href={mapsHref(b)} className="block py-2 leading-[1.6] text-muted no-underline hover:text-[color:var(--pt)]">
            {b.address}
            <br />
            {b.town}, {b.state} {b.zip}
          </a>
          {hours.length > 0 && (
            <dl className="mt-3 grid gap-1 text-[14px]">
              {hours.map(([d, h]) => (
                <div key={d} className="flex flex-wrap gap-x-2">
                  <dt className="font-medium text-ink">{d}</dt>
                  <dd className="m-0">{h}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
      <div className={wrap}>
        <p className="border-t border-line py-6 text-[16px] md:text-[14px]">
          &copy; {new Date().getFullYear()} {b.name}
        </p>
      </div>
    </footer>
  );
}

function MobileBar({ b, tel }) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 md:hidden" style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="grid grid-cols-[auto_1fr] gap-2 rounded-2xl bg-ink p-2 shadow-[0_18px_40px_-12px_rgba(11,27,43,0.6)]">
        <a href={tel} className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 text-[16px] font-semibold text-white no-underline">
          <Phone size={18} className="flex-none" aria-hidden="true" /> Call
        </a>
        <a
          href="/contact"
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-3 font-heading text-[16px] font-bold text-[color:var(--on-primary)] no-underline"
        >
          <CalendarCheck size={18} className="flex-none" aria-hidden="true" /> Book Service
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- pages */

function Home({ b, groups, tel }) {
  const rating = ratingLine(b);
  const cols = groups.length >= 4 ? 'md:grid-cols-2 xl:grid-cols-4' : groups.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';
  const firstTier = list(b.plan?.tiers)[0];
  return (
    <>
      <section className="relative isolate overflow-hidden bg-white">
        <div className={`absolute inset-0 -z-10 ${gridBg} [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_65%)]`} aria-hidden="true" />
        <div className={`${wrap} grid gap-10 pb-14 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:pb-20 lg:pt-16 xl:gap-20`}>
          <div className="min-w-0">
            <p className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4 text-[14px] font-medium text-ink shadow-[0_8px_20px_-14px_rgba(11,27,43,0.4)]">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-primary text-[color:var(--on-primary)]">
                <GroupIcon name={groups[0]?.icon} size={14} />
              </span>
              <span className="min-w-0 truncate">{b.hero.eyebrow}</span>
            </p>
            <h1 className="font-heading text-[clamp(2.4rem,1.2rem+4.2vw,4.4rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink [text-wrap:balance] break-words">
              {b.hero.title} {b.hero.titleAccent && <span className="text-[color:var(--pt)]">{b.hero.titleAccent}</span>}
            </h1>
            <p className={`mt-6 max-w-[34rem] ${lead}`}>{b.hero.lead}</p>
            <CtaPair b={b} tel={tel} />
            {rating && (
              <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[16px] md:text-[15px] font-medium text-muted">
                <Stars value={b.rating} size={16} /> <span>{rating}</span>
              </p>
            )}
          </div>
          <div className="relative min-w-0">
            <Img
              className="aspect-[16/11] w-full rounded-[28px] object-cover lg:aspect-[4/5] lg:max-h-[640px]"
              src={b.hero.image}
              alt={b.hero.imageAlt}
              sizes="(min-width: 1024px) 48vw, 100vw"
              eager
            />
            <div className="relative -mt-16 px-3 sm:-mt-24 sm:px-10 lg:absolute lg:bottom-8 lg:left-auto lg:right-8 lg:mt-0 lg:w-[min(400px,calc(100%-4rem))] lg:px-0 xl:-left-14 xl:right-auto">
              <BookingCard b={b} groups={groups} />
            </div>
          </div>
        </div>
      </section>

      <TrustRow b={b} />

      <section id="services" className={`${pad} bg-white`}>
        <div className={wrap}>
          <div className="mb-10 grid gap-5 lg:mb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end lg:gap-16">
            <div>
              <Eyebrow>Services</Eyebrow>
              <h2 className={h2}>What we can help with</h2>
            </div>
            <p className={lead}>{b.summary}</p>
          </div>
          <div className={`grid gap-5 ${cols}`}>
            {groups.map((g) => (
              <article
                key={g.slug}
                className="group relative flex flex-col rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_24px_50px_-30px_rgba(11,27,43,0.4)] sm:p-7"
              >
                <span className={`${iconTile} h-14 w-14 transition group-hover:bg-primary group-hover:text-[color:var(--on-primary)]`}>
                  <GroupIcon name={g.icon} size={26} />
                </span>
                <h3 className="mt-6 font-heading text-[21px] font-extrabold tracking-[-0.02em] text-ink">
                  <a href={`/${g.slug}`} className="text-current no-underline after:absolute after:inset-0 after:rounded-2xl after:content-['']">
                    {g.title}
                  </a>
                </h3>
                <p className="mt-2 text-[16px] leading-[1.6] text-muted">{g.summary}</p>
                <ul className="mb-6 mt-5 grid gap-2 border-t border-line pt-5">
                  {list(g.services).map((s) => (
                    <li key={s.slug} className="flex items-center gap-2.5 text-[16px] md:text-[15px] font-medium text-ink">
                      <GroupIcon name={s.icon || g.icon} size={15} className="flex-none text-[color:var(--pt)]" />
                      <span className="min-w-0">{s.title}</span>
                    </li>
                  ))}
                </ul>
                <span className="mt-auto inline-flex items-center gap-1.5 font-heading text-[16px] md:text-[15px] font-bold text-[color:var(--pt)]">
                  See {g.title} <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </article>
            ))}
          </div>
          {firstTier && (
            <a
              href="/maintenance-plan"
              className="group mt-6 flex flex-col gap-4 rounded-2xl border border-dashed border-primary/40 bg-surface/60 p-5 no-underline transition hover:border-primary sm:flex-row sm:items-center sm:p-6"
            >
              <span className={`${iconTile} h-12 w-12 bg-white`}>
                <ShieldCheck size={22} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-[18px] font-bold text-ink">{b.plan.name}</span>
                <span className="mt-1 block text-[16px] md:text-[15px] leading-[1.55] text-muted">{b.plan.intro}</span>
              </span>
              <span className="inline-flex flex-none items-center gap-1.5 font-heading text-[16px] md:text-[15px] font-bold text-[color:var(--pt)]">
                From {firstTier.price} {firstTier.period} <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </a>
          )}
        </div>
      </section>

      {b.promo && (
        <section aria-label={b.promo.eyebrow} className="bg-white pb-[clamp(4rem,8vw,6.5rem)]">
          <div className={wrap}>
            <div className="grid overflow-hidden rounded-[28px] bg-primary text-[color:var(--on-primary)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div className="relative isolate px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
                <div className={`absolute inset-0 -z-10 opacity-40 ${gridBg} [mask-image:linear-gradient(120deg,black,transparent_70%)]`} aria-hidden="true" />
                <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-accent px-3.5 py-1.5 font-heading text-[13px] font-bold uppercase tracking-[0.12em] text-[color:var(--on-accent)]">
                  <Sun size={15} aria-hidden="true" /> {b.promo.eyebrow}
                </p>
                <h2 className="font-heading text-[clamp(1.9rem,1.35rem+2.1vw,2.85rem)] font-extrabold leading-[1.08] tracking-[-0.025em] [text-wrap:balance]">
                  {b.promo.title}
                </h2>
                <p className="mt-4 max-w-xl text-[17px] leading-[1.65] opacity-85 sm:text-[18px]">{b.promo.text}</p>
                <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
                  {b.promo.price && (
                    <p className="flex items-baseline gap-2">
                      <strong className="font-heading text-[52px] font-extrabold leading-none tracking-[-0.04em]">{b.promo.price}</strong>
                      {b.promo.priceNote && <span className="text-[16px] md:text-[15px] opacity-80">{b.promo.priceNote}</span>}
                    </p>
                  )}
                  <a href="/contact" className={`${btn} bg-white text-[color:var(--pt)] hover:bg-surface sm:ml-auto lg:ml-4`}>
                    Book a Tune-Up <ArrowRight size={18} aria-hidden="true" />
                  </a>
                </div>
              </div>
              {b.promo.image && (
                <Img
                  className="order-first aspect-[16/9] h-full w-full object-cover lg:order-none lg:aspect-auto"
                  src={b.promo.image}
                  alt={b.promo.imageAlt}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                />
              )}
            </div>
          </div>
        </section>
      )}

      {b.about && (
        <section className={`${pad} bg-surface`}>
          <div className={`${wrap} grid items-center gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20`}>
            <div className="relative">
              <Img
                className="aspect-[4/3] w-full rounded-[24px] object-cover md:aspect-[4/5]"
                src={b.about.image}
                alt={b.about.imageAlt}
                sizes="(min-width: 768px) 42vw, 100vw"
              />
              {b.since && (
                <p className="absolute bottom-4 left-4 rounded-2xl bg-white px-5 py-3.5 shadow-[0_18px_40px_-20px_rgba(11,27,43,0.5)]">
                  <span className="block text-[13px] font-medium text-muted">Serving {b.town} since</span>
                  <strong className="font-heading text-[28px] font-extrabold leading-none tracking-[-0.03em] text-ink">{b.since}</strong>
                </p>
              )}
            </div>
            <div>
              <Eyebrow>{b.about.eyebrow || 'About us'}</Eyebrow>
              <h2 className={h2}>{b.about.title}</h2>
              <p className={`mt-5 ${lead}`}>{list(b.about.text)[0]}</p>
              {list(b.about.values).length > 0 && (
                <ul className="mt-8 grid gap-4 sm:grid-cols-3">
                  {list(b.about.values).map((v) => (
                    <li key={v.title} className="rounded-2xl bg-white p-5">
                      <Check size={18} className="text-[color:var(--pt)]" strokeWidth={2.5} aria-hidden="true" />
                      <p className="mt-3 font-heading text-[16px] font-bold text-ink">{v.title}</p>
                      <p className="mt-1 text-[16px] md:text-[15px] leading-[1.5] text-muted">{v.text}</p>
                    </li>
                  ))}
                </ul>
              )}
              <a href="/about" className="mt-8 inline-flex min-h-[44px] items-center gap-1.5 font-heading text-[16px] font-bold text-[color:var(--pt)] no-underline hover:underline">
                About {b.shortName} <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      )}

      <Reviews b={b} />
      <Faqs b={b} tel={tel} />
      <ClosingBand
        b={b}
        tel={tel}
        flush={list(b.faqs).length > 0}
        title={`Book service with ${b.shortName}`}
        text="Send a request or call, and we will set up a time that works for you."
      />
    </>
  );
}

function GroupPage({ b, groups, group, tel }) {
  const services = list(group.services);
  const others = groups.filter((g) => g.slug !== group.slug);
  const stickTop = b.preview ? 'lg:top-[148px]' : 'lg:top-[104px]';
  const anchor = b.preview ? 'scroll-mt-[140px]' : 'scroll-mt-[96px]';
  return (
    <>
      <PageHero
        b={b}
        crumbs={[group.title]}
        icon={group.icon}
        title={`${group.title} services in ${b.town}`}
        text={group.intro}
        image={group.image}
        imageAlt={group.imageAlt}
      >
        <CtaPair b={b} tel={tel} />
      </PageHero>

      {services.length > 1 && (
        <nav aria-label={`${group.title} services`} className="border-b border-line bg-white">
          <ul className={`${wrap} flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]`}>
            {services.map((s) => (
              <li key={s.slug} className="flex-none">
                <a
                  href={`#${s.slug}`}
                  className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full border border-line px-4 text-[16px] md:text-[15px] font-medium text-ink no-underline hover:border-primary hover:text-[color:var(--pt)]"
                >
                  <GroupIcon name={s.icon || group.icon} size={15} className="text-[color:var(--pt)]" /> {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <section className={`${pad} bg-white`}>
        <div className={`${wrap} grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16`}>
          <div className="grid gap-5">
            {services.map((s, i) => (
              <article key={s.slug} id={s.slug} className={`${anchor} rounded-2xl border border-line p-6 sm:p-8`}>
                <div className="flex items-start gap-4 sm:gap-5">
                  <span className={`${iconTile} h-12 w-12 sm:h-14 sm:w-14`}>
                    <GroupIcon name={s.icon || group.icon} size={24} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-muted">
                      {String(i + 1).padStart(2, '0')} / {String(services.length).padStart(2, '0')}
                    </p>
                    <h2 className="mt-1 font-heading text-[24px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[26px]">
                      {s.title}
                    </h2>
                    <p className="mt-3 text-[16px] leading-[1.65] text-muted sm:text-[17px]">{s.text}</p>
                    {list(s.points).length > 0 && (
                      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                        {list(s.points).map((p) => (
                          <li key={p} className="flex gap-2.5 text-[16px] md:text-[15px] leading-[1.5] text-ink">
                            <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-primary/10 text-[color:var(--pt)]">
                              <Check size={13} strokeWidth={3} aria-hidden="true" />
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}
                    <a
                      href="/contact"
                      className="mt-6 inline-flex min-h-[44px] items-center gap-1.5 font-heading text-[16px] md:text-[15px] font-bold text-[color:var(--pt)] no-underline hover:underline"
                    >
                      Book {s.title} <ArrowRight size={16} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className={`grid content-start gap-5 lg:sticky lg:self-start ${stickTop}`}>
            <BookingCard b={b} groups={groups} title={`Book ${group.title}`} service={group.title} />
            {b.emergency && (
              <a href={tel} className="flex gap-4 rounded-2xl bg-accent p-5 text-[color:var(--on-accent)] no-underline">
                <Siren size={22} className="mt-0.5 flex-none" aria-hidden="true" />
                <span className="min-w-0">
                  <strong className="block font-heading text-[17px]">{b.emergency.title}</strong>
                  <span className="mt-1 block text-[16px] md:text-[15px] leading-[1.5] opacity-90">{b.emergency.text}</span>
                  <span className="mt-2 block font-bold">{b.phone}</span>
                </span>
              </a>
            )}
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className={`${pad} bg-surface`}>
          <div className={wrap}>
            <Eyebrow>More services</Eyebrow>
            <h2 className={`${h2} mb-10`}>Other ways we can help</h2>
            <div className={`grid gap-4 ${others.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              {others.map((g) => (
                <a
                  key={g.slug}
                  href={`/${g.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border border-line bg-white p-6 no-underline transition hover:border-primary/40"
                >
                  <span className={`${iconTile} h-12 w-12`}>
                    <GroupIcon name={g.icon} size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 font-heading text-[18px] font-bold text-ink group-hover:text-[color:var(--pt)]">
                      {g.title} <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                    <span className="mt-1.5 block text-[16px] md:text-[15px] leading-[1.55] text-muted">{g.summary}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <ClosingBand
        b={b}
        tel={tel}
        title={`Need ${group.title.toLowerCase()} service?`}
        text="Send a request or call, and we will set up a time that works for you."
      />
    </>
  );
}

function PlanPage({ b, tel }) {
  const tiers = list(b.plan.tiers);
  const cols = tiers.length >= 3 ? 'lg:grid-cols-3' : tiers.length === 2 ? 'md:grid-cols-2' : '';
  return (
    <>
      <PageHero b={b} crumbs={['Maintenance Plan']} eyebrow="Maintenance plan" title={b.plan.name} text={b.plan.intro} />
      <section className={`${pad} bg-white`}>
        <div className={wrap}>
          <div className={`mx-auto grid max-w-[68rem] items-stretch gap-5 ${cols}`}>
            {tiers.map((t) => (
              <article
                key={t.name}
                className={`relative flex flex-col rounded-[24px] p-7 sm:p-8 ${
                  t.featured
                    ? 'bg-primary text-[color:var(--on-primary)] shadow-[0_30px_60px_-30px_rgba(11,27,43,0.55)]'
                    : 'border border-line bg-white text-ink'
                }`}
              >
                {t.featured && (
                  <p className="absolute right-6 top-6 rounded-full bg-accent px-3 py-1 font-heading text-[12px] font-bold uppercase tracking-[0.1em] text-[color:var(--on-accent)]">
                    Recommended
                  </p>
                )}
                <h2 className="font-heading text-[20px] font-extrabold tracking-[-0.01em]">{t.name}</h2>
                <p className="mt-5 flex items-baseline gap-2">
                  <strong className="font-heading text-[48px] font-extrabold leading-none tracking-[-0.04em]">{t.price}</strong>
                  {t.period && <span className={`text-[16px] md:text-[15px] ${t.featured ? 'opacity-80' : 'text-muted'}`}>{t.period}</span>}
                </p>
                <ul className={`mb-8 mt-6 grid gap-3 border-t pt-6 ${t.featured ? 'border-white/20' : 'border-line'}`}>
                  {list(t.features).map((f) => (
                    <li key={f} className="flex gap-3 text-[16px] leading-[1.45]">
                      <Check size={18} strokeWidth={2.5} className={`mt-0.5 flex-none ${t.featured ? '' : 'text-[color:var(--pt)]'}`} aria-hidden="true" />
                      <span className="min-w-0">{f}</span>
                    </li>
                  ))}
                </ul>
                <a href="/contact" className={`${t.featured ? `${btn} bg-white text-[color:var(--pt)] hover:bg-surface` : btnPrimary} mt-auto`}>
                  Join {t.name}
                </a>
              </article>
            ))}
          </div>
          {b.plan.note && <p className="mx-auto mt-8 max-w-[68rem] text-center text-[16px] md:text-[15px] text-muted">{b.plan.note}</p>}
        </div>
      </section>
      <TrustRow b={b} />
      <Faqs b={b} tel={tel} />
      <ClosingBand
        b={b}
        tel={tel}
        flush={list(b.faqs).length > 0}
        title={`Join ${b.plan.name}`}
        text="Call or send a request and we will set up your first visit."
      />
    </>
  );
}

function AboutPage({ b, tel }) {
  const licenses = list(b.licenses);
  const values = list(b.about.values);
  const rating = ratingLine(b);
  return (
    <>
      <PageHero
        b={b}
        crumbs={['About']}
        eyebrow={b.about.eyebrow || 'About us'}
        title={b.about.title}
        text={list(b.about.text)[0]}
        image={b.about.image}
        imageAlt={b.about.imageAlt}
      >
        <CtaPair b={b} tel={tel} />
      </PageHero>
      <section className={`${pad} bg-white`}>
        <div className={`${wrap} grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-20`}>
          <div>
            <h2 className={h2}>How we work</h2>
            {list(b.about.text)
              .slice(1)
              .map((p) => (
                <p key={p} className={`mt-5 ${lead}`}>
                  {p}
                </p>
              ))}
            {values.length > 0 && (
              <ol className="mt-10 grid gap-4">
                {values.map((v, i) => (
                  <li key={v.title} className="flex gap-5 rounded-2xl border border-line p-5 sm:p-6">
                    <span className="font-heading text-[28px] font-extrabold leading-none tracking-[-0.03em] text-[color:var(--pt)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-heading text-[18px] font-bold text-ink">{v.title}</h3>
                      <p className="mt-1.5 text-[16px] leading-[1.55] text-muted">{v.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <aside className="grid content-start gap-4">
            {(b.since || rating) && (
              <div className="grid grid-cols-2 gap-4">
                {b.since && (
                  <div className="rounded-2xl bg-surface p-5">
                    <p className="text-[14px] text-muted">Established</p>
                    <p className="mt-1 font-heading text-[30px] font-extrabold tracking-[-0.03em] text-ink">{b.since}</p>
                  </div>
                )}
                {rating && (
                  <div className="rounded-2xl bg-surface p-5">
                    <p className="text-[14px] text-muted">Google rating</p>
                    <p className="mt-1 font-heading text-[30px] font-extrabold tracking-[-0.03em] text-ink">{Number(b.rating).toFixed(1)}</p>
                  </div>
                )}
              </div>
            )}
            {licenses.length > 0 && (
              <div className="rounded-2xl border border-line p-6">
                <h2 className="flex items-center gap-2 font-heading text-[17px] font-bold text-ink">
                  <ShieldCheck size={19} className="text-[color:var(--pt)]" aria-hidden="true" /> Licenses
                </h2>
                <dl className="mt-4 grid gap-3">
                  {licenses.map((l) => (
                    <div key={l.number} className="flex flex-wrap justify-between gap-x-4 border-t border-line pt-3 text-[16px] md:text-[15px]">
                      <dt className="text-muted">{l.label}</dt>
                      <dd className="m-0 font-semibold text-ink">{l.number}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {list(b.serviceArea).length > 0 && (
              <div className="rounded-2xl border border-line p-6">
                <h2 className="flex items-center gap-2 font-heading text-[17px] font-bold text-ink">
                  <MapPin size={19} className="text-[color:var(--pt)]" aria-hidden="true" /> Service area
                </h2>
                <p className="mt-3 text-[16px] md:text-[15px] leading-[1.6] text-muted">{list(b.serviceArea).join(', ')}</p>
              </div>
            )}
          </aside>
        </div>
      </section>
      <Reviews b={b} surface />
      <ClosingBand b={b} tel={tel} title={`Book service with ${b.shortName}`} text="Send a request or call, and we will set up a time that works for you." />
    </>
  );
}

function ContactPage({ b, groups, tel }) {
  const hours = list(b.hours);
  const full = `${b.address}, ${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;
  const options = [...groups.flatMap((g) => list(g.services).map((s) => s.title)), 'Something else'];
  return (
    <>
      <PageHero
        b={b}
        crumbs={['Contact']}
        eyebrow="Schedule service"
        title="Tell us what is going on"
        text="Send a request and we will call to confirm a time, or pick up the phone and talk to us now."
      />
      <section className={`${pad} bg-white`}>
        <div className={`${wrap} grid items-start gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-14`}>
          <div className="rounded-[24px] border border-line p-5 sm:p-8 lg:p-10">
            <h2 className="mb-6 font-heading text-[24px] font-extrabold tracking-[-0.02em] text-ink">Request Service</h2>
            <EnquiryForm
              b={b}
              submitLabel="Send Request"
              styles={{
                form: '',
                label: 'text-[14px] font-semibold text-ink',
                field:
                  'min-h-[50px] rounded-xl border border-line bg-surface/60 px-3.5 py-3 text-[16px] font-normal text-ink focus:border-primary focus:bg-white focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-primary/25',
                button:
                  'min-h-[54px] rounded-xl bg-primary py-3.5 font-heading text-[16px] font-bold text-[color:var(--on-primary)] transition hover:bg-primary-deep hover:text-white',
                done: 'rounded-xl bg-surface p-5 text-ink',
              }}
              fields={[
                { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
                { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
                { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
                { name: 'zip', label: 'ZIP Code', required: true, autoComplete: 'postal-code' },
                { name: 'service', label: 'Service Type', type: 'select', required: true, wide: true, options },
                { name: 'time', label: 'Best Time to Visit', type: 'select', wide: true, options: ['First available', 'Morning', 'Afternoon'] },
                { name: 'details', label: 'What Is Going On?', type: 'textarea', wide: true },
              ]}
            />
          </div>
          <aside className="grid gap-4">
            {b.emergency && (
              <a href={tel} className="flex gap-4 rounded-2xl bg-accent p-6 text-[color:var(--on-accent)] no-underline">
                <Siren size={24} className="mt-0.5 flex-none" aria-hidden="true" />
                <span className="min-w-0">
                  <strong className="block font-heading text-[18px]">{b.emergency.title}</strong>
                  <span className="mt-1 block text-[16px] md:text-[15px] leading-[1.55] opacity-90">{b.emergency.text}</span>
                  <span className="mt-3 block font-heading text-[20px] font-extrabold">{b.phone}</span>
                </span>
              </a>
            )}
            <ul className="grid gap-1 rounded-2xl border border-line p-3">
              {[
                [Phone, tel, b.phone],
                b.email && [Mail, `mailto:${b.email}`, b.email],
                [MapPin, mapsHref(b), full],
              ]
                .filter(Boolean)
                .map(([Icon, href, label]) => (
                  <li key={href}>
                    <a href={href} className="flex min-h-[56px] items-center gap-3 rounded-xl px-2 font-medium text-ink no-underline hover:bg-surface">
                      <span className={`${iconTile} h-10 w-10`}>
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 break-words">{label}</span>
                    </a>
                  </li>
                ))}
            </ul>
            {hours.length > 0 && (
              <div className="rounded-2xl bg-surface p-6">
                <h2 className="flex items-center gap-2 font-heading text-[17px] font-bold text-ink">
                  <Clock3 size={18} className="text-[color:var(--pt)]" aria-hidden="true" /> Hours
                </h2>
                <table className="mt-3 w-full border-collapse text-[16px] md:text-[15px]">
                  <tbody>
                    {hours.map(([d, h]) => (
                      <tr key={d} className="border-b border-line last:border-0">
                        <th scope="row" className="py-2.5 pr-4 text-left font-medium text-muted">
                          {d}
                        </th>
                        <td className="py-2.5 text-right font-semibold text-ink">{h}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {list(b.serviceArea).length > 0 && (
              <div className="rounded-2xl border border-line p-6">
                <h2 className="flex items-center gap-2 font-heading text-[17px] font-bold text-ink">
                  <MapPin size={18} className="text-[color:var(--pt)]" aria-hidden="true" /> Service area
                </h2>
                <p className="mt-3 text-[16px] md:text-[15px] leading-[1.6] text-muted">{list(b.serviceArea).join(', ')}</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}

export default function Hvac({ b, path = '' }) {
  const tel = telHref(b.phone);
  const groups = groupsOf(b);
  const group = groups.find((g) => g.slug === path);
  const page =
    group ? 'group' : path === 'maintenance-plan' && b.plan?.tiers?.length ? 'plan' : path === 'about' && b.about ? 'about' : path === 'contact' ? 'contact' : 'home';
  const current = page === 'home' ? '' : path;

  const style = {
    '--ink': '#0f1b2a',
    '--primaryDeep': 'color-mix(in srgb, var(--primary) 45%, #000)',
    '--accent': 'var(--primary)',
    '--muted': 'color-mix(in srgb, var(--ink) 72%, #fff)',
    '--surface': 'color-mix(in srgb, var(--primary) 6%, #fff)',
    '--line': 'color-mix(in srgb, var(--ink) 13%, #fff)',
    ...brandVars(b.brand),
    '--on-primary': onColor(b.brand.primary),
    '--pt': onColor(b.brand.primary) === '#fff' ? 'var(--primary)' : 'var(--primaryDeep)',
    '--on-accent': b.brand.accent ? onColor(b.brand.accent) : onColor(b.brand.primary),
  };

  return (
    <div className="min-w-0 overflow-x-clip bg-white font-body text-[16px] text-ink antialiased" style={style}>
      <EmergencyStrip b={b} tel={tel} />
      <Header b={b} groups={groups} tel={tel} current={current} />
      <main>
        {page === 'home' && <Home b={b} groups={groups} tel={tel} />}
        {page === 'group' && <GroupPage b={b} groups={groups} group={group} tel={tel} />}
        {page === 'plan' && <PlanPage b={b} tel={tel} />}
        {page === 'about' && <AboutPage b={b} tel={tel} />}
        {page === 'contact' && <ContactPage b={b} groups={groups} tel={tel} />}
      </main>
      {!path && <Facts b={b} />}
      <Footer b={b} groups={groups} tel={tel} />
      <MobileBar b={b} tel={tel} />
    </div>
  );
}
