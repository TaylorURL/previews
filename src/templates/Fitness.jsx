/**
 * FITNESS - a gym or group-training studio, drawn dark: a near-black ground,
 * the brand color as the one bright accent, oversized condensed capitals.
 * Several pages, each prerendered at its own address.
 *
 * Pages (from pages(b) below):
 *   ''                     home
 *   'classes'              every class, alternating photo and copy
 *   'classes/<slug>'       one page per entry in b.classes
 *   'schedule'             only when b.schedule has days: day tabs on phones, a week grid from lg up
 *   'membership'           price tiers when b.membership.tiers has any, otherwise how a first class works
 *   'coaches'              only when b.coaches has any
 *   'contact'              the enquiry form (anchor #book), address, phone, hours
 *
 * BRAND FILE (src/brands/<slug>.json). Required unless marked optional.
 *
 *   template      "fitness"
 *   preview       true on a prospect's preview (shows the preview bar); omit or false on a sample
 *   name          full business name, "Forge 146 Fitness"
 *   shortName     the name in running copy, "Forge 146"
 *   phone         "(281) 555-0163"
 *   email         optional
 *   address       street line, "4520 Garth Rd, Suite 110"
 *   town, state   "Baytown", "TX"
 *   zip           optional
 *   rating        optional, Google rating, 4.9. Shown only with reviewCount
 *   reviewCount   optional, number of Google reviews
 *   hours         [[days, hours], ...], e.g. [["Mon – Fri", "5 AM – 8:30 PM"]]. May be []
 *   social        optional { instagram?, facebook?, tiktok?, youtube? } full URLs, shown in the footer
 *   bookingUrl    optional, the studio's own booking or trial page (Mindbody, Glofox...). Every
 *                 trial button goes there when set; otherwise to /contact#book
 *
 *   brand {
 *     primary     the accent: buttons, the marquee, stripes. Text on it is worked out (dark on a
 *                 bright color, white on a deep one) and a deep primary is lifted for words on black
 *     bg          optional ground, default #0b0b0c. Keep it near-black: the template is dark only
 *     panel       optional card ground, default #141416
 *     line        optional rules and borders, default #26262a
 *     ink         optional text, default #f4f4f1
 *     muted       optional secondary text, default #a3a3a8
 *     heading     display font stack, a condensed face: "'Bebas Neue', 'Arial Narrow', Impact, sans-serif"
 *                 (Anton and Oswald also suit). Set in capitals by the page
 *     body        body font stack, "'Inter', system-ui, sans-serif"
 *     fonts       Google Fonts stylesheet URL loading both
 *     logo        optional, a logo that reads on black (light or brand-colored), path under /brands/<slug>/.
 *                 Without one the short name is set in the heading font
 *     logoWidth   optional, logo width in px in the header (default 150)
 *   }
 *
 *   hero {
 *     eyebrow     optional, small line above the title, "Group training on Garth Road"
 *     title       first line of the headline, short: "Show up."
 *     titleAccent optional second line, drawn in the brand color: "Get after it."
 *     lead        one or two sentences under it
 *     image       full-bleed photo: /brands/<slug>/<name> (with -800.webp and -1600.webp beside it)
 *                 or an images.unsplash.com URL. A dark, busy class photo works best
 *     imageAlt
 *     position    optional CSS object-position for the hero photo, "center 35%"
 *   }
 *
 *   trial         optional {
 *     label       the button on every page: "Start Your Free Trial". Default "Book Your First Class".
 *                 Write "free" only when the studio really offers a free class
 *     eyebrow     optional, over the closing band, default "First class"
 *     title       the closing band headline, "Your first class is on us."
 *     text        a sentence under it
 *     image       optional band photo (default the hero photo); imageAlt is not shown, the photo is decorative
 *   }
 *
 *   about         optional { eyebrow?, title, text (string or array of paragraphs), points? [short
 *                 strings], image?, imageAlt? } - the studio block on the home page
 *
 *   classes       [ at least one {
 *     slug        url segment, lowercase-hyphenated, unique: "strength-lab"
 *     name        "Strength Lab"
 *     intensity   1 to 5, drawn as five rising bars
 *     duration    optional, minutes, 60
 *     summary     one line for cards
 *     text        optional, a paragraph for the class page (falls back to summary)
 *     expect      optional [strings], "What to expect" on the class page
 *     image       optional photo, imageAlt
 *   } ]           The first six are on the home page; every one is in the marquee.
 *   classesIntro  optional, the lead under the Classes page title
 *
 *   schedule      optional [ { day: "Monday", sessions: [ { time: "5:30 AM", class: <a class slug,
 *                 or a plain name for a class not in classes>, coach?: "Marcus" } ] } ]
 *                 Days in the order they should show; sessions are sorted by time. Counts and the
 *                 first and last class times on the page are worked out from it.
 *   scheduleNote  optional, replaces the lead on the schedule page
 *
 *   membership    optional {
 *     intro       optional, a sentence under the page title
 *     tiers       optional [ { name, price (number for dollars, or a string such as "Call"),
 *                 period? "month" | "class", text?, features? [strings], featured? true on one,
 *                 badge? short label such as "Most popular" } ] - up to four read well
 *     note        optional, small print under the tiers
 *   }             Without tiers the page explains how a first class works, from the trial fields.
 *
 *   coaches       optional [ { name, role?, bio?, specialties? [strings], image?, imageAlt? } ]
 *                 A session's coach is matched to a coach by first name.
 *   coachesIntro  optional, the lead under the Coaches page title
 *   faq           optional [ { q, a } ] on the membership page
 *   areas         optional [town names] on the contact page
 *   contactImage  optional photo on the contact page, contactImageAlt
 *   reviews       optional [ { author, text } ] - up to six shown, Google reviews quoted as written
 */
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Menu, Phone, X } from 'lucide-react';
import { brandVars, mapsHref, telHref } from '../site.js';
import { hotColor, onColor } from './fitness/color.js';
import { Btn, cut, display, hot, onPrimary, solid, weekOf, wrap } from './fitness/ui.jsx';
import { ClassPage, ClassesPage, CoachesPage, ContactPage, HomePage, MembershipPage, SchedulePage } from './fitness/pages.jsx';

