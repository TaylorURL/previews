/**
 * Trade services: one template for every business whose work is a set of
 * services grouped by kind - heating and air contractors and electricians,
 * where it began, and pool, lawn and landscape, painting, concrete, fencing,
 * tree, pest control, towing, welding, machine shop, industrial, marine and
 * storage businesses. A site of several pages: home, one page per service
 * group, a maintenance-plan page when the business sells a plan, about, and
 * contact. The header carries a mega menu with a column per service group.
 *
 * Brand file shape (src/brands/<slug>.json). Required fields are marked (req);
 * every other field is optional and its section is left out when it is absent.
 *
 *   template     (req) "hvac"
 *   preview            true on a prospect's preview; leave it out on a sample
 *   ask                What the site asks a visitor to do, which sets every
 *                      button, the booking card and the contact form:
 *                      "service" (the default: Schedule Service, a visit
 *                      booked by ZIP code), "quote" (Request a Quote, for
 *                      work priced before it starts) or "reserve" (Reserve a
 *                      Unit, for storage)
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
  ChartLine,
  Check,
  ChevronDown,
  ChevronRight,
  CircuitBoard,
  ClipboardList,
  Clock3,
  CreditCard,
  DraftingCompass,
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
  PencilRuler,
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
import { brandVars, displayVars, mapsHref, ratingLine, telHref } from '../site.js';
import { BrandLogo, EnquiryForm, Img, Stars, Facts, StudioCredit } from './shared.jsx';
import { fillOf, labelOf, onColor } from './hvac/color.js';

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
  // Engineering and project work: design, drawings, models and the plan.
  compass: DraftingCompass,
  ruler: PencilRuler,
  chart: ChartLine,
  clipboard: ClipboardList,
};

const list = (v) => (Array.isArray(v) ? v : []);
const groupsOf = (b) => list(b.groups).filter((g) => g?.slug && g?.title);

/**
 * What the site asks a visitor to do, by how the business takes on work. One
 * that comes out to the customer books a visit; one whose work is priced
 * before it starts takes a request for a quote; one that rents out space takes
 * a reservation. `ask` on the brand picks one, and a brand without it books
 * service.
 */
const ASKS = {
  service: {
    act: 'Schedule Service',
    book: 'Book Service',
    item: 'Book',
    withName: 'Book with',
    card: 'Book a Visit',
    cardText: 'Choose a service and we will call to confirm a time.',
    check: 'Check Availability',
    field: 'Service Type',
    eyebrow: 'Schedule service',
    form: 'Request Service',
    time: 'Best Time to Visit',
    times: ['First available', 'Morning', 'Afternoon'],
    details: 'What Is Going On?',
    closing: 'Book service with',
    closingText: 'Send a request or call, and we will set up a time that works for you.',
    contactTitle: 'Tell us what is going on',
    contactText: 'Send a request and we will call to confirm a time, or pick up the phone and talk to us now.',
    zip: true,
  },
  quote: {
    act: 'Request a Quote',
    book: 'Get a Quote',
    item: 'Get a Quote for',
    withName: 'Get a Quote from',
    card: 'Request a Quote',
    cardText: 'Choose the work you need and we will call to talk it through.',
    check: 'Request a Quote',
    field: 'Type of Work',
    eyebrow: 'Request a quote',
    form: 'Request a Quote',
    time: 'Best Time to Call',
    times: ['Any time', 'Morning', 'Afternoon'],
    details: 'Tell Us About the Job',
    closing: 'Get a quote from',
    closingText: 'Send the details or call, and we will get back to you about the job.',
    contactTitle: 'Tell us about the job',
    contactText: 'Send the details and we will call to talk it through, or pick up the phone and talk to us now.',
    zip: true,
  },
  reserve: {
    act: 'Reserve a Unit',
    book: 'Reserve a Unit',
    item: 'Ask About',
    withName: 'Reserve with',
    card: 'Reserve a Unit',
    cardText: 'Choose what you need and we will call to confirm what is open.',
    // A unit is rented, not a job done: a service page asks what is to be
    // stored, and its closing band names the storage without 'service'.
    itemText: 'Tell us what you need to store and when.',
    rents: true,
    check: 'Check Availability',
    field: 'Unit Type',
    eyebrow: 'Reserve a unit',
    form: 'Reserve a Unit',
    time: 'When Do You Need It?',
    times: ['As soon as possible', 'Within a month', 'Just looking'],
    details: 'Anything We Should Know?',
    closing: 'Reserve a unit with',
    closingText: 'Send a request or call, and we will help you find a unit that fits.',
    contactTitle: 'Tell us what you need',
    contactText: 'Send a request and we will call to confirm what is open, or pick up the phone and talk to us now.',
    zip: false,
  },
};
const askOf = (b) => ASKS[b?.ask] || ASKS.service;

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
  'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg px-6 font-heading text-[16px] font-bold no-underline transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const btnPrimary = `${btn} bg-primary text-[color:var(--on-primary)] hover:bg-primary-deep hover:text-white`;
