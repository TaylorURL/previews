/**
 * The home page's sections after the work: what the business does, why it,
 * how it goes, what customers say, the questions, where it works and the
 * estimate form, and the closing band.
 */
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BadgeDollarSign,
  CalendarCheck,
  Clock3,
  Droplets,
  Fence,
  Flower2,
  Hammer,
  HeartHandshake,
  House,
  Languages,
  Leaf,
  MapPin,
  PaintRoller,
  Phone,
  Plus,
  Quote,
  Ruler,
  Shovel,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Sun,
  ThumbsUp,
  TreeDeciduous,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';
import { mapsHref, ratingLine, telHref } from '../../site.js';
import { EnquiryForm, Img, Stars } from '../shared.jsx';
import Topo from './Topo.jsx';
import { areaOf, askOf, list, phonesOf } from './util.js';
import { Eyebrow, Unbroken, WithArrow, display, h2, lead, pad, wrap } from './ui.jsx';

/** A highlight's icon word, as the brand file writes it, to the drawing for it; anything else gets a check. */
const ICONS = {
  family: HeartHandshake,
  heart: HeartHandshake,
  handshake: HeartHandshake,
  team: Users,
  crew: Users,
  people: Users,
  shield: ShieldCheck,
  insured: ShieldCheck,
  warranty: ShieldCheck,
  guarantee: ShieldCheck,
  license: BadgeCheck,
  licensed: BadgeCheck,
  certified: BadgeCheck,
  check: BadgeCheck,
  award: Award,
  trophy: Award,
  star: Star,
  rating: Star,
  reviews: Star,
  clock: Clock3,
  time: Clock3,
  fast: Clock3,
  calendar: CalendarCheck,
  years: CalendarCheck,
  since: CalendarCheck,
  price: BadgeDollarSign,
  money: BadgeDollarSign,
  dollar: BadgeDollarSign,
  financing: BadgeDollarSign,
  leaf: Leaf,
  lawn: Leaf,
  grass: Leaf,
  sprout: Sprout,
  plant: Sprout,
  flower: Flower2,
  garden: Flower2,
  tree: TreeDeciduous,
  trees: TreeDeciduous,
  water: Droplets,
  irrigation: Droplets,
  drainage: Droplets,
  sun: Sun,
  home: House,
  house: House,
  local: MapPin,
  map: MapPin,
  area: MapPin,
  language: Languages,
  languages: Languages,
  spanish: Languages,
  truck: Truck,
  equipment: Truck,
  tools: Wrench,
  wrench: Wrench,
  hammer: Hammer,
  build: Hammer,
  ruler: Ruler,
  design: Ruler,
  shovel: Shovel,
  dig: Shovel,
  paint: PaintRoller,
  fence: Fence,
  clean: Sparkles,
  quality: ThumbsUp,
};
const grounds = (ground) =>
  ground === 'paper' ? { bg: 'bg-[color:var(--paper)]', card: 'bg-white', chip: 'bg-white' } : { bg: 'bg-white', card: 'bg-[color:var(--paper)]', chip: 'bg-[color:var(--paper)]' };
const iconOf = (word) => ICONS[String(word || '').toLowerCase().trim()] || BadgeCheck;

/* ---------------------------------------------------------------- services */

