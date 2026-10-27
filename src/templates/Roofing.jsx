/**
 * Roofing: a multi-page site for a roofing contractor.
 *
 * Pages: '' (home), 'services', 'services/<slug>' for every service with a
 * slug, 'service-areas', 'about' and 'contact'. Internal links are plain
 * root-relative hrefs, since each page is its own prerendered document.
 *
 * The brand file this template reads (src/brands/sample-roofing.json is the
 * reference; every real file is written against it):
 *
 *   template      required  "roofing"
 *   preview       optional  true on a prospect's preview; omitted on the sample
 *   name          required  full business name, used in the footer and alt text
 *   shortName     required  the name people say, used in running copy
 *   phone         required  "(281) 555-0164", shown and dialled everywhere
 *   email         optional  shown on the contact page and in the footer
 *   address       required  street line of the office or yard
 *   town, state   required  "Baytown", "TX"
 *   zip           optional
 *   rating        optional  Google rating, 4.9; shown only with reviewCount
 *   reviewCount   optional  number of Google reviews
 *   since         optional  year the business started, 2009
 *   license       optional  one line of licence and insurance, shown in the
 *                           utility bar, the about page and the footer
 *   hours         optional  [["Mon – Fri", "7 AM – 6 PM"], ...]
 *
 *   brand         required
 *     primary     required  the main brand color: buttons, links, marks
 *     primaryDeep required  a dark shade of the brand color
 *     accent      required  a bright secondary color, used on the dark charcoal
 *                           sections (numbers, rules, the utility bar button)
 *     ink         required  near-black text color; also the charcoal ground of
 *                           the utility bar, the claim strip and the footer
 *     surface     required  a pale neutral for alternate sections
 *     heading     required  CSS font stack for headings, set in uppercase;
 *                           a condensed face reads best (Oswald, Barlow Condensed)
 *     body        required  CSS font stack for text
 *     fonts       required  Google Fonts stylesheet URL loading both faces
 *     logo        optional  "/brands/<slug>/logo.webp"; without it the
 *                           shortName is set in the heading face
 *     logoWidth   optional  logo width in px in the header, default 200
 *
 *   hero          required
 *     eyebrow     required  short line above the headline
 *     title       required  headline
 *     titleAccent optional  second line of the headline, in the accent color
 *     lead        required  one or two sentences under the headline
 *     image       required  "/brands/<slug>/<name>" (with -800 and -1600 webp
 *                           files beside it) or an Unsplash URL
 *     imageAlt    required
 *
 *   promises      optional  up to four short guarantees, shown in the hero and
 *                           on service pages: ["Free roof inspections", ...]
 *
 *   services      required  one page each. Fields per service:
 *     slug        required  URL segment: "roof-repair" -> /services/roof-repair
 *     group       optional  "residential", "storm" or "commercial"; picks the
 *                           mega menu column (Residential, Storm and Insurance,
 *                           Commercial). A service without one is listed under
 *                           General, as an inspection or a gutter is not only
 *                           for homes. Empty columns are not shown.
 *     title       required  Title Case name, "Roof Repair"
 *     short       required  one-line description for the mega menu
 *     text        required  one or two sentences for cards and the page lead
 *     image       optional  photo for the card and the page hero (else hero.image)
 *     imageAlt    optional  required when image is set
 *     body        optional  paragraphs for the service page: ["...", "..."]
 *     points      optional  what the service includes, a checklist
 *     faqs        optional  [{ "q": "...", "a": "..." }]
 *     claim       optional  true on the storm / hail page: it carries the
 *                           insurance-claim walkthrough from `claim`, and the
 *                           home page's claim strip links to it
 *     materials   optional  true on the replacement page: it carries the
 *                           shingle manufacturers from `materials`
 *
 *   claim         optional  the insurance-claim walkthrough, a numbered strip
 *                           on the home page and services page and a timeline
 *                           on the claim service page
 *     title       required  "How a storm claim works"
 *     text        optional  one sentence under it
 *     steps       required  3 to 6 of { "title", "text" }
 *
 *   materials     optional  the manufacturers the roofer installs, set as text
 *                           badges on the home, replacement and about pages
 *     title       required  "Shingles we install"
 *     text        optional  one sentence
 *     brands      required  ["GAF", "Owens Corning", ...] - only names the
 *                           roofer actually lists
 *
 *   projects      optional  before/after project cards on the home page, and
 *                           on a service page when `service` names it
 *     title, town, scope    required  "Hail claim on a two-story home",
 *                                     "Baytown", "Insurance claim"
 *     text        required  one sentence on what was done
 *     image       required  the finished roof ("after")
 *     imageAlt    required
 *     before      optional  the roof before; adds a Before / After toggle
 *     beforeAlt   optional  required when before is set
 *     service     optional  slug of the service page it also appears on
 *
 *   about         required  the about page, and a band on the home page
 *     title       required
 *     text        required  paragraphs: ["...", "..."]
 *     image       optional  photo for the home band and the about page hero
 *                           (else hero.image on the about page)
 *     imageAlt    optional  required when image is set
 *     values      optional  three of { "title", "text" }
 *
 *   inspection    optional  what happens at a free inspection, on the contact
 *     title       required  page: { "title", "steps": [{ "title", "text" }] }
 *     steps       required
 *
 *   serviceArea   required  towns served, the home town first; each gets an
 *                           anchor on /service-areas and a link in the menu
 *   areasText     optional  one sentence on where the crews work
 *   areasImage    optional  hero photo for /service-areas (else hero.image)
 *   areasImageAlt optional
 *   contactImage  optional  hero photo for /contact (else hero.image)
 *   contactImageAlt optional
 *
 *   reviews       optional  [{ "author", "text" }] - real Google reviews,
 *                           three reads best
 */
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Menu,
  Phone,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';
import { brandVars, displayVars, mapsHref, ratingLine, telHref } from '../site.js';
import { BrandLogo, EnquiryForm, Img, Stars, Facts, StudioCredit } from './shared.jsx';
import { onColor, townId } from './roofing/color.js';

const GROUPS = [
  ['residential', 'Residential'],
  ['general', 'General'],
  ['storm', 'Storm and Insurance'],
  ['commercial', 'Commercial'],
];

const wrap = 'mx-auto w-full max-w-page px-gutter';
const pad = 'py-[clamp(4rem,9vw,7rem)]';
const anchor = 'scroll-mt-[140px]';
// The angled edges. Written out whole, so Tailwind finds the classes.
const heroClip = '[clip-path:polygon(0_0,100%_0,100%_calc(100%_-_clamp(28px,5vw,88px)),0_100%)]';
const topClip = '[clip-path:polygon(0_clamp(28px,5vw,88px),100%_0,100%_100%,0_100%)]';
const h1 =
  'font-heading font-bold uppercase leading-[0.98] tracking-[0.005em] [text-wrap:balance] break-words text-[clamp(2.5rem,1.3rem+4.6vw,5.25rem)]';
const h2 =
  'font-heading font-bold uppercase leading-[1.02] tracking-[0.01em] [text-wrap:balance] break-words text-[clamp(2rem,1.4rem+2.4vw,3.4rem)]';
const h3 = 'font-heading font-semibold uppercase leading-[1.1] tracking-[0.02em]';
const btn =
  'inline-flex min-h-[52px] items-center justify-center gap-2.5 px-6 font-heading text-[17px] font-semibold uppercase tracking-[0.06em] no-underline transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
const solid = `${btn} bg-primary text-[color:var(--on-primary)] hover:bg-primary-deep hover:text-white`;
const hot = `${btn} bg-accent text-[color:var(--on-accent)] hover:brightness-110`;
const ghostDark = `${btn} border-2 border-white/45 text-white hover:border-white hover:bg-white/10`;
const ghostLight = `${btn} border-2 border-ink/20 text-ink hover:border-ink`;

const list = (value) => (Array.isArray(value) ? value : []);
const pad2 = (n) => String(n).padStart(2, '0');
// Letters in the longest word, which a heading or cell must hold on one line.
const longest = (...texts) => Math.max(0, ...texts.flatMap((t) => String(t || '').split(/\s+/)).map((w) => w.length));
const groupOf = (s) => (GROUPS.some(([key]) => key === s.group) ? s.group : 'general');
const servicesOf = (b) => list(b.services).filter((s) => s && s.slug && s.title);
// A short line that only says the title again is left out under it.
const shortOf = (s) => (s.short && s.short.trim().toLowerCase() !== s.title.trim().toLowerCase() ? s.short : null);
// The work a free inspection is offered for, without the "free" or the
// "inspection" its title already says ("Roof Inspections" is a roof one).
const inspected = (title) => {
  const what = title.trim().toLowerCase().replace(/^free\s+/, '').replace(/\s*\binspections?$/, '');
  return what ? `${what} ` : '';
};
const STEP_COLS = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6' };

/** The extra pages this business's site has, from its services. */
export function pages(b) {
  return ['services', ...servicesOf(b).map((s) => `services/${s.slug}`), 'service-areas', 'about', 'contact'];
}