const DARK = { bg: '#0b0b0c', panel: '#141416', line: '#26262a', ink: '#f4f4f1', muted: '#a3a3a8' };

const classList = (b) => (Array.isArray(b.classes) ? b.classes.filter((c) => c && c.slug && c.name) : []);
const hasSchedule = (b) => weekOf(b).some((d) => d.sessions.length);
const hasCoaches = (b) => Array.isArray(b.coaches) && b.coaches.length > 0;

export function pages(b) {
  return [
    'classes',
    ...classList(b).map((c) => `classes/${c.slug}`),
    hasSchedule(b) && 'schedule',
    'membership',
    hasCoaches(b) && 'coaches',
    'contact',
  ].filter(Boolean);
}

function navFor(b, tiers) {
  return [
    ['/classes', 'Classes', 'classes'],
    hasSchedule(b) && ['/schedule', 'Schedule', 'schedule'],
    ['/membership', tiers ? 'Membership' : 'Get Started', 'membership'],
    hasCoaches(b) && ['/coaches', 'Coaches', 'coaches'],
    ['/contact', 'Contact', 'contact'],
  ].filter(Boolean);
}

function Mark({ b, className = '' }) {
  if (b.brand.logo) {
    return (
      <img
        className={`block h-auto max-h-14 ${className}`}
        src={b.brand.logo}
        alt={b.name}
        style={{ width: `min(${b.brand.logoWidth || 150}px, 100%)` }}
      />
    );
  }
  return <span className={`block font-heading text-[1.9rem] uppercase leading-none ${className}`}>{b.shortName}</span>;
}

