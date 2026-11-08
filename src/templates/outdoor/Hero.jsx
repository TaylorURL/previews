/**
 * The openings: the home page's hero in its three styles, and the shorter
 * opening every other page has.
 */
import { ArrowRight, BadgeCheck, CalendarCheck, ChevronRight, MapPin } from 'lucide-react';
import { ratingLine } from '../../site.js';
import { Img, Stars } from '../shared.jsx';
import Topo from './Topo.jsx';
import { areaOf, groupsOf, heroStyleOf, list } from './util.js';
import { Actions, Eyebrow, Unbroken, display, wrap } from './ui.jsx';

// The left edge of the page's own column, for a column that bleeds to the right edge of the screen.
const edge = 'lg:pl-[max(clamp(16px,4vw,64px),calc((100vw-1320px)/2+clamp(16px,4vw,64px)))]';
const heroTitle = `${display} leading-[1.03]`;

/**
 * The headline's size, by how long it is: a short line set large, a long one
 * (a list of services and a town) smaller, so it stays four lines or fewer
 * beside the photo and the buttons stay in the first screen.
 */
function titleSize(b, type) {
  const n = `${b.hero.title || ''} ${b.hero.titleAccent || ''}`.trim().length;
  if (type) {
    if (n > 60) return 'text-[clamp(2.1rem,1.3rem+2.6vw,3.75rem)]';
    if (n > 42) return 'text-[clamp(2.3rem,1.4rem+3vw,4.4rem)]';
    return 'text-[clamp(2.5rem,1.5rem+3.9vw,5.4rem)]';
  }
  if (n > 60) return 'text-[clamp(2.1rem,1.4rem+2vw,3.3rem)]';
  if (n > 42) return 'text-[clamp(2.25rem,1.45rem+2.4vw,3.75rem)]';
  return 'text-[clamp(2.4rem,1.5rem+2.9vw,4.25rem)]';
}