function Eyebrow({ children, dark = false }) {
  return (
    <p
      className={`mb-4 flex items-center gap-3 font-heading text-[14px] font-semibold uppercase tracking-[0.18em] ${
        dark ? 'text-accent' : 'text-primary'
      }`}
    >
      <span className={`h-[3px] w-8 flex-none ${dark ? 'bg-accent' : 'bg-primary'}`} aria-hidden="true" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/* ------------------------------------------------------------------ header */

function UtilityBar({ b, tel }) {
  const first = list(b.hours)[0];
  return (
    <div className="bg-ink text-[14px] text-white/75">
      <div className={`${wrap} flex min-h-[48px] items-center justify-between gap-4`}>
        <p className="hidden min-w-0 items-center gap-5 md:flex">
          {b.license && (
            <span className="flex min-w-0 items-center gap-2">
              <ShieldCheck size={16} className="flex-none text-accent" aria-hidden="true" />
              <span className="truncate">{b.license}</span>
            </span>
          )}
          {first && (
            <span className="hidden flex-none items-center gap-2 lg:flex">
              <Clock size={15} className="flex-none text-accent" aria-hidden="true" />
              {first[0]} {first[1]}
            </span>
          )}
        </p>
        <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-end">
          <a href={tel} className="flex min-h-[44px] items-center gap-2 whitespace-nowrap font-heading text-[16px] font-semibold tracking-[0.03em] text-white no-underline sm:text-[18px]">
            <Phone size={16} className="flex-none text-accent" aria-hidden="true" /> {b.phone}
          </a>
          <a
            href="/contact"
            className="flex min-h-[48px] items-center whitespace-nowrap bg-accent px-3 font-heading text-[13px] font-semibold uppercase tracking-[0.06em] text-[color:var(--on-accent)] no-underline transition hover:brightness-110 sm:px-5 sm:text-[15px] sm:tracking-[0.08em]"
          >
            Free Inspection
          </a>
        </div>
      </div>
    </div>
  );
}

function MegaServices({ b, id, onPick }) {
  const services = servicesOf(b);
  const columns = GROUPS.map(([key, label]) => [label, services.filter((s) => groupOf(s) === key)]).filter(
    ([, items]) => items.length,
  );
  return (
    <div id={id} className="absolute inset-x-0 top-full border-t border-ink/10 bg-white shadow-[0_30px_50px_-30px_rgba(0,0,0,0.45)]">
      <div className={`${wrap} grid gap-10 py-9 lg:grid-cols-[minmax(0,1fr)_300px]`}>
        <div className={`grid gap-8 ${columns.length > 2 ? 'grid-cols-3' : columns.length === 2 ? 'grid-cols-2' : ''}`}>
          {columns.map(([label, items]) => (
            <div key={label} className="min-w-0">
              <p className="mb-3 border-b-[3px] border-ink pb-2 font-heading text-[14px] font-semibold uppercase tracking-[0.16em] text-ink">
                {label}
              </p>
              <ul className="grid">
                {items.map((s) => (
                  <li key={s.slug}>
                    <a
                      href={`/services/${s.slug}`}
                      onClick={onPick}
                      className="group/item -mx-3 block px-3 py-3 text-ink no-underline transition hover:bg-surface"
                    >
                      <span className="flex items-center gap-2 font-heading text-[18px] font-semibold uppercase tracking-[0.03em] group-hover/item:text-primary">
                        {s.title}
                        <ArrowRight size={15} className="opacity-0 transition group-hover/item:opacity-100" aria-hidden="true" />
                      </span>
                      {shortOf(s) && <span className="mt-0.5 block text-[15px] leading-snug text-ink/65">{shortOf(s)}</span>}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-between gap-6 bg-ink p-7 text-white">
          <div>
            <p className={`${h3} text-[22px]`}>Free roof inspection</p>
            <p className="mt-2 text-[15px] leading-relaxed text-white/75">
              {list(b.promises)[0] ? `${list(b.promises).slice(0, 2).join('. ')}.` : `Roofing in ${b.town} and nearby.`}
            </p>
          </div>
          <div className="grid gap-2">
            <a href="/contact" onClick={onPick} className={`${hot} !min-h-[48px] !text-[15px]`}>
              Book an Inspection
            </a>
            <a href="/services" onClick={onPick} className="flex min-h-[44px] items-center gap-2 font-heading text-[15px] uppercase tracking-[0.08em] text-white no-underline hover:text-accent">
              All Services <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function MegaAreas({ b, id, onPick }) {
  const towns = list(b.serviceArea);
  return (
    <div id={id} className="absolute inset-x-0 top-full border-t border-ink/10 bg-white shadow-[0_30px_50px_-30px_rgba(0,0,0,0.45)]">
      <div className={`${wrap} grid gap-10 py-9 lg:grid-cols-[minmax(0,1fr)_300px]`}>
        <div>
          <p className="mb-3 border-b-[3px] border-ink pb-2 font-heading text-[14px] font-semibold uppercase tracking-[0.16em] text-ink">
            Towns We Serve
          </p>
          <ul className="grid grid-cols-3 gap-x-8 xl:grid-cols-4">
            {towns.map((t, i) => (
              <li key={t}>
                <a
                  href={`/service-areas#${townId(t)}`}
                  onClick={onPick}
                  className="flex min-h-[44px] items-center gap-3 border-b border-ink/10 text-[16px] font-medium text-ink no-underline hover:text-primary"
                >
                  <span className="w-[1.5em] flex-none font-heading text-[13px] font-semibold tabular-nums text-primary">{pad2(i + 1)}</span>
                  {t}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-6 bg-surface p-7">
          <div>
            <p className={`${h3} text-[22px] text-ink`}>Our yard</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink/75">
              {b.address}, {b.town}, {b.state} {b.zip}
            </p>
          </div>
          <a href="/service-areas" onClick={onPick} className={`${solid} !min-h-[48px] !text-[15px]`}>
            All Service Areas
          </a>
        </div>
      </div>
    </div>
  );
}

function Header({ b, tel }) {
  const [menu, setMenu] = useState(null);
  const [mobile, setMobile] = useState(false);
  const [section, setSection] = useState(null);
  const via = useRef(null);
  const triggers = useRef({});

  useEffect(() => {
    if (!menu && !mobile) return undefined;
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (menu) triggers.current[menu]?.focus();
      setMenu(null);
      setMobile(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu, mobile]);

  const close = () => setMenu(null);
  const item = (name) => ({
    onMouseEnter: () => {
      via.current = 'hover';
      setMenu(name);
    },
    onMouseLeave: () => setMenu((m) => (m === name ? null : m)),
    onBlur: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setMenu((m) => (m === name ? null : m));
    },
  });
  const trigger = (name, label) => (
    <button
      type="button"
      ref={(el) => {
        triggers.current[name] = el;
      }}
      aria-expanded={menu === name}
      aria-controls={`mega-${name}`}
      onClick={() => {
        if (menu === name && via.current !== 'hover') setMenu(null);
        else setMenu(name);
        via.current = 'click';
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          via.current = 'click';
          setMenu(name);
        }
      }}
      className={`flex h-full cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-[3px] px-1 font-heading text-[17px] font-semibold uppercase tracking-[0.06em] transition ${
        menu === name ? 'border-accent text-head-ink' : 'border-transparent text-head-ink hover:text-head-hover'
      }`}
    >
      {label}
      <ChevronDown size={16} className={`transition ${menu === name ? 'rotate-180' : ''}`} aria-hidden="true" />
    </button>
  );
  const link = 'flex h-full items-center whitespace-nowrap border-b-[3px] border-transparent px-1 font-heading text-[17px] font-semibold uppercase tracking-[0.06em] text-head-ink no-underline transition hover:text-head-hover';
  const towns = list(b.serviceArea);
  const services = servicesOf(b);

  return (
    <header className={`sticky ${b.preview ? 'top-11' : 'top-0'} z-40 border-b border-head-line bg-head`}>
      <div className={`${wrap} flex h-[76px] items-stretch gap-6 lg:h-[92px]`}>
        {/* The menu items keep to one line; when the bar is tight the name beside the logo wraps instead. */}
        <a href="/" className="flex min-w-0 flex-initial items-center no-underline" aria-label={`${b.name} home`}>
          <BrandLogo b={b} textClass="font-heading uppercase text-head-ink" />
        </a>

        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex h-full items-stretch gap-7 xl:gap-9">
            <li className="flex" {...item('services')}>
              {trigger('services', 'Services')}
              {menu === 'services' && <MegaServices b={b} id="mega-services" onPick={close} />}
            </li>
            <li className="flex" {...item('areas')}>
              {trigger('areas', 'Service Areas')}
              {menu === 'areas' && <MegaAreas b={b} id="mega-areas" onPick={close} />}
            </li>
            <li className="flex">
              <a href="/about" className={link}>
                About
              </a>
            </li>
            <li className="flex">
              <a href="/contact" className={link}>
                Contact
              </a>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex flex-none items-center gap-2 lg:ml-2">
          <a href="/contact" className={`${solid} hidden !min-h-[48px] lg:inline-flex`}>
            Free Inspection
          </a>
          <button
            type="button"
            className="inline-flex h-12 cursor-pointer items-center gap-2 border-2 border-head-ink/80 px-3.5 font-heading text-[16px] font-semibold uppercase tracking-[0.06em] text-head-ink lg:hidden"
            aria-expanded={mobile}
            aria-controls="site-menu"
            onClick={() => setMobile((v) => !v)}
          >
            {mobile ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            <span>{mobile ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>

      <div
        id="site-menu"
        hidden={!mobile}
        className={`absolute inset-x-0 top-full overflow-y-auto border-b-4 border-primary bg-white shadow-[0_24px_40px_-24px_rgba(0,0,0,0.45)] lg:hidden ${
          b.preview ? 'max-h-[calc(100dvh-116px)]' : 'max-h-[calc(100dvh-72px)]'
        }`}
      >
        <nav aria-label="Mobile" className={wrap}>
          <ul>
            {[
              ['services', 'Services'],
              ['areas', 'Service Areas'],
            ].map(([key, label]) => (
              <li key={key} className="border-b border-ink/10">
                <button
                  type="button"
                  aria-expanded={section === key}
                  aria-controls={`m-${key}`}
                  onClick={() => setSection((s) => (s === key ? null : key))}
                  className="flex min-h-[60px] w-full cursor-pointer items-center justify-between font-heading text-[22px] font-semibold uppercase tracking-[0.04em] text-ink"
                >
                  {label}
                  <Plus size={22} className={`text-primary transition ${section === key ? 'rotate-45' : ''}`} aria-hidden="true" />
                </button>
                <div id={`m-${key}`} hidden={section !== key} className="pb-4">
                  {key === 'services' ? (
                    <>
                      {GROUPS.map(([g, glabel]) => {
                        const items = services.filter((s) => groupOf(s) === g);
                        if (!items.length) return null;
                        return (
                          <div key={g} className="mb-3">
                            <p className="py-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink/55">{glabel}</p>
                            <ul>
                              {items.map((s) => (
                                <li key={s.slug}>
                                  <a href={`/services/${s.slug}`} className="block border-l-[3px] border-primary/30 py-2.5 pl-4 text-ink no-underline">
                                    <span className="block text-[17px] font-semibold">{s.title}</span>
                                    {shortOf(s) && <span className="block text-[15px] leading-snug text-ink/65">{shortOf(s)}</span>}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                      <a href="/services" className="flex min-h-[48px] items-center gap-2 font-semibold text-primary no-underline">
                        All Services <ArrowRight size={16} aria-hidden="true" />
                      </a>
                    </>
                  ) : (
                    <>
                      <ul className="grid grid-cols-2 gap-x-4">
                        {towns.map((t) => (
                          <li key={t}>
                            <a href={`/service-areas#${townId(t)}`} className="flex min-h-[44px] items-center text-[17px] text-ink no-underline">
                              {t}
                            </a>
                          </li>
                        ))}
                      </ul>
                      <a href="/service-areas" className="flex min-h-[48px] items-center gap-2 font-semibold text-primary no-underline">
                        All Service Areas <ArrowRight size={16} aria-hidden="true" />
                      </a>
                    </>
                  )}
                </div>
              </li>
            ))}
            {[
              ['/#projects', 'Projects', list(b.projects).length > 0],
              ['/about', 'About', true],
              ['/contact', 'Contact', true],
            ]
              .filter(([, , show]) => show)
              .map(([href, label]) => (
                <li key={href} className="border-b border-ink/10">
                  <a
                    href={href}
                    onClick={() => setMobile(false)}
                    className="flex min-h-[60px] items-center justify-between font-heading text-[22px] font-semibold uppercase tracking-[0.04em] text-ink no-underline"
                  >
                    {label} <ArrowRight size={20} className="text-primary" aria-hidden="true" />
                  </a>
                </li>
              ))}
          </ul>
          <div className="grid gap-3 py-6 sm:grid-cols-2">
            <a href="/contact" className={solid}>
              Book a Free Inspection
            </a>
            <a href={tel} className={ghostLight}>
              <Phone size={18} aria-hidden="true" /> {b.phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

/* --------------------------------------------------------------- sections */

function Promises({ items, dark = false }) {
  if (!items.length) return null;
  return (
    <ul className="grid gap-3">
      {items.map((p) => (
        <li key={p} className="flex items-start gap-3 text-[16px] font-medium leading-snug">
          <span className={`mt-0.5 grid h-6 w-6 flex-none place-items-center ${dark ? 'bg-accent text-[color:var(--on-accent)]' : 'bg-primary text-[color:var(--on-primary)]'}`}>
            <Check size={14} strokeWidth={3} aria-hidden="true" />
          </span>
          {p}
        </li>
      ))}
    </ul>
  );
}

function HeroPanel({ b, tel, rating, promises }) {
  const first = list(b.hours)[0];
  return (
    <div className="self-center border-t-4 border-accent bg-white p-7 text-ink shadow-[0_32px_64px_-32px_rgba(0,0,0,0.7)] sm:p-8">
      <p className="font-heading text-[14px] font-semibold uppercase tracking-[0.16em] text-primary">Free Roof Inspection</p>
      <a href={tel} className="mt-3 flex items-center gap-3 whitespace-nowrap font-heading text-[clamp(1.6rem,1.2rem+1.4vw,2rem)] font-bold tracking-[0.02em] text-ink no-underline">
        <Phone size={24} className="flex-none text-primary" aria-hidden="true" /> {b.phone}
      </a>
      {first && (
        <p className="mt-2 flex items-center gap-2 text-[15px] text-ink/70">
          <Clock size={15} className="flex-none text-primary" aria-hidden="true" /> {first[0]} {first[1]}
        </p>
      )}
      {rating && (
        <div className="mt-6 flex items-center gap-4 border-t border-ink/10 pt-6">
          <strong className="font-heading text-[48px] font-bold leading-none">{Number(b.rating).toFixed(1)}</strong>
          <div className="grid gap-1.5">
            <Stars value={b.rating} size={17} />
            <span className="text-[15px] text-ink/70">{b.reviewCount.toLocaleString()} Google reviews</span>
          </div>
        </div>
      )}
      {promises.length > 0 && (
        <div className="mt-6 border-t border-ink/10 pt-6">
          <Promises items={promises} />
        </div>
      )}
      <a href="/contact" className={`${solid} mt-7 w-full`}>
        Book an Inspection <ArrowRight size={18} aria-hidden="true" />
      </a>
    </div>
  );
}

function HomeHero({ b, tel, rating }) {
  const promises = list(b.promises).slice(0, 4);
  return (
    <section className={`relative isolate overflow-hidden bg-ink text-white ${heroClip}`}>
      {b.hero.image ? (
        <>
          {/* On a phone the photo is shown whole above the words; from lg up it is the ground behind them. */}
          <Img
            className="relative block aspect-[16/10] w-full object-cover object-[center_40%] lg:absolute lg:inset-0 lg:-z-20 lg:aspect-auto lg:h-full"
            src={b.hero.image}
            alt={b.hero.imageAlt}
            sizes="100vw"
            eager
            data-backdrop=""
          />
          <div
            className="absolute inset-0 -z-10 hidden lg:block lg:bg-[linear-gradient(100deg,color-mix(in_srgb,var(--ink)_96%,transparent)_0%,color-mix(in_srgb,var(--ink)_90%,transparent)_58%,color-mix(in_srgb,var(--ink)_30%,transparent)_100%)]"
            aria-hidden="true"
          />
        </>
      ) : (
        // No photo strong enough to lead: the brand's own colors carry the band.
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_88%_12%,color-mix(in_srgb,var(--primary)_55%,transparent),transparent_58%),repeating-linear-gradient(135deg,rgba(255,255,255,0.035)_0_2px,transparent_2px_26px)]"
          aria-hidden="true"
        />
      )}
      <div
        className={`${wrap} grid items-end gap-10 pt-10 pb-[calc(clamp(28px,5vw,88px)+3.5rem)] sm:pt-16 lg:min-h-[min(88vh,800px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-16 lg:pt-24`}
      >
        <div className="min-w-0 self-center">
          <Eyebrow dark>{b.hero.eyebrow}</Eyebrow>
          <h1 className={h1}>
            {b.hero.title}
            {b.hero.titleAccent && <span className="block text-accent">{b.hero.titleAccent}</span>}
          </h1>
          <p className="mt-6 max-w-[38rem] text-[17px] leading-[1.6] text-white/85 sm:text-[19px]">{b.hero.lead}</p>
          <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
            <a href="/contact" className={solid}>
              Book a Free Inspection <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href={tel} className={ghostDark}>
              <Phone size={18} aria-hidden="true" /> {b.phone}
            </a>
          </div>
        </div>
        {!b.hero.image ? (
          <HeroPanel b={b} tel={tel} rating={rating} promises={promises} />
        ) : (rating || promises.length > 0) && (
          <div className="border-l-4 border-accent bg-[color-mix(in_srgb,var(--ink)_78%,transparent)] p-6 backdrop-blur-sm sm:p-7">
            {rating && (
              <div className={`flex items-center gap-4 ${promises.length > 0 ? 'mb-6 border-b border-white/15 pb-6' : ''}`}>
                <strong className="font-heading text-[56px] font-bold leading-none">{Number(b.rating).toFixed(1)}</strong>
                <div className="grid gap-1.5">
                  <Stars value={b.rating} size={18} />
                  <span className="text-[15px] text-white/75">{b.reviewCount.toLocaleString()} Google reviews</span>
                </div>
              </div>
            )}
            <Promises items={promises} dark />
          </div>
        )}
      </div>
    </section>
  );
}

function PageHero({ b, tel, crumbs, eyebrow, title, lead, image, imageAlt }) {
  return (
    <section className={`relative isolate overflow-hidden bg-ink text-white ${heroClip}`}>
      {image ? (
        <>
          {/* On a phone the photo is shown whole above the words; from lg up it fills the right half behind them.
              A tall photo (people standing) is cut to its top on a phone, so heads are kept. */}
          <Img
            className="relative block aspect-[16/10] w-full object-cover object-top lg:absolute lg:object-center lg:inset-0 lg:left-auto lg:-z-20 lg:aspect-auto lg:h-full lg:w-[52%] lg:[clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)]"
            src={image}
            alt={imageAlt || ''}
            sizes="(min-width: 1024px) 52vw, 100vw"
            eager
          />
          <div
            className="absolute inset-0 -z-10 hidden lg:block lg:bg-[linear-gradient(90deg,var(--ink)_0%,var(--ink)_47%,color-mix(in_srgb,var(--ink)_35%,transparent)_60%,transparent_78%)]"
            aria-hidden="true"
          />
        </>
      ) : (
        // No photo for the right half: the brand's own colors carry the band, as on the home hero.
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_88%_12%,color-mix(in_srgb,var(--primary)_55%,transparent),transparent_58%),repeating-linear-gradient(135deg,rgba(255,255,255,0.035)_0_2px,transparent_2px_26px)]"
          aria-hidden="true"
        />
      )}
      <div className={`${wrap} pt-10 pb-[calc(clamp(28px,5vw,88px)+3rem)] lg:pt-14`}>
        <nav aria-label="Breadcrumb" className="mb-8 lg:mb-12">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-white/65">
            {[['/', 'Home'], ...crumbs].map(([href, label], i, all) => (
              <li key={label} className="flex items-center gap-2">
                {i < all.length - 1 ? (
                  <>
                    <a href={href} className="inline-flex min-h-[44px] min-w-[44px] items-center text-white/80 no-underline hover:text-accent">
                      {label}
                    </a>
                    <span aria-hidden="true">/</span>
                  </>
                ) : (
                  <span aria-current="page" className="text-white">
                    {label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {/* Without a photo the right half holds the inspection panel, so it is not left empty. */}
        <div className={image ? '' : 'grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-16'}>
          <div className={`max-w-[40rem] [container-type:inline-size] ${image ? 'lg:max-w-[46%]' : 'min-w-0 lg:max-w-none'}`}>
            <Eyebrow dark>{eyebrow}</Eyebrow>
            {/* A long word ('Construction') is set smaller until it fits the column whole, rather than broken. */}
            <h1
              className={`${h1} !text-[min(clamp(2.4rem,1.4rem+3.8vw,4.5rem),var(--fit))]`}
              style={{ '--fit': `${(100 / (Math.max(longest(title), 1) * 0.78)).toFixed(2)}cqi` }}
            >
              {title}
            </h1>
            {lead && <p className="mt-6 text-[17px] leading-[1.6] text-white/85 sm:text-[19px]">{lead}</p>}
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <a href="/contact" className={solid}>
                Book a Free Inspection
              </a>
              <a href={tel} className={ghostDark}>
                <Phone size={18} aria-hidden="true" /> {b.phone}
              </a>
            </div>
          </div>
          {/* On a phone the column is stacked and the panel would only repeat the buttons above it. */}
          {!image && (
            <div className="hidden self-center lg:block">
              <HeroPanel b={b} tel={tel} rating={ratingLine(b)} promises={list(b.promises).slice(0, 4)} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ClaimStrip({ b, stormHref }) {
  const claim = b.claim;
  const steps = list(claim?.steps);
  if (!steps.length) return null;
  return (
    <section id="claims" className={`${anchor} bg-ink pb-[clamp(4rem,8vw,6.5rem)] pt-[clamp(2.5rem,5vw,4rem)] text-white`}>
      <div className={wrap}>
        <div className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-end lg:gap-16">
          <div>
            <Eyebrow dark>Insurance claims</Eyebrow>
            <h2 className={h2}>{claim.title}</h2>
          </div>
          <div>
            {claim.text && <p className="text-[17px] leading-[1.6] text-white/75">{claim.text}</p>}
            {stormHref && (
              <a href={stormHref} className="mt-4 inline-flex min-h-[44px] items-center gap-2 font-heading text-[16px] font-semibold uppercase tracking-[0.08em] text-accent no-underline hover:text-white">
                Storm Damage Help <ArrowRight size={16} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
        <ol className={`grid gap-x-6 gap-y-10 sm:grid-cols-2 ${STEP_COLS[steps.length] || 'lg:grid-cols-4'}`}>
          {steps.map((s, i) => (
            <li key={s.title} className="relative border-t-2 border-white/15 pt-6">
              <span className="absolute -top-[2px] left-0 h-[2px] w-14 bg-accent" aria-hidden="true" />
              <span className="block font-heading text-[64px] font-bold leading-none text-transparent [-webkit-text-stroke:1.5px_var(--accent)]">
                {pad2(i + 1)}
              </span>
              <h3 className={`${h3} mt-4 text-[21px]`}>{s.title}</h3>
              <p className="mt-2 leading-[1.6] text-white/70">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ServiceCard({ s, tagged = true }) {
  const group = tagged && groupOf(s) !== 'general' ? GROUPS.find(([key]) => key === groupOf(s))[1] : null;
  return (
    <li className="min-w-0">
      <a href={`/services/${s.slug}`} className="group flex h-full flex-col bg-surface text-ink no-underline">
        {s.image ? (
          <div className="relative overflow-hidden">
            <Img
              className="aspect-[16/10] w-full object-cover transition duration-500 [clip-path:polygon(0_0,100%_0,100%_86%,0_100%)] group-hover:scale-[1.03]"
              src={s.image}
              alt={s.imageAlt || ''}
              sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
            />
            {group && (
              <span className="absolute left-0 top-5 bg-ink px-3 py-1.5 font-heading text-[13px] font-semibold uppercase tracking-[0.14em] text-white">
                {group}
              </span>
            )}
          </div>
        ) : (
          group && (
            <span className="mx-6 mt-6 w-fit bg-ink px-3 py-1.5 font-heading text-[13px] font-semibold uppercase tracking-[0.14em] text-white">
              {group}
            </span>
          )
        )}
        <div className="flex flex-1 flex-col border-b-4 border-transparent px-6 pb-6 pt-4 transition group-hover:border-primary sm:px-7">
          <h3 className={`${h3} text-[25px]`}>{s.title}</h3>
          {s.text ? <p className="mt-2.5 flex-1 leading-[1.6] text-ink/75">{s.text}</p> : <span className="flex-1" />}
          <span className="mt-5 inline-flex items-center gap-2 font-heading text-[15px] font-semibold uppercase tracking-[0.1em] text-primary">
            {s.title} <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </a>
    </li>
  );
}

function ServiceTile({ s }) {
  return (
    <li className="min-w-0">
      <a
        href={`/services/${s.slug}`}
        className="group flex h-full min-h-[76px] items-center justify-between gap-4 border-l-4 border-primary bg-surface px-6 py-4 text-ink no-underline transition hover:bg-ink hover:text-white"
      >
        <span className={`${h3} text-[21px]`}>{s.title}</span>
        <ArrowRight size={18} className="flex-none text-primary transition group-hover:translate-x-1 group-hover:text-white" aria-hidden="true" />
      </a>
    </li>
  );
}

/**
 * The services as cards when most of them carry words of their own, and as
 * plain tiles when most do not, so no card stands empty beside a full one.
 * Worded services fill whole rows of three cards, or of four where four or
 * eight would leave one over; any left over, and every service without words,
 * follow as tiles. A card's group tag sits above its heading where it has no
 * photo, so the tags are drawn only when every such card has one, and the
 * headings in a row stay level.
 */
function HomeServices({ services }) {
  const worded = services.filter((s) => s.text);
  if (worded.length * 2 < services.length) {
    return (
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <ServiceTile key={s.slug} s={s} />
        ))}
      </ul>
    );
  }
  const ordered = [...worded, ...services.filter((s) => !s.text)];
  const row = worded.length % 3 && worded.length % 4 === 0 ? 4 : 3;
  const whole = worded.length >= row ? worded.length - (worded.length % row) : worded.length;
  const cards = ordered.slice(0, whole);
  const rest = ordered.slice(whole);
  const tagged = new Set(services.map(groupOf)).size > 1 && cards.every((s) => s.image || groupOf(s) !== 'general');
  return (
    <>
      <ul className={`grid gap-5 sm:grid-cols-2 ${cards.length >= 3 ? STEP_COLS[row] : ''}`}>
        {cards.map((s) => (
          <ServiceCard key={s.slug} s={s} tagged={tagged} />
        ))}
      </ul>
      {rest.length > 0 && (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {rest.map((s) => (
            <ServiceTile key={s.slug} s={s} />
          ))}
        </ul>
      )}
    </>
  );
}

function Materials({ b, className = 'bg-surface' }) {
  const m = b.materials;
  const brands = list(m?.brands);
  if (!brands.length) return null;
  return (
    <section className={`${className} ${pad}`}>
      <div className={`${wrap} grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-16`}>
        <div className="[container-type:inline-size]">
          <Eyebrow>Materials</Eyebrow>
          {/* A long word ('Manufacturers') is set smaller until it fits the column whole, rather than broken. */}
          <h2
            className={`${h2} !text-[min(clamp(2rem,1.4rem+2.4vw,3.4rem),var(--fit))]`}
            style={{ '--fit': `${(100 / (Math.max(longest(m.title), 1) * 0.78)).toFixed(2)}cqi` }}
          >
            {m.title}
          </h2>
          {m.text && <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.6] text-ink/75 sm:text-[18px]">{m.text}</p>}
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {brands.map((name) => (
            <li
              key={name}
              className="grid min-h-[88px] place-items-center border-2 border-ink bg-white px-3 py-4 text-center font-heading text-[clamp(1.15rem,0.9rem+0.9vw,1.6rem)] font-bold uppercase leading-tight tracking-[0.04em] text-ink"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ProjectCard({ p, wide = false }) {
  const [view, setView] = useState('after');
  const showing = p.before && view === 'before';
  return (
    <li className={`min-w-0 ${wide ? 'md:col-span-2 md:grid md:grid-cols-2 md:items-center md:gap-x-10' : 'flex flex-col'}`}>
      <div>
        <figure className="relative m-0 overflow-hidden bg-ink">
          <Img
            className={`aspect-[4/3] w-full object-cover transition-opacity duration-300 ${showing ? 'opacity-0' : 'opacity-100'}`}
            src={p.image}
            alt={p.imageAlt}
            sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw"
          />
          {p.before && (
            <Img
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${showing ? 'opacity-100' : 'opacity-0'}`}
              src={p.before}
              alt={p.beforeAlt || ''}
              sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 100vw"
            />
          )}
          <figcaption className="absolute left-0 top-4 bg-accent px-3 py-1.5 font-heading text-[13px] font-semibold uppercase tracking-[0.14em] text-[color:var(--on-accent)]">
            {showing ? 'Before' : 'After'}
          </figcaption>
        </figure>
        {!p.before && (
          <p className="flex min-h-[52px] items-center justify-center border-x-2 border-b-2 border-ink bg-ink font-heading text-[15px] font-semibold uppercase tracking-[0.12em] text-white">
            Finished Roof
          </p>
        )}
        {p.before && (
          <div className="grid grid-cols-2 border-x-2 border-b-2 border-ink" role="group" aria-label={`Before and after: ${p.title}`}>
            {['before', 'after'].map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`min-h-[48px] cursor-pointer font-heading text-[15px] font-semibold uppercase tracking-[0.12em] transition ${
                  view === v ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-surface'
                }`}
              >
                {v === 'before' ? 'Before' : 'After'}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className={wide ? 'pt-5 md:pt-0' : 'pt-5'}>
        <p className="text-[14px] font-semibold uppercase tracking-[0.12em] text-primary">
          {p.town} &middot; {p.scope}
        </p>
        <h3 className={`${h3} mt-2 text-[23px]`}>{p.title}</h3>
        <p className="mt-2 leading-[1.6] text-ink/75">{p.text}</p>
      </div>
    </li>
  );
}

/**
 * Two projects, or five, would leave the last row a column short, so the
 * heading takes the first column of the row; one project takes the two
 * columns beside the heading, its photo beside its words. The photos are
 * never drawn wider than a third of the page.
 */
function Projects({ items, title = 'Recent roofs', className = '' }) {
  if (!items.length) return null;
  const inline = items.length === 1 || items.length % 3 === 2;
  const heading = (
    <>
      <Eyebrow>Projects</Eyebrow>
      <h2 className={`${h2} ${inline ? '' : 'mb-10 lg:mb-14'}`}>{title}</h2>
    </>
  );
  return (
    <section id="projects" className={`${anchor} ${className} ${pad}`}>
      <div className={wrap}>
        {!inline && heading}
        <ul className="grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {inline && <li className="min-w-0 md:col-span-2 lg:col-span-1">{heading}</li>}
          {items.map((p) => (
            <ProjectCard key={p.title} p={p} wide={items.length === 1} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Reviews({ b, className = '' }) {
  const reviews = list(b.reviews);
  if (!reviews.length) return null;
  return (
    <section id="reviews" className={`${anchor} ${className} ${pad}`}>
      <div className={wrap}>
        <div className="mb-10 flex flex-col gap-6 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow>Reviews</Eyebrow>
            <h2 className={h2}>What customers say</h2>
          </div>
          {b.rating && b.reviewCount && (
            <div className="flex items-center gap-4">
              <strong className="font-heading text-[60px] font-bold leading-none">{Number(b.rating).toFixed(1)}</strong>
              <div className="grid gap-1.5">
                <Stars value={b.rating} size={18} />
                <span className="text-[15px] font-medium text-ink/70">{b.reviewCount.toLocaleString()} Google reviews</span>
              </div>
            </div>
          )}
        </div>
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <li key={r.text.slice(0, 40)} className="flex flex-col border-l-4 border-primary bg-surface p-6 sm:p-8">
              <Stars value={5} size={15} />
              <blockquote className="m-0 mb-6 mt-4 flex-1 text-[17px] leading-[1.65] text-ink/85">{r.text}</blockquote>
              <p className="font-heading text-[15px] font-semibold uppercase tracking-[0.1em] text-ink/70">{r.author}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function AboutBand({ b }) {
  const a = b.about;
  if (!a) return null;
  const words = (
    <>
      <p className={`mt-5 text-[17px] leading-[1.65] text-white/80 sm:text-[18px] ${a.image ? '' : 'lg:mt-0'}`}>{list(a.text)[0]}</p>
      {list(a.values).length > 0 && (
        <ul className="mt-8 grid gap-5 sm:grid-cols-3">
          {list(a.values).map((v) => (
            <li key={v.title} className="border-t-2 border-accent pt-4">
              <h3 className={`${h3} text-[18px]`}>{v.title}</h3>
              <p className="mt-1.5 text-[16px] leading-[1.55] text-white/70 lg:text-[15px]">{v.text}</p>
            </li>
          ))}
        </ul>
      )}
      <a href="/about" className={`${ghostDark} mt-9`}>
        About {b.shortName} <ArrowRight size={18} aria-hidden="true" />
      </a>
    </>
  );
  return (
    <section className={`bg-ink text-white ${topClip} pb-[clamp(4rem,9vw,7rem)] pt-[calc(clamp(28px,5vw,88px)+clamp(3.5rem,8vw,6rem))]`}>
      {/* Without a photo the heading takes the left half and the words the right, so neither half is left empty. */}
      <div
        className={`${wrap} grid items-center ${a.image ? 'gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]'} lg:gap-20`}
      >
        {a.image && (
          <Img
            className="aspect-[4/3] w-full object-cover [clip-path:polygon(0_0,100%_0,100%_100%,8%_100%,0_92%)]"
            src={a.image}
            alt={a.imageAlt}
            sizes="(min-width: 768px) 46vw, 100vw"
          />
        )}
        <div>
          <Eyebrow dark>{b.since ? `Since ${b.since}` : 'About us'}</Eyebrow>
          <h2 className={h2}>{a.title}</h2>
          {a.image && words}
        </div>
        {!a.image && <div>{words}</div>}
      </div>
    </section>
  );
}

function AreasBand({ b }) {
  const towns = list(b.serviceArea);
  // The band is a list of towns; with one or two it would be a heading alone, and the hero names the home town.
  if (towns.length < 3) return null;
  return (
    <section id="areas" className={`${anchor} bg-surface ${pad}`}>
      <div className={`${wrap} grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16`}>
        <div>
          <Eyebrow>Service areas</Eyebrow>
          <h2 className={h2}>Roofing across {towns[0]} and nearby</h2>
          {b.areasText && <p className="mt-5 text-[17px] leading-[1.6] text-ink/75 sm:text-[18px]">{b.areasText}</p>}
          <a href="/service-areas" className={`${solid} mt-8`}>
            All Service Areas
          </a>
        </div>
        {/* On a phone a half-width cell holds a word of seven letters; a longer town name takes the full width, so it is never broken. */}
        <ul className={`grid ${longest(...towns) > 7 ? 'grid-cols-1' : 'grid-cols-2'} content-start self-start border-l-2 border-t-2 border-ink sm:grid-cols-3`}>
          {towns.map((t, i) => (
            <li key={t} className="border-b-2 border-r-2 border-ink bg-white">
              <a href={`/service-areas#${townId(t)}`} className="flex min-h-[64px] items-center gap-3 px-4 py-3 text-ink no-underline transition hover:bg-ink hover:text-white">
                <span className="w-[1.5em] flex-none font-heading text-[13px] font-semibold tabular-nums text-primary">{pad2(i + 1)}</span>
                <span className="min-w-0 break-words font-heading text-[18px] font-semibold uppercase tracking-[0.03em]">{t}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function InspectionForm({ b }) {
  const services = servicesOf(b);
  return (
    <EnquiryForm
      b={b}
      submitLabel="Request a Free Inspection"
      styles={{
        form: '',
        label: 'text-[15px] font-semibold text-ink',
        field:
          'min-h-[52px] border-2 border-ink/15 bg-white px-3.5 py-3 text-[16px] font-normal text-ink focus:border-primary focus:outline-none',
        button: `${solid} w-full`,
        done: 'border-l-4 border-primary bg-surface p-6 text-ink',
      }}
      fields={[
        { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
        { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        { name: 'address', label: 'Property Address', autoComplete: 'street-address' },
        {
          name: 'service',
          label: 'What Do You Need?',
          type: 'select',
          required: true,
          options: [...services.map((s) => s.title), 'Something else'],
        },
        {
          name: 'storm',
          label: 'Recent Storm Damage?',
          type: 'select',
          options: ['Yes, hail', 'Yes, wind', 'No', 'Not sure'],
        },
        { name: 'details', label: 'Tell Us About the Roof', type: 'textarea', wide: true },
      ]}
    />
  );
}

function ContactLines({ b, tel, dark = false }) {
  const full = `${b.address}, ${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;
  const rows = [
    [Phone, tel, b.phone],
    b.email && [Mail, `mailto:${b.email}`, b.email.split('@').flatMap((p, i) => (i ? ['@', <wbr key={i} />, p] : [p]))],
    [MapPin, mapsHref(b), full],
  ].filter(Boolean);
  return (
    <ul className="grid gap-2">
      {rows.map(([Icon, href, label]) => (
        <li key={href}>
          <a
            href={href}
            className={`flex min-h-[48px] items-center gap-3 text-[17px] font-medium no-underline ${dark ? 'text-white hover:text-accent' : 'text-ink hover:text-primary'}`}
          >
            <span className={`grid h-11 w-11 flex-none place-items-center ${dark ? 'bg-white/10 text-accent' : 'bg-surface text-primary'}`}>
              <Icon size={18} aria-hidden="true" />
            </span>
            <span className="min-w-0 [overflow-wrap:anywhere]">{label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Hours({ b, dark = false }) {
  const hours = list(b.hours);
  if (!hours.length) return null;
  return (
    <table className="w-full border-collapse">
      <caption className="sr-only">Office hours</caption>
      <tbody>
        {hours.map(([d, h]) => (
          <tr key={d} className={`border-b ${dark ? 'border-white/15' : 'border-ink/10'}`}>
            <th scope="row" className={`py-3 pr-4 text-left font-medium ${dark ? 'text-white/65' : 'text-ink/65'}`}>
              {d}
            </th>
            <td className="py-3 text-right font-semibold">{h}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function InspectionSection({ b, tel }) {
  return (
    <section id="inspection" className={`${anchor} ${pad}`}>
      <div className={`${wrap} grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]`}>
        <div className="bg-ink p-7 text-white sm:p-10 lg:p-12">
          <Eyebrow dark>Free inspection</Eyebrow>
          <h2 className={h2}>Get eyes on your roof</h2>
          <p className="mb-8 mt-4 text-[17px] leading-[1.6] text-white/75">
            Tell us about the roof and we will call to set a time.
          </p>
          <ContactLines b={b} tel={tel} dark />
          <div className="mt-8">
            <Hours b={b} dark />
          </div>
        </div>
        <div className="border-2 border-t-0 border-ink/10 bg-white p-6 sm:p-10 lg:border-l-0 lg:border-t-2 lg:p-12">
          <h3 className={`${h3} mb-7 text-[26px]`}>Request a free inspection</h3>
          <InspectionForm b={b} />
        </div>
      </div>
    </section>
  );
}

function CtaBand({ b, tel }) {
  return (
    <section className="bg-primary text-[color:var(--on-primary)]">
      <div className={`${wrap} flex flex-col gap-8 py-[clamp(3.5rem,7vw,5.5rem)] lg:flex-row lg:items-center lg:justify-between`}>
        <div className="max-w-[44rem]">
          <h2 className={h2}>Book a free roof inspection</h2>
          {ratingLine(b) && (
            <p className="mt-4 flex flex-wrap items-center gap-3 text-[17px] font-medium opacity-90">
              <Stars value={b.rating} size={17} className="text-current" /> {ratingLine(b)}
            </p>
          )}
        </div>
        <div className="grid flex-none gap-3 sm:flex">
          <a href="/contact" className={`${btn} bg-ink text-white hover:bg-white hover:text-ink`}>
            Book an Inspection <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a href={tel} className={`${btn} border-2 border-current hover:bg-white/10`}>
            <Phone size={18} aria-hidden="true" /> {b.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer({ b, tel }) {
  const head = 'mb-4 font-heading text-[14px] font-semibold uppercase tracking-[0.16em] text-accent';
  const linkCls = 'flex min-h-[44px] items-center text-white/80 no-underline hover:text-white';
  return (
    <footer className={`bg-ink pb-24 text-white/75 md:pb-0 ${topClip} pt-[calc(clamp(28px,5vw,88px)+3.5rem)]`}>
      <div className={`${wrap} grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.9fr_1.25fr] lg:gap-12`}>
        <div className="grid content-start gap-5">
          <BrandLogo b={b} ground="#161a20" textClass="font-heading uppercase text-white" />
          <p className="max-w-xs leading-[1.6]">
            Roofing in {b.town}, {b.state}
            {b.since ? `, since ${b.since}` : ''}.
          </p>
          {b.license && (
            <p className="flex items-center gap-2 text-[15px]">
              <ShieldCheck size={16} className="flex-none text-accent" aria-hidden="true" /> {b.license}
            </p>
          )}
        </div>
        <div>
          <h2 className={head}>Company</h2>
          <ul className="grid">
            {[
              ['/services', 'All Services'],
              ['/service-areas', 'Service Areas'],
              ['/about', 'About'],
              ['/contact', 'Contact'],
            ].map(([href, label]) => (
                <li key={href}>
                  <a href={href} className={linkCls}>
                    {label}
                  </a>
                </li>
              ))}
          </ul>
        </div>
        <div>
          <h2 className={head}>Contact</h2>
          <a href={tel} className="flex min-h-[44px] items-center font-heading text-[26px] font-semibold tracking-[0.03em] text-white no-underline">
            {b.phone}
          </a>
          {b.email && (
            <a href={`mailto:${b.email}`} className="flex min-h-[44px] items-center text-white/80 no-underline [overflow-wrap:anywhere] hover:text-white">
              {b.email}
            </a>
          )}
          <a href={mapsHref(b)} className="block py-2.5 leading-[1.6] text-white/80 no-underline hover:text-white">
            {b.address}
            <br />
            {b.town}, {b.state} {b.zip}
          </a>
          {list(b.hours).length > 0 && (
            <dl className="mt-3 grid gap-1.5 text-[15px]">
              {list(b.hours).map(([d, h]) => (
                <div key={d} className="flex flex-wrap gap-x-2">
                  <dt className="text-white/55">{d}</dt>
                  <dd className="m-0 text-white/85">{h}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
      <div className={wrap}>
        <p className="border-t border-white/10 py-6 text-[14px] text-white/50">
          &copy; {new Date().getFullYear()} {b.name}
          <StudioCredit b={b} />
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ pages */

function HomePage({ b, tel, rating, stormHref }) {
  const services = servicesOf(b);
  return (
    <>
      <div className={list(b.claim?.steps).length ? 'bg-ink' : 'bg-white'}>
        <HomeHero b={b} tel={tel} rating={rating} />
      </div>
      <ClaimStrip b={b} stormHref={stormHref} />
      <section id="services" className={`${anchor} ${pad}`}>
        <div className={wrap}>
          <div className="mb-10 grid gap-5 lg:mb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:items-end lg:gap-16">
            <div>
              <Eyebrow>Services</Eyebrow>
              <h2 className={h2}>Roof work, start to finish</h2>
            </div>
            <p className="text-[17px] leading-[1.6] text-ink/75 sm:text-[18px]">
              From a single leak to a new roof, across {b.town} and nearby.
            </p>
          </div>
          <HomeServices services={services} />
        </div>
      </section>
      <Materials b={b} />
      <Projects items={list(b.projects)} />
      <AboutBand b={b} />
      <Reviews b={b} />
      <AreasBand b={b} />
      <InspectionSection b={b} tel={tel} />
    </>
  );
}

function ServicesIndex({ b, tel, stormHref }) {
  const services = servicesOf(b);
  return (
    <>
      <PageHero
        b={b}
        tel={tel}
        crumbs={[['/services', 'Services']]}
        eyebrow={`Roofing in ${b.town}`}
        title="Our services"
        lead={b.hero.lead}
        image={b.hero.image}
        imageAlt={b.hero.imageAlt}
      />
      {GROUPS.map(([key, label]) => {
        const items = services.filter((s) => groupOf(s) === key);
        if (!items.length) return null;
        return (
          <section key={key} className="pt-[clamp(3.5rem,7vw,5.5rem)] last-of-type:pb-[clamp(3.5rem,7vw,5.5rem)]">
            <div className={wrap}>
              <p className="mb-2 border-b-[3px] border-ink pb-3 font-heading text-[15px] font-semibold uppercase tracking-[0.18em] text-ink">
                {label}
              </p>
              <ul>
                {items.map((s) => (
                  <li key={s.slug} className="border-b border-ink/10">
                    <a
                      href={`/services/${s.slug}`}
                      className={`group grid items-center gap-5 py-6 text-ink no-underline sm:gap-8 ${s.image ? 'sm:grid-cols-[180px_minmax(0,1fr)_auto]' : 'sm:grid-cols-[minmax(0,1fr)_auto]'}`}
                    >
                      {s.image && (
                        <Img
                          className="aspect-[16/10] w-full object-cover [clip-path:polygon(0_0,100%_0,90%_100%,0_100%)]"
                          src={s.image}
                          alt=""
                          sizes="(min-width: 640px) 180px, 100vw"
                        />
                      )}
                      <span className="min-w-0">
                        <span className={`${h3} block text-[clamp(1.5rem,1.2rem+1vw,2rem)] group-hover:text-primary`}>{s.title}</span>
                        {s.text && <span className="mt-2 block max-w-[46rem] leading-[1.6] text-ink/75">{s.text}</span>}
                      </span>
                      <span className="hidden h-12 w-12 place-items-center border-2 border-ink transition group-hover:bg-ink group-hover:text-white sm:grid">
                        <ArrowRight size={20} aria-hidden="true" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
      <div className="h-[clamp(3.5rem,7vw,5.5rem)]" aria-hidden="true" />
      <ClaimStrip b={b} stormHref={stormHref} />
      <CtaBand b={b} tel={tel} />
    </>
  );
}

function ServicePage({ b, tel, s }) {
  const others = servicesOf(b).filter((o) => o.slug !== s.slug);
  const projects = list(b.projects).filter((p) => p.service === s.slug);
  const steps = list(b.claim?.steps);
  const promises = list(b.promises);
  const group = groupOf(s) === 'general' ? `Roofing in ${b.town}` : GROUPS.find(([key]) => key === groupOf(s))[1];
  // A service their site only names has no words for its page; the
  // inspection card then runs across the page instead of beside an empty column.
  const said = list(s.body).length > 0 || list(s.points).length > 0 || list(s.faqs).length > 0;
  return (
    <>
      <PageHero
        b={b}
        tel={tel}
        crumbs={[
          ['/services', 'Services'],
          [`/services/${s.slug}`, s.title],
        ]}
        eyebrow={group}
        title={s.title}
        lead={s.text}
        image={s.image || b.hero.image}
        imageAlt={s.image ? s.imageAlt : b.hero.imageAlt}
      />
      <section className={pad}>
        <div className={`${wrap} grid items-start gap-12 ${said ? 'lg:grid-cols-[minmax(0,1fr)_380px]' : ''} lg:gap-16`}>
          <div className={said ? 'min-w-0' : 'hidden'}>
            {list(s.body).map((para) => (
              <p key={para.slice(0, 40)} className="mb-5 max-w-[44rem] text-[17px] leading-[1.7] text-ink/85 sm:text-[19px]">
                {para}
              </p>
            ))}
            {list(s.points).length > 0 && (
              <div className="mt-10">
                <h2 className={`${h3} mb-5 text-[26px]`}>What&apos;s included</h2>
                <ul className="grid gap-px border-2 border-ink bg-ink sm:grid-cols-2">
                  {list(s.points).map((p) => (
                    <li key={p} className="flex items-start gap-3 bg-white p-5 text-[16px] font-medium leading-snug sm:last:odd:col-span-2">
                      <Check size={20} strokeWidth={3} className="mt-0.5 flex-none text-primary" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {list(s.faqs).length > 0 && (
              <div className="mt-14">
                <h2 className={`${h3} mb-4 text-[26px]`}>Common questions</h2>
                {list(s.faqs).map((f) => (
                  <details key={f.q} className="group border-b-2 border-ink/10 [&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-[18px] font-semibold text-ink">
                      {f.q}
                      <Plus size={22} className="flex-none text-primary transition group-open:rotate-45" aria-hidden="true" />
                    </summary>
                    <p className="pb-5 text-[17px] leading-[1.65] text-ink/80">{f.a}</p>
                  </details>
                ))}
              </div>
            )}
          </div>
          <aside
            className={`bg-ink p-7 text-white sm:p-8 ${
              said ? `lg:sticky ${b.preview ? 'lg:top-[150px]' : 'lg:top-[108px]'}` : 'lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-x-12'
            }`}
          >
            <p className={`${h3} text-[24px]`}>Free {inspected(s.title)}inspection</p>
            <a href={tel} className="mt-4 flex min-h-[48px] items-center gap-3 font-heading text-[28px] font-semibold tracking-[0.03em] text-accent no-underline">
              <Phone size={22} aria-hidden="true" /> {b.phone}
            </a>
            <a href="/contact" className={`${hot} mt-4 w-full ${said ? '' : 'lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:w-auto'}`}>
              Book an Inspection
            </a>
            {promises.length > 0 && (
              <div className={`mt-7 border-t border-white/15 pt-7 ${said ? '' : 'lg:col-span-2'}`}>
                <Promises items={promises} dark />
              </div>
            )}
          </aside>
        </div>
      </section>
      {s.claim && steps.length > 0 && (
        <section className={`bg-surface ${pad}`}>
          <div className={`${wrap} grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16`}>
            <div>
              <Eyebrow>Insurance claims</Eyebrow>
              <h2 className={h2}>{b.claim.title}</h2>
              {b.claim.text && <p className="mt-5 text-[17px] leading-[1.6] text-ink/75 sm:text-[18px]">{b.claim.text}</p>}
            </div>
            <ol className="relative grid gap-0 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-[3px] before:bg-ink/15">
              {steps.map((st, i) => (
                <li key={st.title} className="relative flex gap-6 pb-8 last:pb-0">
                  <span className="relative grid h-14 w-14 flex-none place-items-center bg-ink font-heading text-[22px] font-bold text-accent">
                    {pad2(i + 1)}
                  </span>
                  <div className="min-w-0 pt-2">
                    <h3 className={`${h3} text-[22px]`}>{st.title}</h3>
                    <p className="mt-1.5 text-[17px] leading-[1.6] text-ink/75">{st.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
      {s.materials && <Materials b={b} className={s.claim ? 'bg-white' : 'bg-surface'} />}
      <Projects items={projects} title={`Recent ${s.title.toLowerCase()} work`} />
      {others.length > 0 && (
        <section className={`border-t border-ink/10 ${pad}`}>
          <div className={wrap}>
            <Eyebrow>More services</Eyebrow>
            <h2 className={`${h2} mb-8`}>Other roof work we do</h2>
            <ul className="grid gap-x-10 md:grid-cols-2">
              {others.map((o, i) => (
                <li key={o.slug} className="border-b border-ink/10">
                  <a href={`/services/${o.slug}`} className="group flex min-h-[72px] items-center gap-5 py-4 text-ink no-underline">
                    <span className="w-[1.5em] flex-none font-heading text-[15px] font-semibold tabular-nums text-primary">{pad2(i + 1)}</span>
                    <span className="min-w-0 flex-1">
                      <span className={`${h3} block text-[21px] group-hover:text-primary`}>{o.title}</span>
                      {shortOf(o) && <span className="mt-1 block text-[15px] leading-snug text-ink/65">{shortOf(o)}</span>}
                    </span>
                    <ArrowRight size={18} className="flex-none text-primary transition group-hover:translate-x-1" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <CtaBand b={b} tel={tel} />
    </>
  );
}

function AreasPage({ b, tel }) {
  const towns = list(b.serviceArea);
  return (
    <>
      <PageHero
        b={b}
        tel={tel}
        crumbs={[['/service-areas', 'Service Areas']]}
        eyebrow="Service areas"
        title={`Roofing in ${towns[0] || b.town}${towns.length > 1 ? ' and nearby' : ''}`}
        lead={b.areasText}
        image={b.areasImage || b.hero.image}
        imageAlt={b.areasImage ? b.areasImageAlt : b.hero.imageAlt}
      />
      {/* One town would be a lone card in an empty row; the hero and the address below already name it. */}
      {towns.length > 1 && (
        <section className={pad}>
          <div className={wrap}>
            <h2 className={`${h2} mb-10`}>Towns we serve</h2>
            <ul className={`grid gap-4 sm:grid-cols-2 ${towns.length > 2 ? 'lg:grid-cols-3' : ''}`}>
              {towns.map((t, i) => (
                <li
                  key={t}
                  id={townId(t)}
                  className={`${anchor} flex min-h-[132px] flex-col justify-between border-2 border-ink p-6 target:border-primary target:bg-surface`}
                >
                  <span className="font-heading text-[15px] font-semibold text-primary">{pad2(i + 1)}</span>
                  <span>
                    <span className={`${h3} block text-[28px]`}>{t}</span>
                    <span className="mt-1 block text-[15px] text-ink/65">
                      {t}, {b.state}
                      {t === b.town ? ' · home base' : ''}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {/* The menu's link to a lone town lands here, and the town heads it, so
          the page names where they work and not only where they are. */}
      <section
        id={towns.length > 1 ? undefined : townId(towns[0] || b.town)}
        className={`${towns.length > 1 ? '' : anchor} bg-surface ${pad}`}
      >
        <div className={`${wrap} grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16`}>
          <div>
            <Eyebrow>{towns.length > 1 ? 'Find us' : 'Where we work'}</Eyebrow>
            <h2 className={h2}>
              {towns.length > 1 ? (
                <>
                  {/* A suite number ("Ste 202-350") wraps whole, never at its hyphen. */}
                  {b.address.split(/(\S*\d-\d\S*)/).map((part, i) => (i % 2 ? <span key={part} className="whitespace-nowrap">{part}</span> : part))}, {b.town}
                </>
              ) : (
                `${towns[0] || b.town}, ${b.state}`
              )}
            </h2>
            <p className="mt-5 text-[17px] leading-[1.6] text-ink/75 sm:text-[18px]">
              {towns.length > 1 ? '' : `From our base at ${b.address}, ${b.town}. `}
              Not sure whether we reach you? Call and ask; if we cannot get there, we will say so.
            </p>
          </div>
          <div className="grid gap-3 sm:flex sm:flex-wrap lg:justify-end">
            <a href={mapsHref(b)} className={ghostLight}>
              <MapPin size={18} aria-hidden="true" /> Get Directions
            </a>
            <a href={tel} className={solid}>
              <Phone size={18} aria-hidden="true" /> {b.phone}
            </a>
          </div>
        </div>
      </section>
      <Reviews b={b} />
      <CtaBand b={b} tel={tel} />
    </>
  );
}

function AboutPage({ b, tel }) {
  const a = b.about;
  // The first paragraph leads the hero and the rest tell the story. A lone
  // paragraph tells the story, so the story is never a label over nothing.
  const lone = list(a.text).length < 2;
  return (
    <>
      <PageHero
        b={b}
        tel={tel}
        crumbs={[['/about', 'About']]}
        eyebrow={b.since ? `Since ${b.since}` : `About ${b.shortName}`}
        title={a.title}
        lead={lone ? null : list(a.text)[0]}
        image={a.image || b.hero.image}
        imageAlt={a.image ? a.imageAlt : b.hero.imageAlt}
      />
      <section className={pad}>
        <div className={`${wrap} grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20`}>
          <div>
            <Eyebrow>Our story</Eyebrow>
            {list(a.text)
              .slice(lone ? 0 : 1)
              .map((para) => (
                <p key={para.slice(0, 40)} className="mb-5 text-[17px] leading-[1.7] text-ink/85 sm:text-[19px]">
                  {para}
                </p>
              ))}
            {list(a.values).length > 0 && (
              <ol className="mt-10 grid gap-0">
                {list(a.values).map((v, i) => (
                  <li key={v.title} className="flex gap-5 border-t-2 border-ink py-6">
                    <span className="w-[1.5em] flex-none font-heading text-[32px] font-bold leading-none tabular-nums text-primary">{pad2(i + 1)}</span>
                    <div>
                      <h3 className={`${h3} text-[22px]`}>{v.title}</h3>
                      <p className="mt-1.5 text-[17px] leading-[1.6] text-ink/75">{v.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="grid content-start gap-5">
            <div className="bg-ink p-7 text-white sm:p-9">
              <p className={`${h3} mb-5 text-[22px]`}>{b.name}</p>
              <ul className="grid gap-4 text-[16px]">
                {b.since && (
                  <li className="flex justify-between gap-4 border-b border-white/15 pb-4">
                    <span className="text-white/65">In business since</span>
                    <strong>{b.since}</strong>
                  </li>
                )}
                {b.license && (
                  <li className="flex justify-between gap-4 border-b border-white/15 pb-4">
                    <span className="text-white/65">Coverage</span>
                    <strong className="text-right">{b.license}</strong>
                  </li>
                )}
                {ratingLine(b) && (
                  <li className="flex justify-between gap-4 border-b border-white/15 pb-4">
                    <span className="text-white/65">Google rating</span>
                    <strong className="text-right">{Number(b.rating).toFixed(1)} of 5</strong>
                  </li>
                )}
                <li className="flex justify-between gap-4">
                  <span className="text-white/65">Address</span>
                  <strong className="text-right">
                    {b.address}, {b.town}, {b.state} {b.zip}
                  </strong>
                </li>
              </ul>
            </div>
            <a href="/contact" className={solid}>
              Book a Free Inspection
            </a>
          </div>
        </div>
      </section>
      <Materials b={b} />
      <Reviews b={b} />
      <CtaBand b={b} tel={tel} />
    </>
  );
}

function ContactPage({ b, tel }) {
  const steps = list(b.inspection?.steps);
  return (
    <>
      <PageHero
        b={b}
        tel={tel}
        crumbs={[['/contact', 'Contact']]}
        eyebrow="Free inspection"
        title="Book a free roof inspection"
        lead={list(b.promises).length ? `${list(b.promises).slice(0, 2).join('. ')}.` : null}
        image={b.contactImage || b.hero.image}
        imageAlt={b.contactImage ? b.contactImageAlt : b.hero.imageAlt}
      />
      <section id="inspection" className={`${anchor} ${pad}`}>
        <div className={`${wrap} grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16`}>
          <div>
            <h2 className={`${h3} mb-5 text-[26px]`}>Reach us</h2>
            <ContactLines b={b} tel={tel} />
            {list(b.hours).length > 0 && (
              <div className="mt-8">
                <h2 className={`${h3} mb-2 text-[22px]`}>Hours</h2>
                <Hours b={b} />
              </div>
            )}
            {steps.length > 0 && (
              <div className="mt-12 bg-ink p-7 text-white sm:p-8">
                <p className={`${h3} mb-6 text-[22px]`}>{b.inspection.title}</p>
                <ol className="grid gap-5">
                  {steps.map((st, i) => (
                    <li key={st.title} className="flex gap-4">
                      <span className="w-[1.5em] flex-none font-heading text-[26px] font-bold leading-none tabular-nums text-accent">{pad2(i + 1)}</span>
                      <div>
                        <h3 className="text-[17px] font-semibold">{st.title}</h3>
                        <p className="mt-1 text-[16px] leading-[1.55] text-white/70">{st.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
          <div className="border-t-4 border-primary bg-surface p-6 sm:p-10">
            <h2 className={`${h3} mb-7 text-[28px]`}>Request a free inspection</h2>
            <InspectionForm b={b} />
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------- root */

/**
 * On localhost and preview URLs the business and page are named by ?b= and
 * ?p=, so a root-relative link would lose them. Clicks are rewritten there;
 * a prerendered page has neither and its links are left alone.
 */
function keepQuery(event) {
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

export default function Roofing({ b, path = '' }) {
  const tel = telHref(b.phone);
  const rating = ratingLine(b);
  const services = servicesOf(b);
  const storm = services.find((s) => s.claim);
  const stormHref = storm ? `/services/${storm.slug}` : null;
  const vars = {
    ...displayVars(b.brand),
    ...brandVars(b.brand),
    '--on-primary': onColor(b.brand.primary),
    '--on-accent': onColor(b.brand.accent),
  };

  let page;
  if (path === 'services') page = <ServicesIndex b={b} tel={tel} stormHref={stormHref} />;
  else if (path.startsWith('services/') && services.some((s) => `services/${s.slug}` === path))
    page = <ServicePage b={b} tel={tel} s={services.find((s) => `services/${s.slug}` === path)} />;
  else if (path === 'service-areas') page = <AreasPage b={b} tel={tel} />;
  else if (path === 'about' && b.about) page = <AboutPage b={b} tel={tel} />;
  else if (path === 'contact') page = <ContactPage b={b} tel={tel} />;
  else page = <HomePage b={b} tel={tel} rating={rating} stormHref={stormHref} />;

  return (
    <div className="overflow-x-clip bg-white font-body text-[16px] text-ink antialiased" style={vars} onClickCapture={keepQuery}>
      <UtilityBar b={b} tel={tel} />
      <Header b={b} tel={tel} />
      <main>{page}</main>
      {!path && <Facts b={b} />}
      <Footer b={b} tel={tel} />
      <div
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 bg-ink md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <a href={tel} className="flex min-h-[56px] items-center justify-center gap-2 px-2 font-heading text-[17px] font-semibold uppercase tracking-[0.06em] text-white no-underline">
          <Phone size={18} className="flex-none text-accent" aria-hidden="true" /> Call Now
        </a>
        <a
          href="/contact"
          className="flex min-h-[56px] items-center justify-center bg-primary px-2 font-heading text-[17px] font-semibold uppercase tracking-[0.06em] text-[color:var(--on-primary)] no-underline"
        >
          Free Inspection
        </a>
      </div>
    </div>
  );
}
