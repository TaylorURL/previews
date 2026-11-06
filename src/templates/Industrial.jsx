/**
 * Industrial and business-to-business services: industrial contractors,
 * machine shops, welding and fabrication shops, industrial supply houses and
 * marine service companies, mostly working for plants, fleets and contractors
 * along the Houston ship channel. The people reading are plant managers,
 * purchasing agents and engineers, so the site leads with what the business
 * does and for whom, then its capabilities, the industries it works for, its
 * credentials and safety, its equipment, where it works, and a request for
 * quote. A site of several pages: home, one page per capability group, about
 * and contact.
 *
 * It reads a brand file of the same shape as the hvac template's, so a file
 * moved here changes only its "template". Every field but the ones marked
 * (req) is optional, and a section whose field is absent is left out.
 *
 *   template     (req) "industrial"
 *   preview            true on a prospect's preview; leave it out on a sample
 *   name         (req) Full business name, used in the footer and the title
 *   shortName    (req) The name as people say it; used in copy and buttons
 *   summary      (req) One sentence on what the business does and where. The
 *                      capabilities section's lead
 *   phone        (req) "(281) 555-0187", the Google listing's number
 *   phones             [{ label: "Groves", number: "(409) 727-7384" }] lines
 *                      beyond `phone`: header bar, quote band, contact, footer
 *   email              Header bar, quote band, contact page, footer
 *   address      (req) Street line, "4810 Garth Rd, Suite 6"
 *   town         (req) "Baytown"
 *   state        (req) "TX"
 *   zip                "77521"
 *   since              Year founded. The hero's specifications and about
 *   hours              [["Mon – Fri", "7 AM – 5 PM"], ...]
 *   rating             Google rating, shown only with reviewCount, and never
 *   reviewCount        as the hero's main proof: last of its specifications
 *   ask                Ignored: every button here asks for a quote
 *
 *   brand        (req) Colors and type, as the hvac template reads them:
 *     primary    (req) Buttons and marks on white. The dark ground of the
 *                      hero, the bands and the footer is drawn from
 *                      primaryDeep taken toward a blue-black
 *     primaryDeep      Derived from primary when absent
 *     accent           The mark on the dark ground: numbers, rules, the quote
 *                      button. One that does not stand out there is lifted
 *                      toward white, and the primary stands in when absent
 *     ink, muted, surface, line   As in the hvac template
 *     heading    (req) CSS font stack for headings. A condensed face (Oswald,
 *                      Roboto Condensed, Barlow Condensed) is set in capitals
 *                      when the tone is bold
 *     body       (req) CSS font stack for body text
 *     fonts      (req) Google Fonts stylesheet URL loading both faces
 *     logo, logoMono, logoWidth, logoHeight, logoRatio, logoGround, logoReads,
 *     logoName         As BrandLogo in shared.jsx reads them
 *
 *   heroStyle          "split" (the default with hero.image: the words on the
 *                      dark ground beside the photo), "photo" (the photo full
 *                      width behind the words) or "type" (the default without
 *                      a photo: a drawn hero of blueprint grid, brushed
 *                      steel and a flange drawn in fine line, with a title
 *                      block of the capabilities)
 *   tone               "bold" (the default: heavy weights, tight tracking) or
 *                      "classic" (lighter weights, sentence case throughout)
 *
 *   hero         (req) eyebrow, title (req), titleAccent (drawn in the accent),
 *                      lead (req), image, imageAlt
 *   highlights         [{ title, text, icon }] 2 to 4, a strip under the hero
 *   groups       (req) Capability groups, one page each, as in the hvac
 *                      template: slug, title, icon, summary, intro, image,
 *                      imageAlt, services: [{ slug, title, icon, text, points }]
 *   industries         ["Petrochemical", "Marine"] who they work for
 *   credentials        [{ label: "ISO 9001:2015", detail: "Certified since 2012" }]
 *   licenses           [{ label, number }] as in the hvac template; drawn with
 *                      the credentials
 *   statesServed       ["Texas", "Louisiana"]
 *   serviceArea        ["Baytown", "Deer Park"] towns served
 *   projects           [{ title, text, image, imageAlt }] their own work, in
 *                      their own photos. Without it the gallery is drawn from
 *                      the capability groups' photos
 *   steps              [{ title, text }] how a job runs, 3 or 4 steps
 *   about              eyebrow, title (req), text: [paragraphs] (req), image,
 *                      imageAlt, values: [{ title, text }]
 *   owner              { name, role, text, image } on the about section
 *   reviews            [{ author, text, source, rating }] quoted word for word
 *   emergency          { title, text } when they answer around the clock
 *   faqs               [{ q, a }]
 *   facts              As Facts in shared.jsx reads them. A fact headed as
 *                      one of this template's sections (Industries Served,
 *                      Certifications, Machining Equipment, Our Locations,
 *                      How a Job Runs, Selected Projects ...) is drawn in that
 *                      section instead, never in both; the rest stay with Facts
 */
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronDown, Clock3, Mail, MapPin, Menu, Phone, Plus, Quote, ShieldCheck, Siren, X } from 'lucide-react';
import { brandVars, displayVars, mapsHref, telHref } from '../site.js';
import { BrandLogo, EnquiryForm, Facts, Img, Stars, StudioCredit } from './shared.jsx';
import { condensed, gather, headlineSize, heroStyleOf, list, nn, palette, specsOf, split, stateCode } from './industrial/data.js';
import { groupIcon, highlightIcon, industryIcon } from './industrial/icons.js';

const groupsOf = (b) => list(b.groups).filter((g) => g?.slug && g?.title);

/** The pages beyond home: one per capability group, about, contact. */
export function pages(b) {
  return [...groupsOf(b).map((g) => g.slug), b.about ? 'about' : null, 'contact'].filter(Boolean);
}

/* ----------------------------------------------------------------- styling */

const wrap = 'mx-auto w-full max-w-page px-gutter';
const pad = 'py-[clamp(4rem,8vw,7rem)]';
const display = 'font-heading [font-weight:var(--h-weight)] [letter-spacing:var(--h-track)] [text-transform:var(--h-case)]';
const h2 = `${display} text-[clamp(2rem,1.35rem+2.3vw,3.2rem)] leading-[var(--h-lead)] [text-wrap:balance] break-words`;
const lead = 'text-[17px] leading-[1.65] sm:text-[18px]';
// Small capitals for labels, in the heading face; numbers alone are set in a monospace.
const mono = 'font-heading text-[12.5px] font-semibold uppercase tracking-[0.14em]';
const btn =
  'inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[3px] px-6 font-heading text-[15px] font-bold uppercase tracking-[0.07em] no-underline transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--hi)]';
const btnHi = `${btn} bg-[color:var(--hi)] text-[color:var(--on-hi)] hover:brightness-110`;
const btnGhost = `${btn} border border-white/35 bg-[color:var(--night)]/40 text-white hover:border-white hover:bg-white/10`;
const btnPrimary = `${btn} bg-primary text-[color:var(--on-primary)] hover:bg-primary-deep hover:text-white`;
const btnLine = `${btn} border border-ink/25 text-ink hover:border-ink`;

/** The blueprint grid and brushed steel behind a dark ground. */
function Backdrop({ fade = 'radial-gradient(130% 100% at 85% 0%, #000 25%, transparent 80%)', sheen = true }) {
  const line = 'color-mix(in srgb, var(--hi) 11%, transparent)';
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      {sheen && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(100deg, rgba(255,255,255,0.022) 0 1px, transparent 1px 5px), linear-gradient(118deg, transparent 20%, rgba(255,255,255,0.055) 42%, transparent 62%)',
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
          backgroundSize: '160px 160px, 160px 160px, 32px 32px, 32px 32px',
          backgroundPosition: '-1px -1px',
          WebkitMaskImage: fade,
          maskImage: fade,
        }}
      />
    </div>
  );
}

/** Registration marks at a frame's four corners, as on a drawing. */
function Corners({ tone = 'border-[color:var(--hi)]', size = 'h-4 w-4' }) {
  const base = `pointer-events-none absolute ${size} ${tone}`;
  return (
    <span aria-hidden="true">
      <span className={`${base} -left-px -top-px border-l-2 border-t-2`} />
      <span className={`${base} -right-px -top-px border-r-2 border-t-2`} />
      <span className={`${base} -bottom-px -left-px border-b-2 border-l-2`} />
      <span className={`${base} -bottom-px -right-px border-b-2 border-r-2`} />
    </span>
  );
}

