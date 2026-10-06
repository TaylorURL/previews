import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { mapsHref, ratingLine } from '../../site.js';
import { EnquiryForm, Img, Stars } from '../shared.jsx';
import {
  Btn,
  ClassCard,
  ClassMeta,
  Eyebrow,
  Marquee,
  PageHead,
  cut,
  display,
  h2,
  h3,
  hot,
  minutes,
  onPrimary,
  pad,
  wrap,
} from './ui.jsx';

const paragraphs = (text) => (Array.isArray(text) ? text : text ? [text] : []);

function HoursTable({ hours, className = '' }) {
  return (
    <table className={`w-full border-collapse ${className}`}>
      <tbody>
        {hours.map(([d, h]) => (
          <tr key={d} className="border-b border-line last:border-0">
            <th className="py-2.5 pr-4 text-left align-top font-normal text-muted">{d}</th>
            <td className="py-2.5 text-right align-top font-medium">{h}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ------------------------------------------------------------------ home */

function Hero({ b, ctx }) {
  const { hero } = b;
  const rating = ratingLine(b);
  return (
    <section
      className="relative isolate flex min-h-[min(720px,calc(100svh-64px))] items-end overflow-hidden bg-[#000] lg:min-h-[min(900px,calc(100svh-80px))]"
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - clamp(28px, 5vw, 72px)), 0 100%)' }}
    >
      <Img
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[var(--hero-position)]"
        src={hero.image}
        alt={hero.imageAlt || ''}
        sizes="100vw"
        eager
      />
      <span
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ground via-ground/75 to-ground/20 lg:bg-gradient-to-r lg:from-ground lg:via-ground/70 lg:to-ground/5"
        aria-hidden="true"
      />
      <span className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-ground to-transparent" aria-hidden="true" />
      <div className={`${wrap} pb-[clamp(5rem,10vw,9rem)] pt-[clamp(6rem,14vw,10rem)]`}>
        <div className="max-w-[min(100%,880px)]">
          {hero.eyebrow && <Eyebrow>{hero.eyebrow}</Eyebrow>}
          <h1
            className={`${display} [text-wrap:balance] ${
              `${hero.title} ${hero.titleAccent || ''}`.trim().length > 30
                ? 'text-[clamp(3.2rem,1.6rem+6.4vw,7rem)]'
                : 'text-[clamp(4.1rem,2rem+9vw,10.5rem)]'
            }`}
          >
            {hero.title}
            {hero.titleAccent && (
              <>
                {' '}
                <span className={`block ${hot}`}>{hero.titleAccent}</span>
              </>
            )}
          </h1>
          {hero.lead && <p className="mt-7 max-w-[36rem] text-lg leading-relaxed text-ink/85 sm:text-xl">{hero.lead}</p>}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Btn href={ctx.trial.href} arrow>
              {ctx.trial.label}
            </Btn>
            <Btn href={ctx.hasSchedule ? '/schedule' : '/classes'} ghost>
              {ctx.hasSchedule ? 'See the Schedule' : 'See the Classes'}
            </Btn>
          </div>
          {rating && (
            <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-medium text-ink/85">
              <Stars value={b.rating} size={16} />
              {rating}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function HomeClasses({ classes }) {
  const shown = classes.slice(0, 6);
  return (
    <section className={`${wrap} ${pad}`}>
      <div className="mb-[clamp(2.5rem,5vw,4rem)] flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Eyebrow>Classes</Eyebrow>
          <h2 className={h2}>Pick your class.</h2>
        </div>
        <a
          href="/classes"
          className={`inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold uppercase tracking-[0.12em] no-underline lg:self-auto ${hot}`}
        >
          {classes.length > shown.length ? `All ${classes.length} Classes` : 'All Classes'}{' '}
          <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
      <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {shown.map((c, i) => (
          <ClassCard key={c.slug} c={c} index={i} />
        ))}
      </ul>
    </section>
  );
}

function About({ about }) {
  return (
    <section className="border-t border-line">
      <div
        className={`${wrap} ${pad} grid items-center gap-x-[clamp(2rem,6vw,6rem)] gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]`}
      >
        {about.image && (
          <div className="relative min-w-0 pb-5 pr-5">
            <span className="absolute bottom-0 right-0 h-[85%] w-[85%] bg-primary" style={cut(40)} aria-hidden="true" />
            <Img
              className="relative aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]"
              src={about.image}
              alt={about.imageAlt || ''}
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </div>
        )}
        <div className="min-w-0">
          {about.eyebrow && <Eyebrow>{about.eyebrow}</Eyebrow>}
          <h2 className={`${display} text-[clamp(2.8rem,1.6rem+4.2vw,5.6rem)] [text-wrap:balance]`}>{about.title}</h2>
          <div className="mt-7 grid max-w-[38rem] gap-4 text-lg leading-relaxed text-muted">
            {paragraphs(about.text).map((p) => (
              <p key={p} className="m-0">
                {p}
              </p>
            ))}
          </div>
          {about.points?.length > 0 && (
            <ul className="m-0 mt-9 grid list-none gap-3 p-0 sm:grid-cols-2">
              {about.points.map((p) => (
                <li key={p} className="flex min-h-[52px] items-center gap-3 border border-line px-4 py-3 text-base font-semibold">
                  <Check size={18} className={`flex-none ${hot}`} aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function SessionRow({ s, showCoach = true }) {
  const body = (
    <>
      <span className="w-[5.5rem] flex-none font-heading text-[1.65rem] leading-none sm:w-28 sm:text-[1.9rem]">{s.time}</span>
      <span className="min-w-0 flex-1 text-[17px] font-semibold leading-snug">{s.name}</span>
      {showCoach && s.coach && <span className="hidden text-[15px] text-muted sm:inline">Coach {s.coach}</span>}
    </>
  );
  const cls = 'flex min-h-[64px] items-center gap-4 border-t border-line py-3 text-ink no-underline sm:gap-6';
  return s.info ? (
    <a href={`/classes/${s.info.slug}`} className={`${cls} transition-colors hover:bg-ink/[0.04]`}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function ScheduleTeaser({ week }) {
  const all = week.flatMap((d) => d.sessions);
  const first = Math.min(...all.map((s) => minutes(s.time)));
  const last = Math.max(...all.map((s) => minutes(s.time)));
  const earliest = all.find((s) => minutes(s.time) === first)?.time;
  const latest = all.find((s) => minutes(s.time) === last)?.time;
  const day = week.find((d) => d.sessions.length) || week[0];
  return (
    <section className="bg-panel">
      <div className={`${wrap} ${pad} grid gap-x-[clamp(2rem,6vw,6rem)] gap-y-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]`}>
        <div className="min-w-0">
          <Eyebrow>The week</Eyebrow>
          <h2 className={h2}>
            {first < 7 * 60 && last >= 17 * 60 ? (
              <>
                Train early.
                <br />
                Train late.
              </>
            ) : (
              'This week on the floor.'
            )}
          </h2>
          <p className="mb-9 mt-7 max-w-[30rem] text-lg leading-relaxed text-muted">
            {earliest === latest
              ? `${all.length} ${all.length === 1 ? 'class' : 'classes'} on the schedule each week.`
              : `First class at ${earliest}, last class at ${latest}. ${all.length} classes on the schedule each week.`}
          </p>
          <Btn href="/schedule" arrow>
            Full Schedule
          </Btn>
        </div>
        <div className="min-w-0">
          <h3 className={`mb-3 font-heading text-[2rem] uppercase leading-none ${hot}`}>{day.day}</h3>
          <div className="border-b border-line">
            {day.sessions.map((s, i) => (
              <SessionRow key={`${s.time}-${i}`} s={s} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CoachCard({ c, sizes }) {
  return (
    <li className="min-w-0">
      <figure className="group m-0">
        <div className="relative overflow-hidden bg-panel" style={cut(32)}>
          {c.image && (
            <Img
              className="aspect-[4/5] w-full object-cover object-top grayscale-[0.35] transition duration-500 group-hover:grayscale-0"
              src={c.image}
              alt={c.imageAlt || c.name}
              sizes={sizes}
            />
          )}
          <span
            className="absolute inset-x-0 bottom-0 h-1.5 origin-left scale-x-0 bg-primary transition duration-300 group-hover:scale-x-100"
            aria-hidden="true"
          />
        </div>
        <figcaption className="mt-5">
          <span className={`${h3} block`}>{c.name}</span>
          {c.role && <span className={`mt-2 block text-sm font-bold uppercase tracking-[0.12em] ${hot}`}>{c.role}</span>}
        </figcaption>
      </figure>
    </li>
  );
}

function HomeCoaches({ coaches }) {
  const shown = coaches.slice(0, 3);
  return (
    <section className="border-t border-line">
      <div className={`${wrap} ${pad}`}>
        <div className="mb-[clamp(2.5rem,5vw,4rem)] flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow>Coaches</Eyebrow>
            <h2 className={h2}>Meet the coaches.</h2>
          </div>
          <a
            href="/coaches"
            className={`inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold uppercase tracking-[0.12em] no-underline lg:self-auto ${hot}`}
          >
            {coaches.length > 1 ? 'All Coaches' : 'Coach Profile'} <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <ul className="m-0 grid list-none gap-x-6 gap-y-12 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <CoachCard key={c.name} c={c} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Reviews({ b }) {
  const reviews = Array.isArray(b.reviews) ? b.reviews : [];
  const rating = ratingLine(b);
  if (!reviews.length) return null;
  return (
    <section className="border-t border-line">
      <div className={`${wrap} ${pad}`}>
        {rating ? (
          <div className="mb-[clamp(2.5rem,5vw,4rem)] flex flex-wrap items-end gap-x-6 gap-y-3">
            <p className={`m-0 font-heading text-[clamp(6rem,4rem+8vw,12rem)] leading-[0.8] ${hot}`}>
              {Number(b.rating).toFixed(1)}
            </p>
            <div className="grid gap-2 pb-1">
              <Stars value={b.rating} size={22} />
              <p className="m-0 text-lg text-muted">From {b.reviewCount.toLocaleString()} Google reviews</p>
            </div>
          </div>
        ) : (
          <div className="mb-[clamp(2.5rem,5vw,4rem)]">
            <Eyebrow>Reviews</Eyebrow>
            <h2 className={h2}>What members say.</h2>
          </div>
        )}
        <ul className="m-0 grid list-none gap-5 p-0 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((r, i) => (
            <li key={i} className="min-w-0">
              <figure className="m-0 flex h-full flex-col gap-6 border-l-4 border-primary bg-panel p-7 sm:p-8">
                <blockquote className="m-0 text-[19px] font-medium leading-relaxed">&ldquo;{r.text}&rdquo;</blockquote>
                {r.author && (
                  <figcaption className="mt-auto text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
                    {r.author}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The free-trial band that closes most pages. */
export function TrialBand({ b, ctx }) {
  const t = b.trial || {};
  const image = t.image || b.hero.image;
  return (
    <section className="relative isolate overflow-hidden bg-[#000]">
      <Img className="absolute inset-0 -z-20 h-full w-full object-cover" src={image} alt="" sizes="100vw" />
      <span className="absolute inset-0 -z-10 bg-ground/75" aria-hidden="true" />
      <span
        className="absolute left-0 top-0 -z-10 h-full w-[clamp(26px,8vw,128px)] bg-primary/90"
        style={{ clipPath: 'polygon(0 0, 100% 0, 30% 100%, 0 100%)' }}
        aria-hidden="true"
      />
      <div className={`${wrap} py-[clamp(5rem,11vw,9rem)] pl-[calc(clamp(16px,4vw,64px)+clamp(26px,8vw,128px))]`}>
        <div className="max-w-[60rem]">
          <Eyebrow>{t.eyebrow || 'First class'}</Eyebrow>
          <h2 className={`${display} text-[clamp(3rem,1.4rem+6.4vw,8rem)] [text-wrap:balance]`}>
            {t.title || 'Come try a class.'}
          </h2>
          {t.text && <p className="mt-7 max-w-[38rem] text-lg leading-relaxed text-ink/85 sm:text-xl">{t.text}</p>}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Btn href={ctx.trial.href} arrow>
              {ctx.trial.label}
            </Btn>
            <Btn href={ctx.tel} ghost>
              <Phone size={17} aria-hidden="true" /> {b.phone}
            </Btn>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePage({ b, ctx }) {
  return (
    <>
      <Hero b={b} ctx={ctx} />
      <Marquee items={ctx.classes.map((c) => c.name)} />
      <HomeClasses classes={ctx.classes} />
      {ctx.hasSchedule && <ScheduleTeaser week={ctx.week} />}
      {b.about && <About about={b.about} />}
      {ctx.hasCoaches && <HomeCoaches coaches={b.coaches} />}
      <Reviews b={b} />
      <TrialBand b={b} ctx={ctx} />
    </>
  );
}

/* --------------------------------------------------------------- classes */

export function ClassesPage({ b, ctx }) {
  return (
    <>
      <PageHead
        crumbs={[['/classes', 'Classes']]}
        title="Classes"
        lead={b.classesIntro || `Every class on the ${b.shortName} schedule, with how long it runs and how hard it works you.`}
      />
      <section className={`${wrap} ${pad} !pt-[clamp(3rem,6vw,5rem)]`}>
        <ol className="m-0 grid list-none gap-[clamp(3.5rem,8vw,6.5rem)] p-0">
          {ctx.classes.map((c, i) => (
            <li key={c.slug} className="grid items-center gap-x-[clamp(2rem,5vw,5rem)] gap-y-7 lg:grid-cols-2">
              <a
                href={`/classes/${c.slug}`}
                className={`group relative block aspect-[16/10] overflow-hidden bg-panel ${i % 2 ? 'lg:order-2' : ''}`}
                style={cut(36)}
                aria-label={c.name}
              >
                {c.image && (
                  <Img
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    src={c.image}
                    alt={c.imageAlt || ''}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                )}
                <span
                  className={`absolute left-5 top-4 font-heading text-[clamp(3.5rem,2.5rem+3vw,5.5rem)] leading-none ${hot} drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]`}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </a>
              <div className="min-w-0">
                <ClassMeta c={c} size="lg" />
                <h2 className={`${display} mt-4 text-[clamp(2.8rem,1.8rem+3.6vw,5rem)]`}>{c.name}</h2>
                <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-muted">{c.text || c.summary}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Btn href={`/classes/${c.slug}`} arrow>
                    About {c.name}
                  </Btn>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <TrialBand b={b} ctx={ctx} />
    </>
  );
}

export function ClassPage({ b, ctx, c }) {
  const times = ctx.week
    .map((d) => ({ day: d.day, sessions: d.sessions.filter((s) => s.class === c.slug) }))
    .filter((d) => d.sessions.length);
  const others = ctx.classes.filter((o) => o.slug !== c.slug).slice(0, 3);
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          className={`${wrap} grid items-center gap-x-[clamp(2rem,5vw,5rem)] gap-y-10 pb-[clamp(3.5rem,7vw,6rem)] pt-[clamp(2.5rem,6vw,5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]`}
        >
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className="m-0 flex flex-wrap items-center gap-x-2 p-0 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
                <li className="flex list-none items-center gap-2">
                  <a href="/" className="inline-flex min-h-11 items-center text-muted no-underline hover:text-ink">
                    Home
                  </a>
                  <span aria-hidden="true">/</span>
                </li>
                <li className="flex list-none items-center gap-2">
                  <a href="/classes" className="inline-flex min-h-11 items-center text-muted no-underline hover:text-ink">
                    Classes
                  </a>
                  <span aria-hidden="true">/</span>
                </li>
                <li className="list-none">
                  <span aria-current="page" className="inline-flex min-h-11 items-center text-ink">
                    {c.name}
                  </span>
                </li>
              </ol>
            </nav>
            <ClassMeta c={c} size="lg" />
            <h1 className={`${display} mt-5 text-[clamp(3.4rem,1.6rem+6.6vw,8.5rem)] [text-wrap:balance]`}>{c.name}</h1>
            {c.summary && <p className="mt-6 max-w-[34rem] text-xl leading-relaxed text-ink/85">{c.summary}</p>}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Btn href={ctx.trial.href} arrow>
                {ctx.trial.label}
              </Btn>
              {ctx.hasSchedule && (
                <Btn href="/schedule" ghost>
                  See the Schedule
                </Btn>
              )}
            </div>
          </div>
          {c.image && (
            <div className="relative min-w-0">
              <span
                className="absolute -bottom-4 -right-4 h-full w-full border-2 border-primary"
                style={cut(48)}
                aria-hidden="true"
              />
              <Img
                className="relative aspect-[4/3] w-full object-cover lg:aspect-[5/6]"
                src={c.image}
                alt={c.imageAlt || ''}
                sizes="(max-width: 1024px) 100vw, 50vw"
                eager
              />
            </div>
          )}
        </div>
      </section>

      <section
        className={`${wrap} ${pad} grid gap-x-[clamp(2rem,6vw,6rem)] gap-y-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]`}
      >
        <div className="min-w-0">
          <Eyebrow>The class</Eyebrow>
          <p className="m-0 max-w-[40rem] text-[clamp(1.25rem,1.1rem+0.5vw,1.55rem)] font-medium leading-relaxed">
            {c.text || c.summary}
          </p>
          {c.expect?.length > 0 && (
            <>
              <h2 className={`${h3} mb-5 mt-12`}>What to expect</h2>
              <ul className="m-0 grid list-none gap-0 border-b border-line p-0">
                {c.expect.map((e, i) => (
                  <li key={e} className="flex items-baseline gap-5 border-t border-line py-4 text-lg">
                    <span className={`w-8 flex-none font-heading text-2xl leading-none ${hot}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0">{e}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <aside className="min-w-0 self-start bg-panel p-7 sm:p-9" style={cut(28)}>
          <h2 className={`${h3} mb-1`}>When it runs</h2>
          {times.length ? (
            <>
              <dl className="m-0 mt-5 grid gap-0">
                {times.map((d) => (
                  <div key={d.day} className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-t border-line py-3.5">
                    <dt className="text-base font-semibold">{d.day}</dt>
                    <dd className="m-0 text-right text-base text-muted">{d.sessions.map((s) => s.time).join(', ')}</dd>
                  </div>
                ))}
              </dl>
              <a
                href="/schedule"
                className={`mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] no-underline ${hot}`}
              >
                Full Schedule <ArrowRight size={16} aria-hidden="true" />
              </a>
            </>
          ) : (
            <p className="mb-0 mt-4 text-base leading-relaxed text-muted">
              Call {b.shortName} at{' '}
              <a href={ctx.tel} className="whitespace-nowrap text-ink">
                {b.phone}
              </a>{' '}
              for this week&rsquo;s times.
            </p>
          )}
          <Btn href={ctx.trial.href} className="mt-6 w-full">
            {ctx.trial.label}
          </Btn>
        </aside>
      </section>

      {others.length > 0 && (
        <section className="border-t border-line bg-panel/60">
          <div className={`${wrap} ${pad}`}>
            <h2 className={`${h2} mb-[clamp(2.5rem,5vw,4rem)]`}>More classes.</h2>
            <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {others.map((o) => (
                <ClassCard key={o.slug} c={o} />
              ))}
            </ul>
          </div>
        </section>
      )}
      <TrialBand b={b} ctx={ctx} />
    </>
  );
}

/* -------------------------------------------------------------- schedule */

const short = (day) => day.slice(0, 3);

export function SchedulePage({ b, ctx }) {
  const { week } = ctx;
  const [day, setDay] = useState(0);
  const [only, setOnly] = useState('');
  const count = week.reduce((n, d) => n + d.sessions.length, 0);
  const used = ctx.classes.filter((c) => week.some((d) => d.sessions.some((s) => s.class === c.slug)));
  const dim = (s) => (only && s.class !== only ? 'opacity-25' : '');
  const current = week[day] || week[0];

  return (
    <>
      <PageHead
        crumbs={[['/schedule', 'Schedule']]}
        title="The weekly schedule."
        lead={
          b.scheduleNote ||
          `${count} ${count === 1 ? 'class' : 'classes'} a week. Pick one, let us know you are coming, and a coach will get you set up.`
        }
      />
      <section className={`${wrap} pb-[clamp(4.5rem,9vw,7rem)] pt-[clamp(2.5rem,5vw,4rem)]`}>
        {used.length > 1 && (
          <div className="mb-8">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-muted" id="class-filter">
              Show
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="class-filter">
              {[{ slug: '', name: 'All Classes' }, ...used].map((c) => (
                <button
                  key={c.slug || 'all'}
                  type="button"
                  aria-pressed={only === c.slug}
                  onClick={() => setOnly(c.slug)}
                  className={`min-h-11 cursor-pointer border px-4 text-sm font-semibold uppercase tracking-[0.08em] transition ${
                    only === c.slug
                      ? `border-primary bg-primary ${onPrimary}`
                      : 'border-line bg-transparent text-ink hover:border-ink/50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Phones and tablets: one day at a time. */}
        <div className="lg:hidden">
          <div
            role="tablist"
            aria-label="Day of the week"
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${week.length}, minmax(0, 1fr))` }}
          >
            {week.map((d, i) => (
              <button
                key={d.day}
                type="button"
                role="tab"
                id={`day-tab-${i}`}
                aria-selected={i === day}
                aria-controls="day-panel"
                tabIndex={i === day ? 0 : -1}
                onClick={() => setDay(i)}
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                  const next = (i + (e.key === 'ArrowRight' ? 1 : week.length - 1)) % week.length;
                  setDay(next);
                  e.currentTarget.parentElement.children[next]?.focus();
                }}
                className={`min-h-[52px] min-w-0 cursor-pointer px-0 font-heading text-[1.35rem] uppercase leading-none transition sm:text-2xl ${
                  i === day ? `bg-primary ${onPrimary}` : 'bg-panel text-ink hover:bg-line'
                }`}
              >
                {short(d.day)}
                <span className="sr-only">{d.day.slice(3)}</span>
              </button>
            ))}
          </div>
          <div role="tabpanel" id="day-panel" aria-labelledby={`day-tab-${day}`} className="mt-6">
            <h2 className={`mb-2 font-heading text-[2.4rem] uppercase leading-none ${hot}`}>{current.day}</h2>
            {current.sessions.length ? (
              <ul className="m-0 list-none border-b border-line p-0">
                {current.sessions.map((s, i) => (
                  <li key={`${s.time}-${i}`} className={`transition-opacity ${dim(s)}`}>
                    <SessionCard s={s} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-t border-line py-6 text-lg text-muted">No classes on {current.day}.</p>
            )}
          </div>
        </div>

        {/* Desktop: the whole week as a grid. */}
        <div className="hidden gap-3 lg:grid" style={{ gridTemplateColumns: `repeat(${week.length}, minmax(0, 1fr))` }}>
          {week.map((d) => (
            <div key={d.day} className="min-w-0">
              <h2 className="mb-3 border-b-2 border-primary pb-3 font-heading text-[1.9rem] uppercase leading-none xl:text-[2.1rem]">
                {d.day}
              </h2>
              <ul className="m-0 grid list-none gap-2.5 p-0">
                {d.sessions.map((s, i) => (
                  <li key={`${s.time}-${i}`} className={`min-w-0 transition-opacity ${dim(s)}`}>
                    <a
                      href={s.info ? `/classes/${s.info.slug}` : undefined}
                      className="block border-l-[3px] border-primary bg-panel px-3.5 py-3.5 text-ink no-underline transition-colors hover:bg-line xl:px-4"
                    >
                      <span className={`block text-[13px] font-bold tracking-[0.06em] ${hot}`}>{s.time}</span>
                      <span className="mt-1 block font-heading text-[1.45rem] uppercase leading-[0.95] [overflow-wrap:anywhere] xl:text-[1.6rem]">
                        {s.name}
                      </span>
                      {s.coach && <span className="mt-1.5 block text-[13px] text-muted">Coach {s.coach}</span>}
                    </a>
                  </li>
                ))}
                {!d.sessions.length && <li className="py-3 text-sm text-muted">No classes</li>}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <TrialBand b={b} ctx={ctx} />
    </>
  );
}

function SessionCard({ s }) {
  const inner = (
    <>
      <span className="w-[5.6rem] flex-none font-heading text-[1.75rem] leading-none">{s.time}</span>
      <span className="grid min-w-0 flex-1 gap-1">
        <span className="text-[17px] font-semibold leading-snug">{s.name}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          {s.info?.duration && <span>{s.info.duration} min</span>}
          {s.coach && <span>Coach {s.coach}</span>}
        </span>
      </span>
      {s.info && <ArrowRight size={18} className={`flex-none ${hot}`} aria-hidden="true" />}
    </>
  );
  const cls = 'flex min-h-[72px] items-center gap-4 border-t border-line py-4 text-ink no-underline';
  return s.info ? (
    <a href={`/classes/${s.info.slug}`} className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/* ------------------------------------------------------------ membership */

export function MembershipPage({ b, ctx }) {
  const m = b.membership || {};
  const tiers = ctx.tiers;
  const faq = Array.isArray(b.faq) ? b.faq : [];
  const t = b.trial || {};
  return (
    <>
      <PageHead
        crumbs={[['/membership', tiers.length ? 'Membership' : 'Get Started']]}
        title={tiers.length ? 'Membership.' : t.title || 'Your first class.'}
        lead={tiers.length ? m.intro : t.text || m.intro}
      />
      {tiers.length > 0 ? (
        <section className={`${wrap} ${pad} !pt-[clamp(3rem,6vw,5rem)]`}>
          <ul
            className={`m-0 grid list-none items-stretch gap-5 p-0 ${tiers.length === 1 ? 'max-w-xl' : tiers.length === 2 ? 'md:grid-cols-2 lg:max-w-5xl' : tiers.length === 4 ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'}`}
          >
            {tiers.map((tier) => (
              <li key={tier.name} className="min-w-0">
                <div
                  className={`flex h-full flex-col p-7 sm:p-9 ${tier.featured ? `bg-primary ${onPrimary}` : 'bg-panel'}`}
                  style={cut(32)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className={`${h3}`}>{tier.name}</h2>
                    {tier.badge && (
                      <span
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] ${tier.featured ? 'bg-[color:var(--on-primary)] text-primary' : 'bg-primary ' + onPrimary}`}
                      >
                        {tier.badge}
                      </span>
                    )}
                  </div>
                  {tier.price != null && (
                    <p className="m-0 mt-6 flex items-baseline gap-2">
                      <span className="font-heading text-[clamp(4rem,3rem+3vw,5.5rem)] leading-none">
                        {typeof tier.price === 'number' ? `$${tier.price}` : tier.price}
                      </span>
                      {tier.period && (
                        <span className={`text-base font-semibold ${tier.featured ? '' : 'text-muted'}`}>/ {tier.period}</span>
                      )}
                    </p>
                  )}
                  {tier.text && (
                    <p className={`mb-0 mt-4 text-base leading-relaxed ${tier.featured ? 'opacity-85' : 'text-muted'}`}>
                      {tier.text}
                    </p>
                  )}
                  {tier.features?.length > 0 && (
                    <ul
                      className={`m-0 mt-7 grid list-none gap-3 border-t p-0 pt-7 ${tier.featured ? 'border-[color:color-mix(in_srgb,var(--on-primary)_22%,transparent)]' : 'border-line'}`}
                    >
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-base">
                          <Check size={18} className={`mt-0.5 flex-none ${tier.featured ? '' : hot}`} aria-hidden="true" />
                          <span className="min-w-0">{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-auto pt-9">
                    <a
                      href={ctx.trial.href}
                      className={`inline-flex min-h-[52px] w-full items-center justify-center gap-2 px-6 text-[15px] font-bold uppercase tracking-[0.08em] no-underline transition ${
                        tier.featured
                          ? 'bg-[color:var(--on-primary)] text-primary hover:opacity-90'
                          : 'border-2 border-ink/35 text-ink hover:border-ink'
                      }`}
                    >
                      Get Started
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {m.note && <p className="mt-8 max-w-[44rem] text-base leading-relaxed text-muted">{m.note}</p>}
        </section>
      ) : (
        <TrialSteps b={b} ctx={ctx} />
      )}
      {faq.length > 0 && (
        <section className="border-t border-line">
          <div className={`${wrap} ${pad} grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]`}>
            <div>
              <Eyebrow>Questions</Eyebrow>
              <h2 className={h2}>Before your first class.</h2>
            </div>
            <div className="border-b border-line">
              {faq.map((f) => (
                <details key={f.q} className="group border-t border-line">
                  <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-6 py-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span
                      className={`grid h-9 w-9 flex-none place-items-center border border-line text-xl leading-none transition group-open:rotate-45 ${hot}`}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="m-0 max-w-[40rem] pb-6 text-base leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
      <TrialBand b={b} ctx={ctx} />
    </>
  );
}

function TrialSteps({ b, ctx }) {
  const steps = [
    [
      'Pick a class',
      ctx.hasSchedule
        ? 'Find a time that suits you on the weekly schedule.'
        : 'Choose the class that fits what you want to work on.',
    ],
    ['Let us know', `Call ${b.phone} or send the form, so a coach knows to expect you.`],
    ['Show up and train', 'Bring water and training shoes. The coach takes it from there.'],
  ];
  return (
    <section className={`${wrap} ${pad} !pt-[clamp(3rem,6vw,5rem)]`}>
      <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-3">
        {steps.map(([title, text], i) => (
          <li key={title} className="min-w-0 bg-panel p-7 sm:p-9" style={cut(28)}>
            <span className={`font-heading text-[4.5rem] leading-none ${hot}`}>{String(i + 1).padStart(2, '0')}</span>
            <h2 className={`${h3} mt-4`}>{title}</h2>
            <p className="mb-0 mt-3 text-base leading-relaxed text-muted">{text}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Btn href={ctx.trial.href} arrow>
          {ctx.trial.label}
        </Btn>
        {ctx.hasSchedule && (
          <Btn href="/schedule" ghost>
            See the Schedule
          </Btn>
        )}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- coaches */

export function CoachesPage({ b, ctx }) {
  return (
    <>
      <PageHead
        crumbs={[['/coaches', 'Coaches']]}
        title={b.coaches.length > 1 ? 'The coaches.' : 'Your coach.'}
        lead={b.coachesIntro}
      />
      <section className={`${wrap} ${pad} !pt-[clamp(3rem,6vw,5rem)]`}>
        <ul className="m-0 grid list-none gap-[clamp(3.5rem,8vw,6rem)] p-0">
          {b.coaches.map((c, i) => (
            <li
              key={c.name}
              className="grid items-center gap-x-[clamp(2rem,6vw,6rem)] gap-y-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
            >
              <div className={`relative min-w-0 ${i % 2 ? 'md:order-2' : ''}`}>
                <span className="absolute -bottom-3 -left-3 h-full w-full bg-primary" style={cut(36)} aria-hidden="true" />
                {c.image && (
                  <Img
                    className="relative aspect-[4/5] w-full object-cover object-top"
                    src={c.image}
                    alt={c.imageAlt || c.name}
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                )}
              </div>
              <div className="min-w-0">
                {c.role && <Eyebrow>{c.role}</Eyebrow>}
                <h2 className={`${display} text-[clamp(3rem,2rem+4vw,6rem)]`}>{c.name}</h2>
                {c.bio && <p className="mt-6 max-w-[36rem] text-lg leading-relaxed text-muted">{c.bio}</p>}
                {c.specialties?.length > 0 && (
                  <ul className="m-0 mt-7 flex list-none flex-wrap gap-2 p-0">
                    {c.specialties.map((s) => (
                      <li key={s} className="border border-line px-3.5 py-2 text-sm font-semibold uppercase tracking-[0.08em]">
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
                {ctx.hasSchedule &&
                  ctx.week.some((d) => d.sessions.some((s) => s.coach && c.name.split(' ')[0] === s.coach.split(' ')[0])) && (
                    <a
                      href="/schedule"
                      className={`mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] no-underline ${hot}`}
                    >
                      {c.name.split(' ')[0]}&rsquo;s Classes <ArrowRight size={16} aria-hidden="true" />
                    </a>
                  )}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <TrialBand b={b} ctx={ctx} />
    </>
  );
}

/* --------------------------------------------------------------- contact */

export function ContactPage({ b, ctx }) {
  const directions = mapsHref(b);
  const city = `${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;
  const areas = Array.isArray(b.areas) ? b.areas : [];
  const options = [...ctx.classes.map((c) => c.name), 'Not sure yet'];
  return (
    <>
      <PageHead
        crumbs={[['/contact', 'Contact']]}
        title="Come train with us."
        lead={`Questions, a first class or a membership. Call, stop by ${b.address}, or send a note and ${b.shortName} will get back to you.`}
      />
      <section
        className={`${wrap} ${pad} !pt-[clamp(3rem,6vw,5rem)] grid gap-x-[clamp(2rem,6vw,6rem)] gap-y-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]`}
      >
        <div id="book" className="min-w-0 scroll-mt-[140px]">
          <h2 className={`${h3} mb-2`}>{b.trial?.label || 'Book Your First Class'}</h2>
          <p className="mb-8 mt-0 text-base leading-relaxed text-muted">
            Tell us which class you have your eye on and when you would like to come.
          </p>
          <EnquiryForm
            b={b}
            submitLabel="Send"
            fields={[
              { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
              { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
              { name: 'email', label: 'Email', type: 'email', wide: true, autoComplete: 'email' },
              { name: 'class', label: 'Class', type: 'select', options, wide: true },
              { name: 'message', label: 'Anything we should know?', type: 'textarea', wide: true },
            ]}
            styles={{
              form: '',
              label: 'text-sm font-semibold uppercase tracking-[0.1em] text-muted',
              field:
                'min-h-[52px] rounded-none border border-line bg-panel px-4 py-3 text-base normal-case tracking-normal text-ink outline-none transition focus:border-[color:var(--hot)]',
              button: `${'inline-flex min-h-[56px] items-center justify-center gap-2 border-0 px-8 text-[15px] font-bold uppercase tracking-[0.08em]'} bg-primary ${onPrimary} hover:brightness-110`,
              done: 'border-l-4 border-primary bg-panel p-7 text-lg',
            }}
          />
        </div>
        <aside className="grid min-w-0 content-start gap-8">
          <div className="grid gap-0 border-b border-line">
            <a
              className="flex gap-4 border-t border-line py-5 text-[17px] text-ink no-underline hover:bg-ink/[0.03]"
              href={directions}
            >
              <MapPin size={20} className={`mt-0.5 flex-none ${hot}`} aria-hidden="true" />
              <span className="min-w-0">
                {b.address}
                <br />
                {city}
                <span className={`mt-1.5 flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.1em] ${hot}`}>
                  Get Directions <ArrowUpRight size={15} aria-hidden="true" />
                </span>
              </span>
            </a>
            <a
              className="flex min-h-[64px] items-center gap-4 border-t border-line py-4 text-[17px] text-ink no-underline hover:bg-ink/[0.03]"
              href={ctx.tel}
            >
              <Phone size={20} className={`flex-none ${hot}`} aria-hidden="true" />
              {b.phone}
            </a>
            {b.email && (
              <a
                className="flex min-h-[64px] items-center gap-4 border-t border-line py-4 text-[17px] text-ink no-underline [overflow-wrap:anywhere] hover:bg-ink/[0.03]"
                href={`mailto:${b.email}`}
              >
                <Mail size={20} className={`flex-none ${hot}`} aria-hidden="true" />
                <span className="min-w-0">{b.email}</span>
              </a>
            )}
          </div>
          {b.hours?.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-3 font-heading text-[2rem] uppercase leading-none">
                <Clock size={22} className={hot} aria-hidden="true" /> Hours
              </h2>
              <HoursTable hours={b.hours} className="text-base" />
            </div>
          )}
          {areas.length > 0 && (
            <div>
              <h2 className="mb-3 font-heading text-[2rem] uppercase leading-none">Members drive in from</h2>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {areas.map((a) => (
                  <li key={a} className="border border-line px-3.5 py-2 text-[15px] font-medium">
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {b.contactImage && (
            <Img
              className="aspect-[16/10] w-full object-cover"
              src={b.contactImage}
              alt={b.contactImageAlt || ''}
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          )}
        </aside>
      </section>
    </>
  );
}
