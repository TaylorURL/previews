/**
 * Health practices: dentists and chiropractors. A light, airy site built
 * around what a patient choosing a practice looks for: the doctor, the
 * treatments, how to book, what a first visit is like, insurance and payment,
 * reviews, and when and where to come in. A site of several pages, each
 * prerendered at its own address.
 *
 * Pages: '' (home), 'services', 'services/<slug>' for every treatment with words of its own,
 * 'team' (only when the brand lists people), 'about', 'resources' (only when the brand has
 * faqs or resources) and 'contact'. The same addresses the professional template uses, so a
 * practice moved here from it keeps every link.
 *
 * Home, top to bottom, each section left out when the brand file has nothing for it:
 * hero, highlights, treatments, about the practice, meet the doctor, the first visit,
 * insurance and payment, reviews, hours and location, the closing band, and the facts
 * no section has a place for (shared Facts).
 *
 * BRAND FILE (src/brands/<slug>.json). The professional template's shape, unchanged, so a
 * dental or chiropractic brand file moves here by changing `template` alone; the fields
 * marked NEW are optional additions this template also reads. Required unless marked optional.
 *
 *   template      "health"
 *   preview       optional. true on a prospect's preview (shows the preview bar); left out on a sample.
 *   kind          "dental" | "chiropractic". Sets the practice's mark (a tooth, a spine), what the
 *                 treatments are called in the menu (Treatments / Services) and the default button.
 *   talk          optional. Who "talk it through with" names in the treatments menu ("Dr. Le").
 *   name          the practice's full name, as on its own site.
 *   shortName     the name used in running copy and when there is no logo.
 *   tagline       optional. One line under the logo in the footer.
 *   phone         "(281) 555-0163" form: the Google listing's number. Every call button dials it.
 *   phones        NEW, optional. [{ label, number }] lines beyond `phone` ("Español", "Text us"), shown
 *                 in the mobile menu, the hours and location section, the contact page and the footer.
 *   email         optional. The office address the contact page and footer list.
 *   address       street line, with suite. town, state: "Baytown", "TX". zip: optional.
 *   since         optional. Year founded, shown under the hero's buttons and on the photo.
 *   license       optional. One line of license or regulatory text for the footer.
 *   rating        optional. Google star rating, with reviewCount (both or neither). Shown under the
 *                 hero's buttons, on the hero photo and beside the reviews.
 *   reviewCount   optional. Number of Google reviews.
 *   hours         optional. [[day, time], ...] shown in the hours and location section, the contact page and footer.
 *   cta           optional. { label, text }. label is the main button (default "Request an Appointment");
 *                 text is one sentence in the closing band and on the contact page.
 *   newPatients   NEW, optional. true when their site says it welcomes new patients, false to say nothing.
 *                 Left out, the hero says "New patients welcome" only when the copy taken from their site
 *                 mentions new patients (new patient forms, a new patient visit) and never says it is not taking them.
 *   heroStyle     NEW, optional. "split" (the photo in a soft frame beside the words), "photo" (the photo
 *                 across the band's right side, faded into its ground) or "type" (no photo: the practice's
 *                 mark in soft rings with three of its treatments and its address around it). Default "split"
 *                 when hero.image is set, else "type". A style that needs a photo falls back to "type" without one.
 *   tone          NEW, optional. "bold" (the default: heavier headings) or "classic" (lighter headings, more air).
 *   brand         { primary, accent, ink, surface, cream, line, heading, body, fonts (Google Fonts stylesheet
 *                   URL), logo (path or null), logoMono, logoWidth, logoHeight, logoReads, logoGround ... }
 *                 as the build writes them. primary carries the buttons and is darkened only as far as white
 *                 type needs to read on it; the light grounds are pale washes of it, and accent colors the
 *                 small labels. A near-black primary tints the grounds with the accent instead.
 *   hero          { eyebrow (optional), title, lead, image (optional), imageAlt, points (optional, up to 3) }
 *                 eyebrow is the small line over the title; one that only repeats the name is replaced by
 *                 "Dental care in <town>, <state>". image is a "/brands/<slug>/<name>" path with -800 and
 *                 -1600 webp beside it.
 *   highlights    NEW, optional. [{ title, text, icon }] 2 to 4 things that set the practice apart, as a strip
 *                 of cards across the foot of the hero. icon is a free word matched to an icon.
 *   overview      optional. { title, text } heading the treatments on the home and services pages.
 *   services      [ ...treatments, at least one ]. Each:
 *                   slug      url segment, lowercase-hyphenated: "dental-implants".
 *                   title     Title Case name: "Dental Implants".
 *                   icon      optional. The professional template's icon key; the treatment's own words
 *                             pick a closer icon first (src/templates/health/icons.jsx).
 *                   summary   optional. One short line, shown in the menu when every treatment has one.
 *                   text      one or two sentences for the treatment's card.
 *                   lead      optional. The opening paragraph of its own page. Falls back to text. A treatment
 *                             with no lead, text, covers or questions has no page and is listed by name.
 *                   image     optional, with imageAlt. Photo for the treatment page's opening.
 *                   covers    optional. [{ title, text }] what it involves, two to six.
 *                   questions optional. [{ q, a }] questions about it.
 *   about         { title, text (string or [paragraphs]), image (optional), imageAlt (optional),
 *                   values (optional) [{ title, text }] } the practice's story.
 *   owner         NEW, optional. { name, role, text, image (optional), imageAlt (optional) } the doctor, shown
 *                 as "Meet the doctor". Left out, the first doctor in `team` (a "Dr." name, a D.C. or D.D.S.,
 *                 or a dentist's or chiropractor's role) stands there, with the other doctors named under.
 *   team          optional. [{ name, role, bio (optional), image (optional), imageAlt (optional) }] as their own
 *                 site gives them. Without it there is no team page.
 *   steps         NEW, optional. [{ title, text }] what a first visit is like, 3 or 4, only as their site says.
 *                 Left out, process.steps stands in, under process.title.
 *   process       optional. { title, text (optional), steps: [{ title, text }] } the professional template's.
 *   credentials   NEW, optional. [{ label, detail (optional) }] degrees, licenses, certifications, memberships.
 *   affiliations  optional. { title (optional), items: [strings] }. A title about insurance, plans or
 *                 financing puts the items in the insurance and payment section; any other title, beside
 *                 the doctor as credentials.
 *   facts         optional. [{ heading, text | items }] as the shared Facts reads them. A fact headed for
 *                 insurance, financing, payment or prices is drawn in the insurance and payment section
 *                 rather than among the rest.
 *   reviews       optional. [{ author, text, source ("Google" | "their site" | "Facebook"), rating (optional),
 *                   where (optional) }] quoted word for word; up to 3 on the home page with the source named.
 *   languages     NEW, optional. ["English", "Spanish"] the languages spoken in the office.
 *   faqs          optional. [{ q, a }] general questions for the resources page.
 *   resources     optional. [{ title, text, href }] outside links worth having.
 *   serviceArea   optional. [towns] listed in the hours and location section, on the about and contact pages.
 */
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CalendarCheck,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  Languages,
  Mail,
  MapPin,
  Menu,
  Phone,
  Plus,
  Quote,
  Stethoscope,
  X,
} from 'lucide-react';
import { brandVars, displayVars, mapsHref, telHref } from '../site.js';
import { BrandLogo, EnquiryForm, Facts, Img, phonesOf, Stars, StudioCredit } from './shared.jsx';
import { Backdrop, MapArt, Orbit } from './health/art.jsx';
import { highlightIcon, kindIcon, treatmentIcon } from './health/icons.jsx';
import { isDoctor, labelCase, list, opening, openDays, palette, paras, welcomesNew } from './health/util.js';

const KIND = {
  dental: { cta: 'Request an Appointment', menu: 'Treatments', care: 'Dental care', talk: 'our front desk', credentials: 'Memberships and credentials' },
  chiropractic: { cta: 'Request an Appointment', menu: 'Services', care: 'Chiropractic care', talk: 'our front desk', credentials: 'Memberships and credentials' },
};

const wrap = 'mx-auto w-full max-w-page px-gutter';
const btn =
  'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-7 py-2.5 text-center text-[15.5px] leading-snug font-semibold no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const solid = `${btn} bg-primary text-white shadow-[0_16px_30px_-16px_color-mix(in_srgb,var(--primary)_80%,transparent)] hover:bg-[var(--deep)]`;
const outline = `${btn} border border-line bg-white text-ink hover:border-primary/40 hover:text-primary`;
const onColor = `${btn} bg-white text-primary hover:bg-[var(--tint)]`;
const ghost = `${btn} border border-white/40 text-white hover:border-white hover:bg-white/10`;
const lead = 'text-[17px] leading-[1.7] text-muted sm:text-[18px]';
const card = 'rounded-[1.75rem] bg-white ring-1 ring-[color:var(--line)]';

// A section's ground, taken in turn down the home page so no two neighbours share one.
const GROUNDS = ['bg-white', 'bg-[var(--warm)]', 'bg-white', 'bg-[var(--tint)]'];

const PAYS = /insur|financ|payment|paying|\bpay\b|price|pricing|cost|fees?\b|cash|benefit|membership plan|savings plan|discount plan|in-house|\bplans?\b|carecredit|cherry|accept/i;

/** A heading with each hyphenated word held whole, so 'X-Ray' never breaks at its hyphen. */
function unbroken(title) {
  return String(title || '')
    .split(/(\S+-\S+)/)
    .map((part, i) => (i % 2 ? <span key={i} className="whitespace-nowrap">{part}</span> : part));
}

/** A treatment their site only names has no page of its own; it is listed by name. */
const hasPage = (s) => Boolean(s.lead || s.text || list(s.covers).length || list(s.questions).length);

/** A treatment's short line, unless it only says its name again. */
const summaryOf = (s) => (s.summary && s.summary.trim().toLowerCase() !== s.title.trim().toLowerCase() ? s.summary : '');

/** The columns, up to `most`, that leave the last row of `n` cards fullest. */
function columns(n, most) {
  if (n <= most) return n;
  const gap = (c) => (c - (n % c)) % c;
  let best = most;
  for (let c = most - 1; c >= 2; c--) if (gap(c) < gap(best)) best = c;
  return best;
}
const GRID = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 xl:grid-cols-4' };

export function pages(b) {
  const out = ['services', ...list(b.services).filter(hasPage).map((s) => `services/${s.slug}`)];
  if (list(b.team).length) out.push('team');
  out.push('about');
  if (list(b.faqs).length || list(b.resources).length) out.push('resources');
  out.push('contact');
  return out;
}

