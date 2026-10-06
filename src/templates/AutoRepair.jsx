/**
 * Auto repair: a shop's site of several pages - home, services, one page per
 * service group, makes serviced, about, and an appointment request.
 *
 * The brand file (src/brands/<slug>.json) this template reads. Required fields
 * are marked *, everything else is optional and its section or line is left
 * out when it is missing. Copy is sentence case; UI labels in the template are
 * Title Case. src/brands/sample-autorepair.json fills every field.
 *
 *   template*      "autorepair"
 *   preview        true on a prospect's preview (shows the preview strip and
 *                  counts views); left out on the sample
 *   name*          the business's full name: "Cedar Bayou Auto Works"
 *   shortName*     the name in a sentence or when there is no logo
 *   phone*         "(281) 555-0186"
 *   email          shown in the footer
 *   address*       street line: "4518 Garth Rd"
 *   town*, state*  "Baytown", "TX"
 *   zip            "77521"
 *   mapQuery       what the footer map searches for, when the street address
 *                  alone does not find the shop
 *   since          year founded, a number: 2004
 *   rating         Google rating, a number: 4.8      } both or neither
 *   reviewCount    number of Google reviews: 167     }
 *   hours*         rows of [days, time]: [["Mon – Fri", "7:30 AM – 6 PM"],
 *                  ["Saturday", "8 AM – 2 PM"], ["Sunday", "Closed"]]. Days are
 *                  day names or ranges ("Mon – Fri", "Tuesday", "Weekdays",
 *                  "Daily"), so the header can show today's hours and the
 *                  appointment form can offer the open days. A time containing
 *                  "Closed" marks a closed day.
 *
 *   brand*         colors and type, set as CSS custom properties
 *     primary*     the shop's brand color: buttons, the Call Now block, rules
 *     primaryDeep* a darker shade of it
 *     accent       a second brand color for small marks on the dark steel
 *                  (falls back to primary)
 *     ink*         body text, near black
 *     panel        the dark steel of the header, hero and footer (#1f262d by
 *                  default; keep it dark)
 *     surface      the light steel of alternate sections (#eef0f2 by default)
 *     line         hairlines and borders (#d6dadf by default)
 *     muted        secondary text on light grounds (#5c6670 by default)
 *     heading*     heading font stack: "'Chakra Petch', 'Arial Narrow', sans-serif"
 *     body*        body font stack: "'Inter', system-ui, sans-serif"
 *     fonts*       the Google Fonts stylesheet URL for both
 *     logo         path to the logo (webp or png, on a transparent or white
 *                  ground - it sits on a white plate); null sets shortName in type
 *     logoWidth    unused by this template, harmless if present
 *
 *   hero*
 *     eyebrow      small line above the headline: "Baytown auto repair since 2004"
 *     title*       headline: "Honest repairs, done right"
 *     titleAccent  second line of the headline, set in the brand color
 *     lead*        a sentence or two under it
 *     image*       a photo of the shop or a bay: "/brands/<slug>/bay" (with
 *                  bay-800.webp and bay-1600.webp beside it) or an Unsplash URL
 *     imageAlt*    what the photo shows
 *
 *   warranty       { title*, text } the shop's own warranty, as the shop states
 *                  it: { "title": "24 months / 24,000 miles", "text": "..." }
 *   certifications [{ title*, text }] credentials the shop actually holds,
 *                  such as "ASE Certified", "AAA Approved Auto Repair",
 *                  "NAPA AutoCare Center". Never added unless the shop claims it.
 *
 *   services*      the service groups, in menu order (four to eight reads best).
 *                  Each one is a page at /services/<slug>.
 *     slug*        lowercase-and-hyphens: "brakes", "ac-heating"
 *     title*       "Brakes", "AC and Heating"
 *     icon*        one of: droplet, oil, disc, brakes, engine, diagnostics,
 *                  scan, gauge, snowflake, fan, thermometer, wind, tire, wheel,
 *                  battery, zap, wrench, cog, transmission, car, truck, fuel,
 *                  key, inspection, shield, badge
 *     summary*     one short line for the menu and the icon rail
 *     text*        a paragraph that opens the group's page
 *     heading      the group page's headline (default "<title> in <town>")
 *     image        a photo for the group's card and page; a dark tile with
 *     imageAlt     the icon stands in when there is none
 *     items*       [{ title*, text }] the services in the group, three to six
 *   servicesIntro  a sentence under the Services page headline
 *
 *   expect         [{ title*, text* }] the steps of a visit, usually three
 *   expectTitle    headline over them (default "What to expect")
 *   makes          ["Ford", "Toyota", ...] makes serviced; adds the Makes page,
 *                  the makes section and the Make choice in the forms
 *   makesTitle     headline over them (default "Cars, trucks and SUVs we work on")
 *   makesText      a sentence about them
 *
 *   about          the About page; the home page shows its first paragraph
 *     eyebrow      small line over the title (default "About the shop")
 *     title*       headline
 *     text*        a paragraph, or a list of paragraphs
 *     image*, imageAlt*
 *     points       ["Six service bays", ...] short facts, shown as a checklist
 *     gallery      [{ image*, alt* }] more photos of the shop for the About page
 *   band           { title, text } the call to action over every footer
 *   serviceArea    ["Baytown", "Mont Belvieu", ...] towns served, in the footer
 *                  and on the About page
 *   reviews        [{ author*, text*, vehicle }] quoted from the shop's Google
 *                  listing; author as the listing shows it, vehicle like
 *                  "2015 F-150" when the review names it
 */

