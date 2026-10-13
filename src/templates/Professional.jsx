/**
 * Professional services: insurance agencies, accounting firms, title
 * companies, law firms, dental offices and chiropractors. A site of several
 * pages, each prerendered at its own address.
 *
 * Pages: '' (home), 'services', 'services/<slug>' for every service line,
 * 'team' (only when the brand lists people), 'about', 'resources' (only when
 * the brand has faqs or resources) and 'contact'. Services opens a mega menu
 * grouped by audience on desktop and an accordion in the mobile menu.
 *
 * BRAND FILE (src/brands/<slug>.json). Required unless marked optional.
 *
 *   template      "professional"
 *   preview       optional. true on a prospect's preview (shows the preview bar); left out on a sample.
 *   kind          "insurance" | "accounting" | "title" | "legal" | "dental" | "chiropractic". Sets the defaults
 *                 below when a field is left out: the call-to-action label (Get a Quote / Schedule a Consultation /
 *                 Open a Title Order / Request an Appointment),
 *                 the affiliations heading, and who "talk it through with" names.
 *   talk          optional. Overrides who "talk it through with" names, for a practice of one ("Matt").
 *   name          the business's full legal or trading name, as on its own site.
 *   shortName     the name used in running copy and when there is no logo.
 *   tagline       optional. One line under the logo in the footer and in the top bar on desktop.
 *   phone         "(281) 555-0163" form. Every call button dials it.
 *   email         the office address the contact page lists.
 *   address       street line, with suite. town, state: "Baytown", "TX". zip: optional.
 *   since         optional. Year founded, shown beside the rating in the hero.
 *   license       optional. One line of license or regulatory text for the footer.
 *   rating        optional. Google star rating, with reviewCount (both or neither).
 *   reviewCount   optional. Number of Google reviews.
 *   hours         [[day, time], ...]. The first row is shown in the top bar; every row on the contact page and footer.
 *   cta           optional. { label, text }. label is the main button ("Get a Quote", "Schedule a Consultation").
 *                 text is one sentence under the closing call to action and on the contact page.
 *   brand         { primary, primaryDeep (optional), accent, ink, muted (optional), surface, cream, line,
 *                   heading, body, fonts (Google Fonts stylesheet URL), logo (path or null), logoWidth (optional px) }
 *                 primary carries buttons and headings' accents and should be a deep navy, forest or similar
 *                 taken from the brand; surface and cream are light warm grounds; line is the hairline color.
 *                 A serif heading face (Libre Baskerville, Source Serif 4) over a clean sans body reads best.
 *   hero          { eyebrow (optional), title, lead, image, imageAlt, points (optional, up to 3 short strings) }
 *                 image is a portrait or office photo, a "/brands/<slug>/<name>" path with -800 and -1600 webp beside it.
 *   overview      optional. { title, text } heading the service grid on the home and services pages.
 *   audiences     optional. { individuals, businesses } labels for the two groups. Defaults "Individuals" / "Businesses".
 *   services      [ ...service lines, at least one ]. Each:
 *                   slug      url segment, lowercase-hyphenated: "auto", "tax-preparation", "residential-closings".
 *                   title     Title Case name: "Auto Insurance", "Bookkeeping".
 *                   audience  optional. "individuals" | "businesses". Groups the grid and the mega menu.
 *                             When no service names one, the grid is one ungrouped list.
 *                   icon      optional. A key from src/templates/professional/icons.js ("car", "house", "calculator"...).
 *                   summary   one short line for the mega menu, under 50 characters.
 *                   text      one or two sentences for the service card.
 *                   lead      optional. The opening paragraph of the service's own page. Falls back to text, then to a line naming the business and its town.
 *                   image     optional. Photo for the service page hero; without one the hero shows a contact card.
 *                   imageAlt  optional, with image.
 *                   covers    optional. [{ title, text }] what the service includes, two to six.
 *                   questions optional. [{ q, a }] questions about this service.
 *   process       optional. { title, text (optional), steps: [{ title, text }] } the "how we work" timeline, 2 to 5 steps.
 *   affiliations  optional. { title (optional), items: [strings] } carriers, underwriters or memberships, as text badges.
 *                 Only names the brand's own site lists.
 *   about         { title, text (string or [paragraphs]), image (optional), imageAlt (optional),
 *                   values (optional) [{ title, text }] }
 *   team          optional. [{ name, role, bio (optional), image (optional), imageAlt (optional) }]. Names and
 *                 roles only as the brand's own site gives them. Without it there is no team page.
 *   faqs          optional. [{ q, a }] general questions for the resources page.
 *   resources     optional. [{ title, text, href }] outside links worth having (state regulator, flood maps).
 *   serviceArea   optional. [towns] listed on the about and contact pages.
 *   reviews       optional. [{ author, where (optional), text }] Google reviews, quoted as written.
 */
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronDown, Clock, ExternalLink, Mail, MapPin, Menu, Phone, Plus, X } from 'lucide-react';
import { brandVars, displayVars, mapsHref, telHref } from '../site.js';
import { BrandLogo, EnquiryForm, Img, Stars, Facts, StudioCredit } from './shared.jsx';
import { iconFor } from './professional/icons.js';

const KIND = {
  insurance: { cta: 'Get a Quote', affiliations: 'Carriers we represent', talk: 'an agent' },
  accounting: { cta: 'Schedule a Consultation', affiliations: 'Credentials and memberships', talk: 'our team' },
  title: { cta: 'Open a Title Order', affiliations: 'Underwriters we write for', talk: 'our closing team' },
  legal: { cta: 'Schedule a Consultation', affiliations: 'Bar admissions and memberships', talk: 'an attorney' },
  dental: { cta: 'Request an Appointment', affiliations: 'Memberships and credentials', talk: 'our front desk' },
  chiropractic: { cta: 'Request an Appointment', affiliations: 'Memberships and credentials', talk: 'our front desk' },
};

const wrap = 'mx-auto w-full max-w-page px-gutter';
const pad = 'py-[clamp(4rem,8vw,6.5rem)]';
const h2 = 'font-heading font-display-2 text-[clamp(1.8rem,1.25rem+2vw,2.6rem)] leading-[1.14] text-ink [text-wrap:balance]';
const lead = 'text-[17px] leading-[1.65] text-muted sm:text-lg';
const btn =
  'inline-flex min-h-[50px] items-center justify-center gap-2 rounded-md px-6 text-[15px] font-semibold tracking-[0.01em] no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const solid = `${btn} bg-primary text-white hover:bg-[color-mix(in_srgb,var(--primary)_84%,#000)]`;
const line = `${btn} border-[1.5px] border-primary/35 text-primary hover:border-primary hover:bg-primary/[0.04]`;
const white = `${btn} bg-white text-primary hover:bg-surface`;
const ghost = `${btn} border-[1.5px] border-white/45 text-white hover:border-white hover:bg-white/10`;
const cardLink = 'rounded-lg border border-line bg-white transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_22px_40px_-28px_rgba(15,30,50,0.45)]';