/** A section's numbered label: 02 —— Industries served. */
function Label({ n, children, dark = false }) {
  return (
    <p className={`mb-5 flex items-center gap-3 ${mono} ${dark ? 'text-white/65' : 'text-muted'}`}>
      {n != null && <span className={dark ? 'text-[color:var(--hi)]' : 'text-[color:var(--mark)]'}>{nn(n)}</span>}
      <span className={`h-px w-8 flex-none ${dark ? 'bg-white/35' : 'bg-ink/25'}`} aria-hidden="true" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/** The last word held to the arrow after it, so a wrapped title never leaves the arrow alone. */
function Arrowed({ children, Icon = ArrowRight, size = 16 }) {
  const words = String(children).trim();
  const last = words.split(/\s+/).pop();
  // One span, so a flex link keeps the words as one item and the space before the last word is not dropped.
  return (
    <span>
      {words.slice(0, words.length - last.length)}
      <span className="whitespace-nowrap">
        {last}
        <Icon size={size} className="ml-1.5 inline-block align-[-3px] transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </span>
  );
}

function Call({ b, tel, className, short = false }) {
  return (
    <a href={tel} className={className}>
      <Phone size={17} className="flex-none" aria-hidden="true" />
      {short ? (
        <>
          <span className="sm:hidden">Call</span>
          <span className="hidden sm:inline">{b.phone}</span>
        </>
      ) : (
        b.phone
      )}
    </a>
  );
}

/* ------------------------------------------------------------------ header */

function TopBar({ b, g }) {
  const hours = list(b.hours)[0];
  return (
    <div className="hidden bg-[color:var(--night)] text-[13px] text-white/75 lg:block">
      <div className={`${wrap} flex min-h-[38px] items-center justify-between gap-6`}>
        <p className="flex min-w-0 items-center gap-5">
          <span className="inline-flex items-center gap-2">
            <MapPin size={14} className="flex-none text-[color:var(--hi)]" aria-hidden="true" />
            {b.town}, {b.state}
          </span>
          {g.states.length > 1 && <span className="hidden xl:inline">Serving {g.states.map((s) => stateCode(s) || s).join(' · ')}</span>}
        </p>
        <p className="flex flex-none items-center gap-5">
          {hours && (
            <span className="inline-flex items-center gap-2">
              <Clock3 size={14} className="flex-none text-[color:var(--hi)]" aria-hidden="true" /> {hours[0]} {hours[1]}
            </span>
          )}
          {b.emergency?.title && (
            <span className="inline-flex items-center gap-2 font-semibold text-white">
              <Siren size={14} className="flex-none text-[color:var(--hi)]" aria-hidden="true" /> {b.emergency.title}
            </span>
          )}
          {g.phones.slice(0, 2).map((p) => (
            <a key={p.number} href={telHref(p.number)} className="inline-flex min-h-[38px] items-center gap-1.5 text-white/75 no-underline hover:text-white">
              {p.label && <span className="text-white/55">{p.label}</span>} {p.number}
            </a>
          ))}
          {b.email && (
            <a href={`mailto:${b.email}`} className="inline-flex min-h-[38px] items-center gap-2 text-white/75 no-underline hover:text-white">
              <Mail size={14} className="flex-none text-[color:var(--hi)]" aria-hidden="true" /> {b.email}
            </a>
          )}
        </p>
      </div>
    </div>
  );
}

function CapabilityMenu({ groups, current }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    const onDown = (event) => root.current && !root.current.contains(event.target) && setOpen(false);
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
      className="relative flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setOpen(false)}
    >
      <button
        type="button"
        className={`flex h-[92px] cursor-pointer items-center gap-1.5 font-heading text-[14px] font-bold uppercase tracking-[0.08em] text-ink transition hover:text-[color:var(--pt)] ${
          here ? 'shadow-[inset_0_-3px_0_var(--mark)]' : ''
        }`}
        aria-expanded={open}
        aria-controls="capability-menu"
        onClick={() => setOpen((v) => !v)}
      >
        Capabilities <ChevronDown size={15} className={`transition ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <div
        id="capability-menu"
        hidden={!open}
        className="absolute left-1/2 top-full w-[min(560px,80vw)] -translate-x-1/2 border border-line bg-white shadow-[0_30px_60px_-30px_rgba(10,14,20,0.45)]"
      >
        <ol className="grid p-2">
          {groups.map((g, i) => {
            const Icon = groupIcon(g.icon);
            return (
              <li key={g.slug}>
                <a
                  href={`/${g.slug}`}
                  aria-current={g.slug === current ? 'page' : undefined}
                  className="group grid min-h-[56px] grid-cols-[2.25rem_2rem_1fr_auto] items-center gap-2 px-3 py-2.5 text-ink no-underline hover:bg-surface"
                >
                  <span className="font-mono text-[12px] text-muted">{nn(i + 1)}</span>
                  <Icon size={18} className="text-[color:var(--mark)]" aria-hidden="true" />
                  <span className="font-heading text-[16px] font-bold leading-snug">{g.title}</span>
                  <ArrowRight size={15} className="text-muted transition group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </li>
  );
}

function Header({ b, g, groups, tel, current }) {
  const [open, setOpen] = useState(false);
  const links = [b.about && ['/about', 'About'], ['/contact', 'Contact']].filter(Boolean);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const item = 'flex h-[92px] items-center font-heading text-[14px] font-bold uppercase tracking-[0.08em] text-ink no-underline transition hover:text-[color:var(--pt)]';
  return (
    <header className={`sticky ${b.preview ? 'top-11' : 'top-0'} z-40 border-b border-line bg-white`}>
      <div className={`${wrap} flex h-[76px] items-center gap-6 lg:h-[92px]`}>
        <a href="/" className="flex min-h-[44px] min-w-0 flex-initial items-center lg:flex-none" aria-label={`${b.name} home`}>
          <BrandLogo b={b} textClass={`${display} text-ink`} />
        </a>
        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-8 xl:gap-10">
            {groups.length > 0 && <CapabilityMenu groups={groups} current={current} />}
            {links.map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  aria-current={href.slice(1) === current ? 'page' : undefined}
                  className={`${item} ${href.slice(1) === current ? 'shadow-[inset_0_-3px_0_var(--mark)]' : ''}`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex flex-none items-center gap-2 sm:gap-3 lg:ml-4">
          <a href={tel} className="hidden min-h-[44px] items-center gap-3 border-l border-line pl-6 pr-2 text-ink no-underline xl:flex">
            <span className="grid leading-tight">
              <span className={`${mono} text-[11px] text-muted`}>{b.emergency ? '24-hour line' : 'Call'}</span>
              <strong className="whitespace-nowrap font-heading text-[18px] font-bold">{b.phone}</strong>
            </span>
          </a>
          <a href="/contact" className={`${btnPrimary} hidden min-h-[48px] px-5 text-[14px] md:inline-flex`}>
            Request a Quote
          </a>
          <a href={tel} className="grid h-11 w-11 place-items-center rounded-[3px] bg-primary text-[color:var(--on-primary)] md:hidden" aria-label={`Call ${b.phone}`}>
            <Phone size={19} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[3px] border border-line px-3 font-heading text-[14px] font-bold uppercase tracking-[0.08em] text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
            <span className="sr-only sm:not-sr-only">{open ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>
      <div
        id="site-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-7.5rem)] overflow-y-auto border-b border-line bg-white shadow-[0_24px_40px_-24px_rgba(10,14,20,0.45)] lg:hidden"
      >
        <nav aria-label="Mobile" className={`${wrap} pb-28 pt-4 md:pb-8`}>
          <p className={`${mono} pb-2 text-muted`}>Capabilities</p>
          <ol className="border-t border-line">
            {groups.map((gr, i) => (
              <li key={gr.slug} className="border-b border-line">
                <a href={`/${gr.slug}`} onClick={() => setOpen(false)} className="grid min-h-[56px] grid-cols-[2.5rem_1fr_auto] items-center gap-2 py-2 text-ink no-underline">
                  <span className="font-mono text-[13px] text-[color:var(--mark)]">{nn(i + 1)}</span>
                  <span className="font-heading text-[18px] font-bold leading-snug">{gr.title}</span>
                  <ArrowRight size={17} className="text-muted" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ol>
          <ul className="mt-4">
            {links.map(([href, label]) => (
              <li key={href} className="border-b border-line">
                <a href={href} onClick={() => setOpen(false)} className="flex min-h-[56px] items-center justify-between font-heading text-[18px] font-bold text-ink no-underline">
                  {label} <ArrowRight size={17} className="text-muted" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href="/contact" onClick={() => setOpen(false)} className={btnPrimary}>
              Request a Quote
            </a>
            <a href={tel} className={btnLine}>
              <Phone size={17} aria-hidden="true" /> {b.phone}
            </a>
            {g.extraPhones.map((p) => (
              <a key={p.number} href={telHref(p.number)} className={btnLine}>
                <Phone size={17} aria-hidden="true" /> {p.label ? `${p.label} ` : ''}
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

const SPEC_COLS = ['', 'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3', 'lg:grid-cols-4'];

/** The hero's foot: the year, the base, the reach, the industries, read like a drawing's title strip. */
function SpecBar({ specs }) {
  if (!specs.length) return null;
  return (
    <div className="relative border-t border-white/10 bg-[color:var(--night)] text-white">
      <dl className={`${wrap} grid ${specs.length === 1 ? '' : 'grid-cols-2'} ${SPEC_COLS[specs.length]}`}>
        {specs.map((s, i) => (
          <div
            key={s.label}
            className={`min-w-0 border-white/10 py-5 lg:py-6 ${i % 2 ? 'border-l pl-5' : 'pr-5'} ${i > 1 ? 'border-t lg:border-t-0' : ''} ${
              i > 0 ? 'lg:border-l lg:pl-7' : 'lg:pl-0'
            } ${specs.length % 2 && i === specs.length - 1 && specs.length > 1 ? 'col-span-2 border-l-0 pl-0 lg:col-span-1 lg:border-l lg:pl-7' : ''}`}
          >
            <dt className={`${mono} text-[11px] text-white/55`}>{s.label}</dt>
            <dd className="m-0 mt-1.5 flex flex-wrap items-center gap-2 font-heading text-[16px] font-bold leading-snug sm:text-[17px]">
              {s.rating && <Stars value={Number(s.value.split(' ')[0])} size={14} />}
              <span className="min-w-0 break-words">{s.value}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function HeroWords({ b, tel, g }) {
  const title = [b.hero.title, b.hero.titleAccent].filter(Boolean).join(' ');
  return (
    <>
      {b.hero.eyebrow && <Label dark>{b.hero.eyebrow}</Label>}
      <h1 className={`${display} ${headlineSize(title)} leading-[var(--h-lead)] text-white [text-wrap:balance] break-words`}>
        {b.hero.title} {b.hero.titleAccent && <span className="text-[color:var(--hi)]">{b.hero.titleAccent}</span>}
      </h1>
      {b.hero.lead && <p className={`mt-6 max-w-[36rem] ${lead} text-white/80`}>{b.hero.lead}</p>}
      <div className="mt-8 grid grid-cols-[1.45fr_1fr] gap-3 sm:flex sm:flex-wrap">
        <a href="/contact" className={`${btnHi} px-3 text-[14px] tracking-[0.04em] sm:px-6 sm:text-[15px] sm:tracking-[0.07em]`}>
          Request a Quote <ArrowRight size={17} className="hidden sm:block" aria-hidden="true" />
        </a>
        <Call b={b} tel={tel} short className={`${btnGhost} px-3 text-[14px] tracking-[0.04em] sm:px-6 sm:text-[15px] sm:tracking-[0.07em]`} />
      </div>
      {g.extraPhones.length > 0 && (
        <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[15px] text-white/70">
          {g.extraPhones.map((p) => (
            <a key={p.number} href={telHref(p.number)} className="inline-flex min-h-[40px] items-center gap-1.5 text-white/80 no-underline hover:text-white">
              {p.label && <span className="text-white/55">{p.label}</span>} {p.number}
            </a>
          ))}
        </p>
      )}
    </>
  );
}

/**
 * With no photo, a drawing's title block stands beside the words: the
 * capabilities numbered down it, then the business's particulars in cells.
 */
function TitleBlock({ b, groups, specs }) {
  return (
    <div className="relative border border-white/20 bg-[color:var(--night)]/70 backdrop-blur-[2px]">
      <Corners />
      <div className={`flex items-center justify-between gap-4 border-b border-white/15 px-5 py-3.5 ${mono} text-[11px] text-white/60 sm:px-6`}>
        <span>Scope of work</span>
        <span className="text-[color:var(--hi)]">{nn(groups.length)}</span>
      </div>
      <ol>
        {groups.map((gr, i) => (
          <li key={gr.slug} className="border-b border-white/10">
            <a href={`/${gr.slug}`} className="group grid min-h-[60px] grid-cols-[2.25rem_1fr_auto] items-center gap-3 px-5 py-3.5 text-white no-underline transition hover:bg-white/[0.06] sm:px-6">
              <span className="font-mono text-[13px] text-[color:var(--hi)]">{nn(i + 1)}</span>
              <span className="font-heading text-[17px] font-bold leading-snug sm:text-[19px]">{gr.title}</span>
              <ArrowUpRight size={18} className="text-white/45 transition group-hover:text-white" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
      <Particulars b={b} specs={specs} />
    </div>
  );
}

/** The title block's cells: the business's particulars, the phone last. */
function Particulars({ b, specs }) {
  return (
    <dl className="grid grid-cols-2">
      {[...specs, { label: 'Phone', value: b.phone }].slice(0, 4).map((s, i, all) => (
        <div
          key={s.label}
          className={`min-w-0 border-white/10 px-5 py-4 sm:px-6 ${i % 2 ? 'border-l' : ''} ${i > 1 ? 'border-t' : ''} ${all.length % 2 && i === all.length - 1 ? 'col-span-2' : ''}`}
        >
          <dt className={`${mono} text-[10.5px] text-white/50`}>{s.label}</dt>
          <dd className="m-0 mt-1 break-words font-heading text-[15px] font-bold leading-snug text-white sm:text-[16px]">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * A section through a flange, drawn in fine lines behind a hero with no
 * photo: the bolt circle, the bore, centerlines and a dimension, as on a
 * shop drawing. It is drawn, not a picture of anyone's work.
 */
function Drawing() {
  const bolts = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);
  return (
    <svg
      className="pointer-events-none absolute -right-[12%] top-1/2 -z-10 hidden h-[135%] max-h-[980px] -translate-y-1/2 text-[color:var(--hi)] opacity-[0.16] lg:block"
      viewBox="0 0 600 600"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="300" cy="300" r="270" strokeWidth="1.5" />
      <circle cx="300" cy="300" r="214" strokeWidth="1" strokeDasharray="10 6 2 6" />
      <circle cx="300" cy="300" r="150" strokeWidth="1.5" />
      <circle cx="300" cy="300" r="96" strokeWidth="1" />
      {bolts.map((a) => (
        <circle key={a} cx={300 + 214 * Math.cos(a)} cy={300 + 214 * Math.sin(a)} r="17" strokeWidth="1.2" />
      ))}
      <path d="M300 10v580M10 300h580" strokeWidth="0.8" strokeDasharray="22 6 3 6" />
      <path d="M30 580h540M30 570v20M570 570v20" strokeWidth="0.8" />
      <path d="M30 580l14-5v10zM570 580l-14-5v10z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Hero({ b, g, groups, tel, specs }) {
  const style = heroStyleOf(b);
  if (style === 'type') {
    return (
      <section className="relative isolate overflow-hidden bg-[color:var(--steel)] text-white">
        <Backdrop />
        <Drawing />
        <div className={`${wrap} grid gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-24`}>
          <div className="min-w-0 lg:col-span-7">
            <HeroWords b={b} tel={tel} g={g} />
          </div>
          <div className="min-w-0 lg:col-span-5">
            <TitleBlock b={b} groups={groups} specs={specs} />
          </div>
        </div>
      </section>
    );
  }
  if (style === 'photo') {
    return (
      <div>
        <section className="relative isolate overflow-hidden bg-[color:var(--steel)] text-white lg:flex lg:min-h-[640px] lg:items-center">
          {/* On a phone the photo leads, whole across the screen, and the words follow on the steel below it; a tall
              phone frame would cut a sliver from a wide photo and blow it up. From lg up the photo is the ground the
              words are set on. */}
          <div className="relative aspect-[16/10] w-full sm:aspect-[16/9] lg:absolute lg:inset-0 lg:-z-20 lg:aspect-auto">
            <Img className="absolute inset-0 h-full w-full object-cover" src={b.hero.image} alt={b.hero.imageAlt || ''} sizes="100vw" eager />
            <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[color:var(--hi)] lg:hidden" aria-hidden="true" />
          </div>
          <div
            className="absolute inset-0 -z-10 hidden lg:block"
            style={{
              background:
                'linear-gradient(90deg, color-mix(in srgb, var(--steel) 94%, transparent) 0%, color-mix(in srgb, var(--steel) 78%, transparent) 45%, color-mix(in srgb, var(--steel) 25%, transparent) 100%), linear-gradient(0deg, color-mix(in srgb, var(--night) 85%, transparent), transparent 55%)',
            }}
            aria-hidden="true"
          />
          <div className={`${wrap} relative py-10 sm:py-14 lg:py-24`}>
            <div className="max-w-[44rem]">
              <HeroWords b={b} tel={tel} g={g} />
            </div>
          </div>
        </section>
        <SpecBar specs={specs} />
      </div>
    );
  }
  return (
    <div>
      <section className="relative isolate overflow-hidden bg-[color:var(--steel)] text-white">
        <Backdrop fade="linear-gradient(90deg, #000 0%, #000 40%, transparent 60%)" />
        {/* On a phone the photo leads, whole across the screen; from lg up it
            takes the right half to the window's edge, beside the words. */}
        <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <Img
            className="block aspect-[16/10] w-full object-cover sm:aspect-[16/9] lg:aspect-auto lg:h-full"
            src={b.hero.image}
            alt={b.hero.imageAlt || ''}
            sizes="(min-width: 1024px) 90vw, 100vw"
            eager
          />
          <span className="absolute inset-y-0 left-0 hidden w-[3px] bg-[color:var(--hi)] lg:block" aria-hidden="true" />
          <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[color:var(--hi)] lg:hidden" aria-hidden="true" />
        </div>
        <div className={wrap}>
          <div className="flex min-w-0 flex-col justify-center py-10 sm:py-14 lg:min-h-[580px] lg:w-1/2 lg:py-16 lg:pr-14">
            <HeroWords b={b} tel={tel} g={g} />
          </div>
        </div>
      </section>
      <SpecBar specs={specs} />
    </div>
  );
}

function Highlights({ g }) {
  if (g.highlights.length < 2) return null;
  const cols = ['', '', 'md:grid-cols-2', 'md:grid-cols-3', 'md:grid-cols-2 xl:grid-cols-4'][g.highlights.length];
  return (
    <section aria-label="What sets us apart" className="border-b border-line bg-white">
      <ul className={`${wrap} grid divide-y divide-line md:divide-y-0 ${cols}`}>
        {g.highlights.map((h, i) => {
          const Icon = highlightIcon(h.icon, h.title);
          return (
            <li key={h.title} className={`flex gap-4 py-7 md:py-9 ${i ? 'md:border-l md:border-line md:pl-8' : ''} md:pr-6`}>
              <span className="grid h-11 w-11 flex-none place-items-center border border-line text-[color:var(--mark)]">
                <Icon size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-[17px] font-bold leading-snug text-ink">{h.title}</p>
                {h.text && <p className="mt-1.5 text-[15.5px] leading-[1.55] text-muted">{h.text}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- sections */

function Capabilities({ b, groups, n, tone }) {
  return (
    <section id="capabilities" className={`${pad} ${tone} scroll-mt-[140px]`}>
      <div className={wrap}>
        <div className="mb-10 grid gap-6 lg:mb-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <Label n={n}>Capabilities</Label>
            <h2 className={`${h2} text-ink`}>What we do</h2>
          </div>
          {b.summary && <p className={`${lead} text-muted lg:col-span-5 lg:col-start-8`}>{b.summary}</p>}
        </div>
        <ol className="border-t-2 border-ink">
          {groups.map((gr, i) => {
            const services = list(gr.services).filter((s) => s?.title);
            return (
              <li key={gr.slug} className="group relative grid gap-x-10 gap-y-5 border-b border-line py-8 transition hover:bg-[color:var(--ink)]/[0.025] lg:grid-cols-12 lg:py-10">
                <div className={`flex min-w-0 gap-5 ${services.length ? 'lg:col-span-5' : 'lg:col-span-10'}`}>
                  <span className="w-8 flex-none pt-1.5 font-mono text-[14px] text-[color:var(--mark)]">{nn(i + 1)}</span>
                  <div className="min-w-0">
                    <h3 className={`${display} text-[clamp(1.45rem,1.2rem+0.9vw,1.95rem)] leading-[1.1] text-ink`}>
                      <a href={`/${gr.slug}`} className="text-current no-underline after:absolute after:inset-0 after:content-['']">
                        {gr.title}
                      </a>
                    </h3>
                    {gr.summary && <p className={`mt-3 text-[16px] leading-[1.6] text-muted ${services.length ? 'max-w-[34rem]' : 'max-w-[48rem]'}`}>{gr.summary}</p>}
                  </div>
                </div>
                {services.length > 0 && (
                <div className="min-w-0 pl-[3.25rem] lg:col-span-6 lg:pl-0">
                    <ul className="grid gap-x-8 sm:grid-cols-2">
                      {services.map((s) => (
                        <li key={s.slug || s.title} className="relative z-10 border-t border-line first:border-t-0 sm:[&:nth-child(2)]:border-t-0">
                          <a
                            href={`/${gr.slug}${s.slug ? `#${s.slug}` : ''}`}
                            className="flex min-h-[44px] items-center gap-3 py-2 text-[15.5px] font-medium leading-snug text-ink no-underline hover:text-[color:var(--pt)]"
                          >
                            <span className="h-1.5 w-1.5 flex-none bg-[color:var(--mark)]" aria-hidden="true" />
                            <span className="min-w-0">{s.title}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                </div>
                )}
                <span className="absolute right-0 top-8 hidden h-11 w-11 place-items-center border border-line text-ink transition group-hover:border-[color:var(--mark)] group-hover:bg-[color:var(--mark)] group-hover:text-white lg:top-10 lg:grid" aria-hidden="true">
                  <ArrowUpRight size={18} />
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

const INDUSTRY_COLS = (count) => (count <= 2 ? 'md:grid-cols-2' : count === 4 || count >= 7 ? 'md:grid-cols-4' : 'md:grid-cols-3');

function Industries({ g, n, b }) {
  if (g.industries.length < 2) return null;
  return (
    <section className={`${pad} relative isolate overflow-hidden bg-[color:var(--steel)] text-white`}>
      <Backdrop fade="radial-gradient(120% 120% at 100% 100%, #000 10%, transparent 70%)" sheen={false} />
      <div className={`${wrap} grid gap-10 lg:grid-cols-12 lg:gap-14`}>
        <div className="lg:col-span-4">
          <Label n={n} dark>
            Industries
          </Label>
          <h2 className={`${h2} text-white`}>Industries served</h2>
        </div>
        <ul className={`grid grid-cols-2 border-l border-t border-white/15 lg:col-span-8 ${INDUSTRY_COLS(g.industries.length)}`}>
          {g.industries.map((ind) => {
            const Icon = industryIcon(`${ind.name} ${ind.detail}`);
            return (
              <li key={ind.name} className="flex min-h-[128px] min-w-0 flex-col justify-between gap-5 border-b border-r border-white/15 p-5 sm:p-6">
                <Icon size={26} strokeWidth={1.6} className="text-[color:var(--hi)]" aria-hidden="true" />
                <span className="min-w-0">
                  {/* A name of two joined by a slash ("manufacturers/packers") breaks after the slash before it breaks a word. */}
                  <span className="block break-words font-heading text-[17px] font-bold leading-snug sm:text-[19px]">
                    {ind.name.split('/').flatMap((p, i) => (i ? ['/', <wbr key={i} />, p] : [p]))}
                  </span>
                  {ind.detail && <span className="mt-1.5 block text-[14px] leading-[1.5] text-white/60">{ind.detail}</span>}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** The pictures the gallery draws: the business's projects, else its capability groups' photos. */
function galleryOf(b, g, groups) {
  const own = g.projects.filter((p) => p.image);
  if (own.length >= 2) return { kind: 'projects', items: own.slice(0, 5).map((p) => ({ ...p, alt: p.imageAlt || p.title })) };
  const shots = groups
    .filter((gr) => gr.image)
    .map((gr) => ({ title: gr.title, image: gr.image, alt: gr.imageAlt || gr.title, href: `/${gr.slug}` }));
  return { kind: 'groups', items: shots.slice(0, 5) };
}

/* The mosaic for each count of pictures, from two to five. The lead picture
   stands two rows tall beside the rest where there is an odd one to lead;
   every frame is about four by three, so none is cut down to a strip. */
const MOSAIC = {
  2: { grid: 'sm:grid-cols-2', cells: ['', ''] },
  3: { grid: 'sm:grid-cols-2 lg:grid-cols-3', cells: ['sm:col-span-2 lg:row-span-2', '', ''] },
  4: { grid: 'sm:grid-cols-2 lg:grid-cols-4', cells: ['', '', '', ''] },
  5: { grid: 'sm:grid-cols-2 lg:grid-cols-4', cells: ['sm:col-span-2 lg:row-span-2', '', '', '', ''] },
};

/* Each frame's width as a share of the screen, a third over its slot: a 16:9
   photo set in a 4:3 frame spends only three quarters of its width there. */
const SIZES = {
  2: ['(min-width: 640px) 67vw, 100vw', '(min-width: 640px) 67vw, 100vw'],
  3: ['(min-width: 1024px) 90vw, 100vw', '(min-width: 1024px) 45vw, (min-width: 640px) 67vw, 100vw'],
  4: ['(min-width: 1024px) 33vw, (min-width: 640px) 67vw, 100vw'],
  5: ['(min-width: 1024px) 67vw, 100vw', '(min-width: 1024px) 33vw, (min-width: 640px) 67vw, 100vw'],
};

function Gallery({ b, g, groups, n, tone }) {
  const { kind, items } = galleryOf(b, g, groups);
  if (items.length < 2) return null;
  const layout = MOSAIC[items.length];
  return (
    <section className={`${pad} ${tone}`}>
      <div className={wrap}>
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between lg:mb-12">
          <div>
            <Label n={n}>{kind === 'projects' ? 'Projects' : 'The work'}</Label>
            <h2 className={`${h2} text-ink`}>{kind === 'projects' ? 'Selected projects' : 'A look at the work'}</h2>
          </div>
          <a href="/contact" className={`${btnLine} self-start md:self-auto`}>
            Request a Quote <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
        <ul className={`grid grid-cols-1 gap-3 lg:gap-4 ${layout.grid}`}>
          {items.map((item, i) => {
            const big = layout.cells[i].includes('row-span-2');
            const Tag = item.href ? 'a' : 'div';
            return (
              <li key={item.image} className={`relative min-w-0 overflow-hidden bg-[color:var(--steel)] ${layout.cells[i]}`}>
                <Tag {...(item.href ? { href: item.href } : {})} className="group block h-full text-white no-underline">
                  <Img
                    className={`block aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03] ${
                      // Out of flow, so a tall photo cannot stretch the rows the tiles beside it set.
                      big ? 'lg:absolute lg:inset-0 lg:aspect-auto lg:h-full' : ''
                    }`}
                    src={item.image}
                    alt={item.alt}
                    sizes={(i === 0 ? SIZES[items.length][0] : SIZES[items.length].at(-1))}
                  />
                  <span className="pointer-events-none absolute bottom-0 left-0 flex max-w-[calc(100%-1.5rem)] items-baseline gap-3 bg-[color:var(--night)] px-4 py-3 sm:px-5">
                    <span className="font-mono text-[12px] text-[color:var(--hi)]">{nn(i + 1)}</span>
                    <span className="min-w-0">
                      <span className="block font-heading text-[16px] font-bold leading-snug">{item.title}</span>
                      {item.text && <span className="mt-1 block text-[14px] leading-[1.45] text-white/75">{item.text}</span>}
                    </span>
                  </span>
                </Tag>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** A credential's own words, split into its name and what follows a dash or colon. */
function CredentialTile({ label, detail }) {
  return (
    <li className="flex min-w-0 gap-4 border border-line bg-white p-5">
      <span className="grid h-10 w-10 flex-none place-items-center bg-[color:var(--mark)]/10 text-[color:var(--mark)]">
        <ShieldCheck size={19} aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block break-words font-heading text-[16.5px] font-bold leading-snug text-ink">{label}</span>
        {detail && <span className="mt-1 block break-words text-[15px] leading-[1.5] text-muted">{detail}</span>}
      </span>
    </li>
  );
}

function Credentials({ g, n, tone }) {
  const facts = g.credentialFacts;
  if (!g.credentials.length && !facts.length) return null;
  const safety = facts.some((f) => /safety/i.test(f.heading));
  const tiles = (items) => (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((c) => (
        <CredentialTile key={`${c.label}${c.detail}`} label={c.label} detail={c.detail} />
      ))}
    </ul>
  );
  return (
    <section className={`${pad} ${tone}`}>
      <div className={`${wrap} grid gap-10 lg:grid-cols-12 lg:gap-14`}>
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-40">
            <Label n={n}>Credentials</Label>
            <h2 className={`${h2} text-ink`}>{safety ? 'Safety and certifications' : 'Certifications and credentials'}</h2>
          </div>
        </div>
        <div className="grid min-w-0 content-start gap-10 lg:col-span-8">
          {g.credentials.length > 0 && tiles(g.credentials)}
          {facts.map((f) => (
            <div key={f.heading} className="min-w-0">
              <h3 className={`${mono} mb-4 flex items-center gap-3 text-ink`}>
                <span className="h-2 w-2 flex-none bg-[color:var(--mark)]" aria-hidden="true" /> {f.heading}
              </h3>
              {f.text && <p className="mb-4 max-w-[46rem] text-[16.5px] leading-[1.65] text-muted">{f.text}</p>}
              {list(f.items).length > 0 && tiles(list(f.items).map((item) => {
                const { name, detail } = split(item);
                return { label: name, detail };
              }))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** A fact's items as a ruled, numbered spec list; its text, when it has one, above. */
function SpecList({ fact, cols = 'sm:grid-cols-2' }) {
  const items = list(fact.items);
  return (
    <div className="min-w-0 break-inside-avoid">
      <h3 className={`${mono} mb-3 flex items-center justify-between gap-4 border-b-2 border-ink pb-3 text-ink`}>
        <span>{fact.heading}</span>
        {items.length > 1 && <span className="text-muted">{nn(items.length)}</span>}
      </h3>
      {fact.text && <p className="mb-3 text-[16px] leading-[1.65] text-muted">{fact.text}</p>}
      {items.length > 0 && (
        <ol className={`grid gap-x-8 ${items.length > 3 ? cols : ''}`}>
          {items.map((item, i) => {
            const { name, detail } = split(item);
            return (
              <li key={item} className="grid min-w-0 grid-cols-[2.25rem_1fr] gap-2 border-b border-line py-3">
                <span className="pt-0.5 font-mono text-[12px] text-muted">{nn(i + 1)}</span>
                <span className="min-w-0 break-words text-[15.5px] leading-[1.5] text-ink">
                  {detail ? (
                    <>
                      <strong className="font-semibold">{name}</strong> <span className="text-muted">{detail}</span>
                    </>
                  ) : (
                    item
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function Equipment({ g, n, tone }) {
  if (!g.equipment.length) return null;
  const fleet = g.equipment.every((f) => /fleet/i.test(f.heading));
  return (
    <section className={`${pad} ${tone}`}>
      <div className={wrap}>
        <div className="mb-10 max-w-3xl lg:mb-12">
          <Label n={n}>{fleet ? 'Fleet' : 'Equipment'}</Label>
          <h2 className={`${h2} text-ink`}>{fleet ? 'The fleet' : 'Equipment and capacity'}</h2>
        </div>
        <div className={`grid gap-10 ${g.equipment.length > 1 ? 'lg:grid-cols-2 lg:gap-x-14' : ''}`}>
          {g.equipment.map((f) => (
            <SpecList key={f.heading} fact={f} cols={g.equipment.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'} />
          ))}
        </div>
      </div>
    </section>
  );
}

const STEP_COLS = ['', '', 'md:grid-cols-2', 'md:grid-cols-3', 'md:grid-cols-2 lg:grid-cols-4', 'md:grid-cols-3 lg:grid-cols-5', 'md:grid-cols-3', 'md:grid-cols-2 lg:grid-cols-4', 'md:grid-cols-2 lg:grid-cols-4'];

function Steps({ b, g, n, tone }) {
  if (g.steps.length < 2) return null;
  const heading = g.stepsHeading || 'How a project runs';
  return (
    <section className={`${pad} ${tone}`}>
      <div className={wrap}>
        <div className="mb-10 grid gap-5 lg:mb-14 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Label n={n}>Process</Label>
            <h2 className={`${h2} text-ink`}>{heading}</h2>
          </div>
        </div>
        <ol className={`grid gap-x-8 gap-y-10 ${STEP_COLS[Math.min(g.steps.length, 8)]}`}>
          {g.steps.map((s, i) => (
            <li key={s.title} className="relative min-w-0 border-l-2 border-line pl-6 md:border-l-0 md:border-t-2 md:pl-0 md:pt-7">
              <span className="absolute -left-[7px] top-0 h-3 w-3 bg-[color:var(--mark)] md:-top-[7px] md:left-0" aria-hidden="true" />
              <p className="font-mono text-[13px] text-[color:var(--mark)]">Step {nn(i + 1)}</p>
              <h3 className="mt-2 font-heading text-[20px] font-bold leading-snug text-ink">{s.title}</h3>
              {s.text && <p className="mt-2 text-[15.5px] leading-[1.6] text-muted">{s.text}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Record({ g, n, tone }) {
  if (!g.record.length) return null;
  const one = g.record.length === 1;
  return (
    <section className={`${pad} ${tone}`}>
      <div className={wrap}>
        <div className="mb-10 max-w-3xl lg:mb-12">
          <Label n={n}>Track record</Label>
          <h2 className={`${h2} text-ink`}>{one ? g.record[0].heading : 'Selected work'}</h2>
        </div>
        <div className="grid gap-12">
          {g.record.map((f) => (
            <SpecList key={f.heading} fact={f} cols={list(f.items).length > 8 ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2'} />
          ))}
        </div>
      </div>
    </section>
  );
}

function About({ b, n, tone }) {
  if (!b.about) return null;
  const paras = list(b.about.text).slice(0, 2);
  const values = list(b.about.values).filter((v) => v?.title);
  const image = b.about.image;
  const owner = b.owner?.name ? b.owner : null;
  return (
    <section className={`${pad} ${tone}`}>
      <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
        <div className="min-w-0 lg:col-span-5">
          {image ? (
            <figure className="relative m-0">
              <Img className="block h-auto max-h-[min(80svh,620px)] w-full object-cover object-top" src={image} alt={b.about.imageAlt || ''} sizes="(min-width: 1024px) 40vw, 100vw" />
              <Corners tone="border-[color:var(--mark)]" />
              {b.since && (
                <figcaption className="absolute bottom-0 left-0 bg-[color:var(--steel)] px-5 py-4 text-white">
                  <span className={`${mono} block text-[11px] text-white/60`}>Established</span>
                  <span className="mt-1 block font-heading text-[30px] font-bold leading-none">{b.since}</span>
                </figcaption>
              )}
            </figure>
          ) : (
            <div className="relative isolate overflow-hidden bg-[color:var(--steel)] p-8 text-white sm:p-10">
              <Backdrop sheen={false} />
              <p className={`${mono} text-white/60`}>{b.since ? 'Established' : 'Based in'}</p>
              <p className={`${display} mt-3 text-[clamp(3rem,2rem+4vw,5.5rem)] leading-none`}>{b.since || b.town}</p>
              <p className="mt-6 border-t border-white/15 pt-5 text-[16px] leading-[1.6] text-white/75">
                {b.address}
                <br />
                {b.town}, {b.state} {b.zip}
              </p>
            </div>
          )}
        </div>
        <div className="min-w-0 lg:col-span-7">
          <Label n={n}>{b.about.eyebrow || 'About'}</Label>
          <h2 className={`${h2} text-ink`}>{b.about.title}</h2>
          {paras.map((p) => (
            <p key={p} className={`mt-5 ${lead} text-muted`}>
              {p}
            </p>
          ))}
          {values.length > 0 && (
            <ol className="mt-9 grid border-t-2 border-ink">
              {values.map((v, i) => (
                <li key={v.title} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-line py-5">
                  <span className="pt-1 font-mono text-[13px] text-[color:var(--mark)]">{nn(i + 1)}</span>
                  <span className="min-w-0">
                    <span className="block font-heading text-[18px] font-bold leading-snug text-ink">{v.title}</span>
                    {v.text && <span className="mt-1 block text-[15.5px] leading-[1.55] text-muted">{v.text}</span>}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {owner && (
            <div className="mt-9 flex items-start gap-5 border border-line bg-white p-5">
              {owner.image && <Img className="h-20 w-20 flex-none object-cover" src={owner.image} alt={owner.name} sizes="80px" />}
              <div className="min-w-0">
                <p className="font-heading text-[18px] font-bold text-ink">{owner.name}</p>
                {owner.role && <p className={`${mono} mt-1 text-[11px] text-muted`}>{owner.role}</p>}
                {owner.text && <p className="mt-2 text-[15.5px] leading-[1.55] text-muted">{owner.text}</p>}
              </div>
            </div>
          )}
          <a href="/about" className="group mt-8 inline-flex min-h-[44px] items-center font-heading text-[15px] font-bold uppercase tracking-[0.07em] text-[color:var(--pt)] no-underline">
            <Arrowed>{`More about ${b.shortName}`}</Arrowed>
          </a>
        </div>
      </div>
    </section>
  );
}

/** Where the business works: the states, the towns, and its other locations. */
function Coverage({ b, g, n, tone }) {
  const areas = g.areas.filter((a) => a !== b.town || g.areas.length > 1);
  const show = g.states.length || areas.length > 1 || g.locations.length;
  if (!show) return null;
  const hours = list(b.hours);
  return (
    <section className={`${pad} ${tone}`}>
      <div className={`${wrap} grid gap-10 lg:grid-cols-12 lg:gap-14`}>
        <div className="min-w-0 lg:col-span-7">
          <Label n={n}>Coverage</Label>
          <h2 className={`${h2} text-ink`}>Where we work</h2>
          {g.states.length > 0 && (
            <ul className="mt-9 grid border-t-2 border-ink sm:grid-cols-2">
              {g.states.map((s) => (
                <li key={s} className="flex items-baseline gap-4 border-b border-line py-4 sm:[&:nth-child(even)]:pl-6">
                  <span className="w-9 flex-none font-mono text-[14px] text-[color:var(--mark)]">{stateCode(s) || ''}</span>
                  <span className={`${display} text-[24px] leading-tight text-ink`}>{s}</span>
                </li>
              ))}
            </ul>
          )}
          {areas.length > 0 && (
            <div className="mt-9">
              <p className={`${mono} mb-3 text-muted`}>{g.states.length ? 'Towns and ports' : 'Areas served'}</p>
              <ul className="flex flex-wrap gap-2">
                {areas.map((a) => (
                  <li key={a} className="inline-flex min-h-[38px] items-center gap-2 border border-line bg-white px-3.5 text-[15px] font-medium text-ink">
                    <MapPin size={14} className="flex-none text-[color:var(--mark)]" aria-hidden="true" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {g.locations.map((f) => (
            <div key={f.heading} className="mt-9">
              <SpecList fact={f} cols="sm:grid-cols-1" />
            </div>
          ))}
        </div>
        <div className="min-w-0 lg:col-span-5">
          <div className="relative isolate overflow-hidden bg-[color:var(--steel)] p-7 text-white sm:p-9 lg:sticky lg:top-40">
            <Backdrop sheen={false} />
            <Corners />
            <p className={`${mono} text-white/60`}>Headquarters</p>
            <a href={mapsHref(b)} className="mt-3 block font-heading text-[22px] font-bold leading-snug text-white no-underline hover:underline">
              {b.address}
              <br />
              {b.town}, {b.state} {b.zip}
            </a>
            <a href={mapsHref(b)} className="group mt-3 inline-flex min-h-[44px] items-center text-[15px] font-semibold text-[color:var(--hi)] no-underline">
              <Arrowed>Get directions</Arrowed>
            </a>
            {hours.length > 0 && (
              <dl className="mt-6 grid gap-2 border-t border-white/15 pt-5 text-[15px]">
                {hours.map(([d, h]) => (
                  <div key={d} className="flex justify-between gap-4">
                    <dt className="text-white/60">{d}</dt>
                    <dd className="m-0 text-right font-semibold">{h}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Reviews({ b, g, n, tone }) {
  if (!g.reviews.length) return null;
  return (
    <section className={`${pad} ${tone}`}>
      <div className={wrap}>
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-12">
          <div>
            <Label n={n}>Reviews</Label>
            <h2 className={`${h2} text-ink`}>What clients say</h2>
          </div>
          {b.rating && b.reviewCount && (
            <p className="flex items-center gap-3 text-[15px] text-muted">
              <Stars value={b.rating} size={16} /> {Number(b.rating).toFixed(1)} from {b.reviewCount} Google reviews
            </p>
          )}
        </div>
        <div className={`grid gap-4 ${g.reviews.length > 1 ? 'md:grid-cols-2' : ''} ${g.reviews.length > 2 ? 'lg:grid-cols-3' : ''}`}>
          {g.reviews.map((r, i) => (
            <figure key={i} className="m-0 flex flex-col border-t-2 border-ink bg-white p-6 sm:p-7">
              <Quote size={24} className="text-[color:var(--mark)]" aria-hidden="true" />
              <blockquote className="m-0 mb-6 mt-4 text-[16.5px] leading-[1.65] text-ink">{r.text}</blockquote>
              <figcaption className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[15px]">
                <span className="font-semibold text-ink">{r.author}</span>
                {r.source && <span className={`${mono} text-[11px] text-muted`}>{r.source}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faqs({ b, n, tone }) {
  const faqs = list(b.faqs).filter((f) => f?.q && f?.a);
  if (!faqs.length) return null;
  return (
    <section className={`${pad} ${tone}`}>
      <div className={`${wrap} grid gap-10 lg:grid-cols-12 lg:gap-14`}>
        <div className="lg:col-span-4">
          <Label n={n}>Questions</Label>
          <h2 className={`${h2} text-ink`}>Before you send a request</h2>
        </div>
        <div className="border-t-2 border-ink lg:col-span-8">
          {faqs.map((f, i) => (
            <details key={i} className="group border-b border-line">
              <summary className="flex min-h-[68px] cursor-pointer list-none items-center gap-4 py-4 font-heading text-[18px] font-bold leading-snug text-ink [&::-webkit-details-marker]:hidden">
                <span className="w-8 flex-none font-mono text-[12px] font-medium text-muted">{nn(i + 1)}</span>
                <span className="min-w-0 flex-1">{f.q}</span>
                <span className="grid h-9 w-9 flex-none place-items-center border border-line text-ink transition group-open:rotate-45 group-open:border-[color:var(--mark)] group-open:bg-[color:var(--mark)] group-open:text-white">
                  <Plus size={17} aria-hidden="true" />
                </span>
              </summary>
              <p className="pb-6 pl-12 pr-12 text-[16px] leading-[1.7] text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** The business's direct lines and address, as the quote band and the contact page set them. */
function DirectLines({ b, g, tel, dark = true }) {
  const soft = dark ? 'text-white/60' : 'text-muted';
  const strong = dark ? 'text-white' : 'text-ink';
  const full = `${b.address}, ${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;
  const hours = list(b.hours);
  return (
    <dl className={`grid gap-0 border-t ${dark ? 'border-white/15' : 'border-line'}`}>
      {[
        [g.phoneLabel || 'Phone', <a key="p" href={tel} className={`font-heading text-[24px] font-bold no-underline hover:underline ${strong}`}>{b.phone}</a>],
        ...g.extraPhones.map((p) => [p.label || 'Phone', <a key={p.number} href={telHref(p.number)} className={`font-heading text-[20px] font-bold no-underline hover:underline ${strong}`}>{p.number}</a>]),
        b.emergency?.text && ['After hours', <span key="e" className={`text-[15.5px] leading-[1.55] ${strong}`}>{b.emergency.text}</span>],
        b.email && ['Email', <a key="m" href={`mailto:${b.email}`} className={`break-all text-[17px] font-semibold no-underline hover:underline ${strong}`}>{b.email}</a>],
        ['Address', <a key="a" href={mapsHref(b)} className={`text-[16px] leading-[1.55] no-underline hover:underline ${strong}`}>{full}</a>],
        hours.length > 0 && [
          'Hours',
          <span key="h" className={`grid gap-0.5 text-[15.5px] ${strong}`}>
            {hours.map(([d, h]) => (
              <span key={d}>
                <span className={soft}>{d}</span> {h}
              </span>
            ))}
          </span>,
        ],
      ]
        .filter(Boolean)
        .map(([label, value], i) => (
          <div key={`${label}${i}`} className={`grid gap-1 border-b py-4 sm:grid-cols-[7.5rem_1fr] sm:gap-4 ${dark ? 'border-white/15' : 'border-line'}`}>
            <dt className={`${mono} pt-1 text-[11px] ${soft}`}>{label}</dt>
            <dd className="m-0 min-w-0">{value}</dd>
          </div>
        ))}
    </dl>
  );
}

function RfqForm({ b, groups }) {
  const options = [...(groups.length > 1 ? groups.map((g) => g.title) : list(groups[0]?.services).map((s) => s.title)), 'Something else'].filter(Boolean);
  return (
    <EnquiryForm
      b={b}
      submitLabel="Send Request for Quote"
      styles={{
        form: 'gap-4',
        label: `${mono} text-[11.5px] text-ink`,
        field:
          'min-h-[50px] rounded-[2px] border border-line bg-[color:var(--surface)] px-3.5 py-3 font-body text-[16px] normal-case tracking-normal text-ink focus:border-primary focus:bg-white focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-primary/25',
        button: `${btnPrimary} mt-2 w-full`,
        done: 'border border-line bg-[color:var(--surface)] p-5 text-[16px] text-ink',
      }}
      fields={[
        { name: 'company', label: 'Company', required: true, autoComplete: 'organization' },
        { name: 'name', label: 'Your Name', required: true, autoComplete: 'name' },
        { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
        { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
        options.length > 1 && { name: 'scope', label: 'Type of Work', type: 'select', wide: true, options },
        { name: 'site', label: 'Project Location or Site', wide: true },
        { name: 'details', label: 'Project Details', type: 'textarea', required: true, wide: true },
      ].filter(Boolean)}
    />
  );
}

/** The closing band of every page but contact: the request for quote, with the direct lines beside it. */
function Rfq({ b, g, groups, tel, n, title = 'Request a quote' }) {
  return (
    <section id="quote" className={`${pad} relative isolate overflow-hidden bg-[color:var(--steel)] text-white`}>
      <Backdrop />
      <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:gap-14`}>
        <div className="min-w-0 lg:col-span-5">
          <Label n={n} dark>
            Request for quote
          </Label>
          <h2 className={`${h2} text-white`}>{title}</h2>
          <p className={`mt-5 ${lead} text-white/75`}>
            Tell us what the job is, where it is and when it is needed, and {b.shortName} will get back to you about the work.
          </p>
          <div className="mt-9">
            <DirectLines b={b} g={g} tel={tel} />
          </div>
        </div>
        <div className="min-w-0 lg:col-span-7">
          <div className="relative bg-white p-5 text-ink sm:p-8 lg:p-10">
            <Corners />
            <p className={`${mono} mb-6 flex items-center justify-between gap-4 border-b border-line pb-4 text-muted`}>
              <span>RFQ</span>
              <span>{b.shortName}</span>
            </p>
            <RfqForm b={b} groups={groups} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ footer */

function Footer({ b, g, groups, tel, night }) {
  const head = `${mono} mb-4 text-[11px] text-white/50`;
  const credentials = g.credentials.slice(0, 4);
  return (
    <footer className="bg-[color:var(--night)] pb-28 text-[15.5px] text-white/70 md:pb-0">
      <div className={`${wrap} grid grid-cols-2 gap-x-6 gap-y-10 pb-12 pt-16 lg:grid-cols-[1.5fr_1fr_1fr_1.3fr] lg:gap-12`}>
        <div className="col-span-2 grid content-start gap-5 lg:col-span-1">
          <a href="/" className="flex min-h-[44px] w-fit max-w-full items-center" aria-label={`${b.name} home`}>
            <BrandLogo b={b} ground={night} textClass={`${display} text-white`} />
          </a>
          {b.summary && <p className="max-w-[26rem] leading-[1.6]">{b.summary}</p>}
          {credentials.length > 0 && (
            <ul className="grid gap-1.5 text-[14px]">
              {credentials.map((c) => (
                <li key={c.label} className="flex items-start gap-2">
                  <ShieldCheck size={15} className="mt-0.5 flex-none text-[color:var(--hi)]" aria-hidden="true" />
                  <span className="min-w-0 break-words">{[c.label, c.detail].filter(Boolean).join(' ')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className={head}>Capabilities</h2>
          <ul className="grid">
            {groups.map((gr) => (
              <li key={gr.slug}>
                <a href={`/${gr.slug}`} className="flex min-h-[44px] items-center py-2 leading-snug text-white/70 no-underline hover:text-white">
                  {gr.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className={head}>Company</h2>
          <ul className="grid">
            {[b.about && ['/about', 'About'], ['/contact', 'Contact'], ['/contact', 'Request a Quote']].filter(Boolean).map(([href, label]) => (
              <li key={label}>
                <a href={href} className="flex min-h-[44px] items-center py-2 text-white/70 no-underline hover:text-white">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-2 lg:col-span-1">
          <h2 className={head}>Contact</h2>
          <a href={tel} className="flex min-h-[44px] items-center font-heading text-[22px] font-bold text-white no-underline hover:underline">
            {b.phone}
          </a>
          {g.extraPhones.map((p) => (
            <a key={p.number} href={telHref(p.number)} className="flex min-h-[40px] items-center gap-2 text-white/80 no-underline hover:text-white">
              {p.label && <span className="text-white/50">{p.label}</span>} {p.number}
            </a>
          ))}
          {b.email && (
            <a href={`mailto:${b.email}`} className="flex min-h-[44px] items-center break-all text-white/70 no-underline hover:text-white">
              {b.email}
            </a>
          )}
          <a href={mapsHref(b)} className="block py-2 leading-[1.6] text-white/70 no-underline hover:text-white">
            {b.address}
            <br />
            {b.town}, {b.state} {b.zip}
          </a>
          {list(b.hours).length > 0 && (
            <dl className="mt-3 grid gap-1 text-[14px]">
              {list(b.hours).map(([d, h]) => (
                <div key={d} className="flex flex-wrap gap-x-2">
                  <dt className="font-medium text-white/90">{d}</dt>
                  <dd className="m-0">{h}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
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

/** The phone's call and quote bar, once the visitor has scrolled past the hero's own buttons. */
function MobileBar({ tel }) {
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
      <div className="grid grid-cols-[auto_1fr] gap-2 rounded-[4px] bg-[color:var(--night)] p-2 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)]">
        <a href={tel} className="flex min-h-[48px] items-center justify-center gap-2 rounded-[3px] border border-white/20 px-4 font-heading text-[14px] font-bold uppercase tracking-[0.07em] text-white no-underline">
          <Phone size={17} className="flex-none" aria-hidden="true" /> Call
        </a>
        <a href="/contact" className="flex min-h-[48px] items-center justify-center gap-2 rounded-[3px] bg-[color:var(--hi)] px-3 font-heading text-[14px] font-bold uppercase tracking-[0.07em] text-[color:var(--on-hi)] no-underline">
          Request a Quote
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- pages */

/**
 * The light sections in turn take white and the pale surface, so two of the
 * same never meet whichever are left out; a dark band stands between them
 * on its own. Each is numbered in the order it is drawn.
 */
function Sequence({ items }) {
  let n = 0;
  let light = 0;
  return items
    .filter(Boolean)
    .filter(([, , shown]) => shown)
    .map(([key, render, , dark]) => {
      n += 1;
      const tone = dark ? '' : light++ % 2 ? 'bg-surface' : 'bg-white';
      if (dark) light = 0;
      return <div key={key} className="contents">{render(n, tone)}</div>;
    });
}

function Home({ b, g, groups, tel, specs }) {
  const gallery = galleryOf(b, g, groups).items.length >= 2;
  const areas = g.areas.filter((a) => a !== b.town || g.areas.length > 1);
  return (
    <>
      <Hero b={b} g={g} groups={groups} tel={tel} specs={specs} />
      <Highlights g={g} />
      <Sequence
        items={[
          ['capabilities', (n, tone) => <Capabilities b={b} groups={groups} n={n} tone={tone} />, groups.length > 0],
          ['industries', (n) => <Industries b={b} g={g} n={n} />, g.industries.length >= 2, true],
          ['gallery', (n, tone) => <Gallery b={b} g={g} groups={groups} n={n} tone={tone} />, gallery],
          ['credentials', (n, tone) => <Credentials g={g} n={n} tone={tone} />, g.credentials.length || g.credentialFacts.length],
          ['equipment', (n, tone) => <Equipment g={g} n={n} tone={tone} />, g.equipment.length],
          ['steps', (n, tone) => <Steps b={b} g={g} n={n} tone={tone} />, g.steps.length >= 2],
          ['record', (n, tone) => <Record g={g} n={n} tone={tone} />, g.record.length],
          ['about', (n, tone) => <About b={b} n={n} tone={tone} />, Boolean(b.about)],
          ['coverage', (n, tone) => <Coverage b={b} g={g} n={n} tone={tone} />, g.states.length || areas.length > 1 || g.locations.length],
          ['reviews', (n, tone) => <Reviews b={b} g={g} n={n} tone={tone} />, g.reviews.length],
          ['faqs', (n, tone) => <Faqs b={b} n={n} tone={tone} />, list(b.faqs).some((f) => f?.q && f?.a)],
          ['quote', (n) => <Rfq b={b} g={g} groups={groups} tel={tel} n={n} />, true, true],
        ]}
      />
    </>
  );
}

/** An inner page's opening, on the dark ground: where it sits, what it is, and the two buttons. */
function PageHero({ crumbs, label, title, text, image, imageAlt, aside, children }) {
  return (
    <section className="relative isolate overflow-hidden bg-[color:var(--steel)] text-white">
      <Backdrop />
      <div className={`${wrap} grid gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-20`}>
        <div className={`min-w-0 ${image || aside ? 'lg:col-span-7' : 'lg:col-span-9'}`}>
          <nav aria-label="Breadcrumb" className="mb-7">
            <ol className={`flex flex-wrap items-center gap-2 ${mono} text-[11px] text-white/55`}>
              {/* Each step's slash follows it, so a crumb that wraps starts its line on a name, not a dangling slash. */}
              <li className="flex items-center gap-2">
                <a href="/" className="inline-flex min-h-[32px] items-center text-white/55 no-underline hover:text-white">
                  Home
                </a>
                <span aria-hidden="true">/</span>
              </li>
              {crumbs.map(([href, name], i) => (
                <li key={name} className="flex items-center gap-2">
                  {href ? (
                    <a href={href} className="inline-flex min-h-[32px] items-center text-white/55 no-underline hover:text-white">
                      {name}
                    </a>
                  ) : (
                    <span aria-current="page" className="inline-flex min-h-[32px] items-center text-white">
                      {name}
                    </span>
                  )}
                  {i < crumbs.length - 1 && <span aria-hidden="true">/</span>}
                </li>
              ))}
            </ol>
          </nav>
          {label && <Label dark>{label}</Label>}
          <h1 className={`${display} ${headlineSize(title)} leading-[var(--h-lead)] text-white [text-wrap:balance] break-words`}>{title}</h1>
          {text && <p className={`mt-6 max-w-[40rem] ${lead} text-white/80`}>{text}</p>}
          {children}
        </div>
        {image ? (
          <div className="relative min-w-0 lg:col-span-5">
            <Img className="block h-auto max-h-[min(70svh,560px)] w-full object-cover" src={image} alt={imageAlt || ''} sizes="(min-width: 1024px) 40vw, 100vw" eager />
            <Corners />
          </div>
        ) : (
          aside && <div className="min-w-0 lg:col-span-5">{aside}</div>
        )}
      </div>
    </section>
  );
}

function Buttons({ b, tel }) {
  return (
    <div className="mt-8 grid grid-cols-[1.45fr_1fr] gap-3 sm:flex sm:flex-wrap">
      <a href="/contact" className={`${btnHi} px-3 text-[14px] tracking-[0.04em] sm:px-6 sm:text-[15px] sm:tracking-[0.07em]`}>
        Request a Quote <ArrowRight size={17} className="hidden sm:block" aria-hidden="true" />
      </a>
      <Call b={b} tel={tel} short className={`${btnGhost} px-3 text-[14px] tracking-[0.04em] sm:px-6 sm:text-[15px] sm:tracking-[0.07em]`} />
    </div>
  );
}

/** A ruled list of the other capabilities, each a link to its page. */
function OtherGroups({ groups, current, dark = false }) {
  const others = groups.map((gr, i) => [gr, i]).filter(([gr]) => gr.slug !== current);
  if (!others.length) return null;
  return (
    <ol className={`border-t ${dark ? 'border-white/15' : 'border-line'}`}>
      {others.map(([gr, i]) => (
        <li key={gr.slug} className={`border-b ${dark ? 'border-white/10' : 'border-line'}`}>
          <a
            href={`/${gr.slug}`}
            className={`group grid min-h-[56px] grid-cols-[2.25rem_1fr_auto] items-center gap-2 py-3 no-underline ${dark ? 'text-white' : 'text-ink hover:text-[color:var(--pt)]'}`}
          >
            <span className={`font-mono text-[12px] ${dark ? 'text-[color:var(--hi)]' : 'text-[color:var(--mark)]'}`}>{nn(i + 1)}</span>
            <span className="font-heading text-[16.5px] font-bold leading-snug">{gr.title}</span>
            <ArrowRight size={16} className="opacity-60 transition group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        </li>
      ))}
    </ol>
  );
}

function GroupPage({ b, g, groups, group, tel, specs }) {
  const index = groups.findIndex((gr) => gr.slug === group.slug);
  const services = list(group.services).filter((s) => s?.title);
  const anchor = b.preview ? 'scroll-mt-[150px]' : 'scroll-mt-[110px]';
  const stick = b.preview ? 'lg:top-[156px]' : 'lg:top-[112px]';
  // The summary line is drawn under the hero only when it says something the
  // hero's paragraph does not; one cut from that paragraph would repeat it.
  const summary = group.intro && group.summary && !group.intro.includes(group.summary.replace(/[.!?]+$/, '')) ? group.summary : '';
  return (
    <>
      <PageHero
        crumbs={[['/#capabilities', 'Capabilities'], [null, group.title]]}
        label={`Capability ${nn(index + 1)} of ${nn(groups.length)}`}
        title={group.title}
        text={group.intro || group.summary}
        image={group.image}
        imageAlt={group.imageAlt}
        aside={
          services.length > 1 ? (
            <div className="relative hidden border border-white/20 bg-[color:var(--night)]/70 lg:block">
              <Corners />
              <p className={`${mono} border-b border-white/15 px-6 py-3.5 text-[11px] text-white/60`}>In this capability</p>
              <ol>
                {services.map((s, i) => (
                  <li key={s.slug || s.title} className="border-b border-white/10 last:border-0">
                    <a href={`#${s.slug}`} className="grid min-h-[52px] grid-cols-[2.25rem_1fr] items-center gap-2 px-6 py-2.5 text-white no-underline hover:bg-white/[0.06]">
                      <span className="font-mono text-[12px] text-[color:var(--hi)]">{nn(i + 1)}</span>
                      <span className="font-heading text-[16.5px] font-bold leading-snug">{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            // With no photo and no list of its own, the drawing's title block
            // stands beside the words, as on the home hero with no photo.
            <div className="relative border border-white/20 bg-[color:var(--night)]/70">
              <Corners />
              <div className={`flex items-center justify-between gap-4 border-b border-white/15 px-5 py-3.5 ${mono} text-[11px] text-white/60 sm:px-6`}>
                <span>{b.shortName}</span>
                <span className="text-[color:var(--hi)]">{nn(index + 1)}</span>
              </div>
              <Particulars b={b} specs={specs} />
            </div>
          )
        }
      >
        <Buttons b={b} tel={tel} />
      </PageHero>

      <section className={`${pad} bg-white`}>
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:gap-14`}>
          <div className="min-w-0 lg:col-span-8">
            {summary && <p className={`${lead} mb-10 max-w-[44rem] text-muted`}>{summary}</p>}
            {services.length > 0 ? (
              <ol className="border-t-2 border-ink">
                {services.map((s, i) => (
                  <li key={s.slug || s.title} id={s.slug} className={`${anchor} grid gap-x-6 gap-y-3 border-b border-line py-9 sm:grid-cols-[3.5rem_1fr]`}>
                    <span className="font-mono text-[14px] text-[color:var(--mark)] sm:pt-2">{nn(i + 1)}</span>
                    <div className="min-w-0">
                      <h2 className={`${display} text-[clamp(1.5rem,1.25rem+0.9vw,2rem)] leading-[1.1] text-ink`}>{s.title}</h2>
                      {s.text && <p className="mt-3 max-w-[44rem] text-[16.5px] leading-[1.65] text-muted [overflow-wrap:break-word]">{s.text}</p>}
                      {list(s.points).length > 0 && (
                        <ul className="mt-5 grid gap-x-8 sm:grid-cols-2">
                          {list(s.points).map((p) => (
                            <li key={p} className="flex min-w-0 items-start gap-3 border-t border-line py-2.5 text-[15.5px] leading-[1.5] text-ink [overflow-wrap:break-word]">
                              <span className="mt-[0.55em] h-1.5 w-1.5 flex-none bg-[color:var(--mark)]" aria-hidden="true" />
                              <span className="min-w-0">{p}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="border-t-2 border-ink pt-8">
                <p className={`${mono} mb-4 text-muted`}>Other capabilities</p>
                <OtherGroups groups={groups} current={group.slug} />
              </div>
            )}
          </div>
          <aside className={`grid min-w-0 content-start gap-6 lg:sticky lg:col-span-4 lg:self-start ${stick}`}>
            <div className="relative isolate overflow-hidden bg-[color:var(--steel)] p-7 text-white">
              <Backdrop sheen={false} />
              <p className={`${mono} text-[11px] text-white/60`}>Request for quote</p>
              <p className="mt-3 font-heading text-[22px] font-bold leading-snug">{group.title}</p>
              <p className="mt-2 text-[15.5px] leading-[1.55] text-white/75">Send the scope and the site, or call and talk it through.</p>
              <div className="mt-6 grid gap-3">
                <a href="/contact" className={`${btnHi} w-full`}>
                  Request a Quote
                </a>
                <a href={tel} className={`${btnGhost} w-full`}>
                  <Phone size={17} aria-hidden="true" /> {b.phone}
                </a>
              </div>
            </div>
            {services.length > 0 && groups.length > 1 && (
              <div>
                <p className={`${mono} mb-3 text-muted`}>Other capabilities</p>
                <OtherGroups groups={groups} current={group.slug} />
              </div>
            )}
          </aside>
        </div>
      </section>

      <Rfq b={b} g={g} groups={groups} tel={tel} />
    </>
  );
}

function AboutPage({ b, g, groups, tel }) {
  const story = list(b.about.text).slice(1);
  const values = list(b.about.values).filter((v) => v?.title);
  return (
    <>
      <PageHero
        crumbs={[[null, 'About']]}
        label={b.about.eyebrow || 'About'}
        title={b.about.title}
        text={list(b.about.text)[0]}
        image={b.about.image}
        imageAlt={b.about.imageAlt}
        aside={
          <div className="relative border border-white/20 bg-[color:var(--night)]/70 p-6 sm:p-7">
            <Corners />
            <p className={`${mono} mb-3 text-[11px] text-white/60`}>Capabilities</p>
            <OtherGroups groups={groups} current={null} dark />
          </div>
        }
      >
        <Buttons b={b} tel={tel} />
      </PageHero>
      {(story.length > 0 || values.length > 0 || b.since || b.owner?.name) && (
        <section className={`${pad} bg-white`}>
          <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
            <div className={`min-w-0 ${values.length || b.since ? 'lg:col-span-7' : 'lg:col-span-9'}`}>
              <Label>Our story</Label>
              {story.length > 0 ? (
                story.map((p) => (
                  <p key={p} className={`mb-5 ${lead} text-ink/85`}>
                    {p}
                  </p>
                ))
              ) : (
                <p className={`${lead} text-ink/85`}>{b.summary}</p>
              )}
              {b.owner?.name && (
                <div className="mt-8 flex items-start gap-5 border border-line p-5">
                  {b.owner.image && <Img className="h-24 w-24 flex-none object-cover" src={b.owner.image} alt={b.owner.name} sizes="96px" />}
                  <div className="min-w-0">
                    <p className="font-heading text-[19px] font-bold text-ink">{b.owner.name}</p>
                    {b.owner.role && <p className={`${mono} mt-1 text-[11px] text-muted`}>{b.owner.role}</p>}
                    {b.owner.text && <p className="mt-2 text-[16px] leading-[1.6] text-muted">{b.owner.text}</p>}
                  </div>
                </div>
              )}
            </div>
            {(values.length > 0 || b.since) && (
              <aside className="grid min-w-0 content-start gap-8 lg:col-span-5">
                {b.since && (
                  <div className="border-t-2 border-ink pt-5">
                    <p className={`${mono} text-muted`}>Established</p>
                    <p className={`${display} mt-2 text-[clamp(3rem,2rem+3vw,4.5rem)] leading-none text-ink`}>{b.since}</p>
                  </div>
                )}
                {values.length > 0 && (
                  <ol className="grid border-t-2 border-ink">
                    {values.map((v, i) => (
                      <li key={v.title} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-line py-5">
                        <span className="pt-1 font-mono text-[13px] text-[color:var(--mark)]">{nn(i + 1)}</span>
                        <span className="min-w-0">
                          <span className="block font-heading text-[18px] font-bold leading-snug text-ink">{v.title}</span>
                          {v.text && <span className="mt-1 block text-[15.5px] leading-[1.55] text-muted">{v.text}</span>}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </aside>
            )}
          </div>
        </section>
      )}
      <Sequence
        items={[
          ['industries', (n) => <Industries b={b} g={g} n={n} />, g.industries.length >= 2, true],
          ['credentials', (n, tone) => <Credentials g={g} n={n} tone={tone} />, g.credentials.length || g.credentialFacts.length],
          ['quote', (n) => <Rfq b={b} g={g} groups={groups} tel={tel} n={n} />, true, true],
        ]}
      />
    </>
  );
}

function ContactPage({ b, g, groups, tel }) {
  return (
    <>
      <PageHero
        crumbs={[[null, 'Contact']]}
        label="Request for quote"
        title="Request a quote"
        text={`Tell us what the job is, where it is and when it is needed, and ${b.shortName} will get back to you about the work. Or call and talk it through.`}
        aside={
          <a href={tel} className="relative block border border-white/20 bg-[color:var(--night)]/70 p-6 text-white no-underline sm:p-8">
            <Corners />
            <span className={`${mono} block text-[11px] text-white/60`}>{b.emergency ? '24-hour line' : 'Call'}</span>
            <span className="mt-2 block font-heading text-[clamp(1.8rem,1.4rem+1.4vw,2.4rem)] font-bold leading-tight">{b.phone}</span>
            <span className="mt-5 block border-t border-white/15 pt-5 text-[15.5px] leading-[1.6] text-white/75">
              {b.address}, {b.town}, {b.state} {b.zip}
            </span>
          </a>
        }
      />
      <section className={`${pad} bg-white`}>
        <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:gap-14`}>
          <div className="min-w-0 lg:col-span-7">
            <div className="relative border border-line p-5 sm:p-8 lg:p-10">
              <Corners tone="border-[color:var(--mark)]" />
              <h2 className={`${display} mb-7 text-[clamp(1.6rem,1.3rem+1vw,2.1rem)] leading-tight text-ink`}>Send a request for quote</h2>
              <RfqForm b={b} groups={groups} />
            </div>
          </div>
          <aside className="grid min-w-0 content-start gap-10 lg:col-span-5">
            <div>
              <p className={`${mono} mb-2 text-muted`}>Direct lines</p>
              <DirectLines b={b} g={g} tel={tel} dark={false} />
            </div>
            {g.locations.map((f) => (
              <SpecList key={f.heading} fact={f} cols="sm:grid-cols-1" />
            ))}
            {(g.states.length > 0 || g.areas.length > 1) && (
              <div>
                <p className={`${mono} mb-3 text-muted`}>{g.states.length ? 'States served' : 'Areas served'}</p>
                <ul className="flex flex-wrap gap-2">
                  {(g.states.length ? g.states : g.areas).map((a) => (
                    <li key={a} className="inline-flex min-h-[38px] items-center gap-2 border border-line px-3.5 text-[15px] font-medium text-ink">
                      <MapPin size={14} className="flex-none text-[color:var(--mark)]" aria-hidden="true" /> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}

export default function Industrial({ b, path = '' }) {
  const tel = telHref(b.phone);
  const groups = groupsOf(b);
  const g = gather(b);
  const group = groups.find((gr) => gr.slug === path);
  const page = group ? 'group' : path === 'about' && b.about ? 'about' : path === 'contact' ? 'contact' : 'home';
  const current = page === 'home' ? '' : path;
  const pal = palette(b.brand);
  const classic = b.tone === 'classic';
  const serif = /serif/.test(String(b.brand.heading || '').replace(/sans-serif/g, ''));
  const narrow = condensed(b.brand.heading);
  const specs = specsOf(b, g);

  const style = {
    '--ink': pal.ink,
    '--muted': 'color-mix(in srgb, var(--ink) 70%, #fff)',
    '--surface': 'color-mix(in srgb, var(--primary) 5%, #f3f4f5)',
    '--line': 'color-mix(in srgb, var(--ink) 14%, #fff)',
    ...displayVars(b.brand),
    ...brandVars(b.brand),
    '--primary': pal.primary,
    '--primaryDeep': pal.deep,
    '--steel': pal.steel,
    '--night': pal.night,
    '--hi': pal.hi,
    '--on-hi': pal.onHi,
    '--on-primary': pal.onPrimary,
    '--pt': pal.pt,
    '--mark': pal.mark,
    '--h-weight': serif ? 'var(--display-weight, 400)' : classic ? 600 : 800,
    '--h-track': narrow && !classic ? '0.01em' : classic || serif ? '-0.01em' : '-0.025em',
    '--h-case': narrow && !classic ? 'uppercase' : 'none',
    // Capitals have no descenders and sit close; lowercase needs room for a
    // g or a y to clear the line below.
    '--h-lead': narrow && !classic ? 1.04 : 1.12,
  };

  return (
    <div className="min-w-0 overflow-x-clip bg-white font-body text-[16px] text-ink antialiased [&_.font-heading]:[word-spacing:0.06em]" style={style}>
      <TopBar b={b} g={g} />
      <Header b={b} g={g} groups={groups} tel={tel} current={current} />
      <main>
        {page === 'home' && <Home b={b} g={g} groups={groups} tel={tel} specs={specs} />}
        {page === 'group' && <GroupPage b={b} g={g} groups={groups} group={group} tel={tel} specs={specs} />}
        {page === 'about' && <AboutPage b={b} g={g} groups={groups} tel={tel} />}
        {page === 'contact' && <ContactPage b={b} g={g} groups={groups} tel={tel} />}
      </main>
      {!path && g.rest.length > 0 && (
        <div className="pb-[clamp(2rem,4vw,3rem)] pt-[clamp(3.5rem,7vw,5.5rem)]">
          <Facts b={{ ...b, facts: g.rest }} />
        </div>
      )}
      <Footer b={b} g={g} groups={groups} tel={tel} night={pal.night} />
      <MobileBar tel={tel} />
    </div>
  );
}