import { ArrowRight, Check, Clock, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { brandVars, mapsHref, ratingLine, telHref } from '../site.js';
import { Img, Stars } from './shared.jsx';
import { CtaBand, Footer, Header, HoursStrip, HoursToday, MobileBar, useToday } from './autorepair/chrome.jsx';
import { liftOn, onColor } from './autorepair/color.js';
import { AppointmentForm, QuickBook } from './autorepair/forms.jsx';
import {
  Eyebrow,
  cardTitle,
  edgeLlg,
  ghostDark,
  h2,
  href,
  iconFor,
  onDark,
  outline,
  pad,
  solid,
  wrap,
} from './autorepair/ui.jsx';

const DEFAULTS = { panel: '#1f262d', surface: '#eef0f2', line: '#d6dadf', muted: '#5c6670' };
const num = (i) => String(i + 1).padStart(2, '0');
const paragraphs = (text) => (Array.isArray(text) ? text : text ? [text] : []);

/** The paths beyond the home page this business's site has. */
export function pages(b) {
  return [
    'services',
    ...(b.services || []).map((s) => `services/${s.slug}`),
    b.makes?.length > 0 && 'makes',
    b.about && 'about',
    'appointment',
  ].filter(Boolean);
}

/* ------------------------------------------------------------------ parts */

function PageHero({ b, crumbs, eyebrow, title, lead, image, imageAlt, actions }) {
  return (
    <section className="relative isolate overflow-hidden bg-panel text-white">
      {!image && (
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 -z-10 w-1/2 bg-[repeating-linear-gradient(135deg,transparent_0_26px,rgba(255,255,255,0.035)_26px_52px)]"
        />
      )}
      <div className={image ? 'lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]' : ''}>
        <div className={image ? `px-gutter py-12 sm:py-16 lg:py-20 lg:pr-14 ${edgeLlg}` : `${wrap} py-12 sm:py-16 lg:py-20`}>
          <nav aria-label="Breadcrumb" className="mb-6 text-[14px] font-medium text-white/65">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {[['', 'Home'], ...crumbs].map(([to, label], i, all) => (
                <li key={label} className="flex items-center gap-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {i < all.length - 1 ? (
                    <a href={href(to)} className="-mx-1 inline-flex min-h-[44px] min-w-[44px] items-center px-1 text-white/75 no-underline hover:text-white">
                      {label}
                    </a>
                  ) : (
                    <span aria-current="page" className="text-white">
                      {label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          {eyebrow}
          <h1 className="max-w-[46rem] break-words font-heading text-[clamp(2.3rem,1.4rem+3.4vw,4rem)] font-bold leading-[1.02] tracking-[-0.01em] [text-wrap:balance]">
            {title}
          </h1>
          {lead && <p className="mt-5 max-w-[38rem] text-[17px] leading-[1.65] text-white/85 sm:text-[19px]">{lead}</p>}
          {actions && <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">{actions}</div>}
        </div>
        {image && (
          <div className="relative min-h-[240px] sm:min-h-[340px]">
            <Img
              className="absolute inset-0 h-full w-full object-cover lg:[clip-path:polygon(56px_0,100%_0,100%_100%,0_100%)]"
              src={image}
              alt={imageAlt || ''}
              sizes="(max-width: 1024px) 100vw, 48vw"
              eager
            />
          </div>
        )}
      </div>
      {!image && <div className="h-1 bg-primary" aria-hidden="true" />}
    </section>
  );
}

function CallButtons({ b, tel, book = 'Book an Appointment', service }) {
  return (
    <>
      <a href={service ? `${href('appointment')}?service=${service}` : href('appointment')} className={solid}>
        {book} <ArrowRight size={18} aria-hidden="true" />
      </a>
      <a href={tel} className={ghostDark}>
        <Phone size={18} aria-hidden="true" /> {b.phone}
      </a>
    </>
  );
}

function ServiceRail({ b }) {
  return (
    <nav aria-label="Service groups" className="border-b border-line bg-white">
      <ul className={`${wrap} flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]`}>
        {b.services.map((s, i) => {
          const Icon = iconFor(s.icon);
          return (
            <li key={s.slug} className={`min-w-[172px] flex-1 snap-start ${i ? 'border-l border-line' : ''}`}>
              <a
                href={href(`services/${s.slug}`)}
                className="group flex h-full flex-col gap-3 border-t-[3px] border-transparent px-4 pb-6 pt-6 text-ink no-underline transition hover:border-primary hover:bg-surface sm:px-5 lg:pt-7"
              >
                <Icon size={30} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
                <span className={`text-[16px] lg:text-[17px] ${cardTitle}`}>{s.title}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 text-[14px] font-semibold text-primary">
                  View Services <ArrowRight size={14} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Credentials({ b }) {
  const certs = b.certifications || [];
  if (!b.warranty && !certs.length) return null;
  return (
    <section aria-label="Warranty and certifications" className="bg-surface py-[clamp(3rem,6vw,4.5rem)]">
      <div className={`${wrap} grid items-center gap-10 ${b.warranty && certs.length ? 'lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)] lg:gap-14' : ''}`}>
        {b.warranty && (
          <div>
            <Eyebrow>Warranty</Eyebrow>
            <p className="font-heading text-[clamp(1.9rem,1.4rem+1.7vw,2.5rem)] font-bold leading-[1.05]">{b.warranty.title}</p>
            {b.warranty.text && <p className="mt-3 max-w-[30rem] text-[17px] leading-[1.6] text-muted">{b.warranty.text}</p>}
          </div>
        )}
        {certs.length > 0 && (
          <ul className={`grid gap-4 ${certs.length > 1 ? 'md:grid-cols-2' : ''}`}>
            {certs.map((c) => (
              <li key={c.title} className="flex gap-4 border border-line bg-white p-5">
                <span className="grid h-12 w-12 flex-none place-items-center bg-panel text-accent">
                  <ShieldCheck size={26} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className={`block text-[18px] ${cardTitle}`}>{c.title}</span>
                  {c.text && <span className="mt-1.5 block text-[15px] leading-[1.55] text-muted">{c.text}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function GroupVisual({ s, i, className = '', sizes }) {
  const Icon = iconFor(s.icon);
  if (s.image) return <Img className={`h-full w-full object-cover ${className}`} src={s.image} alt={s.imageAlt || ''} sizes={sizes} />;
  return (
    <div className={`grid h-full w-full place-items-center bg-panel bg-[repeating-linear-gradient(135deg,transparent_0_20px,rgba(255,255,255,0.04)_20px_40px)] ${className}`}>
      <Icon size={64} strokeWidth={1.25} className={onDark} aria-hidden="true" />
      <span className="sr-only">{`${num(i)} ${s.title}`}</span>
    </div>
  );
}

function Bays({ b }) {
  return (
    <section id="services" className={`scroll-mt-36 ${pad}`}>
      <div className={wrap}>
        <div className="mb-10 grid gap-5 lg:mb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-end lg:gap-16">
          <div>
            <Eyebrow>Services</Eyebrow>
            <h2 className={h2}>What we fix at {b.shortName}</h2>
          </div>
          {b.servicesIntro && <p className="text-[17px] leading-[1.6] text-muted sm:text-[18px]">{b.servicesIntro}</p>}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {b.services.map((s, i) => {
            const Icon = iconFor(s.icon);
            return (
              <article key={s.slug} className="group relative flex flex-col border border-line bg-white transition hover:border-ink/30 hover:shadow-[0_24px_40px_-28px_rgba(0,0,0,0.4)]">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <GroupVisual s={s} i={i} className="transition duration-500 group-hover:scale-[1.03]" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  <span className="absolute left-0 top-0 flex items-center gap-2 bg-panel px-3 py-2 font-heading text-[13px] font-bold tracking-[0.12em] text-white">
                    <Icon size={15} className={onDark} aria-hidden="true" />
                    {num(i)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6 lg:p-7">
                  <h3 className={`text-[23px] ${cardTitle}`}>
                    <a href={href(`services/${s.slug}`)} className="text-ink no-underline after:absolute after:inset-0 after:content-['']">
                      {s.title}
                    </a>
                  </h3>
                  <p className="mt-2.5 leading-[1.6] text-muted">{s.summary}</p>
                  <ul className="mb-5 mt-4">
                    {s.items.slice(0, 3).map((it) => (
                      <li key={it.title} className="flex items-center gap-3 border-t border-line py-2.5 text-[15px] font-medium">
                        <span className="h-1.5 w-1.5 flex-none bg-primary" aria-hidden="true" />
                        {it.title}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto inline-flex items-center gap-2 font-heading text-[15px] font-bold uppercase tracking-[0.06em] text-primary">
                    {s.title} Services <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Expect({ b }) {
  if (!b.expect?.length) return null;
  const cols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 xl:grid-cols-4' }[b.expect.length] || 'md:grid-cols-3';
  return (
    <section className={`bg-panel text-white ${pad}`}>
      <div className={wrap}>
        <Eyebrow dark>Your visit</Eyebrow>
        <h2 className={`${h2} mb-10 lg:mb-14`}>{b.expectTitle || 'What to expect'}</h2>
        <ol className={`grid gap-x-10 gap-y-10 ${cols}`}>
          {b.expect.map((step, i) => (
            <li key={step.title} className={`border-t-[3px] pt-6 ${i ? 'border-white/20' : 'border-primary'}`}>
              <span className={`block font-heading text-[clamp(2.75rem,2rem+2vw,3.5rem)] font-bold leading-none ${i ? 'text-white/35' : onDark}`}>
                {num(i)}
              </span>
              <h3 className={`mt-4 text-[22px] text-white ${cardTitle}`}>{step.title}</h3>
              <p className="mt-2.5 max-w-[24rem] leading-[1.65] text-white/75">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function MakeTiles({ makes }) {
  return (
    <ul className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-4">
      {makes.map((m) => (
        <li key={m} className="flex min-h-[76px] items-center justify-center bg-white px-3 py-5 text-center font-heading text-[clamp(1.05rem,0.95rem+0.4vw,1.3rem)] font-semibold uppercase tracking-[0.06em] text-ink">
          {m}
        </li>
      ))}
    </ul>
  );
}

function Makes({ b }) {
  if (!b.makes?.length) return null;
  const shown = b.makes.slice(0, 12);
  return (
    <section className={pad}>
      <div className={`${wrap} grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:gap-16`}>
        <div>
          <Eyebrow>Makes we service</Eyebrow>
          <h2 className={h2}>{b.makesTitle || 'Cars, trucks and SUVs we work on'}</h2>
          {b.makesText && <p className="mt-4 text-[17px] leading-[1.6] text-muted">{b.makesText}</p>}
          <a href={href('makes')} className="mt-6 inline-flex min-h-[44px] items-center gap-2 font-heading text-[15px] font-bold uppercase tracking-[0.06em] text-primary no-underline hover:underline">
            {b.makes.length > shown.length ? `See All ${b.makes.length} Makes` : 'Makes We Service'} <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <MakeTiles makes={shown} />
      </div>
    </section>
  );
}

function Reviews({ b }) {
  const reviews = b.reviews || [];
  const rating = ratingLine(b);
  if (!reviews.length && !rating) return null;
  return (
    <section id="reviews" className={`scroll-mt-36 bg-surface ${reviews.length ? pad : 'py-12'}`}>
      <div className={wrap}>
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow>Reviews</Eyebrow>
            <h2 className={h2}>From the people we work for</h2>
          </div>
          {rating && (
            <a href={mapsHref(b)} className="flex items-center gap-4 text-ink no-underline">
              <strong className="font-heading text-[56px] font-bold leading-none">{Number(b.rating).toFixed(1)}</strong>
              <span className="grid gap-1.5">
                <Stars value={b.rating} size={18} />
                <span className="text-[15px] font-semibold text-muted underline-offset-2 hover:underline">
                  {b.reviewCount.toLocaleString()} Google reviews
                </span>
              </span>
            </a>
          )}
        </div>
        {reviews.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <figure
                key={r.text.slice(0, 24)}
                className="m-0 flex flex-col border-l-4 border-primary bg-white p-6 sm:p-7 md:[&:last-child:nth-child(odd)]:col-span-2 lg:[&:last-child:nth-child(odd)]:col-span-1"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Stars value={5} size={15} />
                  {r.vehicle && (
                    <span className="bg-surface px-2.5 py-1 font-heading text-[13px] font-semibold uppercase tracking-[0.06em]">{r.vehicle}</span>
                  )}
                </div>
                <blockquote className="mb-5 mt-4 text-[17px] leading-[1.65]">{r.text}</blockquote>
                <figcaption className="mt-auto text-[14px] font-semibold text-muted">{r.author}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Checklist({ points, className = '' }) {
  if (!points?.length) return null;
  return (
    <ul className={`grid gap-x-8 sm:grid-cols-2 ${className}`}>
      {points.map((p) => (
        <li key={p} className="flex items-center gap-3 border-t border-line py-3 font-semibold">
          <Check size={18} strokeWidth={3} className="flex-none text-primary" aria-hidden="true" />
          {p}
        </li>
      ))}
    </ul>
  );
}

function AboutTeaser({ b }) {
  if (!b.about) return null;
  const [first] = paragraphs(b.about.text);
  return (
    <section className={pad}>
      <div className={`${wrap} grid items-center gap-10 lg:grid-cols-2 lg:gap-20`}>
        <div className="relative isolate">
          <Img className="aspect-[4/3] w-full object-cover" src={b.about.image} alt={b.about.imageAlt} sizes="(max-width: 1024px) 100vw, 50vw" />
          <span className="absolute -bottom-3 -left-3 -z-10 hidden h-2/3 w-2/3 bg-primary sm:block" aria-hidden="true" />
        </div>
        <div>
          <Eyebrow>{b.about.eyebrow || 'About the shop'}</Eyebrow>
          <h2 className={h2}>{b.about.title}</h2>
          {first && <p className="mt-5 text-[17px] leading-[1.7] text-ink/80 sm:text-[18px]">{first}</p>}
          <Checklist points={b.about.points} className="mt-7" />
          <a href={href('about')} className={`${outline} mt-8`}>
            About the Shop <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ pages */

function Home({ b, tel }) {
  const rating = ratingLine(b);
  return (
    <>
      <section className="relative bg-panel text-white">
        <div className="lg:grid lg:min-h-[640px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)]">
          <div className={`flex flex-col justify-center px-gutter pb-12 pt-11 sm:pb-14 sm:pt-16 lg:py-20 lg:pr-12 ${edgeLlg}`}>
            {b.hero.eyebrow && <Eyebrow dark>{b.hero.eyebrow}</Eyebrow>}
            <h1 className="break-words font-heading text-[clamp(2.4rem,1.3rem+3.6vw,4rem)] font-bold leading-[1.0] tracking-[-0.015em] [text-wrap:balance]">
              {b.hero.title}
              {b.hero.titleAccent && <span className={`mt-2 block ${onDark}`}>{b.hero.titleAccent}</span>}
            </h1>
            <p className="mt-6 max-w-[34rem] text-[17px] leading-[1.65] text-white/85 sm:text-[19px]">{b.hero.lead}</p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <CallButtons b={b} tel={tel} />
            </div>
            {rating && (
              <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-semibold text-white/85">
                <Stars value={b.rating} size={16} /> <span>{rating}</span>
              </p>
            )}
          </div>
          <div className="relative">
            <div className="relative h-[clamp(240px,62vw,460px)] lg:absolute lg:inset-0 lg:h-auto">
              <Img
                className="h-full w-full object-cover lg:[clip-path:polygon(72px_0,100%_0,100%_100%,0_100%)]"
                src={b.hero.image}
                alt={b.hero.imageAlt}
                sizes="(max-width: 1024px) 100vw, 55vw"
                eager
              />
            </div>
            <div className="relative z-10 -mt-16 px-gutter pb-10 sm:-mt-20 lg:absolute lg:bottom-10 lg:left-12 lg:mt-0 lg:w-[400px] lg:px-0 lg:pb-0 xl:left-16">
              <div className="mx-auto max-w-[480px] border-t-4 border-primary bg-white p-5 text-ink shadow-[0_30px_60px_-24px_rgba(0,0,0,0.55)] sm:p-7">
                <h2 className={`text-[23px] ${cardTitle}`}>Book a Visit</h2>
                <p className="mb-5 mt-1.5 text-[16px] leading-snug text-muted sm:text-[15px]">Tell us the vehicle. We call back to confirm a time.</p>
                <QuickBook b={b} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <ServiceRail b={b} />
      <Credentials b={b} />
      <Bays b={b} />
      <Expect b={b} />
      <Makes b={b} />
      <Reviews b={b} />
      <AboutTeaser b={b} />
    </>
  );
}

function ServicesPage({ b, tel }) {
  return (
    <>
      <PageHero
        b={b}
        crumbs={[['services', 'Services']]}
        eyebrow={<Eyebrow dark>Services</Eyebrow>}
        title={`Auto repair services in ${b.town}`}
        lead={b.servicesIntro || `Repairs and maintenance at ${b.shortName} in ${b.town}, ${b.state}, grouped the way the shop works.`}
        actions={<CallButtons b={b} tel={tel} />}
      />
      <ServiceRail b={b} />
      {b.services.map((s, i) => {
        const Icon = iconFor(s.icon);
        return (
          <section key={s.slug} id={s.slug} className={`scroll-mt-36 ${i % 2 ? 'bg-surface' : 'bg-white'} py-[clamp(3.5rem,6vw,5rem)]`}>
            <div className={`${wrap} grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:gap-16`}>
              <div>
                <div className="relative mb-7 aspect-[16/10] overflow-hidden">
                  <GroupVisual s={s} i={i} sizes="(max-width: 1024px) 100vw, 40vw" />
                </div>
                <p className="mb-3 flex items-center gap-3 font-heading text-[14px] font-bold uppercase tracking-[0.14em] text-primary">
                  <Icon size={18} aria-hidden="true" /> {num(i)}
                </p>
                <h2 className={`${cardTitle} text-[clamp(1.8rem,1.4rem+1.4vw,2.4rem)]`}>{s.title}</h2>
                <p className="mt-4 text-[17px] leading-[1.65] text-muted">{s.text}</p>
                <a href={href(`services/${s.slug}`)} className={`${outline} mt-7`}>
                  {s.title} Details <ArrowRight size={18} aria-hidden="true" />
                </a>
              </div>
              <ul className="grid content-start sm:grid-cols-2 sm:gap-x-10">
                {s.items.map((it) => (
                  <li key={it.title} className="border-t border-line py-5">
                    <h3 className={`text-[18px] ${cardTitle}`}>{it.title}</h3>
                    {it.text && <p className="mt-2 leading-[1.6] text-muted">{it.text}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </>
  );
}

function GroupPage({ b, tel, s }) {
  const i = b.services.indexOf(s);
  const Icon = iconFor(s.icon);
  const others = b.services.filter((o) => o !== s);
  const includes = [b.warranty?.title && `${b.warranty.title} warranty`, ...(b.certifications || []).map((c) => c.title)].filter(Boolean);
  return (
    <>
      <PageHero
        b={b}
        crumbs={[
          ['services', 'Services'],
          [`services/${s.slug}`, s.title],
        ]}
        eyebrow={
          <p className="mb-5 flex items-center gap-3 font-heading text-[15px] font-bold uppercase tracking-[0.14em] text-white/75">
            <span className="grid h-11 w-11 place-items-center bg-primary text-[color:var(--on-primary)]">
              <Icon size={24} aria-hidden="true" />
            </span>
            {num(i)} &middot; Services
          </p>
        }
        title={s.heading || `${s.title} in ${b.town}`}
        lead={s.text}
        image={s.image}
        imageAlt={s.imageAlt}
        actions={<CallButtons b={b} tel={tel} book="Book This Service" service={s.slug} />}
      />
      <section className={pad}>
        <div className={`${wrap} grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_400px]`}>
          <div>
            <Eyebrow>What we do</Eyebrow>
            <h2 className={h2}>{s.title} services</h2>
            <ol className="mt-8 border-b border-line">
              {s.items.map((it, n) => (
                <li key={it.title} className="flex gap-5 border-t border-line py-6 sm:gap-7">
                  <span className="w-8 flex-none font-heading text-[22px] font-bold leading-[1.15] text-primary">{num(n)}</span>
                  <div className="min-w-0">
                    <h3 className={`text-[clamp(1.15rem,1rem+0.5vw,1.4rem)] ${cardTitle}`}>{it.title}</h3>
                    {it.text && <p className="mt-2 text-[17px] leading-[1.65] text-muted">{it.text}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <aside className={`grid gap-5 lg:sticky ${b.preview ? 'lg:top-[152px]' : 'lg:top-[108px]'}`}>
            <div className="border-t-4 border-primary bg-panel p-6 text-white sm:p-7">
              <h2 className={`text-[22px] ${cardTitle}`}>Book {s.title}</h2>
              <p className="mt-2.5 leading-[1.6] text-white/75">Pick a day and we call to confirm a time.</p>
              <div className="mt-6 grid gap-3">
                <a href={`${href('appointment')}?service=${s.slug}`} className={solid}>
                  Request an Appointment
                </a>
                <a href={tel} className={ghostDark}>
                  <Phone size={18} aria-hidden="true" /> {b.phone}
                </a>
              </div>
            </div>
            {includes.length > 0 && (
              <div className="bg-surface p-6">
                <h2 className="mb-3 text-[13px] font-bold uppercase tracking-[0.14em] text-primary">Every repair here</h2>
                <ul className="grid gap-2.5">
                  {includes.map((t) => (
                    <li key={t} className="flex items-start gap-2.5 font-medium">
                      <Check size={18} strokeWidth={3} className="mt-0.5 flex-none text-primary" aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
      {others.length > 0 && (
        <section className="bg-surface py-[clamp(3rem,6vw,4.5rem)]">
          <div className={wrap}>
            <h2 className={`${cardTitle} mb-6 text-[26px]`}>Other services</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {others.map((o) => {
                const OIcon = iconFor(o.icon);
                return (
                  <li key={o.slug}>
                    <a
                      href={href(`services/${o.slug}`)}
                      className="group flex h-full min-h-[64px] items-center gap-3 border border-line bg-white px-4 py-4 text-ink no-underline transition hover:border-primary"
                    >
                      <OIcon size={22} className="flex-none text-primary" aria-hidden="true" />
                      <span className={`min-w-0 flex-1 text-[15px] ${cardTitle}`}>{o.title}</span>
                      <ArrowRight size={16} className="flex-none text-primary transition group-hover:translate-x-0.5" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

function MakesPage({ b, tel }) {
  return (
    <>
      <PageHero
        b={b}
        crumbs={[['makes', 'Makes']]}
        eyebrow={<Eyebrow dark>Makes we service</Eyebrow>}
        title={b.makesTitle || 'Cars, trucks and SUVs we work on'}
        lead={b.makesText}
        actions={<CallButtons b={b} tel={tel} />}
      />
      <section className={pad}>
        <div className={wrap}>
          <MakeTiles makes={b.makes} />
          <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[17px] text-muted">
            Not on the list?
            <a href={tel} className="inline-flex min-h-[44px] items-center gap-2 font-heading text-[18px] font-bold text-primary no-underline hover:underline">
              <Phone size={18} aria-hidden="true" /> Call {b.phone}
            </a>
          </p>
        </div>
      </section>
      <Expect b={b} />
    </>
  );
}

function AboutPage({ b, tel }) {
  const a = b.about;
  const text = paragraphs(a.text);
  return (
    <>
      <PageHero
        b={b}
        crumbs={[['about', 'About']]}
        eyebrow={<Eyebrow dark>{a.eyebrow || 'About the shop'}</Eyebrow>}
        title={a.title}
        image={a.image}
        imageAlt={a.imageAlt}
        actions={<CallButtons b={b} tel={tel} />}
      />
      <section className={pad}>
        <div className={`${wrap} grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-20`}>
          <div className="grid content-start gap-5 text-[18px] leading-[1.75] text-ink/85">
            {text.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
          <div>
            {a.points?.length > 0 && (
              <>
                <h2 className="mb-2 text-[13px] font-bold uppercase tracking-[0.14em] text-primary">At the shop</h2>
                <Checklist points={a.points} className="!grid-cols-1" />
              </>
            )}
            <div className="mt-8 grid gap-3 border-l-4 border-primary bg-surface p-6">
              <span className="text-[13px] font-bold uppercase tracking-[0.14em] text-muted">Find us</span>
              <a href={mapsHref(b)} className="flex min-h-[44px] items-center gap-2.5 text-[17px] font-semibold text-ink no-underline hover:text-primary">
                <MapPin size={18} className="mt-1 flex-none text-primary" aria-hidden="true" />
                {b.address}, {b.town}, {b.state} {b.zip}
              </a>
              {b.since && (
                <span className="flex items-center gap-2.5 text-[17px] font-semibold">
                  <Clock size={18} className="flex-none text-primary" aria-hidden="true" /> Serving {b.town} since {b.since}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
      {a.gallery?.length > 0 && (
        <section aria-label="The shop" className="pb-[clamp(4rem,8vw,6.5rem)]">
          <ul className={`${wrap} grid gap-4 sm:grid-cols-2 ${a.gallery.length > 2 ? 'lg:grid-cols-3' : ''}`}>
            {a.gallery.map((g) => (
              <li key={g.image}>
                <Img className="aspect-[4/3] w-full object-cover" src={g.image} alt={g.alt} sizes="(max-width: 640px) 100vw, 50vw" />
              </li>
            ))}
          </ul>
        </section>
      )}
      <Credentials b={b} />
      <Expect b={b} />
      <Reviews b={b} />
      {b.serviceArea?.length > 0 && (
        <section className="py-[clamp(3rem,6vw,4.5rem)]">
          <div className={wrap}>
            <Eyebrow>Service area</Eyebrow>
            <h2 className={`${h2} mb-7`}>Drivers come in from</h2>
            <ul className="flex flex-wrap gap-2.5">
              {b.serviceArea.map((t) => (
                <li key={t} className="inline-flex items-center gap-2 border border-line px-4 py-2.5 font-heading text-[16px] font-semibold uppercase tracking-[0.04em]">
                  <MapPin size={15} className="text-primary" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

function AppointmentPage({ b, tel, today }) {
  return (
    <>
      <PageHero
        b={b}
        crumbs={[['appointment', 'Appointment']]}
        eyebrow={<Eyebrow dark>Appointments</Eyebrow>}
        title="Book an appointment"
        lead="Tell us about the vehicle and the day that suits you. We call back to confirm the time."
      />
      <section className="bg-surface py-[clamp(3rem,6vw,5rem)]">
        <div className={`${wrap} grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12`}>
          <div className="border-t-4 border-primary bg-white p-5 sm:p-8 lg:p-10">
            <AppointmentForm b={b} />
          </div>
          <aside className="grid gap-5">
            <div className="bg-panel p-6 text-white">
              <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-white/65">Rather Call?</h2>
              <a href={tel} className="flex min-h-[44px] items-center gap-3 font-heading text-[26px] font-bold text-white no-underline">
                <Phone size={22} className={onDark} aria-hidden="true" /> {b.phone}
              </a>
              <HoursToday hours={b.hours} today={today} className="mt-3 text-[15px] text-white/80" />
            </div>
            {b.expect?.length > 0 && (
              <div className="bg-white p-6">
                <h2 className="mb-1 text-[13px] font-bold uppercase tracking-[0.14em] text-primary">{b.expectTitle || 'What to expect'}</h2>
                <ol>
                  {b.expect.map((step, i) => (
                    <li key={step.title} className="flex gap-4 border-b border-line py-4 last:border-b-0">
                      <span className="font-heading text-[20px] font-bold text-primary">{num(i)}</span>
                      <span>
                        <span className={`block text-[16px] ${cardTitle}`}>{step.title}</span>
                        <span className="mt-1 block text-[15px] leading-[1.55] text-muted">{step.text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------- root */

export default function AutoRepair({ b, path = '' }) {
  const tel = telHref(b.phone);
  const today = useToday();
  const brand = { ...DEFAULTS, accent: b.brand.primary, ...b.brand };
  const group = path.startsWith('services/') ? b.services.find((s) => `services/${s.slug}` === path) : null;
  const known = pages(b);
  const page = group ? 'group' : known.includes(path) ? path : '';
  const section = group ? 'services' : page;

  const body = {
    '': <Home b={b} tel={tel} />,
    services: <ServicesPage b={b} tel={tel} />,
    group: group && <GroupPage b={b} tel={tel} s={group} />,
    makes: b.makes?.length > 0 && <MakesPage b={b} tel={tel} />,
    about: b.about && <AboutPage b={b} tel={tel} />,
    appointment: <AppointmentPage b={b} tel={tel} today={today} />,
  }[page];

  return (
    <div
      className="min-w-0 overflow-x-clip bg-white font-body text-[16px] text-ink antialiased"
      style={{
        ...brandVars(brand),
        '--on-primary': onColor(brand.primary),
        '--primary-lit': liftOn(brand.primary, brand.panel),
      }}
    >
      <Header b={b} section={section} today={today} tel={tel} />
      <HoursStrip b={b} today={today} />
      <main>{body}</main>
      <CtaBand b={b} tel={tel} service={group?.slug} />
      <Footer b={b} tel={tel} today={today} />
      <MobileBar b={b} tel={tel} />
    </div>
  );
}