const GRID = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 xl:grid-cols-4' };
const STEPS = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' };

/** The columns, up to `most`, that leave the last row of `n` cards fullest: six cards sit three and three, not four and two. */
function columns(n, most) {
  if (n <= most) return n;
  const gap = (c) => (c - (n % c)) % c;
  let best = most;
  for (let c = most - 1; c >= 3; c--) if (gap(c) < gap(best)) best = c;
  return best;
}

const list = (value) => (Array.isArray(value) ? value : []);
const paras = (value) => (Array.isArray(value) ? value : value ? [value] : []);

function Eyebrow({ children, className = '', light = false }) {
  return (
    <p className={`mb-4 flex items-center gap-3 text-[12.5px] font-bold uppercase tracking-[0.18em] ${light ? 'text-white/85' : 'text-accent'} ${className}`}>
      <span aria-hidden="true" className={`h-px w-7 flex-none ${light ? 'bg-white/60' : 'bg-accent'}`} />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/** The service lines split by audience, in brand-file order. One unnamed group when none says. */
function groupsOf(b) {
  const services = list(b.services);
  const labels = { individuals: 'Individuals', businesses: 'Businesses', ...(b.audiences || {}) };
  if (!services.some((s) => s.audience)) return [{ key: 'all', label: null, items: services }];
  return ['individuals', 'businesses']
    .map((key) => ({
      key,
      label: labels[key],
      items: services.filter((s) => (s.audience || 'individuals') === key),
    }))
    .filter((g) => g.items.length);
}

export function pages(b) {
  const out = ['services', ...list(b.services).map((s) => `services/${s.slug}`)];
  if (list(b.team).length) out.push('team');
  out.push('about');
  if (list(b.faqs).length || list(b.resources).length) out.push('resources');
  out.push('contact');
  return out;
}

/* ------------------------------------------------------------------ header */

function TopBar({ b, tel }) {
  const first = list(b.hours)[0];
  return (
    <div className="bg-primary-deep text-sm text-white/75">
      <div className={`${wrap} flex min-h-10 items-center justify-between gap-4`}>
        {b.tagline && <p className="hidden min-w-0 truncate lg:block">{b.tagline}</p>}
        {first && (
          <p className="flex min-w-0 items-center gap-2 lg:hidden">
            <Clock size={14} className="flex-none text-white/60" aria-hidden="true" />
            <span className="truncate">
              {first[0]} {first[1]}
            </span>
          </p>
        )}
        <div className="ml-auto flex flex-none items-center gap-7">
          {first && (
            <span className="hidden items-center gap-2 lg:flex">
              <Clock size={15} className="text-white/60" aria-hidden="true" />
              {first[0]}&nbsp;&nbsp;{first[1]}
            </span>
          )}
          <a href={tel} className="flex min-h-11 items-center gap-2 font-bold text-white no-underline hover:underline">
            <Phone size={14} className="text-white/60" aria-hidden="true" />
            {b.phone}
          </a>
        </div>
      </div>
    </div>
  );
}

function MegaMenu({ b, groups, path, k, open, id }) {
  return (
    <div id={id} hidden={!open} className="absolute inset-x-0 top-full pt-2">
      <div className={wrap}>
        <div className="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)_250px] gap-8 rounded-lg border border-line bg-white p-8 shadow-[0_40px_80px_-40px_rgba(15,30,50,0.45)] xl:gap-10 xl:p-9">
          {groups.map((g) => (
            <div key={g.key} className={groups.length === 1 ? 'col-span-2' : ''}>
              {g.label && <p className="mb-2 px-3 text-xs font-bold uppercase tracking-[0.16em] text-muted">{g.label}</p>}
              <ul className={groups.length === 1 ? 'grid grid-cols-2 gap-x-6' : ''}>
                {g.items.map((s) => {
                  const Icon = iconFor(s.icon);
                  const here = path === `services/${s.slug}`;
                  return (
                    <li key={s.slug}>
                      <a
                        href={`/services/${s.slug}`}
                        aria-current={here ? 'page' : undefined}
                        className={`flex gap-3.5 rounded-xl p-3 no-underline transition-colors hover:bg-surface focus-visible:bg-surface ${here ? 'bg-surface' : ''}`}
                      >
                        <Icon size={24} strokeWidth={1.25} className="mt-0.5 flex-none text-primary" aria-hidden="true" />
                        <span className="grid gap-0.5">
                          <span className="font-semibold text-ink">{s.title}</span>
                          {s.summary && <span className="text-sm leading-snug text-muted">{s.summary}</span>}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <div className="flex flex-col gap-3 self-start rounded-lg bg-primary p-7 text-white">
            <p className="font-heading text-lg leading-snug">Not sure what you need?</p>
            <p className="text-[15px] leading-relaxed text-white/80">Call and talk it through with {k.talk}.</p>
            <a href={telHref(b.phone)} className="inline-flex min-h-11 items-center text-lg font-bold text-white no-underline hover:underline">
              {b.phone}
            </a>
            <a href="/services" className="inline-flex min-h-11 items-center gap-1.5 font-bold text-white no-underline hover:underline">
              All Services <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ b, path, k, groups, nav, tel, ctaLabel }) {
  const [mega, setMega] = useState(false);
  const [menu, setMenu] = useState(false);
  const [section, setSection] = useState(null);
  const timer = useRef(null);
  const openedAt = useRef(0);
  const trigger = useRef(null);
  const stick = b.preview ? 'top-11' : 'top-0';
  const inServices = path === 'services' || path.startsWith('services/');

  const show = () => {
    clearTimeout(timer.current);
    setMega((was) => {
      if (!was) openedAt.current = Date.now();
      return true;
    });
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMega(false), 140);
  };

  useEffect(() => {
    if (!mega && !menu) return undefined;
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (mega) trigger.current?.focus();
      setMega(false);
      setMenu(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mega, menu]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const navLink = (here) =>
    `relative inline-flex min-h-11 min-w-11 items-center justify-center gap-1 whitespace-nowrap text-[15px] font-semibold no-underline transition-colors xl:text-base ${
      here ? 'text-head-ink after:absolute after:inset-x-0 after:bottom-1.5 after:h-0.5 after:bg-accent' : 'text-head-ink hover:text-head-hover'
    }`;

  return (
    <header className={`sticky ${stick} z-40 border-b border-head-line bg-head`}>
      <div className={`${wrap} flex h-[76px] items-center gap-4 lg:h-[92px] lg:gap-6`}>
        <a href="/" className="flex min-h-11 min-w-0 max-w-[62vw] flex-initial items-center no-underline lg:max-w-[280px] lg:flex-none" aria-label={`${b.name} home`}>
          <BrandLogo b={b} textClass="text-head-ink" />
        </a>

        <nav aria-label="Main" className="ml-auto hidden self-stretch lg:block">
          <ul className="flex h-full items-center gap-6 xl:gap-9">
            {/* Full header height, so the pointer stays inside it on the way down to the menu. */}
            <li
              className="flex h-full items-center"
              onMouseEnter={show}
              onMouseLeave={hide}
              onFocus={show}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) hide();
              }}
            >
              <button
                ref={trigger}
                type="button"
                className={`${navLink(inServices)} cursor-pointer bg-transparent`}
                aria-expanded={mega}
                aria-controls="services-menu"
                onClick={() => {
                  if (mega && Date.now() - openedAt.current > 400) setMega(false);
                  else show();
                }}
              >
                Services
                <ChevronDown size={16} className={`transition-transform ${mega ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <MegaMenu b={b} groups={groups} path={path} k={k} open={mega} id="services-menu" />
            </li>
            {nav.map(([href, label]) => (
              <li key={href}>
                <a href={`/${href}`} className={navLink(path === href)} aria-current={path === href ? 'page' : undefined}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex flex-none items-center gap-2 lg:ml-0">
          <a href="/contact" className={`${solid} hidden lg:inline-flex`}>
            {ctaLabel}
          </a>
          <a href={tel} aria-label={`Call ${b.phone}`} className="grid size-11 place-items-center rounded-md border border-head-line text-head-ink lg:hidden">
            <Phone size={19} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border border-head-line bg-transparent px-4 font-semibold text-head-ink lg:hidden"
            aria-expanded={menu}
            aria-controls="site-menu"
            onClick={() => setMenu((v) => !v)}
          >
            {menu ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
            {menu ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      <div
        id="site-menu"
        hidden={!menu}
        className={`absolute inset-x-0 top-full overflow-y-auto border-b border-line bg-white shadow-[0_30px_50px_-30px_rgba(15,30,50,0.45)] lg:hidden ${
          b.preview ? 'max-h-[calc(100dvh-160px)]' : 'max-h-[calc(100dvh-116px)]'
        }`}
      >
        <nav aria-label="Mobile" className={`${wrap} pb-6 pt-2`}>
          <ul>
            {groups.map((g) => {
              const label = g.label || 'Services';
              const open = section === g.key;
              return (
                <li key={g.key} className="border-b border-line">
                  <button
                    type="button"
                    className="flex min-h-14 w-full cursor-pointer items-center justify-between bg-transparent text-left font-heading text-lg text-ink"
                    aria-expanded={open}
                    aria-controls={`menu-${g.key}`}
                    onClick={() => setSection(open ? null : g.key)}
                  >
                    {label}
                    <ChevronDown size={20} className={`flex-none text-primary transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  <ul id={`menu-${g.key}`} hidden={!open} className="pb-3">
                    {g.items.map((s) => {
                      const Icon = iconFor(s.icon);
                      return (
                        <li key={s.slug}>
                          <a
                            href={`/services/${s.slug}`}
                            className="flex min-h-12 items-center gap-3 rounded-xl px-2 text-base font-semibold text-ink no-underline hover:bg-surface"
                            aria-current={path === `services/${s.slug}` ? 'page' : undefined}
                          >
                            <Icon size={22} strokeWidth={1.25} className="flex-none text-primary" aria-hidden="true" />
                            {s.title}
                          </a>
                        </li>
                      );
                    })}
                    <li>
                      <a href="/services" className="flex min-h-12 items-center gap-1.5 px-2 text-base font-bold text-primary no-underline">
                        All Services <ArrowRight size={16} aria-hidden="true" />
                      </a>
                    </li>
                  </ul>
                </li>
              );
            })}
            {nav.map(([href, label]) => (
              <li key={href} className="border-b border-line">
                <a
                  href={`/${href}`}
                  className="flex min-h-14 items-center justify-between font-heading text-lg text-ink no-underline"
                  aria-current={path === href ? 'page' : undefined}
                >
                  {label} <ArrowRight size={18} className="text-primary" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            <a href="/contact" className={solid}>
              {ctaLabel}
            </a>
            <a href={tel} className={line}>
              <Phone size={17} aria-hidden="true" /> {b.phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- sections */

function Crumbs({ trail }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 lg:mb-8">
      <ol className="flex flex-wrap items-center gap-x-2 text-[15px] text-muted">
        {trail.map(([href, label], i) => (
          <li key={label} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className="text-line">
                /
              </span>
            )}
            {href ? (
              <a href={href} className="inline-flex min-h-11 min-w-11 items-center text-muted no-underline hover:text-primary hover:underline">
                {label}
              </a>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">
                {label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function PageHero({ eyebrow, title, text, trail, image, imageAlt, aside, children }) {
  const split = image || aside;
  return (
    <section className="border-b border-line bg-surface">
      <div className={`${wrap} pb-[clamp(3rem,7vw,5.5rem)] pt-4 lg:pt-6`}>
        <Crumbs trail={trail} />
        <div className={`grid items-center gap-10 ${split ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-20' : ''}`}>
          <div className="min-w-0 max-w-3xl">
            {eyebrow}
            <h1 className="break-words font-heading font-display text-[clamp(2.15rem,1.4rem+3vw,3.5rem)] leading-[1.1] text-ink [text-wrap:balance]">
              {title}
            </h1>
            {text && <p className={`mt-5 max-w-2xl ${lead}`}>{text}</p>}
            {children}
          </div>
          {/* Drawn in its own shape and no taller than the band, so a portrait keeps the head and is not blown up to the column's width. */}
          {image && (
            <Img
              className="h-auto max-h-[30rem] w-auto max-w-full justify-self-center rounded-lg lg:justify-self-end"
              src={image}
              alt={imageAlt || ''}
              sizes="(max-width: 1024px) 100vw, 45vw"
              eager
            />
          )}
          {!image && aside}
        </div>
      </div>
    </section>
  );
}

/** The office at a glance, for a hero with no photo: the call, the hours, the address. */
function OfficePanel({ b, tel, ctaLabel }) {
  const hours = list(b.hours);
  return (
    <aside className="rounded-lg bg-white p-6 text-ink shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] sm:p-8">
      <p className="text-[12.5px] font-bold uppercase tracking-[0.18em] text-accent">Call the office</p>
      <a href={tel} className="mt-2 flex min-h-11 items-center gap-3 font-heading font-display-2 text-[1.7rem] text-primary no-underline hover:underline">
        <Phone size={22} aria-hidden="true" /> {b.phone}
      </a>
      <a href={mapsHref(b)} className="mt-3 flex items-start gap-3 border-t border-line pt-4 text-[15px] leading-relaxed text-ink no-underline hover:text-primary">
        <MapPin size={17} className="mt-1 flex-none text-accent" aria-hidden="true" />
        <span>
          {b.address}
          <br />
          {b.town}, {b.state} {b.zip}
        </span>
      </a>
      {hours.length > 0 && (
        <dl className="mt-4 grid gap-1.5 border-t border-line pt-4 text-[15px]">
          {hours.map(([day, time]) => (
            <div key={day} className="flex justify-between gap-4">
              <dt className="text-muted">{day}</dt>
              <dd className="m-0 text-right font-semibold text-ink">{time}</dd>
            </div>
          ))}
        </dl>
      )}
      <a href="/contact" className={`${solid} mt-6 w-full`}>
        {ctaLabel} <ArrowRight size={17} aria-hidden="true" />
      </a>
    </aside>
  );
}

/**
 * The home page's opening. With a photo good enough to lead (the build gives
 * one only when it is wide and sharp enough), the photo fills the band under
 * a wash of the brand's deep color. Without one, the band is that color alone
 * and the office's own details stand where a photo would.
 */
function Hero({ b, tel, ctaLabel }) {
  const points = list(b.hero.points).slice(0, 3);
  const image = b.hero.image;
  return (
    <section className="relative isolate overflow-hidden bg-primary-deep text-white">
      {image ? (
        <>
          {/* On a phone the photo is shown whole above the words; from lg up it fills the band's right part and
              fades into the brand's color, so the words stand on that color rather than over the people in it. */}
          <Img
            className="relative block aspect-[16/10] w-full object-cover object-[center_30%] lg:absolute lg:inset-y-0 lg:right-0 lg:-z-20 lg:aspect-auto lg:h-full lg:w-[56%]"
            src={image}
            alt={b.hero.imageAlt || ''}
            sizes="100vw"
            eager
            data-backdrop=""
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 hidden lg:block lg:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--primaryDeep)_94%,#000)_0%,var(--primaryDeep)_44%,color-mix(in_srgb,var(--primaryDeep)_30%,transparent)_62%,transparent_80%)]"
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_10%,color-mix(in_srgb,var(--primary)_55%,transparent),transparent_60%),linear-gradient(135deg,color-mix(in_srgb,var(--primaryDeep)_92%,#000),var(--primaryDeep))]"
        />
      )}
      <div
        className={`${wrap} grid items-center gap-12 py-12 sm:py-20 lg:py-28 ${
          image ? 'lg:min-h-[min(660px,80vh)]' : 'lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-20'
        }`}
      >
        <div className="min-w-0 max-w-[44rem]">
          {b.hero.eyebrow && <Eyebrow light>{b.hero.eyebrow}</Eyebrow>}
          <h1 className="break-words font-heading font-display text-[clamp(2.3rem,1.3rem+3.6vw,4.1rem)] leading-[1.06] text-white [text-wrap:balance]">
            {b.hero.title}
          </h1>
          <p className="mt-6 max-w-[36rem] text-[17px] leading-[1.65] text-white/85 sm:text-[19px]">{b.hero.lead}</p>
          <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
            <a href="/contact" className={white}>
              {ctaLabel} <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href={tel} className={ghost}>
              <Phone size={17} aria-hidden="true" /> {b.phone}
            </a>
          </div>
          {points.length > 0 && (
            <ul className="mt-10 grid gap-3 border-t border-white/20 pt-7 sm:grid-cols-3 sm:gap-5">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-2.5 text-[15px] font-semibold leading-snug text-white">
                  <Check size={18} strokeWidth={2.2} className="mt-0.5 flex-none text-white/70" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
        {!image && (
          <div className="min-w-0">
            <OfficePanel b={b} tel={tel} ctaLabel={ctaLabel} />
          </div>
        )}
      </div>
    </section>
  );
}

/** The few numbers that are true of the business, in a strip under the hero. */
function Stats({ b }) {
  const rated = b.rating && b.reviewCount;
  const towns = list(b.serviceArea);
  const items = [
    rated && { value: Number(b.rating).toFixed(1), label: 'Google rating', stars: true },
    rated && { value: b.reviewCount.toLocaleString('en-US'), label: 'Google reviews' },
    b.since && { value: String(b.since), label: `Serving ${b.town} since` },
    towns.length >= 3 && { value: String(towns.length), label: 'Towns served' },
  ].filter(Boolean);
  // A lone figure is no strip: it would sit in a wide box of its own.
  if (items.length < 2) return null;
  const cols = ['', '', 'grid-cols-2', 'grid-cols-2 md:grid-cols-3', 'grid-cols-2 md:grid-cols-4'][items.length];
  return (
    <section aria-label={`${b.shortName} in numbers`} className="border-b border-line bg-white">
      <div className={`${wrap}`}>
        <ul className={`grid ${cols} border-x border-line`}>
          {items.map((item, i) => (
            <li key={item.label} className={`flex flex-col items-center justify-center gap-1.5 px-4 py-7 text-center ${i ? 'border-l border-line' : ''} ${i >= 2 ? 'max-md:border-t' : ''}`}>
              <strong className="font-heading font-display text-[clamp(1.8rem,1.4rem+1.4vw,2.4rem)] leading-none text-primary">{item.value}</strong>
              {item.stars && <Stars value={b.rating} size={14} />}
              <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-muted">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Affiliations({ b, k, className = '' }) {
  const items = list(b.affiliations?.items);
  if (!items.length) return null;
  return (
    <section aria-label={b.affiliations.title || k.affiliations} className={`border-y border-line bg-surface ${className}`}>
      <div className={`${wrap} flex flex-col gap-4 py-8 lg:flex-row lg:items-center lg:gap-10`}>
        <h2 className="flex-none text-[13px] font-bold uppercase tracking-[0.16em] text-muted">{b.affiliations.title || k.affiliations}</h2>
        <ul className="flex flex-wrap gap-2.5">
          {items.map((name) => (
            <li key={name} className="rounded-full border border-line bg-white px-4 py-2 font-heading text-base text-ink sm:text-sm">
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ServiceCard({ s, compact = false }) {
  const Icon = iconFor(s.icon);
  if (compact) {
    return (
      <a href={`/services/${s.slug}`} className={`group flex h-full items-center gap-4 p-5 text-ink no-underline ${cardLink}`}>
        <span className="grid size-12 flex-none place-items-center rounded-md bg-primary/[0.07] text-primary">
          <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 font-heading font-display-2 text-[1.15rem] leading-snug">{s.title}</span>
        <ArrowRight size={18} className="flex-none text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </a>
    );
  }
  return (
    <a href={`/services/${s.slug}`} className={`group flex h-full gap-4 p-5 text-ink no-underline sm:flex-col sm:gap-0 sm:p-6 lg:p-7 ${cardLink}`}>
      <span className="grid size-12 flex-none place-items-center rounded-md bg-primary/[0.07] text-primary sm:size-[52px]">
        <Icon size={26} strokeWidth={1.5} aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <h3 className="mb-2 mt-2 font-heading font-display-2 text-[1.2rem] leading-snug sm:mb-2.5 sm:mt-5">{s.title}</h3>
        <span className="mb-4 text-base leading-[1.6] text-muted sm:mb-5">{s.text}</span>
        <span className="mt-auto inline-flex items-center gap-1.5 font-bold text-primary">
          Learn More <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </span>
    </a>
  );
}

function ServiceGrid({ groups }) {
  // Most lines with nothing to say beyond their name are drawn as a list of
  // links rather than as cards with an empty middle.
  const all = groups.flatMap((g) => g.items);
  const compact = all.filter((s) => !s.text).length * 2 >= all.length;
  return (
    <div className="grid gap-12">
      {groups.map((g) => (
        <div key={g.key}>
          {g.label && (
            <div className="mb-5 flex items-center gap-4">
              <h3 className="flex-none text-[12.5px] font-bold uppercase tracking-[0.18em] text-primary">{g.label}</h3>
              <span aria-hidden="true" className="h-px flex-1 bg-line" />
            </div>
          )}
          <ul className={`grid gap-4 lg:gap-5 ${GRID[columns(g.items.length, compact ? 3 : 4)]}`}>
            {g.items.map((s) => (
              <li key={s.slug}>
                <ServiceCard s={s} compact={compact} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Services({ b, groups, heading = true }) {
  return (
    <section className={pad}>
      <div className={wrap}>
        {heading && (
          <div className="mb-12 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] xl:items-end xl:gap-20">
            <div>
              <Eyebrow>Services</Eyebrow>
              <h2 className={h2}>{b.overview?.title || `What ${b.shortName} does`}</h2>
            </div>
            {b.overview?.text && <p className={lead}>{b.overview.text}</p>}
          </div>
        )}
        <ServiceGrid groups={groups} />
      </div>
    </section>
  );
}

function Process({ b }) {
  const steps = list(b.process?.steps).slice(0, 5);
  if (steps.length < 2) return null;
  return (
    <section className={`${pad} bg-surface`}>
      <div className={wrap}>
        <div className="mb-12 max-w-3xl lg:mb-14">
          <Eyebrow>{b.process.title || 'How we work'}</Eyebrow>
          {b.process.text && <h2 className={h2}>{b.process.text}</h2>}
        </div>
        <ol className={`grid gap-0 lg:gap-8 ${STEPS[steps.length]}`}>
          {steps.map((s, i) => (
            <li key={s.title} className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-x-5 pb-9 last:pb-0 lg:block lg:pb-0">
              {i < steps.length - 1 && (
                <>
                  <span aria-hidden="true" className="absolute bottom-0 left-6 top-12 w-px bg-primary/25 lg:hidden" />
                  <span aria-hidden="true" className="absolute -right-8 left-16 top-6 hidden h-px bg-primary/25 lg:block" />
                </>
              )}
              <span className="relative grid size-12 place-items-center rounded-full border-[1.5px] border-primary bg-white font-heading text-base text-primary">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0 pt-2.5 lg:pt-6">
                <h3 className="font-heading font-display-2 text-xl leading-snug text-ink">{s.title}</h3>
                <p className="mt-2 text-base leading-[1.6] text-muted">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Values({ values }) {
  if (!values.length) return null;
  return (
    <dl className="mt-8 border-b border-line">
      {values.map((v) => (
        <div key={v.title} className="grid gap-1 border-t border-line py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6">
          <dt className="font-heading font-display-2 text-[17px] text-ink">{v.title}</dt>
          <dd className="m-0 text-base leading-[1.6] text-muted">{v.text}</dd>
        </div>
      ))}
    </dl>
  );
}

function AboutTeaser({ b, hasTeam }) {
  const text = paras(b.about.text);
  const towns = list(b.serviceArea);
  const links = (
    <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
      <a href="/about" className={line}>
        About Us
      </a>
      {hasTeam && (
        <a href="/team" className={line}>
          Meet the Team
        </a>
      )}
    </div>
  );
  if (!b.about.image) {
    // No photo worth showing: the story beside the office's own facts, so
    // neither half of the band is empty.
    return (
      <section className={`${pad} bg-surface`}>
        <div className={`${wrap} grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-20`}>
          <div className="min-w-0">
            <Eyebrow>About {b.shortName}</Eyebrow>
            <h2 className={h2}>{b.about.title}</h2>
            {text.slice(0, 2).map((t) => (
              <p key={t} className={`mt-6 ${lead}`}>
                {t}
              </p>
            ))}
            <Values values={list(b.about.values)} />
            {links}
          </div>
          <dl className="grid content-start gap-0 self-start rounded-lg border border-line bg-white px-6 py-2 sm:px-8">
            {[
              ['Office', `${b.address}, ${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`],
              ['Phone', b.phone],
              b.since && ['Since', String(b.since)],
              towns.length > 1 && ['Serving', towns.join(', ')],
              b.license && ['License', b.license],
            ]
              .filter(Boolean)
              .map(([label, value]) => (
                <div key={label} className="grid gap-1 border-b border-line py-4 last:border-b-0">
                  <dt className="text-[12px] font-bold uppercase tracking-[0.16em] text-muted">{label}</dt>
                  <dd className="m-0 text-[16px] font-semibold leading-snug text-ink">{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </section>
    );
  }
  return (
    <section className={pad}>
      <div className={`${wrap} grid items-center gap-12 lg:grid-cols-2 lg:gap-24`}>
        {/* Drawn in its own shape, so a wide team photo keeps the people at its edges. */}
        <Img className="max-h-[34rem] w-full rounded-lg object-cover" src={b.about.image} alt={b.about.imageAlt || ''} sizes="(max-width: 1024px) 100vw, 46vw" />
        <div className="min-w-0">
          <Eyebrow>About {b.shortName}</Eyebrow>
          <h2 className={h2}>{b.about.title}</h2>
          {text[0] && <p className={`mt-6 ${lead}`}>{text[0]}</p>}
          <Values values={list(b.about.values)} />
          {links}
        </div>
      </div>
    </section>
  );
}

function Reviews({ b, className = '' }) {
  const reviews = list(b.reviews);
  const rated = b.rating && b.reviewCount;
  // A rating with no words to quote is the stats strip's, not a panel of its own.
  if (!reviews.length) return null;
  const [first, ...rest] = reviews;
  return (
    <section className={`pb-[clamp(4rem,8vw,6.5rem)] ${className}`}>
      <div className={wrap}>
        <div className="grid gap-10 rounded-lg bg-surface px-6 py-10 sm:px-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20 lg:p-16">
          <div>
            <Eyebrow>Client reviews</Eyebrow>
            {rated ? (
              <>
                <p className="flex items-center gap-4 lg:block">
                  <strong className="font-heading font-display text-[clamp(3rem,6vw,4.5rem)] leading-none text-primary">{Number(b.rating).toFixed(1)}</strong>
                  <span className="grid gap-1.5 lg:mt-4">
                    <Stars value={b.rating} size={18} />
                    <span className="text-base text-muted">from {b.reviewCount.toLocaleString('en-US')} Google reviews</span>
                  </span>
                </p>
                <a href={mapsHref(b)} className="mt-5 inline-flex min-h-11 items-center gap-1.5 font-bold text-primary no-underline hover:underline">
                  Read on Google <ArrowRight size={16} aria-hidden="true" />
                </a>
              </>
            ) : (
              <h2 className={h2}>What clients say</h2>
            )}
          </div>
          {first && (
            <div className="min-w-0">
              <figure className="m-0 pb-7">
                <blockquote className="font-heading text-[clamp(1.15rem,1rem+0.6vw,1.4rem)] leading-[1.6] text-ink">&ldquo;{first.text}&rdquo;</blockquote>
                <figcaption className="mt-4 text-[15px] font-semibold text-muted">
                  {first.author}
                  {first.where ? `, ${first.where}` : ''}
                </figcaption>
              </figure>
              {rest.length > 0 && (
                <div className={`grid gap-x-10 border-t border-line ${rest.length > 1 ? 'md:grid-cols-2' : ''}`}>
                  {rest.map((r) => (
                    <figure key={r.text} className="m-0 border-b border-line py-6 last:border-b-0 md:border-b-0">
                      <blockquote className="font-heading text-[17px] leading-[1.65] text-ink">&ldquo;{r.text}&rdquo;</blockquote>
                      <figcaption className="mt-3 text-[15px] font-semibold text-muted">
                        {r.author}
                        {r.where ? `, ${r.where}` : ''}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Cta({ b, tel, ctaLabel, title = 'Ready to talk it through?' }) {
  return (
    <section className="relative isolate overflow-hidden bg-primary-deep text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_100%_0%,color-mix(in_srgb,var(--primary)_60%,transparent),transparent_55%)]"
      />
      <div className={`${wrap} flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-20`}>
        <div className="min-w-0 max-w-2xl">
          <h2 className="font-heading font-display-2 text-[clamp(1.7rem,1.2rem+1.8vw,2.5rem)] leading-tight [text-wrap:balance]">{title}</h2>
          {b.cta?.text && <p className="mt-3 text-[17px] leading-[1.6] text-white/80 sm:text-lg">{b.cta.text}</p>}
        </div>
        <div className="grid flex-none gap-3 sm:flex sm:flex-wrap">
          <a href="/contact" className={white}>
            {ctaLabel} <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a href={tel} className={ghost}>
            <Phone size={17} aria-hidden="true" /> {b.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

function Faq({ items, className = '' }) {
  return (
    <div className={`border-t border-line ${className}`}>
      {items.map((f) => (
        <details key={f.q} className="group border-b border-line">
          <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-6 py-4 font-heading text-[17px] leading-snug text-ink sm:text-lg [&::-webkit-details-marker]:hidden">
            {f.q}
            <Plus size={20} strokeWidth={1.6} className="flex-none text-primary transition-transform group-open:rotate-45" aria-hidden="true" />
          </summary>
          <p className="max-w-2xl pb-6 text-base leading-[1.7] text-muted sm:text-[17px]">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

function OfficeCard({ b, tel, ctaLabel, k }) {
  const hours = list(b.hours);
  return (
    <aside className="rounded-lg border border-line bg-white p-6 sm:p-8">
      <p className="font-heading text-xl text-ink">Talk it through with {k.talk}</p>
      <a href={tel} className="mt-4 flex min-h-11 items-center gap-3 font-bold text-primary no-underline hover:underline">
        <Phone size={18} className="text-accent" aria-hidden="true" /> {b.phone}
      </a>
      {hours.length > 0 && (
        <dl className="mt-3 grid gap-1.5 border-t border-line pt-4 text-[15px]">
          {hours.map(([day, time]) => (
            <div key={day} className="flex justify-between gap-4">
              <dt className="text-muted">{day}</dt>
              <dd className="m-0 text-right font-semibold text-ink">{time}</dd>
            </div>
          ))}
        </dl>
      )}
      <a href="/contact" className={`${solid} mt-6 w-full`}>
        {ctaLabel}
      </a>
    </aside>
  );
}

/* ------------------------------------------------------------------- pages */

function HomePage(props) {
  const { b, groups, k, hasTeam } = props;
  return (
    <>
      <Hero {...props} />
      <Stats b={b} />
      <Affiliations b={b} k={k} />
      <Services b={b} groups={groups} />
      <Process b={b} />
      <AboutTeaser b={b} hasTeam={hasTeam} />
      <Reviews b={b} />
      <Cta {...props} />
    </>
  );
}

function ServicesPage(props) {
  const { b, groups } = props;
  return (
    <>
      <PageHero trail={[['/', 'Home'], [null, 'Services']]} eyebrow={<Eyebrow>Services</Eyebrow>} title={b.overview?.title || 'Services'} text={b.overview?.text} />
      <Services b={b} groups={groups} heading={false} />
      <Process b={b} />
      <div className="pt-[clamp(4rem,8vw,6.5rem)]">
        <Cta {...props} />
      </div>
    </>
  );
}

function ServicePage(props) {
  const { b, s, groups, tel, ctaLabel, k } = props;
  const Icon = iconFor(s.icon);
  const covers = list(s.covers);
  const questions = list(s.questions);
  const group = groups.find((g) => g.items.includes(s));
  const related = [...(group?.items || []), ...list(b.services)].filter((o, i, all) => o !== s && all.indexOf(o) === i).slice(0, 3);
  return (
    <>
      <PageHero
        trail={[['/', 'Home'], ['/services', 'Services'], [null, s.title]]}
        eyebrow={
          <p className="mb-5 flex items-center gap-3">
            <span className="grid size-12 flex-none place-items-center rounded-full bg-white text-primary">
              <Icon size={24} strokeWidth={1.25} aria-hidden="true" />
            </span>
            {group?.label && <span className="text-[13px] font-bold uppercase tracking-[0.16em] text-accent">For {group.label}</span>}
          </p>
        }
        title={s.title}
        // A service their site only names still says under its heading who offers it and where.
        text={s.lead || s.text || `${b.shortName} offers ${s.title.toLowerCase()} in ${b.town}. Ask ${k.talk} about it when you call or write.`}
        image={s.image}
        imageAlt={s.imageAlt}
        aside={<OfficeCard b={b} tel={tel} ctaLabel={ctaLabel} k={k} />}
      >
        <div className={`mt-8 gap-3 sm:flex-wrap ${s.image ? 'grid sm:flex' : 'hidden lg:flex'}`}>
          <a href="/contact" className={solid}>
            {ctaLabel} <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a href={tel} className={line}>
            <Phone size={17} aria-hidden="true" /> {b.phone}
          </a>
        </div>
      </PageHero>

      {covers.length > 0 && (
        <section className={pad}>
          <div className={wrap}>
            <div className="mb-10 max-w-3xl">
              <Eyebrow>What it covers</Eyebrow>
              <h2 className={h2}>What {s.title.toLowerCase()} from {b.shortName} includes.</h2>
            </div>
            <ul className="grid gap-4 md:grid-cols-2 lg:gap-5">
              {covers.map((c) => (
                <li key={c.title} className="flex gap-4 rounded-lg border border-line p-6 lg:p-7">
                  <span className="grid size-9 flex-none place-items-center rounded-full bg-surface text-accent">
                    <Check size={18} strokeWidth={2} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-heading font-display-2 text-lg leading-snug text-ink sm:text-xl">{c.title}</h3>
                    <p className="mt-1.5 text-base leading-[1.6] text-muted">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {questions.length > 0 && (
        <section className={`${pad} bg-surface`}>
          <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-24`}>
            <div>
              <Eyebrow>Common questions</Eyebrow>
              <h2 className={h2}>{s.title}, answered plainly.</h2>
            </div>
            <Faq items={questions} />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className={pad}>
          <div className={wrap}>
            <h2 className="mb-7 font-heading font-display-2 text-[clamp(1.4rem,1.1rem+1vw,1.75rem)] text-ink">
              {group?.label ? `More for ${group.label.toLowerCase()}` : 'More services'}
            </h2>
            <ul className="grid gap-4 md:grid-cols-3 lg:gap-5">
              {related.map((o) => {
                const RIcon = iconFor(o.icon);
                return (
                  <li key={o.slug}>
                    <a href={`/services/${o.slug}`} className={`group flex h-full items-center gap-4 p-5 text-ink no-underline ${cardLink}`}>
                      <span className="grid size-12 flex-none place-items-center rounded-md bg-surface text-primary">
                        <RIcon size={24} strokeWidth={1.25} aria-hidden="true" />
                      </span>
                      <span className="grid min-w-0 flex-1 gap-0.5">
                        <span className="font-heading text-lg leading-snug">{o.title}</span>
                        {o.summary && <span className="text-base leading-snug text-muted sm:text-[15px]">{o.summary}</span>}
                      </span>
                      <ArrowRight size={18} className="flex-none text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
      <Cta {...props} title={`Questions about ${s.title.toLowerCase()}?`} />
    </>
  );
}

function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('');
}

function TeamPage(props) {
  const { b } = props;
  const team = list(b.team);
  // With no one's photo to show, the people are drawn as their names and
  // words alone; a wall of grey boxes with initials reads as placeholders.
  // Initials stand in only beside colleagues who do have a photo.
  const photos = team.some((p) => p.image);
  return (
    <>
      <PageHero trail={[['/', 'Home'], [null, 'Our Team']]} eyebrow={<Eyebrow>Our team</Eyebrow>} title={`The people behind ${b.shortName}`} text={b.tagline} />
      <section className={pad}>
        <ul className={`${wrap} grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3 ${photos ? 'gap-y-12' : 'gap-y-10'}`}>
          {team.map((p) => (
            <li key={p.name} className={`min-w-0 ${photos ? '' : 'border-t-2 border-accent pt-6'}`}>
              {p.image ? (
                <Img className="aspect-[4/5] w-full rounded-lg bg-surface object-cover object-top" src={p.image} alt={p.imageAlt || p.name} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              ) : (
                photos && (
                  <span aria-hidden="true" className="grid aspect-[4/5] w-full place-items-center rounded-lg bg-surface font-heading text-6xl text-primary/70">
                    {initials(p.name)}
                  </span>
                )
              )}
              <h2 className={`${photos ? 'mt-5' : ''} font-heading font-display-2 text-[1.35rem] leading-snug text-ink`}>{p.name}</h2>
              <p className="mt-1 text-[13px] font-bold uppercase tracking-[0.14em] text-accent">{p.role}</p>
              {p.bio && <p className="mt-3 text-base leading-[1.6] text-muted">{p.bio}</p>}
            </li>
          ))}
        </ul>
      </section>
      <Cta {...props} />
    </>
  );
}

function AboutPage(props) {
  const { b, k } = props;
  const text = paras(b.about.text);
  const area = list(b.serviceArea);
  return (
    <>
      <PageHero
        trail={[['/', 'Home'], [null, 'About']]}
        eyebrow={<Eyebrow>About {b.shortName}</Eyebrow>}
        title={b.about.title}
        image={b.about.image}
        imageAlt={b.about.imageAlt}
      />
      <section className={pad}>
        <div className={`${wrap} grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-24`}>
          <div className="min-w-0 space-y-5">
            {text.map((t) => (
              <p key={t} className="text-[17px] leading-[1.75] text-ink/85 sm:text-lg">
                {t}
              </p>
            ))}
          </div>
          <div className="min-w-0">
            {list(b.about.values).length > 0 && <h2 className="font-heading font-display-2 text-2xl text-ink">What to expect</h2>}
            <Values values={list(b.about.values)} />
            {area.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-4 font-heading font-display-2 text-2xl text-ink">Where we work</h2>
                <ul className="flex flex-wrap gap-2.5">
                  {area.map((t) => (
                    <li key={t} className="flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-[15px] font-semibold text-ink">
                      <MapPin size={14} className="text-accent" aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
      <Process b={b} />
      <Affiliations b={b} k={k} className="border-t-0" />
      <div className="pt-[clamp(4rem,8vw,6.5rem)]">
        <Reviews b={b} />
        <Cta {...props} />
      </div>
    </>
  );
}

function ResourcesPage(props) {
  const { b } = props;
  const faqs = list(b.faqs);
  const links = list(b.resources);
  return (
    <>
      <PageHero trail={[['/', 'Home'], [null, 'Resources']]} eyebrow={<Eyebrow>Resources</Eyebrow>} title="Resources and common questions" />
      {faqs.length > 0 && (
        <section className={pad}>
          <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-24`}>
            <div>
              <Eyebrow>Questions</Eyebrow>
              <h2 className={h2}>What clients ask us most.</h2>
            </div>
            <Faq items={faqs} />
          </div>
        </section>
      )}
      {links.length > 0 && (
        <section className={`${pad} bg-surface`}>
          <div className={wrap}>
            <div className="mb-10 max-w-3xl">
              <Eyebrow>Useful links</Eyebrow>
              <h2 className={h2}>Worth having on hand.</h2>
            </div>
            <ul className={`grid gap-4 lg:gap-5 ${GRID[Math.min(links.length, 3)]}`}>
              {links.map((r) => (
                <li key={r.href}>
                  <a href={r.href} rel="noopener" className={`group flex h-full flex-col p-6 text-ink no-underline lg:p-7 ${cardLink}`}>
                    <span className="font-heading text-xl leading-snug">{r.title}</span>
                    <span className="mb-5 mt-2 text-base leading-[1.6] text-muted">{r.text}</span>
                    <span className="mt-auto inline-flex items-center gap-1.5 font-bold text-primary">
                      Visit Site <ExternalLink size={15} aria-hidden="true" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <div className="pt-[clamp(4rem,8vw,6.5rem)]">
        <Cta {...props} />
      </div>
    </>
  );
}

function ContactPage(props) {
  const { b, tel, ctaLabel } = props;
  const hours = list(b.hours);
  const area = list(b.serviceArea);
  const address = `${b.address}, ${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;
  return (
    <>
      <PageHero trail={[['/', 'Home'], [null, 'Contact']]} eyebrow={<Eyebrow>Contact</Eyebrow>} title={`Contact ${b.shortName}`} text={b.cta?.text} />
      <section className={pad}>
        <div className={`${wrap} grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-16`}>
          <div className="min-w-0 rounded-lg border border-line p-5 sm:p-8 lg:p-10">
            <h2 className="mb-6 font-heading font-display-2 text-2xl text-ink">{ctaLabel}</h2>
            <EnquiryForm
              b={b}
              submitLabel={ctaLabel}
              styles={{
                form: '',
                label: 'text-[15px] font-semibold text-ink',
                field:
                  'min-h-12 rounded-xl border border-line bg-surface px-4 py-3 font-body text-base font-normal text-ink outline-none transition-colors focus:border-primary focus:bg-white',
                button: `${solid} mt-2 w-full`,
                done: 'rounded-2xl bg-surface p-6 text-ink',
              }}
              fields={[
                { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
                { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
                { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
                { name: 'service', label: 'What Can We Help With?', type: 'select', options: [...list(b.services).map((s) => s.title), 'Something else'] },
                { name: 'message', label: 'Message', type: 'textarea', wide: true },
              ]}
            />
          </div>
          <div className="min-w-0">
            <ul className="border-t border-line">
              {[
                [Phone, tel, b.phone],
                // A break point after the '@', so a long address wraps whole at its domain rather than mid-word.
                [Mail, `mailto:${b.email}`, (b.email || '').split('@').flatMap((p, i) => (i ? ['@', <wbr key={i} />, p] : [p]))],
                [MapPin, mapsHref(b), address],
              ].map(([Icon, href, label]) => (
                <li key={href} className="border-b border-line">
                  <a href={href} className="flex min-h-14 items-center gap-3.5 py-3 font-semibold text-primary no-underline [overflow-wrap:anywhere] hover:underline">
                    <Icon size={19} className="flex-none text-accent" aria-hidden="true" /> {label}
                  </a>
                </li>
              ))}
            </ul>
            {hours.length > 0 && (
              <div className="mt-8 rounded-lg bg-surface p-6">
                <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.16em] text-muted">Office Hours</h2>
                <dl className="grid gap-2 text-base">
                  {hours.map(([day, time]) => (
                    <div key={day} className="flex justify-between gap-4">
                      <dt className="text-muted">{day}</dt>
                      <dd className="m-0 text-right font-semibold text-ink">{time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {area.length > 0 && (
              <div className="mt-8">
                <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.16em] text-muted">Serving</h2>
                <p className="text-base leading-[1.7] text-ink">{area.join(', ')}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ footer */

function Footer({ b, nav, tel }) {
  const hours = list(b.hours);
  const linkCls = 'inline-flex min-h-11 min-w-11 items-center text-muted no-underline hover:text-primary';
  return (
    <footer className="border-t border-line bg-surface text-base">
      <div
        className={`${wrap} grid gap-10 pb-10 pt-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(2,minmax(0,1fr))] lg:gap-10 lg:pt-20`}
      >
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <a href="/" className="inline-flex min-h-11 max-w-full items-center no-underline" aria-label={`${b.name} home`}>
            <BrandLogo b={b} ground="#f5f6f8" textClass="text-ink" />
          </a>
          {b.tagline && <p className="mt-4 max-w-xs leading-relaxed text-muted">{b.tagline}</p>}
          <p className="mt-4 leading-relaxed text-ink">
            {b.address}
            <br />
            {b.town}, {b.state} {b.zip}
          </p>
        </div>
        <nav aria-label="Footer" className="min-w-0">
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.16em] text-ink">{b.shortName}</h2>
          <ul>
            {[['services', 'All Services'], ...nav].map(([href, label]) => (
              <li key={href}>
                <a href={`/${href}`} className={linkCls}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0">
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.16em] text-ink">Office</h2>
          <a href={tel} className={`${linkCls} font-semibold !text-primary`}>
            {b.phone}
          </a>
          {hours.length > 0 && (
            <dl className="mt-2 grid gap-1.5 text-[15px]">
              {hours.map(([day, time]) => (
                <div key={day}>
                  <dt className="text-ink">{day}</dt>
                  <dd className="m-0 text-muted">{time}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
      <div className={wrap}>
        <div className="flex flex-col gap-2 border-t border-line py-6 text-base text-muted sm:text-sm md:flex-row md:justify-between md:gap-8">
          <p>
            &copy; {new Date().getFullYear()} {b.name}
            <StudioCredit b={b} />
          </p>
          {b.license && <p className="md:text-right">{b.license}</p>}
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------- root */

export default function Professional({ b, path = '' }) {
  const k = { ...(KIND[b.kind] || KIND.insurance), ...(b.talk ? { talk: b.talk } : {}) };
  const ctaLabel = b.cta?.label || k.cta;
  const tel = telHref(b.phone);
  const groups = groupsOf(b);
  const hasTeam = list(b.team).length > 0;
  const hasResources = list(b.faqs).length > 0 || list(b.resources).length > 0;
  const nav = [hasTeam && ['team', 'Our Team'], ['about', 'About'], hasResources && ['resources', 'Resources'], ['contact', 'Contact']].filter(Boolean);
  const service = path.startsWith('services/') ? list(b.services).find((s) => `services/${s.slug}` === path) : null;
  const props = { b, k, path, tel, ctaLabel, groups, nav, hasTeam };

  let page = <HomePage {...props} />;
  if (service) page = <ServicePage {...props} s={service} />;
  else if (path === 'services') page = <ServicesPage {...props} />;
  else if (path === 'team' && hasTeam) page = <TeamPage {...props} />;
  else if (path === 'about') page = <AboutPage {...props} />;
  else if (path === 'resources' && hasResources) page = <ResourcesPage {...props} />;
  else if (path === 'contact') page = <ContactPage {...props} />;

  return (
    <div
      className="min-w-0 overflow-x-clip bg-white font-body text-base text-ink antialiased"
      style={{
        '--muted': 'color-mix(in srgb, var(--ink) 70%, #fff)',
        '--cream': 'var(--surface)',
        '--line': 'color-mix(in srgb, var(--ink) 12%, #fff)',
        '--primaryDeep': 'color-mix(in srgb, var(--primary) 72%, #000)',
        ...displayVars(b.brand),
        ...brandVars(b.brand),
      }}
    >
      <TopBar b={b} tel={tel} />
      <Header {...props} />
      <main>{page}</main>
      {!path && <Facts b={b} />}
      <Footer {...props} />
    </div>
  );
}