/** The few plain facts under the buttons: the rating, the year, a license. */
function Proof({ b, dark = true, ratingClass = 'flex', className = '' }) {
  const rating = ratingLine(b);
  const licensed = list(b.licenses).length > 0 || list(b.credentials).length > 0;
  const items = [
    rating && (
      <span key="r" className={`items-center gap-2.5 ${ratingClass}`}>
        <Stars value={b.rating} size={16} /> {rating}
      </span>
    ),
    b.since && (
      <span key="s" className="flex items-center gap-2">
        <CalendarCheck size={16} className="flex-none opacity-70" aria-hidden="true" /> Since {b.since}
      </span>
    ),
    licensed && (
      <span key="l" className="flex items-center gap-2">
        <BadgeCheck size={16} className="flex-none opacity-70" aria-hidden="true" /> {list(b.licenses)[0]?.label || list(b.credentials)[0]?.label}
      </span>
    ),
  ].filter(Boolean);
  if (!items.length || (items.length === 1 && rating && ratingClass === 'hidden')) return null;
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px] font-medium ${dark ? 'text-white/80' : 'text-muted'} ${className}`}>{items}</div>
  );
}

function Headline({ b, type = false, hl = 'text-[color:var(--hl)]', className = '' }) {
  return (
    <h1 className={`${heroTitle} ${titleSize(b, type)} ${className}`}>
      <Unbroken>{b.hero.title}</Unbroken>
      {b.hero.titleAccent && (
        <>
          {' '}
          <span className={hl}>
            <Unbroken>{b.hero.titleAccent}</Unbroken>
          </span>
        </>
      )}
    </h1>
  );
}

/** The rating, set on the corner of the photo on a large screen. */
function RatingCard({ b }) {
  if (!ratingLine(b)) return null;
  return (
    <div className="absolute bottom-6 left-6 hidden items-center gap-4 xl:bottom-8 xl:left-8 rounded-2xl bg-white/95 px-5 py-4 text-ink shadow-[0_24px_50px_-20px_rgba(0,0,0,0.55)] backdrop-blur lg:flex">
      <strong className="font-heading text-[40px] font-extrabold leading-none tracking-[-0.03em]">{Number(b.rating).toFixed(1)}</strong>
      <span className="grid gap-1">
        <Stars value={b.rating} size={16} />
        <span className="text-[14px] font-medium text-muted">{b.reviewCount.toLocaleString()} Google reviews</span>
      </span>
    </div>
  );
}

/**
 * Beside the photo (split), over it (photo), or in type alone. On a phone the
 * photo leads in both photo styles, with the headline set over its lower part
 * and the words and buttons on the brand's dark ground under it.
 */
export function HomeHero({ b }) {
  const style = heroStyleOf(b);
  if (style === 'type') return <TypeHero b={b} />;
  const full = style === 'photo';
  return (
    <section
      className={`relative isolate grid overflow-hidden bg-[color:var(--deep)] text-white lg:min-h-[clamp(600px,calc(100svh-180px),800px)] ${
        full ? 'lg:grid-cols-[minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'
      } lg:grid-rows-[1fr_auto_auto_1fr]`}
    >
      {!full && <Topo name={b.name} className="-z-10 hidden text-white lg:block" strength={0.09} />}
      {/* On a phone the photo runs on behind the words, blurred and shaded, so the opening is the photo all the way down
          rather than a photo over a flat panel. The same file as the photo, so it costs no second download. */}
      <div className="absolute inset-0 -z-10 overflow-hidden lg:hidden" aria-hidden="true">
        <Img className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl" src={b.hero.image} alt="" sizes="(min-width: 1024px) 100vw, 180vw" />
        <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--deep)_70%,transparent)]" />
      </div>
      <div
        className={`relative col-start-1 row-start-1 aspect-square max-h-[64svh] w-full lg:row-span-4 lg:aspect-auto lg:max-h-none ${
          full ? 'lg:absolute lg:inset-0 lg:-z-10' : 'lg:col-start-2'
        }`}
      >
        {/* On a phone the photo and the shade over it fade out together at its foot, into the blurred photo behind. */}
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_50%,transparent_99%)] lg:[mask-image:none]">
          <Img
            className="absolute inset-0 h-full w-full object-cover"
            src={b.hero.image}
            alt={b.hero.imageAlt || ''}
            // The frame is cut from the photo, so it asks for the photo at the width its height needs, not its own width.
            sizes="(min-width: 1024px) 100vw, 180vw"
            eager
            data-backdrop=""
          />
          {/* The headline is set over the photo's foot on a phone, on a shade rising from below, deep enough up to the
              eyebrow (about half the photo's height) that small spaced type and the coloured line read on a busy photo. */}
          <div
            className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--deep)_90%,transparent)_0%,color-mix(in_srgb,var(--deep)_80%,transparent)_50%,color-mix(in_srgb,var(--deep)_45%,transparent)_70%,transparent_90%)] lg:hidden"
            aria-hidden="true"
          />
        </div>
        {ratingLine(b) && (
          <p className="absolute left-4 top-4 m-0 flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-2 text-[14px] font-semibold text-ink shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)] lg:hidden">
            <Stars value={b.rating} size={14} /> {Number(b.rating).toFixed(1)} · {b.reviewCount.toLocaleString()} Google reviews
          </p>
        )}
        {full ? (
          <div
            className="absolute inset-0 hidden bg-[linear-gradient(90deg,color-mix(in_srgb,var(--deep)_92%,transparent)_0%,color-mix(in_srgb,var(--deep)_70%,transparent)_45%,transparent_80%),linear-gradient(to_top,color-mix(in_srgb,var(--deep)_70%,transparent),transparent_45%)] lg:block"
            aria-hidden="true"
          />
        ) : (
          <RatingCard b={b} />
        )}
      </div>
      {/* Over the photo the headline keeps to the measure of the lead, inside the shade, and its coloured half is held to the
          stricter --hl-photo; beside the photo on a large screen it is on the flat dark ground again. */}
      <div className={`relative col-start-1 row-start-1 self-end px-gutter pb-2 lg:row-start-2 lg:pb-0 lg:pt-16 ${edge} ${full ? 'lg:max-w-[52rem]' : 'lg:pr-14 xl:pr-20'}`}>
        <Eyebrow light>{b.hero.eyebrow}</Eyebrow>
        <Headline b={b} hl={full ? 'text-[color:var(--hl-photo)]' : 'text-[color:var(--hl-photo)] lg:text-[color:var(--hl)]'} className="text-white" />
      </div>
      <div className={`col-start-1 row-start-2 px-gutter pb-12 pt-5 lg:row-start-3 lg:pb-16 ${edge} ${full ? 'lg:max-w-[52rem]' : 'lg:pr-14 xl:pr-20'}`}>
        {b.hero.lead && <p className="max-w-[36rem] text-[17px] leading-[1.65] text-white/80 sm:text-[19px]">{b.hero.lead}</p>}
        <Actions b={b} dark className="mt-8" />
        {/* The rating stands on the photo (its corner on a large screen, a chip on a phone), so the line under the buttons leaves it out there. */}
        <Proof b={b} ratingClass={full ? 'hidden lg:flex' : 'hidden'} className="mt-8" />
      </div>
    </section>
  );
}

/** No photo to lead: the words on the brand's dark ground over its contour lines, and what the business does beside them. */
function TypeHero({ b }) {
  const groups = groupsOf(b);
  const area = areaOf(b);
  return (
    <section className="relative isolate overflow-hidden bg-[color:var(--deep)] text-white">
      <Topo name={b.name} className="-z-10 text-white" strength={0.16} />
      <div
        className="absolute -right-40 -top-40 -z-10 h-[38rem] w-[38rem] rounded-full bg-[color:var(--primary)] opacity-30 blur-[120px]"
        aria-hidden="true"
      />
      <div className={`${wrap} grid gap-12 py-14 sm:py-20 lg:min-h-[clamp(560px,calc(100svh-180px),760px)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-center lg:gap-20 lg:py-24`}>
        <div className="min-w-0">
          <Eyebrow light>{b.hero.eyebrow}</Eyebrow>
          <Headline b={b} type className="text-white" />
          {b.hero.lead && <p className="mt-7 max-w-[38rem] text-[17px] leading-[1.65] text-white/80 sm:text-[19px]">{b.hero.lead}</p>}
          <Actions b={b} dark className="mt-9" />
          <Proof b={b} className="mt-8" />
        </div>
        {groups.length > 0 && (
          <nav aria-label="What we do" className="min-w-0 rounded-[28px] border border-white/15 bg-white/[0.06] p-6 backdrop-blur-sm sm:p-8">
            <p className="font-heading text-[13px] font-bold uppercase tracking-[0.18em] text-white/60">What we do</p>
            <ol className="mt-4 grid">
              {groups.slice(0, 6).map((g, i) => (
                <li key={g.slug} className="border-t border-white/15 first:border-0">
                  <a href={`/${g.slug}`} className="group flex min-h-[56px] items-center gap-4 py-3 font-heading text-[18px] font-bold leading-snug text-white no-underline">
                    <span className="w-7 flex-none text-[14px] font-semibold tabular-nums text-white/45">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1">{g.title}</span>
                    <ArrowRight size={17} className="flex-none text-white/50 transition group-hover:translate-x-1 group-hover:text-white" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ol>
            {area.length > 0 && (
              <p className="mt-5 flex gap-2 border-t border-white/15 pt-5 text-[15px] leading-[1.55] text-white/70">
                <MapPin size={16} className="mt-[3px] flex-none" aria-hidden="true" />
                <span className="min-w-0">
                  Serving {area.slice(0, 5).join(', ')}
                  {area.length > 5 ? ` and ${area.length - 5} more` : ''}
                </span>
              </p>
            )}
          </nav>
        )}
      </div>
    </section>
  );
}

function Crumbs({ crumbs, dark }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className={`flex flex-wrap items-center gap-1.5 text-[15px] ${dark ? 'text-white/65' : 'text-muted'}`}>
        <li>
          <a href="/" className="inline-flex min-h-[32px] items-center text-current no-underline hover:underline">
            Home
          </a>
        </li>
        {crumbs.map((c) => (
          <li key={c} className="flex min-w-0 items-center gap-1.5">
            <ChevronRight size={14} className="flex-none" aria-hidden="true" />
            <span aria-current="page" className={`font-medium ${dark ? 'text-white' : 'text-ink'}`}>
              {c}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Every other page's opening: beside its photo when it has one, which runs to
 * the screen's right edge as the home page's does; else on the dark ground
 * with `aside` (what the page covers, how to call) beside the words.
 */
export function PageHero({ b, crumbs, eyebrow, title, text, image, imageAlt, aside, children }) {
  if (image) {
    return (
      <section className="relative isolate grid overflow-hidden bg-[color:var(--paper)] lg:min-h-[560px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="relative aspect-[4/3] w-full lg:order-last lg:aspect-auto">
          <Img className="absolute inset-0 h-full w-full object-cover" src={image} alt={imageAlt || ''} sizes="(min-width: 1024px) 70vw, 130vw" eager />
        </div>
        <div className={`min-w-0 self-center px-gutter py-12 sm:py-16 lg:py-20 lg:pr-14 xl:pr-20 ${edge}`}>
          <Crumbs crumbs={crumbs} />
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className={`${display} text-[clamp(2.3rem,1.5rem+3vw,4rem)] leading-[1.03] text-ink`}>
            <Unbroken>{title}</Unbroken>
          </h1>
          {text && <p className="mt-6 max-w-[38rem] text-[17px] leading-[1.7] text-muted sm:text-[18px]">{text}</p>}
          {children}
        </div>
      </section>
    );
  }
  return (
    <section className="relative isolate overflow-hidden bg-[color:var(--deep)] text-white">
      <Topo name={b.name} className="-z-10 text-white" strength={0.14} />
      <div className={`${wrap} grid gap-10 py-14 sm:py-20 ${aside ? 'lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center lg:gap-16' : ''} lg:py-24`}>
        <div className="min-w-0">
          <Crumbs crumbs={crumbs} dark />
          {eyebrow && <Eyebrow light>{eyebrow}</Eyebrow>}
          <h1 className={`${display} text-[clamp(2.3rem,1.5rem+3vw,4.2rem)] leading-[1.03] text-white`}>
            <Unbroken>{title}</Unbroken>
          </h1>
          {text && <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.7] text-white/80 sm:text-[18px]">{text}</p>}
          {children}
        </div>
        {aside}
      </div>
    </section>
  );
}