const btnOutline = `${btn} border border-line bg-white text-ink hover:border-primary hover:text-[color:var(--pt)]`;
const btnAccent = `${btn} bg-[color:var(--accent-fill)] text-[color:var(--on-accent)] hover:brightness-105`;
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
      <span className={`h-1.5 w-1.5 flex-none rounded-full ${light ? 'bg-[color:var(--accent-lit)]' : 'bg-primary'}`} aria-hidden="true" />
      <span className="min-w-0">{children}</span>
    </p>
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
    <div className="bg-[color:var(--accent-fill)] text-[color:var(--on-accent)]">
      <div className={`${wrap} flex min-h-[44px] items-center justify-between gap-4 py-1.5 text-[14px]`}>
        <p className="flex min-w-0 items-center gap-2.5 font-semibold">
          <Siren size={17} className="flex-none" aria-hidden="true" />
          {/* Wraps rather than truncates, so a long message is read whole instead of stopping mid-word. */}
          <span className="min-w-0 leading-[1.4]">
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
        className={`flex h-[84px] cursor-pointer items-center gap-1.5 px-1 text-[16px] md:text-[15px] font-semibold text-head-ink transition hover:text-head-hover ${
          open || groups.some((g) => g.slug === current) ? 'underline decoration-accent decoration-2 underline-offset-[10px]' : ''
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
                {b.emergency ? b.emergency.title : `${askOf(b).withName} ${b.shortName}`}
              </p>
              <p className="mt-2 text-[16px] md:text-[15px] leading-[1.55] text-muted">{b.emergency ? b.emergency.text : b.summary}</p>
            </div>
            <div className="grid gap-2.5">
              <a href="/contact" className={`${btnPrimary} min-h-[48px] text-[16px] md:text-[15px]`}>
                {askOf(b).act}
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
          {askOf(b).act}
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
    <header className={`sticky ${stick} z-40 border-b border-head-line bg-head`}>
      <div className={`${wrap} flex h-[76px] items-center gap-5 lg:h-[92px]`}>
        <a href="/" className={`flex min-h-[44px] min-w-0 items-center ${b.brand.logo ? 'flex-initial lg:flex-none' : 'flex-1 lg:flex-none'}`} aria-label={`${b.name} home`}>
          <BrandLogo b={b} textClass="font-extrabold tracking-[-0.02em] text-head-ink" />
        </a>

        <nav aria-label="Main" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-9">
            {groups.length > 0 && <MegaMenu b={b} groups={groups} tel={tel} current={current} />}
            {links.map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  aria-current={href.slice(1) === current ? 'page' : undefined}
                  className={`flex h-[84px] items-center whitespace-nowrap px-2 text-[15px] font-semibold text-head-ink no-underline transition hover:text-head-hover ${
                    href.slice(1) === current ? 'underline decoration-accent decoration-2 underline-offset-[10px]' : ''
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex flex-none items-center gap-2 sm:gap-3 lg:ml-0">
          <a href={tel} className="hidden min-h-[44px] items-center gap-3 pr-2 text-head-ink no-underline xl:flex">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-surface text-[color:var(--pt)]">
              <Phone size={17} aria-hidden="true" />
            </span>
            <span className="grid leading-tight">
              <span className="text-[12px] font-medium text-head-soft">{b.emergency ? 'Call 24/7' : 'Call Us'}</span>
              <strong className="whitespace-nowrap font-heading text-[17px] font-bold">{b.phone}</strong>
            </span>
          </a>
          <a href="/contact" className={`${btnPrimary} hidden min-h-[46px] px-5 text-[16px] md:text-[15px] md:inline-flex`}>
            <CalendarCheck size={17} aria-hidden="true" /> {askOf(b).book}
          </a>
          <a href={tel} className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-[color:var(--on-primary)] md:hidden" aria-label={`Call ${b.phone}`}>
            <Phone size={19} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-head-line px-3.5 font-semibold text-head-ink lg:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
            {/* On a phone the button is its icon alone, leaving the room to the business name. */}
            <span className="sr-only sm:not-sr-only">{open ? 'Close' : 'Menu'}</span>
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

function BookingCard({ b, groups, heading = 'h2', title, service }) {
  const H = heading;
  const w = askOf(b);
  const options = [...groups.flatMap((g) => list(g.services).map((s) => s.title)), 'Something else'];
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_30px_60px_-30px_rgba(11,27,43,0.45)] sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <H className="font-heading text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-ink">{unbroken(title || w.card)}</H>
          <p className="mt-1.5 text-[16px] md:text-[15px] leading-[1.5] text-muted">
            {service ? w.itemText || `Tell us about your ${lowerName(service, townsOf(b), groups.find((g) => g.title === service)?.intro, namesOf(b))} job.` : w.cardText}
          </p>
        </div>
        <span className={`${iconTile} h-11 w-11`}>
          <CalendarCheck size={20} aria-hidden="true" />
        </span>
      </div>
      <EnquiryForm
        b={b}
        submitLabel={w.check}
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
          { name: 'service', label: w.field, type: 'select', required: true, wide: true, options },
          w.zip && { name: 'zip', label: 'ZIP Code', required: true, autoComplete: 'postal-code' },
          { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel', wide: !w.zip },
        ].filter(Boolean)}
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
        .map((l) => [l.label, l.number].filter(Boolean).join(' '))
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

/** A heading with each hyphenated word held whole, so 'Tune-Up' never breaks at its hyphen and leaves 'Up' alone on the next line. */
function unbroken(title) {
  return String(title || '')
    .split(/(\S+-\S+)/)
    .map((part, i) => (i % 2 ? <span key={i} className="whitespace-nowrap">{part}</span> : part));
}

function ClosingBand({ b, tel, title, text, flush = false }) {
  const area = list(b.serviceArea);
  return (
    <section className={`bg-white pb-[clamp(4rem,8vw,6.5rem)] ${flush ? '' : 'pt-[clamp(2.5rem,5vw,4rem)]'}`}>
      <div className={wrap}>
        <div className="relative isolate overflow-hidden rounded-xl bg-primary-deep px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
          <div className={`absolute inset-0 -z-10 opacity-60 ${gridBg} [mask-image:linear-gradient(90deg,transparent,black)]`} aria-hidden="true" />
          <div
            className="absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full bg-primary opacity-60 blur-3xl"
            aria-hidden="true"
          />
          {/* The buttons sit level with the heading, not at the foot of the
              band: against a long service-area list they would otherwise drop
              to the bottom and leave the top right an empty colored block. */}
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start">
            <div>
              <Eyebrow light>{b.emergency ? b.emergency.title : askOf(b).eyebrow}</Eyebrow>
              <h2 className="font-heading text-[clamp(1.9rem,1.35rem+2.1vw,2.85rem)] font-extrabold leading-[1.08] tracking-[-0.025em] [text-wrap:balance]">
                {unbroken(title)}
              </h2>
              <p className="mt-4 max-w-xl text-[17px] leading-[1.65] text-white/80 sm:text-[18px]">{text}</p>
              {area.length > 0 && (
                <ul aria-label="Service area" className="mt-7 flex flex-wrap gap-2">
                  {area.map((t) => (
                    <li key={t} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[14px] font-medium text-white/90">
                      <MapPin size={13} className="flex-none text-[color:var(--accent-lit)]" aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <a href="/contact" className={btnAccent}>
                {askOf(b).act} <ArrowRight size={18} aria-hidden="true" />
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

/** A page's opening. `panel` stands where the photo would when there is none, so the half beside the words is not left bare. */
function PageHero({ b, crumbs, eyebrow, title, text, image, imageAlt, imageHold = 'object-top', icon, panel, children }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-surface">
      <div className={`absolute inset-0 -z-10 ${gridBg} [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]`} aria-hidden="true" />
      <div
        className={`${wrap} grid gap-10 py-12 sm:py-14 lg:py-20 ${image || panel ? 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16' : ''}`}
      >
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-start gap-1.5 text-[14px] text-muted">
              <li className="flex-none">
                <a href="/" className="inline-flex min-h-[32px] items-center text-muted no-underline hover:text-[color:var(--pt)]">
                  Home
                </a>
              </li>
              {crumbs.map((c) => (
                <li key={c} className="flex min-w-0 items-start gap-1.5">
                  <ChevronRight size={14} className="mt-[9px] flex-none" aria-hidden="true" />
                  <span aria-current="page" className="flex min-h-[32px] items-center font-medium text-ink">
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
            {unbroken(title)}
          </h1>
          {text && <p className={`mt-5 max-w-[38rem] ${lead}`}>{text}</p>}
          {children}
        </div>
        {image ? (
          // Drawn in its own proportions, so no fixed frame cuts its subject off at either edge. Only a photo too
          // tall for the cap is cut, held by its top edge unless the page says otherwise.
          <Img
            className={`block h-auto max-h-[min(80svh,640px)] w-full rounded-[24px] object-cover ${imageHold} shadow-[0_30px_60px_-35px_rgba(11,27,43,0.55)]`}
            src={image}
            alt={imageAlt}
            sizes="(min-width: 1024px) 45vw, 100vw"
            eager
          />
        ) : (
          panel
        )}
      </div>
    </section>
  );
}

function CtaPair({ b, tel, className = '' }) {
  return (
    <div className={`mt-8 grid gap-3 sm:flex sm:flex-wrap ${className}`}>
      <a href="/contact" className={btnPrimary}>
        {askOf(b).act} <ArrowRight size={18} aria-hidden="true" />
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
            <BrandLogo b={b} ground="#f4f7fb" textClass="font-extrabold text-ink" />
          </a>
          {licenses.length > 0 && (
            <ul className="grid gap-1 text-[14px]">
              {licenses.map((l) => (
                <li key={l.label} className="flex items-center gap-2">
                  <ShieldCheck size={15} className="flex-none text-[color:var(--pt)]" aria-hidden="true" />
                  <span className="min-w-0 break-words">
                    {[l.label, l.number].filter(Boolean).join(' ')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className={head}>Services</h2>
          <ul className="grid">
            {groups.map((g) => (
              <li key={g.slug}>
                <a href={`/${g.slug}`} className="flex min-h-[44px] items-center py-2.5 leading-snug text-muted no-underline hover:text-[color:var(--pt)]">
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
          <StudioCredit b={b} />
        </p>
      </div>
    </footer>
  );
}

/**
 * The phone's call and book bar. The first screen already carries both
 * buttons, so the bar waits until the visitor scrolls past it rather than
 * floating over the opening words.
 */
function MobileBar({ b, tel }) {
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
      <div className="grid grid-cols-[auto_1fr] gap-2 rounded-2xl bg-ink p-2 shadow-[0_18px_40px_-12px_rgba(11,27,43,0.6)]">
        <a href={tel} className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 text-[16px] font-semibold text-white no-underline">
          <Phone size={18} className="flex-none" aria-hidden="true" /> Call
        </a>
        <a
          href="/contact"
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary px-3 font-heading text-[16px] font-bold text-[color:var(--on-primary)] no-underline"
        >
          <CalendarCheck size={18} className="flex-none" aria-hidden="true" /> {askOf(b).book}
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- pages */

/**
 * The width of each of `n` home service cards: across three or four from lg
 * up, whichever leaves the last row fullest, as columns() in Professional.jsx.
 * The cards grow, so a short last row is filled by its own cards, not a blank.
 */
function cardBasis(n) {
  const half = 'md:basis-[calc(50%-0.625rem)]';
  if (n <= 2) return n === 2 ? half : '';
  if (n === 3) return 'md:basis-[calc((100%-2.5rem)/3)]';
  const gap = (c) => (c - (n % c)) % c;
  return gap(3) < gap(4) ? `${half} lg:basis-[calc((100%-2.5rem)/3)]` : `${half} xl:basis-[calc((100%-3.75rem)/4)]`;
}

function Home({ b, groups, tel }) {
  const rating = ratingLine(b);
  const basis = cardBasis(groups.length);
  const firstTier = list(b.plan?.tiers)[0];
  const aboutFacts = !b.about?.image && (b.since || rating);
  return (
    <>
      <section className="relative isolate flex flex-col overflow-hidden bg-primary-deep text-white">
        {/* The brand's own color, with the grid it draws elsewhere, behind the words and the booking card. */}
        <div
          className={`absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_90%_0%,color-mix(in_srgb,var(--primary)_70%,transparent),transparent_60%)] ${b.hero.image ? 'hidden lg:block' : ''}`}
          aria-hidden="true"
        />
        {b.hero.image && (
          // On a phone the photo is shown whole above the words; from lg up it is framed whole below them. Laid
          // behind the words and the card, its subject (mostly in the middle) was shaded out or hidden by the card.
          // Cropped about the middle, not the top: a top-anchored band kept the sky and cut the work off at the waist.
          // On a phone it keeps its own proportions, as a 16:10 band cut the crew at the foot of the photo off at the head.
          <div className="lg:order-last lg:mx-auto lg:w-full lg:max-w-page lg:px-gutter lg:pb-24">
            <Img
              className="block h-auto max-h-[80svh] w-full object-cover lg:aspect-[16/9] lg:max-h-none lg:rounded-[24px] lg:shadow-[0_30px_60px_-35px_rgba(0,0,0,0.6)]"
              src={b.hero.image}
              alt={b.hero.imageAlt || ''}
              sizes="(min-width: 1024px) 1320px, 100vw"
              eager
            />
          </div>
        )}
        <div
          className={`${wrap} grid gap-10 py-10 sm:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-16 lg:py-24 xl:gap-24 ${b.hero.image ? 'lg:pb-16' : ''}`}
        >
          <div className="min-w-0">
            <Eyebrow light>{b.hero.eyebrow}</Eyebrow>
            <h1 className="font-heading font-display text-[clamp(2.4rem,1.2rem+4vw,4.3rem)] leading-[1.03] text-white [text-wrap:balance] break-words">
              {/* The second half is solid white too: a see-through white turns grey over a busy photo and reads weaker than the first. */}
              {b.hero.title} {b.hero.titleAccent && <span className="text-white">{b.hero.titleAccent}</span>}
            </h1>
            <p className="mt-6 max-w-[34rem] text-[17px] leading-[1.65] text-white/85 sm:text-[18px]">{b.hero.lead}</p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <a href="/contact" className={`${btn} bg-white text-[color:var(--pt)] hover:bg-surface`}>
                {askOf(b).act} <ArrowRight size={18} aria-hidden="true" />
              </a>
              {/* Filled with the brand's deep color so lettering in the photo behind (a sign, a truck's door) never shows through the number. */}
              <a href={tel} className={`${btn} border border-white/40 bg-[color-mix(in_srgb,var(--primaryDeep)_88%,#000)] text-white hover:bg-primary-deep`}>
                <Phone size={17} aria-hidden="true" /> {b.phone}
              </a>
            </div>
            {rating && (
              <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[16px] font-medium text-white/85 md:text-[15px]">
                <Stars value={b.rating} size={16} /> <span>{rating}</span>
              </p>
            )}
          </div>
          <div className="min-w-0 text-ink lg:justify-self-end lg:w-full lg:max-w-[420px]">
            <BookingCard b={b} groups={groups} />
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
          <div className="flex flex-wrap gap-5">
            {groups.map((g) => (
              <article
                key={g.slug}
                className={`group relative flex min-w-0 grow basis-full flex-col rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_24px_50px_-30px_rgba(11,27,43,0.4)] sm:p-7 ${basis}`}
              >
                <span className={`${iconTile} h-14 w-14 transition group-hover:bg-primary group-hover:text-[color:var(--on-primary)]`}>
                  <GroupIcon name={g.icon} size={26} />
                </span>
                <h3 className="mt-6 font-heading text-[21px] font-extrabold tracking-[-0.02em] text-ink">
                  <a href={`/${g.slug}`} className="text-current no-underline after:absolute after:inset-0 after:rounded-2xl after:content-['']">
                    {g.title}
                  </a>
                </h3>
                <p className="mb-6 mt-2 text-[16px] leading-[1.6] text-muted">{g.summary}</p>
                {list(g.services).length > 0 && (
                  <ul className="mb-6 grid gap-2 border-t border-line pt-5">
                    {list(g.services).map((s) => (
                      <li key={s.slug} className="flex items-center gap-2.5 text-[16px] md:text-[15px] font-medium text-ink">
                        <GroupIcon name={s.icon || g.icon} size={15} className="flex-none text-[color:var(--pt)]" />
                        <span className="min-w-0">{s.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {/* Inline, so a title that wraps keeps the arrow at the end of its last line,
                    held to the last word. */}
                <span className="mt-auto font-heading text-[16px] md:text-[15px] font-bold text-[color:var(--pt)]">
                  See {g.title.trim().replace(/\S+$/, '')}
                  <span className="whitespace-nowrap">
                    {g.title.trim().split(/\s+/).pop()}
                    <ArrowRight size={16} className="ml-1.5 inline-block align-[-3px] transition group-hover:translate-x-1" aria-hidden="true" />
                  </span>
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
            {/* Without a photo the banner is one column, and from lg up its
                button stands to the right of the words rather than leaving
                the right half bare. */}
            <div className={`grid overflow-hidden rounded-[28px] bg-primary text-[color:var(--on-primary)] ${b.promo.image ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]' : ''}`}>
              <div className={`relative isolate px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16 ${b.promo.image ? '' : 'lg:flex lg:items-center lg:gap-12'}`}>
                <div className={`absolute inset-0 -z-10 opacity-40 ${gridBg} [mask-image:linear-gradient(120deg,black,transparent_70%)]`} aria-hidden="true" />
                <div className="min-w-0 lg:flex-1">
                  <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--accent-fill)] px-3.5 py-1.5 font-heading text-[13px] font-bold uppercase tracking-[0.12em] text-[color:var(--on-accent)]">
                    <Sun size={15} aria-hidden="true" /> {b.promo.eyebrow}
                  </p>
                  <h2 className="font-heading text-[clamp(1.9rem,1.35rem+2.1vw,2.85rem)] font-extrabold leading-[1.08] tracking-[-0.025em] [text-wrap:balance]">
                    {b.promo.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-[17px] leading-[1.65] opacity-85 sm:text-[18px]">{b.promo.text}</p>
                </div>
                <div className={`mt-8 flex flex-col gap-6 sm:flex-row sm:items-center ${b.promo.image ? '' : 'lg:mt-0 lg:flex-none'}`}>
                  {b.promo.price && (
                    <p className="flex items-baseline gap-2">
                      <strong className="font-heading text-[52px] font-extrabold leading-none tracking-[-0.04em]">{b.promo.price}</strong>
                      {b.promo.priceNote && <span className="text-[16px] md:text-[15px] opacity-80">{b.promo.priceNote}</span>}
                    </p>
                  )}
                  {/* The button asks for what the business does, the same as
                      the hero's, not for a tune-up every trade lacks. */}
                  <a href="/contact" className={`${btn} bg-white text-[color:var(--pt)] hover:bg-surface ${b.promo.price ? 'sm:ml-auto lg:ml-4' : ''}`}>
                    {askOf(b).act} <ArrowRight size={18} aria-hidden="true" />
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
          {/* The photo stands level with the heading, so words that run longer than it never leave a bare block above it.
              It is drawn in its own proportions and only one too tall for the cap is cut, held by its top edge so a portrait
              keeps the person's head. The year stands under it, never over what the photo shows. */}
          <div className={`${wrap} grid items-start gap-10 ${b.about.image ? 'md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]' : ''} lg:gap-20`}>
            {b.about.image && (
            <div>
              <Img
                className="block h-auto max-h-[min(80svh,600px)] w-full rounded-xl object-cover object-top"
                src={b.about.image}
                alt={b.about.imageAlt}
                sizes="(min-width: 768px) 42vw, 100vw"
              />
              {b.since && (
                <p className="mt-4 inline-block rounded-2xl bg-white px-5 py-3.5 shadow-[0_18px_40px_-20px_rgba(11,27,43,0.5)]">
                  <span className="block text-[13px] font-medium text-muted">Serving {b.town} since</span>
                  <strong className="font-heading text-[28px] font-extrabold leading-none tracking-[-0.03em] text-ink">{b.since}</strong>
                </p>
              )}
            </div>
            )}
            {/* With no photo the heading takes the photo's side, with the year and rating under it, and the words stand beside it, so neither half is bare. */}
            <div className={b.about.image ? '' : 'grid gap-x-20 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'}>
              <div>
                <Eyebrow>{b.about.eyebrow || 'About us'}</Eyebrow>
                <h2 className={h2}>{b.about.title}</h2>
                {/* A lone card is drawn to its own width with the stars and the review count, not stretched into a bare white strip. */}
                {aboutFacts && (
                  <div className={`mt-8 grid gap-4 ${b.since && rating ? 'grid-cols-2' : 'justify-items-start'}`}>
                    {b.since && (
                      <div className="rounded-2xl bg-white p-5">
                        <p className="text-[14px] text-muted">Serving {b.town} since</p>
                        <p className="mt-1 font-heading text-[30px] font-extrabold tracking-[-0.03em] text-ink">{b.since}</p>
                      </div>
                    )}
                    {rating && (
                      <div className="rounded-2xl bg-white p-5">
                        <p className="text-[14px] text-muted">Google rating</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 font-heading text-[30px] font-extrabold tracking-[-0.03em] text-ink">
                          {Number(b.rating).toFixed(1)} <Stars value={b.rating} size={18} />
                        </p>
                        <p className="mt-1 text-[14px] text-muted">From {b.reviewCount.toLocaleString()} customer reviews</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <p className={`mt-5 ${b.about.image ? '' : 'lg:mt-10'} ${lead}`}>{list(b.about.text)[0]}</p>
                {list(b.about.values).length > 0 && (
                  <ul className="mt-8 grid gap-3">
                    {list(b.about.values).map((v) => (
                      <li key={v.title} className="flex gap-4 rounded-2xl bg-white p-5">
                        <Check size={18} className="mt-0.5 flex-none text-[color:var(--pt)]" strokeWidth={2.5} aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="font-heading text-[16px] font-bold text-ink">{v.title}</p>
                          <p className="mt-1 text-[16px] md:text-[15px] leading-[1.5] text-muted">{v.text}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <a href="/about" className="mt-8 inline-flex min-h-[44px] items-center gap-1.5 font-heading text-[16px] font-bold text-[color:var(--pt)] no-underline hover:underline">
                  About {b.shortName} <ArrowRight size={17} aria-hidden="true" />
                </a>
              </div>
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
        title={`${askOf(b).closing} ${b.shortName}`}
        text={askOf(b).closingText}
      />
    </>
  );
}

/** A group page's heading: the group named as it is, in the town. Adding 'services' after it read wrong for a group named for its goods ('Wood Fences services'). */
function groupTitle(group, town) {
  // A group that already names the town ("Outdoor Lighting For Houston Homes")
  // is not given it twice.
  const named = town && townWords(town).test(group.title);
  return `${group.title}${named ? '' : ` in ${town}`}`;
}

/** The town as whole words in any case, to find it inside a name. */
function townWords(town) {
  return new RegExp(`\\b${town.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
}

/**
 * The words a text capitalises inside its sentences: names such as a maker's ('your Polaris pool cleaner'). The
 * business's own name is left out, so the trade words in it ('Two Brothers Foundation Repair') are not names.
 */
function namedWords(text, own = []) {
  const named = new Set();
  const plain = own.filter(Boolean).reduce((t, name) => t.split(name).join(' '), String(text || ''));
  for (const sentence of plain.split(/[.!?]\s+/)) {
    for (const word of sentence.split(/\s+/).slice(1)) {
      if (/^[A-Z]/.test(word.replace(/^\W+/, ''))) named.add(word.replace(/^\W+|\W+$/g, '').toLowerCase());
    }
  }
  return named;
}

/** A word written all in capitals, as an initialism is ('I', 'HVAC', 'A/C'), but not the article 'A'. */
const initialism = (word) => /^[^a-z]*[A-Z][^a-z]*$/.test(word) && word !== 'A';

/** A name lowered to run inside a sentence, the towns in it, its initialisms ('I & E') and any word its own text writes as a name keeping their capitals. */
function lowerName(title, towns, text, own) {
  const named = namedWords(text, own);
  const lower = title
    .split(/(\s+)/)
    .map((word) => (initialism(word) || named.has(word.replace(/^\W+|\W+$/g, '').toLowerCase()) ? word : word.toLowerCase()))
    .join('');
  return [towns].flat().filter(Boolean).reduce((name, town) => name.replace(townWords(town), town), lower);
}

/** The business's town and the towns it serves, which keep their capitals inside a sentence ('Houston weather'). */
function townsOf(b) {
  return [b.town, ...(b.serviceArea || [])];
}

/** The business's own names, which name no service inside a sentence. */
function namesOf(b) {
  return [b.name, b.shortName];
}

/**
 * What the closing band asks if they need: the goods of a sale ('Marine Equipment Sales' is 'marine equipment', and
 * one thing takes its article: 'Generator Sales' is 'a generator'), supplies as supplies ('Crew Supplies'), else the
 * work as a service, unless it is already named as things done ('Structural Foundation Assessments', 'Heat Pumps').
 */
function needOf(b, group) {
  const name = lowerName(group.title, townsOf(b), group.intro, namesOf(b));
  if (/\s(?:supply|supplies)$/i.test(name)) return name.replace(/supply$/i, 'supplies');
  const goods = name.replace(/\s+sales$/i, '');
  if (goods !== name) {
    if (/s$|\b(?:equipment|gear|machinery|hardware|software|furniture|lumber|material|stone|steel|fuel|ice|water)$/i.test(goods)) return goods;
    return `${/^[aeiou]/i.test(goods) ? 'an' : 'a'} ${goods}`;
  }
  return `${name}${askOf(b).rents || /\bservices?\b|[^aisu]s$/i.test(group.title) ? '' : ' service'}`;
}

function GroupPage({ b, groups, group, tel }) {
  const services = list(group.services);
  const others = groups.filter((g) => g.slug !== group.slug);
  const stickTop = b.preview ? 'lg:top-[148px]' : 'lg:top-[104px]';
  const anchor = b.preview ? 'scroll-mt-[140px]' : 'scroll-mt-[96px]';
  const booking = (
    <>
      <BookingCard b={b} groups={groups} title={`${askOf(b).item} ${group.title}`} service={group.title} />
      {b.emergency && (
        <a href={tel} className="flex gap-4 rounded-2xl bg-[color:var(--accent-fill)] p-5 text-[color:var(--on-accent)] no-underline">
          <Siren size={22} className="mt-0.5 flex-none" aria-hidden="true" />
          <span className="min-w-0">
            <strong className="block font-heading text-[17px]">{b.emergency.title}</strong>
            <span className="mt-1 block text-[16px] md:text-[15px] leading-[1.5] opacity-90">{b.emergency.text}</span>
            <span className="mt-2 block font-bold">{b.phone}</span>
          </span>
        </a>
      )}
    </>
  );
  return (
    <>
      <PageHero
        b={b}
        crumbs={[group.title]}
        icon={group.icon}
        title={groupTitle(group, b.town)}
        text={group.intro}
        image={group.image}
        imageAlt={group.imageAlt}
        // A photo of the work may be a person at the top or a van, a unit or a panel standing on the ground,
        // so one too tall for the cap is cut evenly from both edges.
        imageHold="object-center"
        panel={
          // A group with no list of its own, or a list of one, has nothing to set beside the form without
          // passing a service's own selling points off as services, so the form stands in the hero instead.
          services.length <= 1 ? (
            <div className="grid content-start gap-5 text-ink lg:w-full lg:max-w-[420px] lg:justify-self-end">{booking}</div>
          ) : (
            <div className="hidden rounded-[24px] border border-line bg-white p-6 shadow-[0_30px_60px_-35px_rgba(11,27,43,0.55)] sm:p-8 lg:block">
              <p className="font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-muted">What we cover</p>
              <ul className="mt-4 grid">
                {services.map((s) => (
                  <li key={s.slug} className="border-t border-line first:border-0">
                    <a
                      href={`#${s.slug}`}
                      className="flex min-h-[56px] items-center gap-3.5 py-2.5 font-heading text-[17px] font-bold text-ink no-underline hover:text-[color:var(--pt)]"
                    >
                      <span className={`${iconTile} h-10 w-10`}>
                        <GroupIcon name={s.icon || group.icon} size={19} />
                      </span>
                      <span className="min-w-0 flex-1">{s.title}</span>
                      <ChevronRight size={17} className="flex-none text-[color:var(--pt)]" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )
        }
      >
        <CtaPair b={b} tel={tel} />
      </PageHero>

      {services.length > 1 && (
        <nav aria-label={`${group.title} services`} className="border-b border-line bg-white">
          {/* Every chip wraps into view, on a phone too, rather than being cut at the edge. */}
          <ul className={`${wrap} flex flex-wrap gap-2 py-3`}>
            {services.map((s) => (
              <li key={s.slug} className="max-w-full flex-none">
                <a
                  href={`#${s.slug}`}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-[22px] border border-line px-4 py-2 text-[16px] leading-snug md:text-[15px] font-medium text-ink no-underline hover:border-primary hover:text-[color:var(--pt)]"
                >
                  <GroupIcon name={s.icon || group.icon} size={15} className="flex-none text-[color:var(--pt)]" /> {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {services.length > 0 && (
      <section className={`${pad} bg-white`}>
        {/* A list of one has its form in the hero already, so its card stands alone rather than beside the form again. */}
        <div className={`${wrap} grid gap-12 ${services.length > 1 ? 'lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16' : ''}`}>
          {/* content-start, so a short list keeps its cards their own height rather than stretching them to the form's.
              min-w-0 here and on each card, with the text free to break a long email or web address, so a card never runs
              past the page's margin: this list is a grid of its own, whose column would otherwise widen to the longest word. */}
          <div className="grid min-w-0 content-start gap-5">
            {services.map((s, i) => (
              <article key={s.slug} id={s.slug} className={`${anchor} min-w-0 rounded-2xl border border-line p-6 sm:p-8`}>
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
                    <p className="mt-3 text-[16px] leading-[1.65] text-muted [overflow-wrap:break-word] sm:text-[17px]">{s.text}</p>
                    {list(s.points).length > 0 && (
                      <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                        {list(s.points).map((p) => (
                          <li key={p} className="flex min-w-0 gap-2.5 text-[16px] md:text-[15px] leading-[1.5] text-ink [overflow-wrap:break-word]">
                            <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-primary/10 text-[color:var(--pt)]">
                              <Check size={13} strokeWidth={3} aria-hidden="true" />
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    )}
                    {/* Inline, so a title that wraps keeps the arrow at the end of its last line;
                        a line may break beside an icon, so the last word and the arrow are held together. */}
                    <a
                      href="/contact"
                      className="mt-4 inline-block min-h-[44px] py-2.5 font-heading text-[16px] md:text-[15px] font-bold text-[color:var(--pt)] no-underline hover:underline"
                    >
                      {askOf(b).item} {s.title.trim().replace(/\S+$/, '')}
                      <span className="whitespace-nowrap">
                        {s.title.trim().split(/\s+/).pop()}
                        <ArrowRight size={16} className="ml-1.5 inline align-[-3px]" aria-hidden="true" />
                      </span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {services.length > 1 && <aside className={`grid content-start gap-5 lg:sticky lg:self-start ${stickTop}`}>{booking}</aside>}
        </div>
      </section>
      )}

      {others.length > 0 && (
        <section className={`${pad} bg-surface`}>
          <div className={wrap}>
            <Eyebrow>More services</Eyebrow>
            <h2 className={`${h2} mb-10`}>Other ways we can help</h2>
            <div className={`grid gap-4 ${others.length === 1 ? '' : others.length >= 3 && others.length !== 4 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
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
                    {/* Inline, so a title that wraps keeps the arrow at the end of its last line,
                        held to the last word. */}
                    <span className="block font-heading text-[18px] font-bold text-ink group-hover:text-[color:var(--pt)]">
                      {g.title.trim().replace(/\S+$/, '')}
                      <span className="whitespace-nowrap">
                        {g.title.trim().split(/\s+/).pop()}
                        <ArrowRight size={16} className="ml-1.5 inline-block align-[-2px] transition group-hover:translate-x-1" aria-hidden="true" />
                      </span>
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
        title={`Need ${needOf(b, group)}?`}
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
      <PageHero
        b={b}
        crumbs={['Maintenance Plan']}
        eyebrow="Maintenance plan"
        title={b.plan.name}
        text={b.plan.intro}
        panel={
          // The plan has no photo of its own, so what the plan is made of
          // stands beside the heading rather than a bare half of grid.
          <div className="hidden rounded-[24px] border border-line bg-white p-6 text-ink sm:p-8 lg:block lg:w-full lg:max-w-[420px] lg:justify-self-end shadow-[0_30px_60px_-35px_rgba(11,27,43,0.55)]">
            <p className="font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-muted">What the plan covers</p>
            <ul className="mt-5 grid gap-3">
              {list((tiers.find((t) => t.featured) || tiers[0])?.features)
                .slice(0, 5)
                .map((f) => (
                  <li key={f} className="flex gap-3 text-[15px] leading-[1.55]">
                    <Check size={18} className="mt-0.5 flex-none text-primary" aria-hidden="true" /> {f}
                  </li>
                ))}
            </ul>
          </div>
        }
      />
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
                  <p className="absolute right-6 top-6 rounded-full bg-[color:var(--accent-fill)] px-3 py-1 font-heading text-[12px] font-bold uppercase tracking-[0.1em] text-[color:var(--on-accent)]">
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

function AboutPage({ b, groups, tel }) {
  const licenses = list(b.licenses);
  const values = list(b.about.values);
  const story = list(b.about.text).slice(1);
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
        panel={
          // With no photo of the business, what it does stands beside its story rather than a bare half of grid.
          groups.length > 0 && (
            <div className="hidden rounded-[24px] border border-line bg-white p-6 shadow-[0_30px_60px_-35px_rgba(11,27,43,0.55)] sm:p-8 lg:block lg:w-full lg:max-w-[420px] lg:justify-self-end">
              <p className="font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-muted">What we do</p>
              <ul className="mt-4 grid">
                {groups.map((g) => (
                  <li key={g.slug} className="border-t border-line first:border-0">
                    <a
                      href={`/${g.slug}`}
                      className="flex min-h-[56px] items-center gap-3.5 py-2.5 font-heading text-[17px] font-bold text-ink no-underline hover:text-[color:var(--pt)]"
                    >
                      <span className={`${iconTile} h-10 w-10`}>
                        <GroupIcon name={g.icon} size={19} />
                      </span>
                      <span className="min-w-0 flex-1">{g.title}</span>
                      <ChevronRight size={17} className="flex-none text-[color:var(--pt)]" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )
        }
      >
        <CtaPair b={b} tel={tel} />
      </PageHero>
      {/* A service area with nothing else to stand beside is left to the closing band's chips, not drawn as one card over a blank. */}
      {(story.length > 0 || values.length > 0 || b.since || rating || licenses.length > 0) && (
      <section className={`${pad} bg-white`}>
        <div className={`${wrap} grid gap-12 ${story.length > 0 ? 'lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]' : ''} lg:gap-20`}>
          {/* The rest of the about text is whatever the business wrote about itself, often the owner's own story, not a process. */}
          {story.length > 0 && (
            <div>
              <h2 className={h2}>Our story</h2>
              {story.map((p) => (
                <p key={p} className={`mt-5 ${lead}`}>
                  {p}
                </p>
              ))}
            </div>
          )}
          {/* The promises stand beside the words with the licenses, so the side column is not one card over a blank. */}
          {/* With no story beside them, the cards share the row rather than stacking down one side. */}
          <aside className={`grid content-start gap-4 ${story.length > 0 ? '' : 'md:grid-cols-2'}`}>
            {values.length > 0 && (
              <ol className="grid gap-4">
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
            {(b.since || rating) && (
              <div className={`grid self-start gap-4 ${b.since && rating ? 'grid-cols-2' : ''}`}>
                {b.since && (
                  <div className="rounded-2xl bg-surface p-5">
                    <p className="text-[14px] text-muted">Established</p>
                    <p className="mt-1 font-heading text-[30px] font-extrabold tracking-[-0.03em] text-ink">{b.since}</p>
                  </div>
                )}
                {rating && (
                  <div className="rounded-2xl bg-surface p-5">
                    <p className="text-[14px] text-muted">Google rating</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 font-heading text-[30px] font-extrabold tracking-[-0.03em] text-ink">
                      {Number(b.rating).toFixed(1)} <Stars value={b.rating} size={18} />
                    </p>
                    <p className="mt-1 text-[14px] text-muted">From {b.reviewCount.toLocaleString()} customer reviews</p>
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
                    <div key={l.label} className="flex flex-wrap justify-between gap-x-4 border-t border-line pt-3 text-[16px] md:text-[15px]">
                      <dt className={l.number ? 'text-muted' : 'font-semibold text-ink'}>{l.label}</dt>
                      {l.number && <dd className="m-0 font-semibold text-ink">{l.number}</dd>}
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
      )}
      <Reviews b={b} surface />
      <ClosingBand b={b} tel={tel} title={`${askOf(b).closing} ${b.shortName}`} text={askOf(b).closingText} />
    </>
  );
}

function ContactPage({ b, groups, tel }) {
  const hours = list(b.hours);
  const full = `${b.address}, ${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;
  const options = [...groups.flatMap((g) => list(g.services).map((s) => s.title)), 'Something else'];
  const w = askOf(b);
  return (
    <>
      <PageHero
        b={b}
        crumbs={['Contact']}
        eyebrow={w.eyebrow}
        title={w.contactTitle}
        text={w.contactText}
        panel={
          // The hero asks the visitor to pick up the phone, so the number stands beside it rather than a bare half of grid.
          <a
            href={tel}
            className="hidden rounded-[24px] border border-line bg-white p-6 text-ink no-underline shadow-[0_30px_60px_-35px_rgba(11,27,43,0.55)] sm:p-8 lg:block lg:w-full lg:max-w-[420px] lg:justify-self-end"
          >
            <span className="flex items-center gap-4">
              <span className={`${iconTile} h-14 w-14`}>
                <Phone size={24} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-heading text-[13px] font-bold uppercase tracking-[0.14em] text-muted">Call us now</span>
                <span className="mt-1 block font-heading text-[28px] font-extrabold tracking-[-0.02em]">{b.phone}</span>
              </span>
            </span>
            <span className="mt-5 block border-t border-line pt-5 text-[15px] leading-[1.6] text-muted">
              {b.address ? full : `${b.town}, ${b.state}`}
            </span>
          </a>
        }
      />
      <section className={`${pad} bg-white`}>
        <div className={`${wrap} grid items-start gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-14`}>
          <div className="rounded-[24px] border border-line p-5 sm:p-8 lg:p-10">
            <h2 className="mb-6 font-heading text-[24px] font-extrabold tracking-[-0.02em] text-ink">{w.form}</h2>
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
                { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', wide: !w.zip },
                w.zip &&{ name: 'zip', label: 'ZIP Code', required: true, autoComplete: 'postal-code' },
                { name: 'service', label: w.field, type: 'select', required: true, wide: true, options },
                { name: 'time', label: w.time, type: 'select', wide: true, options: w.times },
                { name: 'details', label: w.details, type: 'textarea', wide: true },
              ].filter(Boolean)}
            />
          </div>
          <aside className="grid gap-4">
            {b.emergency && (
              <a href={tel} className="flex gap-4 rounded-2xl bg-[color:var(--accent-fill)] p-6 text-[color:var(--on-accent)] no-underline">
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
                // A long address may break after the @ and before each dot of its domain but the last, never mid-word,
                // so '.com' never drops onto a line of its own.
                b.email && [Mail, `mailto:${b.email}`, b.email.split(/(?=\.[^.]*\.)|(?<=@)/).flatMap((p, i) => (i ? [<wbr key={i} />, p] : [p]))],
                [MapPin, mapsHref(b), full],
              ]
                .filter(Boolean)
                .map(([Icon, href, label]) => (
                  <li key={href}>
                    <a href={href} className="flex min-h-[56px] items-center gap-3 rounded-xl px-2 font-medium text-ink no-underline hover:bg-surface">
                      <span className={`${iconTile} h-10 w-10`}>
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 [overflow-wrap:break-word]">{label}</span>
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
    ...displayVars(b.brand),
    ...brandVars(b.brand),
    '--on-primary': onColor(b.brand.primary),
    '--pt': onColor(b.brand.primary) === '#fff' ? 'var(--primary)' : 'var(--primaryDeep)',
    '--on-accent': labelOf(b.brand.accent || b.brand.primary),
    '--accent-fill': fillOf(b.brand.accent || b.brand.primary),
    // The accent lifted toward white for marks on the deep band, where a dark
    // accent (or the primary it falls back to) would vanish.
    '--accent-lit': 'color-mix(in srgb, var(--accent) 40%, #fff)',
  };

  // Heading type is tracked tight, which also narrows the word space; a face
  // with a slim space (Archivo) would run 'Book a Visit' into 'Booka Visit'.
  return (
    <div className="min-w-0 overflow-x-clip bg-white font-body text-[16px] text-ink antialiased [&_.font-heading]:[word-spacing:0.08em]" style={style}>
      <EmergencyStrip b={b} tel={tel} />
      <Header b={b} groups={groups} tel={tel} current={current} />
      <main>
        {page === 'home' && <Home b={b} groups={groups} tel={tel} />}
        {page === 'group' && <GroupPage b={b} groups={groups} group={group} tel={tel} />}
        {page === 'plan' && <PlanPage b={b} tel={tel} />}
        {page === 'about' && <AboutPage b={b} groups={groups} tel={tel} />}
        {page === 'contact' && <ContactPage b={b} groups={groups} tel={tel} />}
      </main>
      {!path && <Facts b={b} />}
      <Footer b={b} groups={groups} tel={tel} />
      <MobileBar b={b} tel={tel} />
    </div>
  );
}