export function Services({ b, groups, ground = 'paper' }) {
  if (!groups.length) return null;
  const ask = askOf(b);
  const g0 = grounds(ground);
  return (
    <section id="services" className={`${pad} ${g0.bg}`}>
      <div className={`${wrap} grid gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20`}>
        <div className="lg:sticky lg:top-40 lg:self-start">
          <Eyebrow>Services</Eyebrow>
          <h2 className={h2}>What we do</h2>
          {b.summary && <p className={`mt-6 ${lead}`}>{b.summary}</p>}
          <a href="/contact" className="group mt-7 inline-flex min-h-[44px] items-center font-heading text-[17px] font-bold text-[color:var(--pt)] no-underline">
            <WithArrow text={ask.get} />
          </a>
        </div>
        <ol className="grid border-b border-ink/15">
          {groups.map((g, i) => (
            <li key={g.slug} className="border-t border-ink/15">
              <a
                href={`/${g.slug}`}
                className="group grid gap-x-6 gap-y-3 py-7 text-ink no-underline sm:grid-cols-[3.25rem_minmax(0,1fr)_auto] sm:py-9"
              >
                <span className="font-heading text-[15px] font-bold tabular-nums text-[color:var(--pt)] sm:pt-2">{String(i + 1).padStart(2, '0')}</span>
                <span className="min-w-0">
                  <span className={`${display} block text-[clamp(1.5rem,1.2rem+1vw,2rem)] leading-[1.15] transition group-hover:text-[color:var(--pt)]`}>
                    <Unbroken>{g.title}</Unbroken>
                  </span>
                  {g.summary && <span className="mt-2.5 block max-w-[42rem] text-[16px] leading-[1.65] text-muted sm:text-[17px]">{g.summary}</span>}
                  {list(g.services).length > 1 && (
                    <span className="mt-4 flex flex-wrap gap-2">
                      {list(g.services).map((s) => (
                        <span key={s.slug} className={`rounded-full border border-ink/10 ${g0.chip} px-3 py-1 text-[14px] font-medium text-ink`}>
                          {s.title}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
                <span
                  className="hidden h-12 w-12 flex-none place-items-center rounded-full border border-ink/15 text-ink transition group-hover:border-[color:var(--cta)] group-hover:bg-[color:var(--cta)] group-hover:text-[color:var(--cta-ink)] sm:grid"
                  aria-hidden="true"
                >
                  <ArrowRight size={18} />
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- promo */

export function Promo({ b, ground = 'white' }) {
  const p = b.promo;
  if (!p?.title) return null;
  const g0 = grounds(ground);
  return (
    <section aria-label={p.eyebrow || p.title} className={`${pad} ${g0.bg}`}>
      <div className={wrap}>
        <div className={`relative isolate grid overflow-hidden rounded-[28px] bg-[color:var(--primary)] text-[color:var(--on-primary)] ${p.image ? 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]' : ''}`}>
          <Topo name={`${b.name} promo`} className="-z-10" strength={0.18} />
          <div className="px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            {p.eyebrow && (
              <p className="mb-5 inline-flex rounded-full bg-[color:var(--on-primary)] px-3.5 py-1.5 font-heading text-[13px] font-bold uppercase tracking-[0.12em] text-[color:var(--primary)]">
                {p.eyebrow}
              </p>
            )}
            <h2 className={`${display} text-[clamp(1.9rem,1.35rem+2.1vw,3rem)] leading-[1.06]`}>{p.title}</h2>
            {p.text && <p className="mt-4 max-w-xl text-[17px] leading-[1.65] opacity-85 sm:text-[18px]">{p.text}</p>}
            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">
              {p.price && (
                <p className="flex items-baseline gap-2">
                  <strong className="font-heading text-[48px] font-extrabold leading-none tracking-[-0.04em]">{p.price}</strong>
                  {p.priceNote && <span className="text-[15px] opacity-80">{p.priceNote}</span>}
                </p>
              )}
              <a
                href="/contact"
                className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full bg-[color:var(--on-primary)] px-6 font-heading text-[16px] font-bold text-[color:var(--primary)] no-underline hover:opacity-90"
              >
                {askOf(b).act} <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
          </div>
          {p.image && (
            <div className="relative order-first aspect-[3/2] lg:order-none lg:aspect-auto">
              <Img className="absolute inset-0 h-full w-full object-cover" src={p.image} alt={p.imageAlt || ''} sizes="(min-width: 1024px) 55vw, 110vw" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- about, highlights */

/**
 * Who the business is: its about words, the owner when the brand names one,
 * and the things that set it apart (highlights, else the about section's own
 * promises). The about photo stands beside the words.
 */
export function AboutBlock({ b, spare, ground = 'white' }) {
  const g0 = grounds(ground);
  const about = b.about;
  const points = list(b.highlights).length ? list(b.highlights).slice(0, 4) : list(about?.values).slice(0, 4);
  if (!about && !points.length) return null;
  // The owner's photo first, else the about photo, else a lone work photo with no gallery to stand in.
  const image = b.owner?.image || about?.image || spare?.src;
  const imageAlt = b.owner?.image ? b.owner.name || '' : about?.image ? about.imageAlt || '' : spare?.alt || '';
  const cols = ['', '', 'md:grid-cols-2', 'md:grid-cols-3', 'md:grid-cols-2 xl:grid-cols-4'][points.length];
  return (
    <section className={`${pad} ${g0.bg}`}>
      <div className={wrap}>
        {about && (
          <div className={`grid gap-10 lg:gap-20 ${image ? 'lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center' : 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]'}`}>
            {image && (
              <div className="relative">
                <Img className="block h-auto max-h-[min(78svh,640px)] w-full rounded-[24px] object-cover object-top" src={image} alt={imageAlt} sizes="(min-width: 1024px) 45vw, 100vw" />
                {b.since && (
                  <p className="absolute -bottom-6 right-5 m-0 rounded-2xl bg-[color:var(--deep)] px-6 py-4 text-white shadow-[0_24px_50px_-20px_rgba(0,0,0,0.5)] sm:right-8">
                    <span className="block text-[13px] font-medium text-white/70">Since</span>
                    <strong className="font-heading text-[32px] font-extrabold leading-none tracking-[-0.03em]">{b.since}</strong>
                  </p>
                )}
              </div>
            )}
            <div className="min-w-0">
              <Eyebrow>{about.eyebrow || 'About us'}</Eyebrow>
              <h2 className={h2}>
                <Unbroken>{about.title}</Unbroken>
              </h2>
              {!image && b.since && <p className="mt-6 font-heading text-[17px] font-bold text-[color:var(--pt)]">In business since {b.since}</p>}
              {image && <AboutWords b={b} />}
            </div>
            {!image && (
              <div className="min-w-0 lg:pt-12">
                <AboutWords b={b} />
              </div>
            )}
          </div>
        )}
        {points.length > 0 && (
          <ul className={`grid gap-4 ${about ? 'mt-16 lg:mt-24' : ''} ${cols}`}>
            {points.map((p, i) => {
              const Icon = list(b.highlights).length ? iconOf(p.icon) : null;
              return (
                <li key={p.title} className={`rounded-[22px] ${g0.card} p-6 sm:p-7`}>
                  {Icon ? (
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--cta)] text-[color:var(--cta-ink)]">
                      <Icon size={21} aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="font-heading text-[30px] font-extrabold leading-none tabular-nums text-[color:var(--pt)]">{String(i + 1).padStart(2, '0')}</span>
                  )}
                  <h3 className="mt-5 font-heading text-[19px] font-bold leading-snug text-ink">{p.title}</h3>
                  {p.text && <p className="mt-2 text-[16px] leading-[1.6] text-muted">{p.text}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function AboutWords({ b }) {
  return (
    <>
      {list(b.about.text)[0] && <p className={`mt-6 ${lead}`}>{list(b.about.text)[0]}</p>}
      {b.owner?.name && (
        <p className="mt-6 border-l-2 border-[color:var(--pt)] pl-4">
          <strong className="block font-heading text-[17px] text-ink">{b.owner.name}</strong>
          {b.owner.role && <span className="text-[15px] text-muted">{b.owner.role}</span>}
          {b.owner.text && <span className="mt-2 block text-[16px] leading-[1.6] text-muted">{b.owner.text}</span>}
        </p>
      )}
      <a href="/about" className="group mt-7 inline-flex min-h-[44px] items-center font-heading text-[17px] font-bold text-[color:var(--pt)] no-underline">
        <WithArrow text={`More about ${b.shortName}`} />
      </a>
    </>
  );
}

/* ------------------------------------------------------------------- steps */

export function Steps({ b, ground = 'paper' }) {
  const g0 = grounds(ground);
  const steps = list(b.steps).filter((s) => s?.title).slice(0, 4);
  if (steps.length < 2) return null;
  const cols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 xl:grid-cols-4' }[steps.length];
  return (
    <section className={`${pad} ${g0.bg}`}>
      <div className={wrap}>
        <Eyebrow>How it works</Eyebrow>
        <h2 className={`${h2} max-w-3xl`}>From first call to finished job</h2>
        <ol className={`mt-12 grid gap-x-8 gap-y-10 ${cols}`}>
          {steps.map((s, i) => (
            <li key={s.title} className="border-t-2 border-[color:var(--pt)] pt-6">
              <span className="font-heading text-[15px] font-bold tabular-nums text-[color:var(--pt)]">Step {i + 1}</span>
              <h3 className="mt-2 font-heading text-[22px] font-bold leading-snug text-ink">{s.title}</h3>
              {s.text && <p className="mt-2.5 text-[16px] leading-[1.65] text-muted">{s.text}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- reviews */

function RatingSummary({ b, className = '' }) {
  if (!ratingLine(b)) return null;
  return (
    <a href={mapsHref(b)} className={`group flex items-center gap-5 no-underline ${className}`}>
      <strong className="font-heading text-[64px] font-extrabold leading-none tracking-[-0.04em] text-ink">{Number(b.rating).toFixed(1)}</strong>
      <span className="grid gap-1.5">
        <Stars value={b.rating} size={20} />
        <span className="text-[15px] font-medium text-muted group-hover:text-ink group-hover:underline">
          {b.reviewCount.toLocaleString()} reviews on Google
        </span>
      </span>
    </a>
  );
}

/** Up to three reviews in their own words, each with where it was written; with none, the rating on its own. */
export function Reviews({ b, max = 3, ground = 'white' }) {
  const g0 = grounds(ground);
  const reviews = list(b.reviews).filter((r) => r?.text).slice(0, max);
  if (!reviews.length) {
    if (!ratingLine(b)) return null;
    return (
      <section aria-label="Google rating" className={`border-y border-line ${g0.bg}`}>
        <div className={`${wrap} flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between`}>
          <RatingSummary b={b} />
          <p className="max-w-md text-[17px] leading-[1.6] text-muted">
            Rated {Number(b.rating).toFixed(1)} out of 5 by {b.reviewCount.toLocaleString()} customers on Google.
          </p>
        </div>
      </section>
    );
  }
  const cols = reviews.length === 1 ? '' : reviews.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';
  return (
    <section id="reviews" className={`${pad} ${g0.bg}`}>
      <div className={wrap}>
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>Reviews</Eyebrow>
            <h2 className={h2}>What customers say</h2>
          </div>
          <RatingSummary b={b} />
        </div>
        <div className={`grid gap-5 ${cols}`}>
          {reviews.map((r, i) => (
            <figure key={i} className={`m-0 flex flex-col rounded-[24px] ${g0.card} p-7 sm:p-8`}>
              <Quote size={30} className="text-[color:var(--pt)] opacity-40" aria-hidden="true" />
              <blockquote className={`m-0 mb-7 mt-4 text-ink ${reviews.length === 1 ? 'text-[clamp(1.25rem,1rem+0.8vw,1.6rem)] leading-[1.5]' : 'text-[17px] leading-[1.65]'}`}>
                {r.text}
              </blockquote>
              <figcaption className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-5">
                <span className="font-heading text-[16px] font-bold text-ink">{r.author}</span>
                <span className="flex items-center gap-2 text-[14px] text-muted">
                  {r.rating ? <Stars value={r.rating} size={14} /> : null}
                  {r.source ? `on ${r.source === 'their site' ? 'our site' : r.source}` : 'on Google'}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- faqs */

export function Faqs({ b, ground = 'paper' }) {
  const g0 = grounds(ground);
  const faqs = list(b.faqs).filter((f) => f?.q && f?.a);
  if (!faqs.length) return null;
  return (
    <section id="faq" className={`${pad} ${g0.bg}`}>
      <div className={`${wrap} grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-20`}>
        <div className="lg:sticky lg:top-40 lg:self-start">
          <Eyebrow>Questions</Eyebrow>
          <h2 className={h2}>Good to know</h2>
          <a href={telHref(b.phone)} className="mt-6 inline-flex min-h-[44px] items-center gap-2 font-heading text-[19px] font-bold text-[color:var(--pt)] no-underline hover:underline">
            <Phone size={18} aria-hidden="true" /> {b.phone}
          </a>
        </div>
        <div className="border-b border-ink/15">
          {faqs.map((f, i) => (
            <details key={i} className="group border-t border-ink/15">
              <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-6 py-5 font-heading text-[18px] font-bold leading-snug text-ink [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">{f.q}</span>
                <span className="grid h-9 w-9 flex-none place-items-center rounded-full border border-ink/15 transition group-open:rotate-45 group-open:border-[color:var(--cta)] group-open:bg-[color:var(--cta)] group-open:text-[color:var(--cta-ink)]">
                  <Plus size={17} aria-hidden="true" />
                </span>
              </summary>
              <p className="max-w-[46rem] pb-6 pr-12 text-[16px] leading-[1.7] text-muted sm:text-[17px]">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------- area and the estimate */

const field =
  'min-h-[54px] rounded-2xl border border-ink/15 bg-white px-4 py-3 text-[16px] font-normal text-ink focus:border-[color:var(--pt)] focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-[color:var(--pt)]';

/** The estimate form: who, how to reach them, what they need and where. */
export function EstimateForm({ b, groups, need, full = false }) {
  const ask = askOf(b);
  const options = [...(need ? [need] : []), ...groups.map((g) => g.title).filter((t) => t !== need), 'Something else'];
  return (
    <EnquiryForm
      b={b}
      submitLabel={ask.free ? `Request My ${ask.act}` : 'Request an Estimate'}
      styles={{
        form: 'gap-4',
        label: 'text-[15px] font-semibold text-ink',
        field,
        button:
          'mt-2 min-h-[56px] rounded-full bg-[color:var(--cta)] px-6 font-heading text-[16px] font-bold text-[color:var(--cta-ink)] transition hover:brightness-110',
        done: 'rounded-2xl bg-[color:var(--paper)] p-5 text-[16px] text-ink',
      }}
      fields={[
        { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
        { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
        full && { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', wide: true },
        { name: 'need', label: 'What do you need?', type: 'select', required: true, wide: true, options },
        { name: 'place', label: 'Address or town', required: true, wide: true, autoComplete: 'street-address' },
        full && { name: 'details', label: 'Tell us about the project', type: 'textarea', wide: true },
      ].filter(Boolean)}
    />
  );
}

/** Where the business works, how to reach it, and the estimate form beside it. */
export function Estimate({ b, groups, ground = 'white' }) {
  const g0 = grounds(ground);
  const ask = askOf(b);
  const area = areaOf(b);
  const hours = list(b.hours);
  return (
    <section id="estimate" className={`${pad} ${g0.bg}`}>
      <div className={`${wrap} grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20`}>
        <div className="min-w-0">
          <Eyebrow>{ask.free ? `${ask.act}s` : 'Estimates'}</Eyebrow>
          <h2 className={h2}>Tell us about your project</h2>
          <p className={`mt-6 max-w-xl ${lead}`}>Send a few details, or call, and we will talk the job through with you.</p>
          <ul className="mt-8 grid gap-2">
            {phonesOf(b).map((p) => (
              <li key={p.number}>
                <a href={telHref(p.number)} className="inline-flex min-h-[48px] items-center gap-3 font-heading text-[22px] font-bold text-ink no-underline hover:text-[color:var(--pt)]">
                  <span className={`grid h-11 w-11 place-items-center rounded-full ${g0.chip} text-[color:var(--pt)]`}>
                    <Phone size={18} aria-hidden="true" />
                  </span>
                  {p.number}
                  {p.label && phonesOf(b).length > 1 && <span className="font-body text-[15px] font-medium text-muted">{p.label}</span>}
                </a>
              </li>
            ))}
          </ul>
          {hours.length > 0 && (
            <dl className="mt-6 grid max-w-md gap-1.5 text-[16px]">
              {hours.map(([d, h]) => (
                <div key={d} className="flex justify-between gap-6 border-b border-line pb-1.5">
                  <dt className="text-muted">{d}</dt>
                  <dd className="m-0 text-right font-semibold text-ink">{h}</dd>
                </div>
              ))}
            </dl>
          )}
          {area.length > 0 && (
            <div className="mt-10">
              <h3 className="flex items-center gap-2 font-heading text-[15px] font-bold uppercase tracking-[0.14em] text-ink">
                <MapPin size={17} className="text-[color:var(--pt)]" aria-hidden="true" /> Where we work
              </h3>
              <ul aria-label="Service area" className="mt-4 flex flex-wrap gap-2">
                {area.map((t) => (
                  <li key={t} className={`rounded-full ${g0.chip} px-3.5 py-1.5 text-[15px] font-medium text-ink`}>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="min-w-0 self-start rounded-[28px] border border-line bg-white p-6 shadow-[0_40px_80px_-50px_rgba(10,20,10,0.5)] sm:p-9">
          <h3 className="font-heading text-[24px] font-extrabold tracking-[-0.02em] text-ink">{ask.free ? `Request your ${ask.noun}` : 'Request an estimate'}</h3>
          <p className="mb-6 mt-1.5 text-[16px] text-muted">Four quick details, and we will call you back.</p>
          <EstimateForm b={b} groups={groups} />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- closing */

export function ClosingBand({ b, title, text }) {
  const ask = askOf(b);
  return (
    <section className="relative isolate overflow-hidden bg-[color:var(--primary)] text-[color:var(--on-primary)]">
      <Topo name={`${b.name} close`} className="-z-10" strength={0.16} />
      <div className={`${wrap} grid gap-10 py-[clamp(4rem,8vw,6.5rem)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-end lg:gap-16`}>
        <div className="min-w-0">
          <h2 className={`${display} text-[clamp(2.2rem,1.4rem+3vw,4rem)] leading-[1.03]`}>
            <Unbroken>{title || `${ask.get} from ${b.shortName}`}</Unbroken>
          </h2>
          <p className="mt-5 max-w-xl text-[17px] leading-[1.65] opacity-85 sm:text-[19px]">{text || 'Send the details or call, and we will get back to you about the job.'}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <a
            href="/contact"
            className="group/btn inline-flex min-h-[58px] items-center justify-between gap-3 rounded-full bg-[color:var(--on-primary)] pl-7 pr-2 font-heading text-[17px] font-bold text-[color:var(--primary)] no-underline hover:opacity-90"
          >
            {ask.act}
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--primary)] text-[color:var(--on-primary)]" aria-hidden="true">
              <ArrowRight size={18} />
            </span>
          </a>
          <a
            href={telHref(b.phone)}
            className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-full border border-[color:var(--on-primary-line)] px-6 font-heading text-[17px] font-bold text-current no-underline hover:bg-black/5"
          >
            <Phone size={18} aria-hidden="true" /> {b.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