/* ------------------------------------------------------------- the brand file read */

/** The doctor the home page introduces, and the other doctors to name under them. */
function doctorsOf(b) {
  const team = list(b.team);
  const docs = team.filter(isDoctor);
  if (b.owner?.name) {
    const same = (p) => p.name.replace(/\W/g, '').toLowerCase() === b.owner.name.replace(/\W/g, '').toLowerCase();
    const match = team.find(same);
    return {
      lead: { name: b.owner.name, role: b.owner.role || match?.role, text: b.owner.text || match?.bio, image: b.owner.image || match?.image, imageAlt: b.owner.imageAlt || b.owner.name },
      others: docs.filter((p) => !same(p)),
    };
  }
  if (!docs.length) return null;
  const first = docs.find((p) => /owner|founder|lead|principal|director/i.test(p.role || '')) || docs[0];
  return {
    lead: { name: first.name, role: first.role, text: first.bio, image: first.image, imageAlt: first.imageAlt || first.name },
    others: docs.filter((p) => p !== first),
  };
}

/** Credentials as [{ label, detail }]: the contract's own, or the memberships an affiliations list names. */
function credentialsOf(b) {
  const own = list(b.credentials).filter((c) => c?.label);
  if (own.length) return own;
  const aff = b.affiliations;
  if (list(aff?.items).length && !PAYS.test(aff.title || '')) return list(aff.items).map((label) => ({ label }));
  return [];
}

/** What the insurance and payment section draws: an affiliations list about insurance, and the facts about paying. */
function payBlocks(b) {
  const blocks = [];
  const aff = b.affiliations;
  if (list(aff?.items).length && PAYS.test(aff.title || '')) blocks.push({ heading: aff.title, items: list(aff.items) });
  for (const f of list(b.facts)) {
    if (f?.heading && (f.text || list(f.items).length) && PAYS.test(f.heading)) blocks.push({ heading: f.heading, text: f.text, items: list(f.items), fact: f });
  }
  return blocks;
}

function stepsOf(b) {
  if (list(b.steps).length >= 2) return { title: 'Your first visit', text: '', steps: list(b.steps).slice(0, 5) };
  const steps = list(b.process?.steps).slice(0, 5);
  if (steps.length < 2) return null;
  return { title: b.process.title || 'Your first visit', text: b.process.text || '', steps };
}

function reviewsOf(b) {
  return list(b.reviews).filter((r) => r?.text);
}

/** The small line over the hero's title: their own, unless it only says the practice's name again. */
function eyebrowOf(b, k) {
  const own = String(b.hero?.eyebrow || '').trim();
  const name = (s) => String(s || '').replace(/\W/g, '').toLowerCase();
  if (own && name(own) !== name(b.name) && name(own) !== name(b.shortName)) return own;
  return `${k.care} in ${b.town}, ${b.state}`;
}

/* ------------------------------------------------------------------ pieces */