function Header({ b, nav, section, ctx }) {
  const [open, setOpen] = useState(false);
  const stick = b.preview ? 'top-11' : 'top-0';

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = before;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <header className={`sticky ${stick} z-40 border-b border-line bg-ground/90 backdrop-blur-md`}>
        <div className={`${wrap} flex min-h-16 items-center gap-6 py-2 lg:min-h-20`}>
          <a
            href="/"
            className="flex min-h-11 min-w-0 max-w-[48vw] items-center text-ink no-underline sm:max-w-none"
            aria-label={`${b.name} home`}
          >
            <Mark b={b} />
          </a>
          <nav aria-label="Main" className="mx-auto hidden items-center gap-1 lg:flex xl:gap-3">
            {nav.map(([href, label, key]) => (
              <a
                key={href}
                href={href}
                aria-current={section === key ? 'page' : undefined}
                className={`relative inline-flex min-h-11 items-center px-3 text-[14px] font-semibold uppercase tracking-[0.12em] no-underline transition hover:text-ink ${
                  section === key
                    ? `${hot} after:absolute after:inset-x-3 after:bottom-1 after:h-[3px] after:-skew-x-[24deg] after:bg-[color:var(--hot)]`
                    : 'text-ink/80'
                }`}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:gap-5">
            <a
              href={ctx.tel}
              className="hidden min-h-11 items-center gap-2 whitespace-nowrap text-[15px] font-semibold text-ink no-underline xl:inline-flex"
            >
              <Phone size={16} className={hot} aria-hidden="true" /> {b.phone}
            </a>
            <a
              href={ctx.trial.href}
              className={`${solid} hidden !min-h-12 whitespace-nowrap !px-6 !text-[14px] md:inline-flex`}
              style={cut(10)}
            >
              {ctx.trial.label}
            </a>
            <button
              type="button"
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-line bg-transparent px-3.5 text-[14px] font-bold uppercase tracking-[0.12em] text-ink lg:hidden"
              aria-expanded={open}
              aria-controls="fitness-menu"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} aria-hidden="true" /> Menu
            </button>
          </div>
        </div>
      </header>

      <div
        id="fitness-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
        className={`fixed inset-x-0 bottom-0 ${b.preview ? 'top-11' : 'top-0'} z-50 overflow-y-auto bg-ground lg:hidden`}
      >
        <span
          className="pointer-events-none absolute -right-16 top-24 h-[140%] w-24 rotate-[16deg] bg-primary/90"
          aria-hidden="true"
        />
        <div className={`${wrap} relative flex min-h-16 items-center justify-between gap-4 border-b border-line py-2`}>
          <a
            href="/"
            className="flex min-h-11 min-w-0 max-w-[48vw] items-center text-ink no-underline"
            onClick={() => setOpen(false)}
          >
            <Mark b={b} />
          </a>
          <button
            type="button"
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-line bg-ground px-3.5 text-[14px] font-bold uppercase tracking-[0.12em] text-ink"
            onClick={() => setOpen(false)}
          >
            <X size={20} aria-hidden="true" /> Close
          </button>
        </div>
        <nav aria-label="Mobile" className={`${wrap} relative pt-4`}>
          <ol className="m-0 list-none p-0">
            {[['/', 'Home', ''], ...nav].map(([href, label, key], i) => (
              <li key={href} className="border-b border-line">
                <a
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={section === key ? 'page' : undefined}
                  className={`flex min-h-[64px] items-baseline gap-4 py-2 no-underline ${section === key ? hot : 'text-ink'}`}
                >
                  <span className="w-7 flex-none text-sm font-semibold text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className={`${display} text-[clamp(2.9rem,10vw,4.5rem)]`}>{label}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className={`${wrap} relative grid gap-3 py-8 sm:grid-cols-2`}>
          <Btn href={ctx.trial.href} arrow>
            {ctx.trial.label}
          </Btn>
          <Btn href={ctx.tel} ghost className="bg-ground">
            <Phone size={17} aria-hidden="true" /> {b.phone}
          </Btn>
        </div>
        {b.hours?.length > 0 && (
          <div className={`${wrap} relative pb-10`}>
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-muted">Hours</p>
            <ul className="m-0 grid max-w-[min(24rem,calc(100%-5.5rem))] list-none gap-1 p-0 text-base">
              {b.hours.map(([d, h]) => (
                <li key={d} className="flex justify-between gap-4">
                  <span className="text-muted">{d}</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

const SOCIAL = [
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['tiktok', 'TikTok'],
  ['youtube', 'YouTube'],
];

function Footer({ b, nav, ctx }) {
  const city = `${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;
  const social = SOCIAL.filter(([k]) => b.social?.[k]);
  const label = 'mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] ' + hot;
  const link = 'inline-flex min-h-11 items-center text-base text-ink no-underline hover:underline';
  return (
    <footer className="overflow-hidden border-t border-line bg-[color-mix(in_srgb,var(--bg)_70%,#000)] pb-28 md:pb-0">
      <div
        className={`${wrap} grid gap-10 pb-10 pt-16 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:pt-24`}
      >
        <div className="grid content-start gap-5">
          <a
            href="/"
            className="flex min-h-11 max-w-[60vw] items-center text-ink no-underline sm:max-w-none"
            aria-label={`${b.name} home`}
          >
            <Mark b={b} />
          </a>
          <a href={mapsHref(b)} className="text-base leading-relaxed text-muted no-underline hover:text-ink">
            {b.address}
            <br />
            {city}
          </a>
          {social.length > 0 && (
            <ul className="m-0 flex list-none flex-wrap gap-x-5 p-0">
              {social.map(([k, name]) => (
                <li key={k}>
                  <a href={b.social[k]} className={`${link} gap-1 !text-[15px] font-semibold`} rel="noopener">
                    {name} <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className={label}>Studio</p>
          <ul className="m-0 grid list-none p-0">
            {nav.map(([href, text]) => (
              <li key={href}>
                <a href={href} className={link}>
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {b.hours?.length > 0 && (
          <div>
            <p className={label}>Hours</p>
            <table className="w-full border-collapse text-base">
              <tbody>
                {b.hours.map(([d, h]) => (
                  <tr key={d}>
                    <th className="py-1.5 pr-4 text-left align-top font-normal text-muted">{d}</th>
                    <td className="py-1.5 text-right align-top lg:text-left">{h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div>
          <p className={label}>Contact</p>
          <ul className="m-0 grid list-none p-0">
            <li>
              <a href={ctx.tel} className={`${link} whitespace-nowrap`}>
                {b.phone}
              </a>
            </li>
            {b.email && (
              <li>
                <a href={`mailto:${b.email}`} className={`${link} [overflow-wrap:anywhere]`}>
                  {b.email}
                </a>
              </li>
            )}
            <li>
              <a
                href={ctx.trial.href}
                className={`inline-flex min-h-11 items-center gap-2 text-base font-semibold no-underline hover:underline ${hot}`}
              >
                {ctx.trial.label} <ArrowRight size={16} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className={`${wrap} pb-3`} aria-hidden="true">
        <p
          className="m-0 select-none whitespace-nowrap font-heading uppercase leading-[0.8] text-ink/[0.07]"
          style={{ fontSize: `clamp(2.5rem, calc((100vw - 8vw) / ${(b.shortName.length * 0.56).toFixed(2)}), 15rem)` }}
        >
          {b.shortName}
        </p>
      </div>
      <div className={`${wrap} pb-8`}>
        <p className="m-0 border-t border-line pt-6 text-[13px] text-muted">
          &copy; {new Date().getFullYear()} {b.name}
        </p>
      </div>
    </footer>
  );
}

export default function Fitness({ b, path = '' }) {
  const classes = classList(b);
  const week = weekOf(b);
  const tiers = Array.isArray(b.membership?.tiers) ? b.membership.tiers : [];
  const ctx = {
    tel: telHref(b.phone),
    classes,
    week,
    tiers,
    hasSchedule: hasSchedule(b),
    hasCoaches: hasCoaches(b),
    trial: { label: b.trial?.label || 'Book Your First Class', href: b.bookingUrl || '/contact#book' },
  };
  const nav = navFor(b, tiers.length > 0);

  const [first, second] = path.split('/');
  const cls = first === 'classes' && second ? classes.find((c) => c.slug === second) : null;
  let page;
  let section = first;
  if (cls) page = <ClassPage b={b} ctx={ctx} c={cls} />;
  else if (path === 'classes') page = <ClassesPage b={b} ctx={ctx} />;
  else if (path === 'schedule' && ctx.hasSchedule) page = <SchedulePage b={b} ctx={ctx} />;
  else if (path === 'membership') page = <MembershipPage b={b} ctx={ctx} />;
  else if (path === 'coaches' && ctx.hasCoaches) page = <CoachesPage b={b} ctx={ctx} />;
  else if (path === 'contact') page = <ContactPage b={b} ctx={ctx} />;
  else {
    page = <HomePage b={b} ctx={ctx} />;
    section = '';
  }

  return (
    <div
      className="min-w-0 overflow-x-clip bg-ground font-body text-base text-ink antialiased [color-scheme:dark]"
      style={{
        ...Object.fromEntries(Object.entries(DARK).map(([k, v]) => [`--${k}`, v])),
        ...brandVars(b.brand),
        '--on-primary': onColor(b.brand.primary),
        '--hot': hotColor(b.brand.primary),
        '--hero-position': b.hero?.position || 'center',
      }}
    >
      <Header b={b} nav={nav} section={section} ctx={ctx} />
      <main>{page}</main>
      <Footer b={b} nav={nav} ctx={ctx} />

      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-ground/95 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
        <a
          href={ctx.tel}
          aria-label={`Call ${b.phone}`}
          className="inline-flex min-h-[52px] w-[52px] flex-none items-center justify-center border border-line text-ink"
        >
          <Phone size={20} aria-hidden="true" />
        </a>
        <a
          href={ctx.trial.href}
          className={`inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 bg-primary px-4 text-[15px] font-bold uppercase tracking-[0.08em] no-underline ${onPrimary}`}
          style={cut(10)}
        >
          {ctx.trial.label} <ArrowRight size={18} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
