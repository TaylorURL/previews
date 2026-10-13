import { ArrowRight, CalendarDays, Check, Clock, Mail, MapPin, Phone, Quote, ShieldCheck, Star, Trophy, Users } from 'lucide-react';
import { mapsHref, ratingLine } from '../../site.js';
import { EnquiryForm, Img, Stars } from '../shared.jsx';
import {
  Chips,
  Confetti,
  Eyebrow,
  Meta,
  PageHero,
  ProgramCard,
  Ticks,
  Wave,
  ghost,
  h1,
  h2,
  h3,
  list,
  metaOf,
  onP,
  outline,
  pad,
  paras,
  pop,
  pt,
  solid,
  wrap,
} from './ui.jsx';

const GRID = { 1: 'max-w-xl', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 xl:grid-cols-4' };

/** Where an offering's card leads: its own page when it has one, else its place on the programs page. */
const cardHref = (ctx, p) => (ctx.hasPage(p) ? `/programs/${p.slug}` : `/programs#${p.slug}`);

/* ------------------------------------------------------------------ home */

function Hero({ b, ctx }) {
  const { hero } = b;
  const rating = ratingLine(b);
  const long = String(hero.title || '').length > 34;
  return (
    <section className={`relative isolate overflow-hidden bg-primary ${onP}`}>
      <Confetti />
      <div
        className={`${wrap} grid items-center gap-x-14 gap-y-10 pb-[clamp(5.5rem,10vw,8.5rem)] pt-10 sm:pt-14 lg:pt-16 ${
          hero.image ? 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]' : ''
        }`}
      >
        <div className={`min-w-0 ${hero.image ? '' : 'max-w-[56rem]'}`}>
          {hero.eyebrow && (
            <p className="mb-6 inline-flex max-w-full items-center rounded-full bg-accent px-4 py-2 font-heading text-[15px] font-semibold leading-tight text-[color:var(--on-accent)] sm:text-[16px]">
              {hero.eyebrow}
            </p>
          )}
          <h1 className={`${h1} ${long ? 'text-[clamp(2.4rem,1.5rem+3.6vw,4.4rem)]' : 'text-[clamp(2.7rem,1.6rem+4.4vw,5.3rem)]'}`}>
            {hero.title}
          </h1>
          {hero.lead && <p className="mb-0 mt-6 max-w-[38rem] text-[18px] leading-[1.6] opacity-90 sm:text-[20px]">{hero.lead}</p>}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={ctx.action.href} className={pop}>
              {ctx.action.label} <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href={ctx.tel} className={ghost}>
              <Phone size={18} aria-hidden="true" /> {b.phone}
            </a>
          </div>
          {rating && (
            <a
              href={mapsHref(b)}
              className={`mt-7 inline-flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 text-[16px] font-semibold no-underline hover:underline ${onP}`}
            >
              <Stars value={b.rating} size={17} />
              {rating}
            </a>
          )}
        </div>
        {hero.image && (
          <div className="relative mx-auto w-full min-w-0 max-w-[640px] pb-4 pr-4 lg:max-w-none">
            <span aria-hidden="true" className="absolute inset-0 left-4 top-4 rotate-[2deg] rounded-[2.25rem] bg-accent" />
            <Img
              className="relative aspect-[4/3] w-full rounded-[2.25rem] border-[6px] border-white object-cover shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] lg:aspect-[5/4] lg:-rotate-[1.5deg]"
              src={hero.image}
              alt={hero.imageAlt || ''}
              style={hero.position ? { objectPosition: hero.position } : undefined}
              sizes="(max-width: 1024px) 100vw, 48vw"
              eager
            />
            {b.ages && (
              <p className="absolute -top-4 left-3 m-0 grid max-w-[60%] -rotate-[6deg] gap-0.5 rounded-2xl bg-white px-4 py-2.5 text-ink shadow-[0_14px_30px_-14px_rgba(0,0,0,0.55)] sm:-left-4 sm:px-5 sm:py-3">
                <span className={`text-[12px] font-bold uppercase tracking-[0.14em] ${pt}`}>Ages</span>
                <span className="font-heading text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-display leading-none">{b.ages}</span>
              </p>
            )}
          </div>
        )}
      </div>
      <Wave />
    </section>
  );
}

/** Ages, what is offered, the rating and the year founded, each only when the brand gives it. */
function Highlights({ b, ctx }) {
  const rating = ratingLine(b);
  const activities = list(b.activities);
  const cells = [
    b.ages && [Users, 'Ages', b.ages],
    rating && [Star, 'Google Rating', `${Number(b.rating).toFixed(1)} from ${b.reviewCount.toLocaleString()} reviews`],
    b.since && [CalendarDays, 'Established', String(b.since)],
  ].filter(Boolean);
  if (!cells.length && !activities.length) return null;
  const cols = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }[cells.length];
  return (
    <section aria-label="Highlights" className="relative z-10 -mt-[clamp(3.5rem,6vw,5rem)]">
      <div className={wrap}>
        <div className="rounded-[1.75rem] border border-line bg-white p-5 shadow-[0_28px_50px_-34px_rgba(15,23,42,0.55)] sm:p-7">
          {cells.length > 0 && (
            <dl className={`m-0 grid gap-5 ${cols}`}>
              {cells.map(([Icon, label, value]) => (
                <div key={label} className="flex min-w-0 items-center gap-4">
                  <span className={`grid size-12 flex-none place-items-center rounded-2xl bg-surface ${pt}`}>
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[13px] font-bold uppercase tracking-[0.12em] text-muted">{label}</dt>
                    <dd className="m-0 mt-0.5 break-words font-heading text-[20px] font-semibold leading-snug text-ink">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          )}
          {activities.length > 0 && (
            <div className={`flex flex-col gap-3 sm:flex-row sm:items-center ${cells.length ? 'mt-6 border-t border-line pt-6' : ''}`}>
              <p className="m-0 flex flex-none items-center gap-2 text-[13px] font-bold uppercase tracking-[0.12em] text-muted">
                <Trophy size={17} className={pt} aria-hidden="true" /> {ctx.k.activities}
              </p>
              <Chips items={activities} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Featured({ ctx }) {
  const shown = ctx.programs.slice(0, 6);
  return (
    <section id="programs" className={`scroll-mt-28 ${pad}`}>
      <div className={wrap}>
        <div className="mb-10 flex flex-col gap-5 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <Eyebrow>{ctx.k.offerings}</Eyebrow>
            <h2 className={h2}>{ctx.k.featured}</h2>
          </div>
          <a href="/programs" className={`${outline} self-start lg:self-auto`}>
            {ctx.programs.length > shown.length ? `All ${ctx.programs.length} ${ctx.k.offerings}` : `All ${ctx.k.offerings}`}{' '}
            <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
        <ul className={`m-0 grid list-none gap-5 p-0 lg:gap-6 ${GRID[shown.length] || GRID[3]}`}>
          {shown.map((p) => (
            <ProgramCard key={p.slug} p={p} k={ctx.k} href={cardHref(ctx, p)} tile={shown.some((o) => o.image)} />
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The season or session dates, when the brand gives them. */
export function ScheduleBand({ b, ctx, action = true }) {
  const s = b.schedule;
  const rows = list(s?.rows).filter((row) => Array.isArray(row) && row[0] && row[1]);
  if (!s || (!s.text && !rows.length)) return null;
  return (
    <section id="schedule" className={`scroll-mt-28 bg-surface ${pad}`}>
      <div className={`${wrap} grid items-center gap-x-16 gap-y-10 ${rows.length ? 'lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]' : ''}`}>
        <div className="min-w-0">
          <Eyebrow>Dates and Times</Eyebrow>
          <h2 className={h2}>{s.title || 'Mark the calendar'}</h2>
          {s.text && <p className="mb-0 mt-5 max-w-[36rem] text-[18px] leading-[1.65] text-muted">{s.text}</p>}
          {action && (
            <a href={ctx.action.href} className={`${solid} mt-8`}>
              {ctx.action.label} <ArrowRight size={18} aria-hidden="true" />
            </a>
          )}
        </div>
        {rows.length > 0 && (
          <dl className="m-0 grid gap-2.5 rounded-[1.75rem] bg-white p-3 shadow-[0_24px_44px_-34px_rgba(15,23,42,0.5)] sm:p-4">
            {rows.map(([label, value], i) => (
              <div key={`${label}-${i}`} className="flex flex-col gap-1 rounded-2xl px-4 py-3.5 odd:bg-surface sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <dt className="flex items-center gap-3 text-[17px] font-semibold text-ink">
                  <Clock size={18} className={`flex-none ${pt}`} aria-hidden="true" /> {label}
                </dt>
                <dd className={`m-0 pl-[30px] font-heading text-[18px] font-semibold sm:pl-0 sm:text-right ${pt}`}>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}

function PartiesTeaser({ b, ctx }) {
  const p = b.parties;
  const packages = list(p.packages).filter((pk) => pk?.name);
  const packageList = packages.length > 0 && (
    <ul className={`m-0 grid list-none gap-2.5 p-0 ${p.image ? 'mt-7 max-w-[36rem]' : ''}`}>
      {packages.map((pk) => (
        <li key={pk.name} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-2xl border border-line bg-white px-5 py-4">
          <span className="font-heading text-[18px] font-semibold text-ink">{pk.name}</span>
          {pk.price && <span className={`font-heading text-[18px] font-semibold ${pt}`}>{String(pk.price)}</span>}
        </li>
      ))}
    </ul>
  );
  // Beside the photo the packages sit under the words; with no photo they take its place.
  return (
    <section id="parties" className={`scroll-mt-28 ${pad}`}>
      <div className={`${wrap} grid items-center gap-x-16 gap-y-10 ${p.image || packages.length ? 'lg:grid-cols-2' : ''}`}>
        {p.image && (
          <div className="relative min-w-0 pb-4 pl-4">
            <span aria-hidden="true" className="absolute inset-0 bottom-0 right-4 top-4 -rotate-[2deg] rounded-[2.25rem] bg-accent" />
            <Img
              className="relative aspect-[4/3] w-full rounded-[2.25rem] object-cover"
              src={p.image}
              alt={p.imageAlt || ''}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        )}
        <div className="min-w-0">
          <Eyebrow>{ctx.partyLabel}</Eyebrow>
          <h2 className={h2}>{p.title}</h2>
          {p.text && <p className="mb-0 mt-5 max-w-[36rem] text-[18px] leading-[1.65] text-muted">{p.text}</p>}
          {p.image && packageList}
          <a href="/parties" className={`${solid} mt-8`}>
            {packages.length ? 'See the Packages' : 'Party Details'} <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
        {!p.image && packageList && <div className="min-w-0 rounded-[1.75rem] bg-surface p-3 sm:p-4">{packageList}</div>}
      </div>
    </section>
  );
}

function Reviews({ b }) {
  const rating = ratingLine(b);
  if (!rating) return null;
  const quotes = list(b.reviews).filter((r) => r?.text);
  return (
    <section id="reviews" className={`scroll-mt-28 bg-surface ${quotes.length ? pad : 'py-14'}`}>
      <div className={wrap}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <Eyebrow>Reviews</Eyebrow>
            <h2 className={h2}>{quotes.length ? 'In their own words' : 'Rated on Google'}</h2>
          </div>
          <a
            href={mapsHref(b)}
            className="flex items-center gap-4 self-start rounded-[1.5rem] bg-white px-5 py-3.5 text-ink no-underline shadow-[0_18px_36px_-28px_rgba(15,23,42,0.6)] lg:self-auto"
          >
            <strong className="font-heading text-[52px] font-display leading-none">{Number(b.rating).toFixed(1)}</strong>
            <span className="grid gap-1.5">
              <Stars value={b.rating} size={18} />
              <span className="text-[15px] font-semibold text-muted">{b.reviewCount.toLocaleString()} Google reviews</span>
            </span>
          </a>
        </div>
        {quotes.length > 0 && (
          <ul className="m-0 mt-10 grid list-none gap-5 p-0 md:grid-cols-2 lg:grid-cols-3">
            {quotes.slice(0, 6).map((r, i) => (
              <li key={i} className="min-w-0">
                <figure className="relative m-0 flex h-full flex-col rounded-[1.75rem] bg-white p-7 sm:p-8">
                  <Quote size={30} className={`mb-4 ${pt}`} aria-hidden="true" />
                  <blockquote className="m-0 text-[17px] leading-[1.7] text-ink">{r.text}</blockquote>
                  {r.author && <figcaption className="mt-auto pt-5 text-[15px] font-bold text-muted">{r.author}</figcaption>}
                </figure>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export function HomePage({ b, ctx }) {
  return (
    <>
      <Hero b={b} ctx={ctx} />
      <Highlights b={b} ctx={ctx} />
      <Featured ctx={ctx} />
      <ScheduleBand b={b} ctx={ctx} />
      {ctx.hasParties && <PartiesTeaser b={b} ctx={ctx} />}
      <Reviews b={b} />
    </>
  );
}

/* -------------------------------------------------------------- programs */

export function ProgramsPage({ b, ctx }) {
  const { k } = ctx;
  return (
    <>
      <PageHero
        trail={[['/programs', k.offerings]]}
        title={k.offerings}
        lead={b.programsIntro || k.lead(b)}
        actions={
          <>
            <a href={ctx.action.href} className={pop}>
              {ctx.action.label} <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href={ctx.tel} className={ghost}>
              <Phone size={18} aria-hidden="true" /> {b.phone}
            </a>
          </>
        }
      />
      <section id="programs" className={`${pad} !pt-[clamp(3rem,6vw,4.5rem)]`}>
        <ol className={`${wrap} m-0 grid list-none gap-6 p-0 lg:gap-8`}>
          {ctx.programs.map((p, i) => {
            const rules = list(p.rules);
            return (
              <li
                key={p.slug}
                id={p.slug}
                className={`grid scroll-mt-28 items-center gap-x-10 gap-y-7 rounded-[2rem] border border-line p-4 sm:p-6 lg:p-8 ${
                  p.image ? (i % 2 ? 'lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]' : 'lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]') : ''
                }`}
              >
                {p.image && (
                  <div className={`min-w-0 ${i % 2 ? 'lg:order-2' : ''}`}>
                    <Img
                      className="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
                      src={p.image}
                      alt={p.imageAlt || ''}
                      sizes="(max-width: 1024px) 100vw, 42vw"
                    />
                  </div>
                )}
                <div className={`min-w-0 ${p.image ? '' : 'px-1 sm:px-2'}`}>
                  <h2 className={`${h3} text-[clamp(1.75rem,1.4rem+1.3vw,2.4rem)] text-ink`}>{p.title}</h2>
                  {p.summary && <p className="mb-0 mt-3 max-w-[40rem] text-[17px] leading-[1.65] text-muted">{p.summary}</p>}
                  {metaOf(p, k).length > 0 && (
                    <div className="mt-6">
                      <Meta p={p} k={k} />
                    </div>
                  )}
                  {rules.length > 0 && (
                    <div className="mt-6">
                      <h3 className="mb-3 font-heading text-[15px] font-semibold uppercase tracking-[0.1em] text-ink">{k.rules}</h3>
                      <ul className="m-0 grid list-none gap-1.5 p-0">
                        {rules.map((rule) => (
                          <li key={rule} className="flex items-start gap-2.5 text-[16px] leading-snug text-ink">
                            <ShieldCheck size={18} className={`mt-0.5 flex-none ${pt}`} aria-hidden="true" /> {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {ctx.hasPage(p) && (
                      <a href={`/programs/${p.slug}`} className={solid}>
                        {k.offering} Details <ArrowRight size={18} aria-hidden="true" />
                      </a>
                    )}
                    <a href={ctx.action.href} className={ctx.hasPage(p) ? outline : solid}>
                      {ctx.action.label}
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
      <ScheduleBand b={b} ctx={ctx} action={false} />
    </>
  );
}

export function ProgramPage({ b, ctx, p }) {
  const { k } = ctx;
  const text = paras(p.text);
  const points = list(p.points);
  const rules = list(p.rules);
  const meta = metaOf(p, k);
  const others = ctx.programs.filter((o) => o.slug !== p.slug).slice(0, 3);
  return (
    <>
      <PageHero
        trail={[
          ['/programs', k.offerings],
          [`/programs/${p.slug}`, p.title],
        ]}
        title={p.title}
        lead={p.summary}
        chips={[p.ages && `Ages ${p.ages}`, p.season]}
        image={p.image}
        imageAlt={p.imageAlt}
        actions={
          <>
            <a href={ctx.action.href} className={pop}>
              {ctx.action.label} <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href={ctx.tel} className={ghost}>
              <Phone size={18} aria-hidden="true" /> {b.phone}
            </a>
          </>
        }
      />
      <section className={pad}>
        <div className={`${wrap} grid items-start gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]`}>
          <div className="grid min-w-0 gap-10">
            {text.length > 0 && (
              <div className="grid gap-5 text-[18px] leading-[1.75] text-ink">
                {text.map((para) => (
                  <p key={para.slice(0, 40)} className="m-0">
                    {para}
                  </p>
                ))}
              </div>
            )}
            {points.length > 0 && (
              <div>
                <h2 className={`${h3} mb-5 text-[clamp(1.6rem,1.3rem+1vw,2.1rem)] text-ink`}>What to expect</h2>
                <Ticks items={points} icon={Check} />
              </div>
            )}
            {rules.length > 0 && (
              <div>
                <h2 className={`${h3} mb-5 text-[clamp(1.6rem,1.3rem+1vw,2.1rem)] text-ink`}>{k.rules}</h2>
                <Ticks items={rules} icon={ShieldCheck} />
              </div>
            )}
          </div>
          <aside className={`grid gap-5 rounded-[1.75rem] border border-line p-5 sm:p-7 lg:sticky ${b.preview ? 'lg:top-[156px]' : 'lg:top-[112px]'}`}>
            <h2 className={`${h3} text-[24px] text-ink`}>{meta.length ? 'At a glance' : 'Get started'}</h2>
            <Meta p={p} k={k} single />
            <div className="grid gap-3">
              <a href={ctx.action.href} className={solid}>
                {ctx.action.label} <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a href={ctx.tel} className={outline}>
                <Phone size={18} aria-hidden="true" /> {b.phone}
              </a>
            </div>
          </aside>
        </div>
      </section>
      {others.length > 0 && (
        <section className={`bg-surface ${pad}`}>
          <div className={wrap}>
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <h2 className={h2}>More {k.offerings.toLowerCase()}</h2>
              <a href="/programs" className={`${outline} self-start bg-white sm:self-auto`}>
                All {k.offerings} <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {others.map((o) => (
                <ProgramCard key={o.slug} p={o} k={k} href={cardHref(ctx, o)} tile={others.some((x) => x.image)} />
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

/* --------------------------------------------------------------- parties */

export function PartiesPage({ b, ctx }) {
  const p = b.parties;
  const packages = list(p.packages).filter((pk) => pk?.name);
  const book = { href: p.bookingUrl || '/contact#enquire', label: p.action || 'Book a Party' };
  const buttons = (light) => (
    <>
      <a href={book.href} className={light ? pop : solid}>
        {book.label} <ArrowRight size={18} aria-hidden="true" />
      </a>
      <a href={ctx.tel} className={light ? ghost : outline}>
        <Phone size={18} aria-hidden="true" /> {b.phone}
      </a>
    </>
  );
  const cols = { 1: 'max-w-xl', 2: 'md:grid-cols-2 lg:max-w-5xl', 4: 'md:grid-cols-2 xl:grid-cols-4' }[packages.length] || 'md:grid-cols-2 lg:grid-cols-3';
  return (
    <>
      <PageHero
        trail={[['/parties', ctx.partyLabel]]}
        title={p.title}
        lead={p.text}
        image={p.image}
        imageAlt={p.imageAlt}
        actions={buttons(true)}
      />
      <section id="packages" className={`${pad} !pt-[clamp(3rem,6vw,4.5rem)]`}>
        <div className={wrap}>
          {packages.length > 0 && (
            <>
              <Eyebrow>Packages</Eyebrow>
              <h2 className={`${h2} mb-10`}>Pick a package</h2>
              <ul className={`m-0 grid list-none items-stretch gap-5 p-0 ${cols}`}>
                {packages.map((pk) => {
                  const includes = list(pk.includes);
                  return (
                    <li key={pk.name} className="min-w-0">
                      <div className="flex h-full flex-col rounded-[1.75rem] border-2 border-line bg-white p-6 sm:p-8">
                        <h3 className={`${h3} text-[26px] text-ink`}>{pk.name}</h3>
                        {pk.price && (
                          <p className="m-0 mt-4">
                            <span className={`font-heading text-[clamp(2.2rem,1.8rem+1.4vw,2.9rem)] font-display leading-none ${pt}`}>
                              {String(pk.price)}
                            </span>
                            {pk.priceNote && <span className="mt-1.5 block text-[15px] text-muted">{pk.priceNote}</span>}
                          </p>
                        )}
                        {includes.length > 0 && (
                          <ul className="m-0 mt-6 grid list-none gap-2.5 border-t border-line p-0 pt-6">
                            {includes.map((item) => (
                              <li key={item} className="flex items-start gap-3 text-[16px] leading-snug text-ink">
                                <span className="mt-0.5 grid size-5 flex-none place-items-center rounded-full bg-primary text-[color:var(--on-primary)]">
                                  <Check size={13} strokeWidth={3} aria-hidden="true" />
                                </span>
                                <span className="min-w-0">{item}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          {p.note && <p className="mb-0 mt-8 max-w-[46rem] text-[16px] leading-relaxed text-muted">{p.note}</p>}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">{buttons(false)}</div>
        </div>
      </section>
    </>
  );
}

/* ----------------------------------------------------------------- about */

export function AboutPage({ b, ctx }) {
  const a = b.about || {};
  const text = paras(a.text);
  const points = list(a.points);
  const staff = list(b.staff).filter((s) => s?.name);
  const gallery = list(b.gallery).filter((g) => g?.image);
  const area = list(b.serviceArea);
  const hasStory = text.length > 0 || a.image || points.length > 0;
  return (
    <>
      <PageHero
        trail={[['/about', 'About']]}
        title={a.title || `About ${b.shortName}`}
        chips={[b.since && `Since ${b.since}`, b.ages && `Ages ${b.ages}`, `${b.town}, ${b.state}`]}
        waveClass={hasStory ? 'text-white' : staff.length ? 'text-surface' : 'text-white'}
      />
      {hasStory && (
        <section className={pad}>
          <div className={`${wrap} grid items-start gap-x-16 gap-y-12 ${a.image ? 'lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]' : ''}`}>
            <div className="min-w-0">
              {text.length > 0 && (
                <div className="grid max-w-[42rem] gap-5 text-[18px] leading-[1.75] text-ink">
                  {text.map((para) => (
                    <p key={para.slice(0, 40)} className="m-0">
                      {para}
                    </p>
                  ))}
                </div>
              )}
              {points.length > 0 && (
                <div className={text.length ? 'mt-10' : ''}>
                  <h2 className={`${h3} mb-5 text-[clamp(1.6rem,1.3rem+1vw,2.1rem)] text-ink`}>At {b.shortName}</h2>
                  <Ticks items={points} icon={Check} />
                </div>
              )}
            </div>
            {a.image && (
              <div className="relative min-w-0 pb-4 pr-4">
                <span aria-hidden="true" className="absolute inset-0 left-4 top-4 rotate-[2deg] rounded-[2.25rem] bg-accent" />
                <Img
                  className="relative aspect-[4/3] w-full rounded-[2.25rem] object-cover lg:aspect-[4/5]"
                  src={a.image}
                  alt={a.imageAlt || ''}
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
              </div>
            )}
          </div>
        </section>
      )}
      {staff.length > 0 && (
        <section id="team" className={`scroll-mt-28 bg-surface ${pad}`}>
          <div className={wrap}>
            <Eyebrow>{ctx.k.staffEyebrow}</Eyebrow>
            <h2 className={`${h2} mb-10`}>{b.staffTitle || ctx.k.staff}</h2>
            <ul className={`m-0 grid list-none gap-5 p-0 sm:grid-cols-2 ${staff.length > 2 ? 'lg:grid-cols-3' : 'lg:max-w-4xl'}`}>
              {staff.map((s) => (
                <li key={s.name} className="min-w-0">
                  <figure className="m-0 flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white">
                    {s.image && (
                      <Img
                        className="aspect-square w-full object-cover object-top"
                        src={s.image}
                        alt={s.imageAlt || s.name}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                    <figcaption className="flex flex-1 flex-col p-6 sm:p-7">
                      <span className={`${h3} block text-[24px] text-ink`}>{s.name}</span>
                      {s.role && <span className={`mt-1.5 block text-[15px] font-bold ${pt}`}>{s.role}</span>}
                      {s.bio && <span className="mt-3 block text-[16px] leading-[1.65] text-muted">{s.bio}</span>}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {gallery.length > 0 && (
        <section id="gallery" className={pad}>
          <div className={wrap}>
            <Eyebrow>Photos</Eyebrow>
            <h2 className={`${h2} mb-10`}>A look around</h2>
            <ul
              className={`m-0 grid list-none gap-4 p-0 sm:grid-cols-2 ${
                gallery.length % 4 === 0 ? 'lg:grid-cols-4' : gallery.length > 2 ? 'lg:grid-cols-3' : ''
              }`}
            >
              {gallery.map((g) => (
                <li key={g.image} className="min-w-0">
                  <Img
                    className="aspect-[4/3] w-full rounded-[1.5rem] object-cover"
                    src={g.image}
                    alt={g.imageAlt || ''}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {area.length > 0 && (
        <section className={`border-t border-line py-[clamp(3rem,6vw,4.5rem)]`}>
          <div className={wrap}>
            <Eyebrow>Service Area</Eyebrow>
            <h2 className={`${h2} mb-7`}>Areas served</h2>
            <Chips items={area} />
          </div>
        </section>
      )}
    </>
  );
}

/* --------------------------------------------------------------- contact */

export function ContactPage({ b, ctx }) {
  const { k } = ctx;
  const hours = list(b.hours).filter((row) => Array.isArray(row) && row[0] && row[1]);
  const area = list(b.serviceArea);
  const faqs = list(b.faqs).filter((f) => f?.q && f?.a);
  const options = [...ctx.programs.map((p) => p.title), ...(ctx.hasParties ? [ctx.partyLabel] : []), 'Something else'];
  const fields =
    b.kind === 'attraction'
      ? [
          { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
          { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
          { name: 'email', label: 'Email', type: 'email', wide: true, autoComplete: 'email' },
          { name: 'date', label: 'Visit Date', type: 'date' },
          { name: 'group', label: 'Group Size', type: 'number' },
          { name: 'interest', label: 'Interested In', type: 'select', options, wide: true },
          { name: 'message', label: 'Message', type: 'textarea', wide: true },
        ]
      : [
          { name: 'name', label: 'Name', required: true, autoComplete: 'name', wide: true },
          { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
          { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
          { name: 'age', label: "Athlete's Age", type: 'number' },
          { name: 'program', label: k.offering, type: 'select', options },
          { name: 'message', label: 'Message', type: 'textarea', wide: true },
        ];
  const address = `${b.address}, ${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;
  const row = 'flex min-h-14 items-center gap-3.5 border-b border-line py-3 text-[17px] text-ink no-underline [overflow-wrap:anywhere] hover:text-[color:var(--pt)]';
  return (
    <>
      <PageHero trail={[['/contact', 'Contact']]} title={`Contact ${b.shortName}`} lead={`Questions about ${k.topic}? Call ${b.phone} or send a note below.`} />
      <section id="contact" className={`${pad} !pt-[clamp(3rem,6vw,4.5rem)]`}>
        <div className={`${wrap} grid items-start gap-x-14 gap-y-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]`}>
          <div id="enquire" className="min-w-0 scroll-mt-32 rounded-[1.75rem] border border-line p-5 sm:p-8 lg:p-10">
            <h2 className={`${h3} text-[clamp(1.7rem,1.4rem+1vw,2.2rem)] text-ink`}>{k.ask}</h2>
            <p className="mb-7 mt-2 text-[17px] leading-relaxed text-muted">{k.askText}</p>
            <EnquiryForm
              b={b}
              submitLabel="Send Message"
              fields={fields}
              styles={{
                form: '',
                label: 'text-[15px] font-bold text-ink',
                field:
                  'min-h-[52px] rounded-2xl border-2 border-line bg-white px-4 py-3 font-body text-[16px] font-normal text-ink outline-none transition-colors focus:border-primary',
                button: `${solid} mt-2 w-full border-0`,
                done: 'rounded-[1.5rem] bg-surface p-6 text-[17px] text-ink',
              }}
            />
          </div>
          <aside className="grid min-w-0 gap-8">
            <ul className="m-0 list-none border-t border-line p-0">
              <li>
                <a href={mapsHref(b)} className={row}>
                  <MapPin size={20} className={`flex-none ${pt}`} aria-hidden="true" />
                  <span className="min-w-0">
                    {address}
                    <span className={`mt-1 flex items-center gap-1.5 text-[14px] font-bold ${pt}`}>
                      Get Directions <ArrowRight size={15} aria-hidden="true" />
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a href={ctx.tel} className={`${row} font-semibold`}>
                  <Phone size={20} className={`flex-none ${pt}`} aria-hidden="true" /> {b.phone}
                </a>
              </li>
              {b.email && (
                <li>
                  <a href={`mailto:${b.email}`} className={row}>
                    <Mail size={20} className={`flex-none ${pt}`} aria-hidden="true" /> {b.email}
                  </a>
                </li>
              )}
            </ul>
            {hours.length > 0 && (
              <div className="rounded-[1.5rem] bg-surface p-6">
                <h2 className="mb-3 flex items-center gap-2.5 font-heading text-[18px] font-semibold text-ink">
                  <Clock size={19} className={pt} aria-hidden="true" /> Hours
                </h2>
                <dl className="m-0 grid gap-2 text-[16px]">
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
              <div>
                <h2 className="mb-3 font-heading text-[18px] font-semibold text-ink">Areas served</h2>
                <Chips items={area} />
              </div>
            )}
          </aside>
        </div>
      </section>
      {faqs.length > 0 && (
        <section id="faq" className={`bg-surface ${pad}`}>
          <div className={`${wrap} grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]`}>
            <div className="min-w-0">
              <Eyebrow>Questions</Eyebrow>
              <h2 className={h2}>Questions and answers</h2>
            </div>
            <div className="grid min-w-0 gap-3">
              {faqs.map((f) => (
                <details key={f.q} className="group rounded-[1.5rem] bg-white px-5 sm:px-6">
                  <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-5 py-4 font-heading text-[18px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span
                      aria-hidden="true"
                      className={`grid size-9 flex-none place-items-center rounded-full bg-surface text-[22px] leading-none transition group-open:rotate-45 ${pt}`}
                    >
                      +
                    </span>
                  </summary>
                  <p className="m-0 max-w-[42rem] pb-6 text-[16px] leading-[1.7] text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