function Eyebrow({ children, className = '', light = false }) {
  return (
    <p className={`mb-4 flex items-center gap-2.5 text-[13px] font-bold uppercase tracking-[0.16em] ${light ? 'text-white/85' : 'text-accent'} ${className}`}>
      <span aria-hidden="true" className={`size-1.5 flex-none rounded-full ${light ? 'bg-white/70' : 'bg-accent'}`} />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

function SectionHead({ eyebrow, title, text, action, className = 'mb-10 lg:mb-14' }) {
  return (
    <div className={`grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16 ${className}`}>
      <div className="min-w-0 max-w-3xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="font-heading font-display-2 text-[clamp(1.85rem,1.3rem+2vw,2.75rem)] leading-[1.12] text-ink [text-wrap:balance]">{unbroken(title)}</h2>
        {text && <p className={`mt-4 max-w-2xl ${lead}`}>{text}</p>}
      </div>
      {action && <div className="min-w-0">{action}</div>}
    </div>
  );
}

function TextLink({ href, children, className = '' }) {
  return (
    <a href={href} className={`group inline-flex min-h-11 items-center gap-1.5 text-[15.5px] font-semibold text-primary no-underline hover:underline ${className}`}>
      {children} <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </a>
  );
}

function TreatmentLink({ s, ...rest }) {
  if (hasPage(s)) return <a href={`/services/${s.slug}`} {...rest} />;
  return <span className={rest.className}>{rest.children}</span>;
}

function IconTile({ Icon, size = 'size-14', icon = 27, className = '' }) {
  return (
    <span className={`grid ${size} flex-none place-items-center rounded-2xl bg-[var(--tint)] text-primary ${className}`}>
      <Icon size={icon} strokeWidth={1.6} aria-hidden="true" />
    </span>
  );
}

function HoursList({ hours, className = '' }) {
  return (
    <dl className={`grid gap-2.5 text-[15.5px] ${className}`}>
      {hours.map(([day, time]) => (
        <div key={day} className="flex items-baseline gap-3">
          <dt className="flex-none text-ink">{day}</dt>
          <span aria-hidden="true" className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-[color:var(--line)]" />
          <dd className={`m-0 text-right font-semibold ${/closed/i.test(time) ? 'text-muted' : 'text-ink'}`}>{time}</dd>
        </div>
      ))}
    </dl>
  );
}

function Rating({ b, size = 16, className = '' }) {
  if (!(b.rating && b.reviewCount)) return null;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Stars value={b.rating} size={size} />
      <span>
        <strong className="font-semibold text-ink">{Number(b.rating).toFixed(1)}</strong>
        <span className="text-muted"> · {b.reviewCount.toLocaleString('en-US')} Google reviews</span>
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ header */

function Header({ b, path, k, nav, tel, ctaLabel }) {
  const [drop, setDrop] = useState(false);
  const [menu, setMenu] = useState(false);
  const [section, setSection] = useState(false);
  const timer = useRef(null);
  const trigger = useRef(null);
  const services = list(b.services);
  const lines = services.every(summaryOf);
  const inServices = path === 'services' || path.startsWith('services/');

  const show = () => {
    clearTimeout(timer.current);
    setDrop(true);
  };
  const hide = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDrop(false), 140);
  };

  useEffect(() => {
    if (!drop && !menu) return undefined;
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (drop) trigger.current?.focus();
      setDrop(false);
      setMenu(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drop, menu]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const navLink = (here) =>
    `inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-full px-4 text-[15.5px] font-semibold no-underline transition-colors ${
      here ? 'bg-[var(--tint)] text-primary' : 'text-ink hover:bg-[var(--tint)] hover:text-primary'
    }`;
  const dropCols = services.length > 8 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <header className={`sticky ${b.preview ? 'top-11' : 'top-0'} z-40 border-b border-[color:var(--line)] bg-white`}>
      <div className={`${wrap} flex h-[72px] items-center gap-3 lg:h-[86px]`}>
        <a href="/" className="flex min-h-11 min-w-0 max-w-[56vw] flex-initial items-center no-underline sm:max-w-[60vw] lg:max-w-[300px] lg:flex-none" aria-label={`${b.name} home`}>
          <BrandLogo b={b} textClass="text-ink" />
        </a>

        <nav aria-label="Main" className="ml-auto hidden self-stretch xl:block">
          <ul className="flex h-full items-center gap-1">
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
                className={`${navLink(inServices)} cursor-pointer border-0 bg-transparent`}
                aria-expanded={drop}
                aria-controls="treatments-menu"
                onClick={() => setDrop((v) => !v)}
              >
                {k.menu}
                <ChevronDown size={16} className={`transition-transform ${drop ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <div id="treatments-menu" hidden={!drop} className="absolute inset-x-0 top-full pt-2">
                <div className={wrap}>
                  <div className="ml-auto grid max-w-[1080px] grid-cols-[minmax(0,1fr)_260px] gap-6 rounded-[1.75rem] bg-white p-5 shadow-[0_40px_80px_-40px_rgba(16,32,48,0.45)] ring-1 ring-black/5">
                    <ul className={`grid ${dropCols} content-start gap-1`}>
                      {services.map((s) => {
                        const Icon = treatmentIcon(s, b.kind);
                        const here = path === `services/${s.slug}`;
                        return (
                          <li key={s.slug}>
                            <TreatmentLink
                              s={s}
                              aria-current={here ? 'page' : undefined}
                              className={`flex items-center gap-3 rounded-2xl p-2.5 no-underline transition-colors ${hasPage(s) ? 'hover:bg-[var(--tint)]' : ''} ${here ? 'bg-[var(--tint)]' : ''}`}
                            >
                              <IconTile Icon={Icon} size="size-11" icon={22} className="bg-[var(--tint)]" />
                              <span className="grid min-w-0 gap-0.5">
                                <span className="font-semibold leading-snug text-ink">{s.title}</span>
                                {lines && <span className="text-sm leading-snug text-muted">{s.summary}</span>}
                              </span>
                            </TreatmentLink>
                          </li>
                        );
                      })}
                    </ul>
                    <div className="flex flex-col gap-3 self-stretch rounded-[1.25rem] bg-[var(--tint)] p-6">
                      <p className="font-heading text-lg font-semibold leading-snug text-ink">Not sure what you need?</p>
                      <p className="text-[15px] leading-relaxed text-muted">Call and talk it through with {b.talk || k.talk}.</p>
                      <a href={tel} className="inline-flex min-h-11 items-center gap-2 text-lg font-bold text-primary no-underline hover:underline">
                        <Phone size={18} aria-hidden="true" /> {b.phone}
                      </a>
                      <a href="/services" className="mt-auto inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary no-underline hover:underline">
                        All {k.menu.toLowerCase()} <ArrowRight size={16} aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
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

        <div className="ml-auto flex flex-none items-center gap-2 xl:ml-3">
          <a href={tel} className="hidden min-h-11 items-center gap-2 whitespace-nowrap px-2 font-semibold text-ink no-underline hover:text-primary 2xl:inline-flex">
            <Phone size={17} className="text-primary" aria-hidden="true" /> {b.phone}
          </a>
          <a href={tel} aria-label={`Call ${b.phone}`} className="grid size-11 place-items-center rounded-full bg-[var(--tint)] text-primary 2xl:hidden">
            <Phone size={19} aria-hidden="true" />
          </a>
          <a href="/contact" className={`${solid} hidden min-h-[48px] px-6 lg:inline-flex`}>
            {ctaLabel}
          </a>
          <button
            type="button"
            className="grid size-11 cursor-pointer place-items-center rounded-full border border-[color:var(--line)] bg-white text-ink xl:hidden"
            aria-expanded={menu}
            aria-controls="site-menu"
            aria-label={menu ? 'Close the menu' : 'Open the menu'}
            onClick={() => setMenu((v) => !v)}
          >
            {menu ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id="site-menu"
        hidden={!menu}
        className={`absolute inset-x-0 top-full overflow-y-auto border-b border-[color:var(--line)] bg-white shadow-[0_30px_50px_-30px_rgba(16,32,48,0.45)] xl:hidden ${
          b.preview ? 'max-h-[calc(100dvh-116px)]' : 'max-h-[calc(100dvh-72px)]'
        }`}
      >
        <nav aria-label="Mobile" className={`${wrap} pb-6 pt-3`}>
          <ul className="grid gap-1">
            <li>
              <button
                type="button"
                className="flex min-h-14 w-full cursor-pointer items-center justify-between rounded-2xl border-0 bg-transparent px-3 text-left text-lg font-semibold text-ink"
                aria-expanded={section}
                aria-controls="menu-treatments"
                onClick={() => setSection((v) => !v)}
              >
                {k.menu}
                <ChevronDown size={20} className={`flex-none text-primary transition-transform ${section ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <ul id="menu-treatments" hidden={!section} className="grid gap-0.5 pb-2">
                {services.map((s) => {
                  const Icon = treatmentIcon(s, b.kind);
                  return (
                    <li key={s.slug}>
                      <TreatmentLink s={s} className="flex min-h-12 items-center gap-3 rounded-2xl px-3 text-base font-semibold text-ink no-underline hover:bg-[var(--tint)]">
                        <Icon size={20} strokeWidth={1.6} className="flex-none text-primary" aria-hidden="true" />
                        {s.title}
                      </TreatmentLink>
                    </li>
                  );
                })}
                <li>
                  <a href="/services" className="flex min-h-12 items-center gap-1.5 px-3 text-base font-semibold text-primary no-underline">
                    All {k.menu.toLowerCase()} <ArrowRight size={16} aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </li>
            {nav.map(([href, label]) => (
              <li key={href}>
                <a href={`/${href}`} className="flex min-h-14 items-center justify-between rounded-2xl px-3 text-lg font-semibold text-ink no-underline hover:bg-[var(--tint)]" aria-current={path === href ? 'page' : undefined}>
                  {label} <ArrowRight size={18} className="text-primary" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <a href="/contact" className={solid}>
              <CalendarCheck size={18} aria-hidden="true" /> {ctaLabel}
            </a>
            <a href={tel} className={outline}>
              <Phone size={17} aria-hidden="true" /> {b.phone}
            </a>
            {phonesOf(b).filter((p) => !p.main).map((p) => (
              <a key={p.number} href={telHref(p.number)} className={outline}>
                <Phone size={17} aria-hidden="true" /> {p.label ? `${p.label}: ` : ''}
                {p.number}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------- hero */

function HeroCopy({ b, k, tel, ctaLabel }) {
  const welcome = welcomesNew(b);
  const Mark = kindIcon(b.kind);
  const points = list(b.hero.points).slice(0, 3);
  const rated = b.rating && b.reviewCount;
  const langs = list(b.languages);
  const eyebrow = eyebrowOf(b, k);
  // A year the line over the title already gives is not said again under the buttons.
  const since = b.since && !eyebrow.includes(String(b.since));
  return (
    <div className="min-w-0 max-w-[40rem]">
      <p className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/85 py-1.5 pl-1.5 pr-4 text-[13.5px] font-semibold text-ink shadow-[0_8px_20px_-14px_rgba(16,32,48,0.5)] ring-1 ring-black/5">
        <span className="grid size-7 flex-none place-items-center rounded-full bg-primary text-white">
          <Mark size={16} strokeWidth={1.9} aria-hidden="true" />
        </span>
        <span className="min-w-0">{eyebrow}</span>
      </p>
      <h1 className="mt-6 break-words font-heading font-display text-[clamp(2.35rem,1.45rem+3.3vw,4.15rem)] leading-[1.06] text-ink [text-wrap:balance]">
        {unbroken(b.hero.title)}
      </h1>
      {b.hero.lead && <p className="mt-5 max-w-[35rem] text-[17px] leading-[1.68] text-muted sm:text-[19px]">{b.hero.lead}</p>}
      {welcome && (
        <p className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-[color-mix(in_srgb,#10b981_12%,#fff)] px-3.5 py-1.5 text-[14.5px] font-semibold text-[#0b6b4c]">
          <span aria-hidden="true" className="size-2 rounded-full bg-[#10b981] shadow-[0_0_0_4px_color-mix(in_srgb,#10b981_22%,transparent)]" />
          New patients welcome
        </p>
      )}
      <div className={`${welcome ? 'mt-5' : 'mt-8'} grid gap-3 sm:flex sm:flex-wrap`}>
        <a href="/contact" className={solid}>
          <CalendarCheck size={19} aria-hidden="true" /> {ctaLabel}
        </a>
        <a href={tel} className={outline}>
          <Phone size={17} className="text-primary" aria-hidden="true" /> Call {b.phone}
        </a>
      </div>
      {(rated || since || langs.length > 1) && (
        <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[15px]">
          {rated && (
            <li>
              <Rating b={b} />
            </li>
          )}
          {since && (
            <li className="flex items-center gap-2 text-muted">
              <Award size={17} className="text-accent" aria-hidden="true" />
              <span>
                Serving {b.town} since <strong className="font-semibold text-ink">{b.since}</strong>
              </span>
            </li>
          )}
          {langs.length > 1 && (
            <li className="flex items-center gap-2 text-muted">
              <Languages size={17} className="text-accent" aria-hidden="true" />
              {langs.join(' · ')}
            </li>
          )}
        </ul>
      )}
      {points.length > 0 && (
        <ul className="mt-8 grid gap-3 border-t border-[color:var(--line)] pt-7 sm:grid-cols-3 sm:gap-5">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-[15px] font-semibold leading-snug text-ink">
              <span className="mt-px grid size-5 flex-none place-items-center rounded-full bg-primary text-white">
                <Check size={13} strokeWidth={3} aria-hidden="true" />
              </span>
              {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** A card laid over the corner of the hero photo: the rating when there is one, the address when not. */
function PhotoCard({ b }) {
  if (b.rating && b.reviewCount) {
    return (
      <div className="flex items-center gap-3.5 rounded-2xl bg-white p-4 pr-5 shadow-[0_24px_48px_-24px_rgba(16,32,48,0.55)] ring-1 ring-black/5">
        <strong className="font-heading font-display text-[2rem] leading-none text-primary">{Number(b.rating).toFixed(1)}</strong>
        <span className="grid gap-1">
          <Stars value={b.rating} size={15} />
          <span className="text-[13.5px] text-muted">{b.reviewCount.toLocaleString('en-US')} Google reviews</span>
        </span>
      </div>
    );
  }
  return (
    <a href={mapsHref(b)} className="flex max-w-[19rem] items-center gap-3 rounded-2xl bg-white p-3.5 pr-5 text-ink no-underline shadow-[0_24px_48px_-24px_rgba(16,32,48,0.55)] ring-1 ring-black/5 hover:text-primary">
      <span className="grid size-11 flex-none place-items-center rounded-xl bg-primary text-white">
        <MapPin size={20} aria-hidden="true" />
      </span>
      <span className="min-w-0 text-[14.5px] leading-snug">
        <span className="block font-semibold">{b.address}</span>
        <span className="block text-muted">
          {b.town}, {b.state} {b.zip}
        </span>
      </span>
    </a>
  );
}

function Hero({ b, k, tel, ctaLabel, strip }) {
  const image = b.hero.image;
  const style = image ? (b.heroStyle === 'photo' ? 'photo' : b.heroStyle === 'type' ? 'type' : 'split') : 'type';
  const foot = strip ? 'pb-24 lg:pb-32' : 'pb-16 lg:pb-24';
  const days = openDays(b.hours);
  const langs = list(b.languages);
  const copy = <HeroCopy b={b} k={k} tel={tel} ctaLabel={ctaLabel} />;

  if (style === 'photo') {
    return (
      <section className="relative isolate overflow-hidden bg-[var(--tint)]">
        <Backdrop />
        <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-[60%]">
          <Img className="block h-[clamp(240px,64vw,460px)] w-full object-cover lg:h-full" src={image} alt={b.hero.imageAlt || ''} sizes="(max-width: 1024px) 100vw, 60vw" eager />
          <div aria-hidden="true" className="absolute inset-0 hidden lg:block" style={{ background: 'linear-gradient(90deg, var(--tint) 0%, color-mix(in srgb, var(--tint) 70%, transparent) 22%, transparent 55%)' }} />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-16 lg:hidden" style={{ background: 'linear-gradient(0deg, var(--tint), transparent)' }} />
        </div>
        <div className={`${wrap} relative ${foot} pt-4 lg:min-h-[640px] lg:pt-24`}>
          <div className="lg:max-w-[min(40rem,46%)]">{copy}</div>
        </div>
      </section>
    );
  }

  if (style === 'split') {
    return (
      <section className="relative isolate overflow-hidden bg-[var(--tint)]">
        <Backdrop />
        <div className={`${wrap} grid items-center gap-12 ${foot} pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-16 lg:pt-20`}>
          {copy}
          <div className="relative order-first min-w-0 sm:order-none sm:pb-6 lg:pb-0 lg:pl-4">
            <div aria-hidden="true" className="absolute -right-4 -top-4 bottom-10 left-10 hidden rounded-[2.5rem] bg-[var(--tint2)] sm:block" />
            <div className="relative overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-44px_rgba(16,32,48,0.6)]">
              <Img className="block aspect-[2/1] h-auto w-full object-cover sm:aspect-auto sm:max-h-[34rem]" src={image} alt={b.hero.imageAlt || ''} sizes="(max-width: 1024px) 100vw, 48vw" eager />
            </div>
            <div className="absolute -bottom-2 left-3 hidden sm:-left-5 sm:block lg:-bottom-7">
              <PhotoCard b={b} />
            </div>
            {(days || langs.length > 1) && (
              <p className="absolute -top-4 right-3 hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-[14px] font-semibold text-ink shadow-[0_16px_32px_-20px_rgba(16,32,48,0.55)] ring-1 ring-black/5 sm:-right-3 sm:inline-flex">
                {days ? <Clock size={16} className="text-accent" aria-hidden="true" /> : <Languages size={16} className="text-accent" aria-hidden="true" />}
                {days ? `Open ${days}` : langs.join(' · ')}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative isolate overflow-hidden bg-[var(--tint)]">
      <Backdrop strong Mark={kindIcon(b.kind)} />
      <div className={`${wrap} grid items-center gap-10 ${foot} pt-10 sm:gap-12 sm:pt-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-14 lg:pt-20`}>
        {copy}
        <div className={`min-w-0 sm:hidden ${strip ? 'hidden' : ''}`}>
          <p className="mb-3 text-[13px] font-bold uppercase tracking-[0.16em] text-accent">{k.menu}</p>
          <ul className="flex flex-wrap gap-2">
            {list(b.services)
              .slice(0, 5)
              .map((s) => {
                const Icon = treatmentIcon(s, b.kind);
                return (
                  <li key={s.slug} className="min-w-0 max-w-full">
                    <TreatmentLink s={s} className="flex min-h-11 items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-[15px] font-semibold text-ink no-underline shadow-[0_10px_24px_-18px_rgba(16,32,48,0.5)] ring-1 ring-black/5">
                      <span className="grid size-8 flex-none place-items-center rounded-full bg-[var(--tint)] text-primary">
                        <Icon size={17} strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <span className="min-w-0">{s.title}</span>
                    </TreatmentLink>
                  </li>
                );
              })}
          </ul>
        </div>
        <div className="hidden min-w-0 sm:block">
          <Orbit b={b} services={list(b.services)} hasPage={hasPage} />
        </div>
      </div>
    </section>
  );
}

/** Two to four things that set the practice apart, as cards across the foot of the hero. */
function Highlights({ b }) {
  const items = list(b.highlights).filter((h) => h?.title).slice(0, 4);
  const cols = { 2: 'sm:grid-cols-2', 3: 'md:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[items.length] || '';
  return (
    <section aria-label={`Why patients choose ${b.shortName}`} className="relative z-10">
      <div className={`${wrap} -mt-14 lg:-mt-20`}>
        <ul className={`grid gap-2 rounded-[2rem] bg-white p-3 shadow-[0_40px_70px_-48px_rgba(16,32,48,0.55)] ring-1 ring-black/5 sm:p-4 ${cols}`}>
          {items.map((h) => {
            const Icon = highlightIcon(h, b.kind);
            return (
              <li key={h.title} className="flex gap-4 rounded-[1.4rem] p-4 lg:p-5">
                <IconTile Icon={Icon} size="size-12" icon={24} />
                <div className="min-w-0">
                  <h2 className="font-heading font-display-2 text-[1.1rem] leading-snug text-ink">{h.title}</h2>
                  {h.text && <p className="mt-1.5 text-[15px] leading-[1.55] text-muted">{h.text}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- sections */

function TreatmentCard({ s, kind, arrow, many }) {
  const Icon = treatmentIcon(s, kind);
  const linked = hasPage(s);
  return (
    <TreatmentLink
      s={s}
      className={`group flex h-full gap-4 text-ink no-underline sm:flex-col sm:items-start sm:gap-0 sm:p-7 ${many ? 'items-center p-4 pr-5' : 'items-start p-5'} ${card} ${
        linked ? 'transition duration-200 hover:-translate-y-1 hover:shadow-[0_30px_50px_-34px_rgba(16,32,48,0.5)] hover:ring-primary/30' : ''
      }`}
    >
      <IconTile Icon={Icon} size={many ? 'size-12 sm:size-14' : 'size-14'} className={linked ? 'transition-colors group-hover:bg-primary group-hover:text-white' : ''} />
      <span className="flex min-w-0 flex-1 flex-col self-stretch sm:mt-6">
        <h3 className={`font-heading font-display-2 leading-snug sm:text-[1.28rem] ${many ? 'my-auto text-[1.08rem] sm:my-0' : 'text-[1.2rem]'}`}>{s.title}</h3>
        {/* A long list is a list of names on a phone, each a tap to its page; the card's words wait there. */}
        {s.text && <span className={`mt-2 text-[15.5px] leading-[1.6] text-muted ${many ? 'hidden sm:block' : ''}`}>{s.text}</span>}
        {arrow && linked && (
          <span className={`mt-auto items-center gap-1.5 pt-4 text-[15px] font-semibold text-primary sm:inline-flex sm:pt-5 ${many ? 'hidden' : 'inline-flex'}`}>
            Learn more <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        )}
      </span>
      {many && linked && <ArrowRight size={18} className="flex-none self-center text-primary sm:hidden" aria-hidden="true" />}
    </TreatmentLink>
  );
}

function Treatments({ b, k, bg, heading = true }) {
  const services = list(b.services);
  // Treatments their site only names are drawn as a tidy list of names rather than cards with an empty middle.
  const bare = services.filter((s) => !s.text).length * 2 >= services.length;
  const arrow = services.every(hasPage);
  return (
    <section className={`py-[clamp(4rem,8vw,6.5rem)] ${bg}`}>
      <div className={wrap}>
        {heading && (
          <SectionHead
            eyebrow={k.menu}
            title={b.overview?.title || `${k.care} at ${b.shortName}`}
            text={b.overview?.text}
            action={
              <TextLink href="/services" className="lg:mb-1">
                All {k.menu.toLowerCase()}
              </TextLink>
            }
          />
        )}
        {bare ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => {
              const Icon = treatmentIcon(s, b.kind);
              return (
                <li key={s.slug}>
                  <TreatmentLink s={s} className={`group flex h-full items-center gap-4 p-4 pr-5 text-ink no-underline ${card} ${hasPage(s) ? 'transition hover:ring-primary/30' : ''}`}>
                    <IconTile Icon={Icon} size="size-12" icon={24} />
                    <span className="min-w-0 flex-1 font-heading font-display-2 text-[1.08rem] leading-snug">{s.title}</span>
                    {hasPage(s) && <ArrowRight size={18} className="flex-none text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />}
                  </TreatmentLink>
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className={`grid gap-4 lg:gap-5 ${GRID[columns(services.length, 3)]}`}>
            {services.map((s) => (
              <li key={s.slug}>
                <TreatmentCard s={s} kind={b.kind} arrow={arrow} many={services.length > 6} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function aboutText(b) {
  return paras(b.about?.text).filter((t) => t !== b.hero.lead);
}

function About({ b, bg }) {
  const text = aboutText(b).slice(0, 2);
  const values = list(b.about.values).slice(0, 4);
  const image = b.about.image;
  const links = (
    <div className="mt-8 flex flex-wrap gap-3">
      <a href="/about" className={outline}>
        About {b.shortName}
      </a>
    </div>
  );
  const valueList = values.length > 0 && (
    <ul className="mt-8 grid gap-4">
      {values.map((v) => (
        <li key={v.title} className="flex gap-3.5">
          <span className="mt-0.5 grid size-7 flex-none place-items-center rounded-full bg-primary text-white">
            <Check size={15} strokeWidth={2.6} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-ink">{v.title}</span>
            {v.text && <span className="mt-0.5 block text-[15.5px] leading-[1.6] text-muted">{v.text}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
  if (image) {
    return (
      <section className={`py-[clamp(4rem,8vw,6.5rem)] ${bg}`}>
        <div className={`${wrap} grid items-start gap-12 lg:grid-cols-2 lg:gap-20`}>
          <div className="relative min-w-0 lg:sticky lg:top-40">
            <div aria-hidden="true" className="absolute -bottom-5 -left-5 right-12 top-12 hidden rounded-[2.5rem] bg-[var(--tint2)] sm:block" />
            <Img className="relative block h-auto max-h-[36rem] w-full rounded-[2rem] object-cover" src={image} alt={b.about.imageAlt || ''} sizes="(max-width: 1024px) 100vw, 46vw" />
          </div>
          <div className="min-w-0">
            <Eyebrow>Welcome</Eyebrow>
            <h2 className="font-heading font-display-2 text-[clamp(1.85rem,1.3rem+2vw,2.75rem)] leading-[1.12] text-ink [text-wrap:balance]">{unbroken(b.about.title)}</h2>
            {text.slice(0, values.length ? 1 : 2).map((t) => (
              <p key={t} className={`mt-5 ${lead}`}>
                {t}
              </p>
            ))}
            {valueList}
            {links}
          </div>
        </div>
      </section>
    );
  }
  if (!values.length) {
    // The story alone: its heading on the left and its words on the right, so the band is laid out rather than half empty.
    return (
      <section className={`py-[clamp(4rem,8vw,6.5rem)] ${bg}`}>
        <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20`}>
          <div className="min-w-0">
            <Eyebrow>Welcome</Eyebrow>
            <h2 className="font-heading font-display-2 text-[clamp(1.85rem,1.3rem+2vw,2.75rem)] leading-[1.12] text-ink [text-wrap:balance]">{unbroken(b.about.title)}</h2>
            <div className="hidden lg:block">{links}</div>
          </div>
          <div className="min-w-0 lg:pt-10">
            {text.map((t, i) => (
              <p key={t} className={`${i ? 'mt-5' : ''} ${i ? lead : 'text-[18px] leading-[1.7] text-ink/85 sm:text-[20px]'}`}>
                {t}
              </p>
            ))}
            <div className="lg:hidden">{links}</div>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className={`py-[clamp(4rem,8vw,6.5rem)] ${bg}`}>
      <div className={`${wrap} grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20`}>
        <div className="min-w-0">
          <Eyebrow>Welcome</Eyebrow>
          <h2 className="font-heading font-display-2 text-[clamp(1.85rem,1.3rem+2vw,2.75rem)] leading-[1.12] text-ink [text-wrap:balance]">{unbroken(b.about.title)}</h2>
          {text.map((t) => (
            <p key={t} className={`mt-5 ${lead}`}>
              {t}
            </p>
          ))}
          {links}
        </div>
        {values.length > 0 && (
          <ul className="grid content-start gap-4">
            {values.map((v) => (
              <li key={v.title} className={`flex gap-4 p-6 ${card}`}>
                <span className="mt-0.5 grid size-8 flex-none place-items-center rounded-full bg-primary text-white">
                  <Check size={16} strokeWidth={2.6} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block font-heading font-display-2 text-[1.1rem] text-ink">{v.title}</span>
                  {v.text && <span className="mt-1 block text-[15.5px] leading-[1.6] text-muted">{v.text}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function CredentialList({ items, className = '' }) {
  if (!items.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2.5 ${className}`}>
      {items.map((c) => (
        <li key={c.label} className="inline-flex items-start gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-[14.5px] leading-snug ring-1 ring-[color:var(--line)]">
          <Award size={16} className="mt-0.5 flex-none text-accent" aria-hidden="true" />
          <span className="min-w-0">
            <span className="font-semibold text-ink">{c.label}</span>
            {c.detail && <span className="text-muted"> · {c.detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Doctor({ b, bg, hasTeam }) {
  const docs = doctorsOf(b);
  if (!docs) return null;
  const { lead: doc, others } = docs;
  const creds = credentialsOf(b);
  const bio = doc.text ? opening(doc.text, 440) : '';
  const eyebrow = others.length ? 'Meet our doctors' : 'Meet the doctor';
  const more = (
    <>
      {others.length > 0 && (
        <ul className={`mt-8 grid gap-3 sm:grid-cols-2 ${doc.image ? '' : 'lg:grid-cols-1'}`}>
          {others.slice(0, 4).map((p) => (
            <li key={p.name} className="flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-[color:var(--line)]">
              <span className="grid size-10 flex-none place-items-center rounded-full bg-[var(--tint)] text-primary">
                <Stethoscope size={19} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold leading-snug text-ink">{p.name}</span>
                {p.role && <span className="block text-[14px] text-muted">{p.role}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
      {hasTeam && (
        <div className="mt-7">
          <TextLink href="/team">Meet the whole team</TextLink>
        </div>
      )}
    </>
  );
  if (doc.image) {
    return (
      <section className={`py-[clamp(4rem,8vw,6.5rem)] ${bg}`}>
        <div className={`${wrap} grid items-center gap-14 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-20`}>
          <div className="relative mx-auto w-full max-w-[27rem]">
            <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 rounded-[2.25rem] bg-[var(--tint2)]" />
            <Img className="relative block aspect-[4/5] w-full rounded-[2.25rem] object-cover object-top" src={doc.image} alt={doc.imageAlt || doc.name} sizes="(max-width: 1024px) 90vw, 30vw" />
            <div className="absolute -bottom-5 left-5 right-5 rounded-2xl bg-white px-5 py-4 shadow-[0_24px_48px_-26px_rgba(16,32,48,0.55)] ring-1 ring-black/5">
              <p className="font-heading font-display-2 text-[1.15rem] leading-snug text-ink">{doc.name}</p>
              {doc.role && <p className="text-[14.5px] text-muted">{doc.role}</p>}
            </div>
          </div>
          <div className="min-w-0">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="font-heading font-display-2 text-[clamp(1.85rem,1.3rem+2vw,2.75rem)] leading-[1.12] text-ink [text-wrap:balance]">{doc.name}</h2>
            {bio && <p className={`mt-5 ${lead}`}>{bio}</p>}
            <CredentialList items={creds} className="mt-7" />
            {more}
          </div>
        </div>
      </section>
    );
  }
  // Only a name, a role and credentials: they run across the card in one row,
  // so no wide empty half is left where a photo or a bio would stand.
  if (!bio && !others.length) {
    return (
      <section className={`py-[clamp(4rem,8vw,6.5rem)] ${bg}`}>
        <div className={wrap}>
          <div className="grid gap-7 rounded-[2.25rem] bg-[var(--tint)] p-6 sm:p-10 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,auto)] lg:items-center lg:gap-10 lg:p-14">
            <span className="grid size-16 place-items-center rounded-[1.25rem] bg-white text-primary shadow-[0_14px_30px_-20px_rgba(16,32,48,0.5)] lg:size-20">
              <Stethoscope size={30} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <Eyebrow>{eyebrow}</Eyebrow>
              <h2 className="font-heading font-display-2 text-[clamp(1.85rem,1.3rem+2vw,2.75rem)] leading-[1.12] text-ink [text-wrap:balance]">{doc.name}</h2>
              {doc.role && <p className="mt-2 text-[16px] font-semibold text-accent">{doc.role}</p>}
            </div>
            {(creds.length > 0 || hasTeam) && (
              <div className="min-w-0 lg:max-w-md lg:justify-self-end">
                <CredentialList items={creds} className="lg:justify-end" />
                {hasTeam && (
                  <div className={creds.length ? 'mt-6 lg:text-right' : 'lg:text-right'}>
                    <TextLink href="/team">Meet the whole team</TextLink>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className={`py-[clamp(4rem,8vw,6.5rem)] ${bg}`}>
      <div className={wrap}>
        <div className={`grid gap-10 rounded-[2.25rem] bg-[var(--tint)] p-6 sm:p-10 lg:gap-16 lg:p-14 ${bio || others.length ? 'lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]' : ''}`}>
          <div className="min-w-0">
            <span className="grid size-16 place-items-center rounded-[1.25rem] bg-white text-primary shadow-[0_14px_30px_-20px_rgba(16,32,48,0.5)]">
              <Stethoscope size={30} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <Eyebrow className="mt-7">{eyebrow}</Eyebrow>
            <h2 className="font-heading font-display-2 text-[clamp(1.85rem,1.3rem+2vw,2.75rem)] leading-[1.12] text-ink [text-wrap:balance]">{doc.name}</h2>
            {doc.role && <p className="mt-2 text-[16px] font-semibold text-accent">{doc.role}</p>}
            <CredentialList items={creds} className="mt-7" />
            {bio && <div className="hidden lg:block">{more}</div>}
          </div>
          {(bio || others.length > 0 || hasTeam) && (
            <div className={`min-w-0 ${bio ? 'lg:self-center' : 'lg:pt-2'}`}>
              {bio && <p className="font-heading text-[clamp(1.1rem,1rem+0.45vw,1.32rem)] leading-[1.65] text-ink/85">{bio}</p>}
              <div className={bio ? 'lg:hidden' : ''}>{more}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Steps({ b, bg }) {
  const plan = stepsOf(b);
  if (!plan) return null;
  const cols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 xl:grid-cols-4', 5: 'md:grid-cols-3 xl:grid-cols-5' }[plan.steps.length];
  return (
    <section className={`py-[clamp(4rem,8vw,6.5rem)] ${bg}`}>
      <div className={wrap}>
        <SectionHead eyebrow="What to expect" title={plan.title} text={plan.text} />
        <ol className={`grid gap-4 lg:gap-5 ${cols}`}>
          {plan.steps.map((s, i) => (
            <li key={s.title} className={`relative flex flex-col p-6 sm:p-7 ${card}`}>
              <span className="flex items-center gap-3">
                <span className="grid size-11 flex-none place-items-center rounded-full bg-primary font-heading text-[17px] font-semibold text-white">{i + 1}</span>
                {i < plan.steps.length - 1 && <span aria-hidden="true" className="hidden h-px flex-1 border-t-2 border-dashed border-primary/20 md:block" />}
              </span>
              <h3 className="mt-6 font-heading font-display-2 text-[1.2rem] leading-snug text-ink">{s.title}</h3>
              {s.text && <p className="mt-2 text-[15.5px] leading-[1.6] text-muted">{s.text}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PayBlock({ block }) {
  const short = block.items.length > 0 && block.items.every((i) => String(i).length <= 60);
  return (
    <div className={`mb-5 break-inside-avoid p-6 sm:p-7 ${card}`}>
      <h3 className="font-heading font-display-2 text-[1.15rem] leading-snug text-ink">{block.heading}</h3>
      {block.text && <p className="mt-3 text-[15.5px] leading-[1.65] text-muted">{block.text}</p>}
      {short ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {block.items.map((item) => (
            <li key={item} className="rounded-full bg-[var(--tint)] px-3.5 py-1.5 text-[14.5px] font-semibold text-ink">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        block.items.length > 0 && (
          <ul className="mt-4 grid gap-2.5">
            {block.items.map((item) => (
              <li key={item} className="flex gap-2.5 text-[15.5px] leading-[1.55] text-muted">
                <Check size={17} strokeWidth={2.4} className="mt-0.5 flex-none text-primary" aria-hidden="true" />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}

function Insurance({ b, bg }) {
  const blocks = payBlocks(b);
  if (!blocks.length) return null;
  return (
    <section className={`py-[clamp(4rem,8vw,6.5rem)] ${bg}`}>
      <div className={wrap}>
        <SectionHead eyebrow="Insurance & payment" title="Insurance, payment and financing" />
        <div className={blocks.length > 1 ? 'md:columns-2 md:gap-5' : 'max-w-3xl'}>
          {blocks.map((block) => (
            <PayBlock key={block.heading} block={block} />
          ))}
        </div>
      </div>
    </section>
  );
}

const SOURCE = { google: 'Google', facebook: 'Facebook', yelp: 'Yelp' };
function sourceOf(r, b) {
  if (r.where) return r.where;
  if (!r.source) return '';
  if (/their site|website/i.test(r.source)) return `${b.shortName}'s website`;
  return SOURCE[String(r.source).toLowerCase()] || r.source;
}

function ReviewCard({ r, b, big = false }) {
  const text = r.text.length > 460 ? `${opening(r.text, 420)} …` : r.text;
  const from = sourceOf(r, b);
  return (
    <figure className={`m-0 flex h-full flex-col p-7 sm:p-8 ${card}`}>
      <Quote size={30} className="text-primary/25" aria-hidden="true" />
      {r.rating && <Stars value={r.rating} size={16} className="mt-4 text-star" />}
      <blockquote className={`mt-4 text-ink ${big ? 'font-heading text-[clamp(1.15rem,1rem+0.5vw,1.35rem)] leading-[1.6]' : 'text-[16.5px] leading-[1.65]'}`}>&ldquo;{text}&rdquo;</blockquote>
      <figcaption className="mt-auto pt-6 text-[15px]">
        <span className="font-semibold text-ink">{r.author}</span>
        {from && <span className="text-muted"> · {from}</span>}
      </figcaption>
    </figure>
  );
}

function Reviews({ b, bg, limit = 3 }) {
  const reviews = reviewsOf(b).slice(0, limit);
  if (!reviews.length) return null;
  const rated = b.rating && b.reviewCount;
  const cols = reviews.length === 1 ? 'max-w-3xl' : reviews.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';
  return (
    <section className={`py-[clamp(4rem,8vw,6.5rem)] ${bg}`}>
      <div className={wrap}>
        <SectionHead
          eyebrow="Patient reviews"
          title="What patients say"
          action={
            rated ? (
              <a href={mapsHref(b)} className="flex items-center gap-4 rounded-[1.5rem] bg-white p-4 pr-6 text-ink no-underline ring-1 ring-[color:var(--line)] hover:ring-primary/30">
                <strong className="font-heading font-display text-[2.6rem] leading-none text-primary">{Number(b.rating).toFixed(1)}</strong>
                <span className="grid gap-1">
                  <Stars value={b.rating} size={17} />
                  <span className="text-[14.5px] text-muted">{b.reviewCount.toLocaleString('en-US')} Google reviews</span>
                </span>
                <ArrowUpRight size={18} className="text-primary" aria-hidden="true" />
              </a>
            ) : null
          }
        />
        <ul className={`grid gap-5 ${cols}`}>
          {reviews.map((r, i) => (
            <li key={r.text} className={reviews.length === 3 && i === 2 ? 'md:col-span-2 lg:col-span-1' : ''}>
              <ReviewCard r={r} b={b} big={reviews.length === 1} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ContactLines({ b, tel, className = '' }) {
  const langs = list(b.languages);
  return (
    <ul className={`grid gap-1 ${className}`}>
      <li>
        <a href={tel} className="flex min-h-12 items-center gap-3 font-semibold text-ink no-underline hover:text-primary">
          <span className="grid size-10 flex-none place-items-center rounded-full bg-[var(--tint)] text-primary">
            <Phone size={18} aria-hidden="true" />
          </span>
          {b.phone}
        </a>
      </li>
      {phonesOf(b).filter((p) => !p.main).map((p) => (
        <li key={p.number}>
          <a href={telHref(p.number)} className="flex min-h-12 items-center gap-3 font-semibold text-ink no-underline hover:text-primary">
            <span className="grid size-10 flex-none place-items-center rounded-full bg-[var(--tint)] text-primary">
              <Phone size={18} aria-hidden="true" />
            </span>
            <span>
              {p.number}
              {p.label && <span className="font-normal text-muted"> · {p.label}</span>}
            </span>
          </a>
        </li>
      ))}
      {b.email && (
        <li>
          <a href={`mailto:${b.email}`} className="flex min-h-12 items-center gap-3 font-semibold text-ink no-underline [overflow-wrap:anywhere] hover:text-primary">
            <span className="grid size-10 flex-none place-items-center rounded-full bg-[var(--tint)] text-primary">
              <Mail size={18} aria-hidden="true" />
            </span>
            {b.email.split('@').flatMap((p, i) => (i ? ['@', <wbr key={i} />, p] : [p]))}
          </a>
        </li>
      )}
      {langs.length > 0 && (
        <li className="flex min-h-12 items-center gap-3 text-ink">
          <span className="grid size-10 flex-none place-items-center rounded-full bg-[var(--tint)] text-primary">
            <Languages size={18} aria-hidden="true" />
          </span>
          {langs.join(', ')}
        </li>
      )}
    </ul>
  );
}

function Visit({ b, bg, tel, ctaLabel }) {
  const hours = list(b.hours);
  const area = list(b.serviceArea).filter((t) => t.toLowerCase() !== String(b.town).toLowerCase());
  return (
    <section className={`py-[clamp(4rem,8vw,6.5rem)] ${bg}`}>
      <div className={wrap}>
        <SectionHead eyebrow={hours.length ? 'Hours & location' : 'Location'} title={`Visit us in ${b.town}`} />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="relative isolate min-h-[23rem] overflow-hidden rounded-[2rem] ring-1 ring-black/5 lg:min-h-[28rem]">
            <MapArt />
            <div className="absolute inset-x-3 bottom-3 flex flex-col gap-4 rounded-[1.4rem] bg-white p-5 shadow-[0_24px_48px_-28px_rgba(16,32,48,0.55)] sm:inset-x-5 sm:bottom-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="flex min-w-0 items-start gap-3 text-[16px] leading-snug">
                <MapPin size={20} className="mt-0.5 flex-none text-primary" aria-hidden="true" />
                <span>
                  <span className="block font-semibold text-ink">{b.name}</span>
                  <span className="block text-muted">{b.address}</span>
                  <span className="block text-muted">
                    {b.town}, {b.state} {b.zip}
                  </span>
                </span>
              </p>
              <a href={mapsHref(b)} className={`${solid} min-h-[48px] flex-none px-6`}>
                Get Directions <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
          {/* Without hours the contact card stands alone beside the map, so it fills the column and ends with the booking button. */}
          <div className={`grid gap-5 ${hours.length ? 'content-start' : ''}`}>
            {hours.length > 0 && (
              <div className={`p-6 sm:p-8 ${card}`}>
                <h3 className="mb-5 flex items-center gap-2.5 font-heading font-display-2 text-[1.2rem] text-ink">
                  <Clock size={20} className="text-primary" aria-hidden="true" /> Office hours
                </h3>
                <HoursList hours={hours} />
              </div>
            )}
            <div className={`flex flex-col p-4 sm:p-6 ${card}`}>
              <ContactLines b={b} tel={tel} />
              {area.length > 0 && (
                <p className="mt-3 border-t border-[color:var(--line)] px-1 pt-4 text-[15px] leading-relaxed text-muted">
                  Also seeing patients from {area.join(', ')}.
                </p>
              )}
              {!hours.length && (
                <a href="/contact" className={`${solid} mt-6 w-full lg:mt-auto`}>
                  <CalendarCheck size={18} aria-hidden="true" /> {ctaLabel}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Closing({ b, tel, ctaLabel, title = 'Ready to book your visit?' }) {
  const Mark = kindIcon(b.kind);
  return (
    <section className="bg-white py-[clamp(3rem,6vw,5rem)]">
      <div className={wrap}>
        <div className="relative isolate overflow-hidden rounded-[2.25rem] bg-primary px-6 py-12 text-white sm:px-12 lg:px-16 lg:py-16">
          <div aria-hidden="true" className="absolute -right-24 -top-28 -z-10 size-[26rem] rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.16), transparent)' }} />
          <div aria-hidden="true" className="absolute -bottom-48 left-[22%] -z-10 size-[30rem] rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.09), transparent)' }} />
          <Mark size={220} strokeWidth={0.8} aria-hidden="true" className="absolute -bottom-10 right-6 -z-10 hidden text-white/10 lg:block" />
          {/* The words and buttons stand clear of the mark, which keeps the band's right side to itself. */}
          <div className="grid gap-8 lg:pr-64">
            <div className="min-w-0 max-w-2xl">
              <h2 className="font-heading font-display-2 text-[clamp(1.75rem,1.25rem+1.9vw,2.6rem)] leading-tight text-white [text-wrap:balance]">{title}</h2>
              {b.cta?.text && <p className="mt-3 text-[17px] leading-[1.6] text-white/85 sm:text-lg">{b.cta.text}</p>}
            </div>
            <div className="grid flex-none gap-3 sm:flex sm:flex-wrap">
              <a href="/contact" className={onColor}>
                <CalendarCheck size={18} aria-hidden="true" /> {ctaLabel}
              </a>
              <a href={tel} className={ghost}>
                <Phone size={17} aria-hidden="true" /> {b.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq({ items }) {
  return (
    <div className="grid gap-3">
      {items.map((f) => (
        <details key={f.q} className={`group ${card} px-5 sm:px-7`}>
          <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-6 py-4 font-heading font-display-2 text-[17px] leading-snug text-ink sm:text-[1.1rem] [&::-webkit-details-marker]:hidden">
            {f.q}
            <span className="grid size-9 flex-none place-items-center rounded-full bg-[var(--tint)] text-primary transition-transform group-open:rotate-45">
              <Plus size={18} strokeWidth={2} aria-hidden="true" />
            </span>
          </summary>
          <p className="max-w-3xl pb-6 text-[16px] leading-[1.7] text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- sub-pages */

function Crumbs({ trail }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 lg:mb-10">
      <ol className="flex items-center gap-x-2 text-[15px] text-muted">
        {trail.map(([href, label], i) => (
          <li key={label} className={`flex items-center gap-2 ${href ? 'flex-none' : 'min-w-0'}`}>
            {href ? (
              <a href={href} className="inline-flex min-h-11 min-w-11 items-center text-muted no-underline hover:text-primary hover:underline">
                {label}
              </a>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">
                {label}
              </span>
            )}
            {i < trail.length - 1 && (
              <span aria-hidden="true" className="text-muted/50">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function PageHero({ trail, eyebrow, title, text, image, imageAlt, aside, children }) {
  const split = image || aside;
  return (
    <section className="relative isolate overflow-hidden bg-[var(--tint)]">
      <Backdrop />
      <div className={`${wrap} pb-[clamp(3rem,7vw,5.5rem)] pt-4 lg:pt-6`}>
        <Crumbs trail={trail} />
        <div className={`grid items-center gap-10 ${split ? 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16' : ''}`}>
          <div className="min-w-0 max-w-3xl">
            {eyebrow}
            <h1 className="break-words font-heading font-display text-[clamp(2.15rem,1.4rem+3vw,3.6rem)] leading-[1.08] text-ink [text-wrap:balance]">{unbroken(title)}</h1>
            {text && <p className={`mt-5 max-w-2xl ${lead}`}>{text}</p>}
            {children}
          </div>
          {image && (
            <Img className="block h-auto max-h-[30rem] w-full rounded-[2rem] object-cover shadow-[0_40px_80px_-48px_rgba(16,32,48,0.6)]" src={image} alt={imageAlt || ''} sizes="(max-width: 1024px) 100vw, 46vw" eager />
          )}
          {!image && aside}
        </div>
      </div>
    </section>
  );
}

/** The office at a glance beside a page's opening: the call, the hours, the button. */
function OfficeCard({ b, tel, ctaLabel, k }) {
  const hours = list(b.hours);
  return (
    <aside className="rounded-[1.75rem] bg-white p-6 shadow-[0_40px_80px_-48px_rgba(16,32,48,0.6)] ring-1 ring-black/5 sm:p-8">
      <p className="font-heading font-display-2 text-xl text-ink">Talk it through with {b.talk || k.talk}</p>
      <a href={tel} className="mt-4 flex min-h-11 items-center gap-3 text-lg font-bold text-primary no-underline hover:underline">
        <Phone size={19} aria-hidden="true" /> {b.phone}
      </a>
      {hours.length > 0 && <HoursList hours={hours} className="mt-4 border-t border-[color:var(--line)] pt-5 text-[15px]" />}
      <a href="/contact" className={`${solid} mt-6 w-full`}>
        <CalendarCheck size={18} aria-hidden="true" /> {ctaLabel}
      </a>
    </aside>
  );
}

/**
 * The home page's view of the brand: a hero with no photo of its own leads with
 * the practice's about photo when there is one (a patient wants to see the
 * practice), and the about section then goes without it, so it is not shown twice.
 */
function borrowPhoto(b) {
  if (b.hero?.image || !b.about?.image || b.heroStyle === 'type') return b;
  return { ...b, hero: { ...b.hero, image: b.about.image, imageAlt: b.about.imageAlt || '' }, about: { ...b.about, image: null } };
}

function HomePage(props) {
  const b = borrowPhoto(props.b);
  props = { ...props, b };
  const { k, hasTeam, tel } = props;
  const strip = list(b.highlights).filter((h) => h?.title).length >= 2;
  const sections = [
    ['treatments', true, (bg) => <Treatments b={b} k={k} bg={bg} />],
    ['about', Boolean(b.about?.title && (aboutText(b).length || b.about.image || list(b.about.values).length)), (bg) => <About b={b} bg={bg} />],
    ['doctor', Boolean(doctorsOf(b)), (bg) => <Doctor b={b} bg={bg} hasTeam={hasTeam} />],
    ['steps', Boolean(stepsOf(b)), (bg) => <Steps b={b} bg={bg} />],
    ['insurance', payBlocks(b).length > 0, (bg) => <Insurance b={b} bg={bg} />],
    ['reviews', reviewsOf(b).length > 0, (bg) => <Reviews b={b} bg={bg} />],
    ['visit', true, (bg) => <Visit b={b} bg={bg} tel={tel} ctaLabel={props.ctaLabel} />],
  ].filter(([, show]) => show);
  return (
    <>
      <Hero {...props} strip={strip} />
      {strip && <Highlights b={b} />}
      {sections.map(([key, , draw], i) => (
        <div key={key} className="contents">
          {draw(GROUNDS[i % GROUNDS.length])}
        </div>
      ))}
      <Closing {...props} />
    </>
  );
}

function ServicesPage(props) {
  const { b, k } = props;
  return (
    <>
      <PageHero
        trail={[['/', 'Home'], [null, k.menu]]}
        eyebrow={<Eyebrow>{k.menu}</Eyebrow>}
        title={b.overview?.title || `${k.care} at ${b.shortName}`}
        text={b.overview?.text}
      />
      <Treatments b={b} k={k} bg="bg-white" heading={false} />
      <Steps b={b} bg="bg-[var(--warm)]" />
      <Closing {...props} />
    </>
  );
}

function ServicePage(props) {
  const { b, s, k, tel, ctaLabel } = props;
  const Icon = treatmentIcon(s, b.kind);
  const covers = list(s.covers);
  const questions = list(s.questions);
  const related = list(b.services).filter((o) => o !== s && hasPage(o)).slice(0, 3);
  return (
    <>
      <PageHero
        trail={[['/', 'Home'], ['/services', k.menu], [null, s.title]]}
        eyebrow={
          <span className="mb-6 grid size-14 place-items-center rounded-2xl bg-white text-primary shadow-[0_14px_30px_-20px_rgba(16,32,48,0.5)]">
            <Icon size={28} strokeWidth={1.6} aria-hidden="true" />
          </span>
        }
        title={s.title}
        text={s.lead || s.text}
        image={s.image}
        imageAlt={s.imageAlt}
        aside={<OfficeCard b={b} tel={tel} ctaLabel={ctaLabel} k={k} />}
      >
        <div className={`mt-8 gap-3 sm:flex-wrap ${s.image ? 'grid sm:flex' : 'hidden lg:flex'}`}>
          <a href="/contact" className={solid}>
            <CalendarCheck size={18} aria-hidden="true" /> {ctaLabel}
          </a>
          <a href={tel} className={outline}>
            <Phone size={17} className="text-primary" aria-hidden="true" /> Call {b.phone}
          </a>
        </div>
      </PageHero>

      {covers.length > 0 && (
        <section className="bg-white py-[clamp(4rem,8vw,6.5rem)]">
          <div className={wrap}>
            <SectionHead eyebrow="What it involves" title={`${s.title} at ${b.shortName}`} />
            <ul className={`grid gap-4 lg:gap-5 ${covers.length % 3 === 0 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}>
              {covers.map((c) => (
                <li key={c.title} className={`flex gap-4 p-6 lg:p-7 ${card}`}>
                  <span className="grid size-9 flex-none place-items-center rounded-full bg-[var(--tint)] text-primary">
                    <Check size={18} strokeWidth={2.4} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-heading font-display-2 text-[1.15rem] leading-snug text-ink">{c.title}</h3>
                    {c.text && <p className="mt-1.5 text-[15.5px] leading-[1.6] text-muted">{c.text}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {questions.length > 0 && (
        <section className="bg-[var(--warm)] py-[clamp(4rem,8vw,6.5rem)]">
          <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20`}>
            <div>
              <Eyebrow>Common questions</Eyebrow>
              <h2 className="font-heading font-display-2 text-[clamp(1.85rem,1.3rem+2vw,2.75rem)] leading-[1.12] text-ink [text-wrap:balance]">{unbroken(s.title)}, answered.</h2>
            </div>
            <Faq items={questions} />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="bg-white py-[clamp(4rem,8vw,6.5rem)]">
          <div className={wrap}>
            <h2 className="mb-7 font-heading font-display-2 text-[clamp(1.4rem,1.1rem+1vw,1.8rem)] text-ink">More {k.menu.toLowerCase()}</h2>
            <ul className="grid gap-4 md:grid-cols-3 lg:gap-5">
              {related.map((o) => {
                const RIcon = treatmentIcon(o, b.kind);
                return (
                  <li key={o.slug}>
                    <a href={`/services/${o.slug}`} className={`group flex h-full items-center gap-4 p-4 pr-5 text-ink no-underline transition hover:ring-primary/30 ${card}`}>
                      <IconTile Icon={RIcon} size="size-12" icon={24} />
                      <span className="min-w-0 flex-1 font-heading font-display-2 text-[1.08rem] leading-snug">{o.title}</span>
                      <ArrowRight size={18} className="flex-none text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
      <Closing {...props} title={`Questions about ${s.title.toLowerCase().replace(/\b(tmj|tmd|cbct|3d)\b/g, (w) => w.toUpperCase())}?`} />
    </>
  );
}

function TeamPage(props) {
  const { b } = props;
  const team = list(b.team);
  const photos = team.some((p) => p.image);
  const cols = team.length === 1 ? 'max-w-3xl' : team.length === 2 || team.length === 4 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';
  return (
    <>
      <PageHero trail={[['/', 'Home'], [null, 'Our Team']]} eyebrow={<Eyebrow>Our team</Eyebrow>} title={`The people behind ${b.shortName}`} text={b.tagline} />
      <section className="bg-white py-[clamp(4rem,8vw,6.5rem)]">
        <ul className={`${wrap} grid gap-5 ${cols}`}>
          {team.map((p) => (
            <li key={p.name} className={`flex min-w-0 flex-col overflow-hidden ${card}`}>
              {photos &&
                (p.image ? (
                  <Img className="aspect-[4/5] w-full object-cover object-top" src={p.image} alt={p.imageAlt || p.name} sizes="(max-width: 768px) 100vw, 33vw" />
                ) : (
                  <span aria-hidden="true" className="grid aspect-[4/5] w-full place-items-center bg-[var(--tint)] text-primary/60">
                    <Stethoscope size={56} strokeWidth={1.1} />
                  </span>
                ))}
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                {!photos && (
                  <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-[var(--tint)] text-primary">
                    <Stethoscope size={24} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                )}
                <h2 className="font-heading font-display-2 text-[1.3rem] leading-snug text-ink">{p.name}</h2>
                {p.role && <p className="mt-1 text-[14px] font-bold uppercase tracking-[0.12em] text-accent">{p.role}</p>}
                {p.bio && <p className="mt-4 text-[15.5px] leading-[1.65] text-muted">{p.bio}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <Closing {...props} />
    </>
  );
}

function AboutPage(props) {
  const { b, hasTeam, tel } = props;
  const text = paras(b.about.text);
  const values = list(b.about.values);
  const area = list(b.serviceArea);
  const creds = credentialsOf(b);
  return (
    <>
      <PageHero trail={[['/', 'Home'], [null, 'About']]} eyebrow={<Eyebrow>About {b.shortName}</Eyebrow>} title={b.about.title} image={b.about.image} imageAlt={b.about.imageAlt} />
      <section className="bg-white py-[clamp(4rem,8vw,6.5rem)]">
        <div className={`${wrap} grid gap-12 ${values.length || area.length > 1 || creds.length ? 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20' : ''}`}>
          <div className="min-w-0 max-w-3xl space-y-5">
            {text.map((t) => (
              <p key={t} className="text-[17px] leading-[1.75] text-ink/85 sm:text-lg">
                {t}
              </p>
            ))}
          </div>
          {(values.length > 0 || area.length > 1 || creds.length > 0) && (
            <div className="grid min-w-0 content-start gap-10">
              {values.length > 0 && (
                <div>
                  <h2 className="mb-5 font-heading font-display-2 text-2xl text-ink">What to expect</h2>
                  <ul className="grid gap-3">
                    {values.map((v) => (
                      <li key={v.title} className="flex gap-3.5 rounded-2xl bg-[var(--tint)] p-5">
                        <span className="mt-0.5 grid size-7 flex-none place-items-center rounded-full bg-primary text-white">
                          <Check size={15} strokeWidth={2.6} aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-ink">{v.title}</span>
                          {v.text && <span className="mt-0.5 block text-[15.5px] leading-[1.6] text-muted">{v.text}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {creds.length > 0 && (
                <div>
                  <h2 className="mb-5 font-heading font-display-2 text-2xl text-ink">{b.affiliations?.title && !list(b.credentials).length ? b.affiliations.title : 'Credentials'}</h2>
                  <CredentialList items={creds} />
                </div>
              )}
              {area.length > 1 && (
                <div>
                  <h2 className="mb-4 font-heading font-display-2 text-2xl text-ink">Where our patients come from</h2>
                  <ul className="flex flex-wrap gap-2.5">
                    {area.map((t) => (
                      <li key={t} className="flex items-center gap-1.5 rounded-full bg-[var(--tint)] px-4 py-2 text-[15px] font-semibold text-ink">
                        <MapPin size={14} className="text-accent" aria-hidden="true" /> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <Doctor b={b} bg="bg-[var(--warm)]" hasTeam={hasTeam} />
      <Steps b={b} bg="bg-white" />
      <Reviews b={b} bg="bg-[var(--tint)]" limit={6} />
      <Visit b={b} bg="bg-white" tel={tel} ctaLabel={props.ctaLabel} />
      <Closing {...props} />
    </>
  );
}

function ResourcesPage(props) {
  const { b } = props;
  const faqs = list(b.faqs);
  const links = list(b.resources);
  return (
    <>
      <PageHero trail={[['/', 'Home'], [null, links.length ? 'Resources' : 'FAQs']]} eyebrow={<Eyebrow>Patient resources</Eyebrow>} title={links.length ? 'Resources and common questions' : 'Common questions'} />
      {faqs.length > 0 && (
        <section className="bg-white py-[clamp(4rem,8vw,6.5rem)]">
          <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-20`}>
            <div>
              <Eyebrow>Questions</Eyebrow>
              <h2 className="font-heading font-display-2 text-[clamp(1.85rem,1.3rem+2vw,2.75rem)] leading-[1.12] text-ink [text-wrap:balance]">What patients ask us most.</h2>
            </div>
            <Faq items={faqs} />
          </div>
        </section>
      )}
      {links.length > 0 && (
        <section className="bg-[var(--warm)] py-[clamp(4rem,8vw,6.5rem)]">
          <div className={wrap}>
            <SectionHead eyebrow="Useful links" title="Worth having on hand." />
            <ul className={`grid gap-4 lg:gap-5 ${GRID[Math.min(links.length, 3)]}`}>
              {links.map((r) => (
                <li key={r.href}>
                  <a href={r.href} rel="noopener" className={`group flex h-full flex-col p-6 text-ink no-underline transition hover:ring-primary/30 lg:p-7 ${card}`}>
                    <span className="font-heading font-display-2 text-xl leading-snug">{r.title}</span>
                    {r.text && <span className="mb-5 mt-2 text-[15.5px] leading-[1.6] text-muted">{r.text}</span>}
                    <span className="mt-auto inline-flex items-center gap-1.5 font-semibold text-primary">
                      Visit Site <ExternalLink size={15} aria-hidden="true" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <Closing {...props} />
    </>
  );
}

function ContactPage(props) {
  const { b, tel, ctaLabel } = props;
  const hours = list(b.hours);
  const area = list(b.serviceArea);
  return (
    <>
      <PageHero trail={[['/', 'Home'], [null, 'Contact']]} eyebrow={<Eyebrow>Contact</Eyebrow>} title={ctaLabel} text={b.cta?.text} />
      <section className="bg-white py-[clamp(4rem,8vw,6.5rem)]">
        <div className={`${wrap} grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-14`}>
          <div className={`min-w-0 p-5 sm:p-8 lg:p-10 ${card}`}>
            <h2 className="mb-6 font-heading font-display-2 text-2xl text-ink">Tell us a little about your visit</h2>
            <EnquiryForm
              b={b}
              submitLabel={ctaLabel}
              styles={{
                form: '',
                label: 'text-[15px] font-semibold text-ink',
                field:
                  'min-h-12 rounded-2xl border border-[color:var(--line)] bg-[var(--tint)] px-4 py-3 font-body text-base font-normal text-ink outline-none transition-colors focus:border-primary focus:bg-white',
                button: `${solid} mt-2 w-full`,
                done: 'rounded-2xl bg-[var(--tint)] p-6 text-ink',
              }}
              fields={[
                { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
                { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
                { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
                { name: 'service', label: 'What Can We Help With?', type: 'select', options: [...list(b.services).map((s) => s.title), 'Something else'] },
                { name: 'message', label: 'Anything we should know?', type: 'textarea', wide: true },
              ]}
            />
          </div>
          <div className="grid min-w-0 content-start gap-5">
            <div className={`p-4 sm:p-6 ${card}`}>
              <ContactLines b={b} tel={tel} />
              <a href={mapsHref(b)} className="mt-1 flex min-h-12 items-start gap-3 py-1 font-semibold text-ink no-underline hover:text-primary">
                <span className="grid size-10 flex-none place-items-center rounded-full bg-[var(--tint)] text-primary">
                  <MapPin size={18} aria-hidden="true" />
                </span>
                <span className="pt-2 leading-snug">
                  {b.address}, {b.town}, {b.state} {b.zip}
                </span>
              </a>
            </div>
            {hours.length > 0 && (
              <div className="rounded-[1.75rem] bg-[var(--tint)] p-6 sm:p-7">
                <h2 className="mb-4 flex items-center gap-2.5 font-heading font-display-2 text-[1.15rem] text-ink">
                  <Clock size={19} className="text-primary" aria-hidden="true" /> Office hours
                </h2>
                <HoursList hours={hours} />
              </div>
            )}
            {area.length > 1 && (
              <div className="px-2">
                <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[0.16em] text-muted">Serving</h2>
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

function Footer({ b, k, nav, tel }) {
  const hours = list(b.hours);
  const linkCls = 'inline-flex min-h-11 items-center text-muted no-underline hover:text-primary';
  return (
    <footer className="border-t border-[color:var(--line)] bg-[var(--tint)] text-base">
      <div className={`${wrap} grid gap-10 pb-10 pt-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))] lg:gap-10 lg:pt-20`}>
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <a href="/" className="inline-flex min-h-11 max-w-full items-center no-underline" aria-label={`${b.name} home`}>
            <BrandLogo b={b} ground={palette(b.brand).tint} textClass="text-ink" />
          </a>
          {b.tagline && <p className="mt-4 max-w-xs leading-relaxed text-muted">{b.tagline}</p>}
          <a href={mapsHref(b)} className="mt-4 block leading-relaxed text-ink no-underline hover:text-primary">
            {b.address}
            <br />
            {b.town}, {b.state} {b.zip}
          </a>
        </div>
        <nav aria-label="Footer" className="min-w-0">
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.16em] text-ink">{b.shortName}</h2>
          <ul>
            {[['services', `All ${k.menu}`], ...nav].map(([href, label]) => (
              <li key={href}>
                <a href={`/${href}`} className={linkCls}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0">
          <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.16em] text-ink">Call or write</h2>
          <ul>
            <li>
              <a href={tel} className={`${linkCls} font-semibold !text-primary`}>
                {b.phone}
              </a>
            </li>
            {phonesOf(b).filter((p) => !p.main).map((p) => (
              <li key={p.number}>
                <a href={telHref(p.number)} className={linkCls}>
                  {p.number}
                  {p.label ? ` (${p.label})` : ''}
                </a>
              </li>
            ))}
            {b.email && (
              <li>
                <a href={`mailto:${b.email}`} className={`${linkCls} [overflow-wrap:anywhere]`}>
                  {/* Breaks after the @ before it breaks a word, so a long address never leaves a letter alone. */}
                  <span className="min-w-0">{b.email.split('@').flatMap((p, i) => (i ? ['@', <wbr key={i} />, p] : [p]))}</span>
                </a>
              </li>
            )}
            {list(b.languages).length > 0 && <li className="mt-2 text-muted">Languages: {list(b.languages).join(', ')}</li>}
          </ul>
        </div>
        <div className="min-w-0">
          {hours.length > 0 && (
            <>
              <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.16em] text-ink">Hours</h2>
              <dl className="grid gap-1.5 text-[15px]">
                {hours.map(([day, time]) => (
                  <div key={day} className="flex justify-between gap-4">
                    <dt className="text-ink">{day}</dt>
                    <dd className="m-0 text-right text-muted">{time}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>
      <div className={wrap}>
        <div className="flex flex-col gap-2 border-t border-[color:var(--line)] py-6 text-base text-muted sm:text-sm md:flex-row md:justify-between md:gap-8">
          <p>
            &copy; {new Date().getFullYear()} {b.name}
            <StudioCredit b={b} />
          </p>
          {b.license && <p className="md:max-w-[50%] md:text-right">{b.license}</p>}
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------------- root */

export default function Health({ b, path = '' }) {
  const k = KIND[b.kind] || KIND.dental;
  const ctaLabel = labelCase(b.cta?.label || k.cta);
  const tel = telHref(b.phone);
  const hasTeam = list(b.team).length > 0;
  const hasResources = list(b.faqs).length > 0 || list(b.resources).length > 0;
  const nav = [hasTeam && ['team', 'Our Team'], ['about', 'About'], hasResources && ['resources', list(b.resources).length ? 'Resources' : 'FAQs'], ['contact', 'Contact']].filter(Boolean);
  const service = path.startsWith('services/') ? list(b.services).find((s) => hasPage(s) && `services/${s.slug}` === path) : null;
  const props = { b, k, path, tel, ctaLabel, nav, hasTeam };
  const pal = palette(b.brand);

  let page = <HomePage {...props} />;
  if (service) page = <ServicePage {...props} s={service} />;
  else if (path === 'services') page = <ServicesPage {...props} />;
  else if (path === 'team' && hasTeam) page = <TeamPage {...props} />;
  else if (path === 'about') page = <AboutPage {...props} />;
  else if (path === 'resources' && hasResources) page = <ResourcesPage {...props} />;
  else if (path === 'contact') page = <ContactPage {...props} />;

  // The facts the insurance and payment section has drawn are not set out again under it.
  const shown = new Set(payBlocks(b).map((block) => block.fact).filter(Boolean));
  const rest = { ...b, facts: list(b.facts).filter((f) => !shown.has(f)) };
  const display = displayVars(b.brand);
  const classic = b.tone === 'classic';
  const serif = display['--display-weight'] === 400;

  return (
    <div
      className="min-w-0 overflow-x-clip bg-white font-body text-base text-ink antialiased [&_.font-heading]:[word-spacing:0.06em]"
      style={{
        '--ink': '#18222d',
        ...display,
        ...(classic ? { '--display-weight': serif ? 400 : 500, '--display-weight-2': serif ? 400 : 500, '--display-tracking': '-0.01em' } : {}),
        ...brandVars(b.brand),
        '--muted': 'color-mix(in srgb, var(--ink) 70%, #fff)',
        '--line': 'color-mix(in srgb, var(--ink) 11%, #fff)',
        '--primary': pal.primary,
        '--accent': pal.accent,
        '--tint': pal.tint,
        '--tint2': pal.tint2,
        '--warm': pal.warm,
        '--deep': pal.deep,
      }}
    >
      <Header {...props} />
      <main>{page}</main>
      {!path && (
        <div className="pb-6">
          <Facts b={rest} />
        </div>
      )}
      <Footer {...props} />
    </div>
  );
}
