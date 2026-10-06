/**
 * Flooring: a showroom-led site of several pages for a flooring store that
 * sells and installs.
 *
 * Pages, each prerendered at its own address:
 *   ''                     home
 *   flooring               every category the store carries
 *   flooring/<slug>        one page per entry in `categories`
 *   gallery                finished rooms, filterable by category (only when `gallery` has items)
 *   showroom               about the store, address, hours and map link
 *   estimate               the free-estimate request form
 *
 * BRAND FILE (src/brands/<slug>.json). Required unless marked optional.
 *
 *   template        "flooring"
 *   preview         true on a prospect's preview; left out on the sample
 *   name            full business name, as on Google
 *   shortName       optional. Shorter name for the form's thank-you line and
 *                   the logo fallback; defaults to `name`
 *   phone           "(281) 555-0186"
 *   email           optional
 *   address         street line, "4510 Garth Rd, Suite 120"
 *   town, state     "Baytown", "TX"
 *   zip             optional
 *   rating          optional. Google rating, 4.9
 *   reviewCount     optional. Google review count; the rating shows only with both
 *   hours           optional. [["Mon – Fri", "9 AM – 6 PM"], ...] in display order
 *   tagline         optional. One sentence under the logo in the footer
 *   serviceArea     optional. Town names the store installs in
 *
 *   brand
 *     primary       buttons, links and accents. Must carry white text and read
 *                   as text on the cream ground (contrast 4.5:1 both ways)
 *     accent        hairlines and the large step numerals; decorative only
 *     ink           body text
 *     primaryDeep   optional. Top strip, the how-it-works band, footer.
 *                   Defaults to primary darkened
 *     cream         optional. The page ground, a light warm neutral. Default #f8f4ec
 *     surface       optional. Panels a shade off the ground. Default mixed from cream and ink
 *     line          optional. Hairlines. Default mixed from cream and ink
 *     muted         optional. Secondary text. Default mixed from ink
 *     heading       CSS font stack for headings; a serif reads best ('Fraunces', Georgia, serif)
 *     body          CSS font stack for text
 *     fonts         Google Fonts stylesheet URL loading both
 *     logo          optional. Path to the logo (webp/png/svg) on a light ground;
 *                   null sets `shortName` in the heading face
 *     logoWidth     optional. Logo width in px in the header, default 200
 *
 *   hero
 *     eyebrow       optional. Short line above the headline
 *     title         the headline, a sentence
 *     lead          one or two sentences under it
 *     image         a room photograph, landscape; set full-bleed
 *     imageAlt
 *
 *   categories      the floors the store sells, in menu order. Each:
 *     slug          url part, lowercase-hyphenated: "luxury-vinyl"
 *     title         "Luxury Vinyl"
 *     short         one line for the menu and the tiles
 *     text          a paragraph for the category page
 *     texture       close-up of the material, used for tiles and menu thumbnails
 *     textureAlt    optional
 *     image         a finished room in this floor, landscape
 *     imageAlt
 *     brands        optional. Manufacturer names the store stocks in this category
 *     features      optional. [{ title, text }] up to three selling points
 *
 *   process         optional. The how-it-works band, usually three steps:
 *                   [{ title: "Visit", text }, { title: "Measure", text }, { title: "Install", text }]
 *
 *   gallery         optional. Finished rooms: [{ image, alt, category, title }]
 *                   where category is a category slug and title a short caption.
 *                   No photo is used twice anywhere in the file
 *
 *   about           optional. The showroom page and the home page's showroom section
 *     eyebrow       optional
 *     title
 *     text          a string, or an array of paragraphs
 *     image         the showroom or the team
 *     imageAlt
 *     points        optional. Short facts as a list, "Free in-home measuring"
 *
 *   estimate        optional. Words for the estimate page and band
 *     title         default "Get a free estimate."
 *     text          optional
 *
 *   reviews         optional. [{ author, text }], Google reviews as written
 */

import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { brandVars, mapsHref, ratingLine, telHref } from '../site.js';
import { EnquiryForm, Img, Stars, Facts } from './shared.jsx';
import Header from './flooring/Header.jsx';
import { BrandMark, Eyebrow, MASONRY, h2, light, outline, pad, solid, wrap } from './flooring/parts.jsx';

const DEFAULT_TOKENS = {
  '--primaryDeep': 'color-mix(in srgb, var(--primary) 45%, #000)',
  '--cream': '#f8f4ec',
  '--surface': 'color-mix(in srgb, var(--cream) 90%, var(--ink))',
  '--line': 'color-mix(in srgb, var(--cream) 84%, var(--ink))',
  '--muted': 'color-mix(in srgb, var(--ink) 72%, var(--cream))',
};

const categoriesOf = (b) => (Array.isArray(b.categories) ? b.categories.filter((c) => c?.slug && c.title) : []);
const paragraphs = (text) => (Array.isArray(text) ? text : text ? [text] : []);

export function pages(b) {
  return [
    'flooring',
    ...categoriesOf(b).map((c) => `flooring/${c.slug}`),
    ...(b.gallery?.length ? ['gallery'] : []),
    'showroom',
    'estimate',
  ];
}

/* ------------------------------------------------------------------ shared */

function Crumbs({ trail }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="m-0 flex list-none flex-wrap items-center gap-x-2 p-0 text-[15px] text-muted">
        {trail.map(([href, label], i) => (
          <li key={label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {href ? (
              <a href={href} className="inline-flex min-h-11 items-center text-muted no-underline hover:text-primary">
                {label}
              </a>
            ) : (
              <span aria-current="page" className="text-ink">
                {label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function PageHead({ trail, eyebrow, title, lead, children }) {
  return (
    <section className="pb-12 pt-8 sm:pt-12 lg:pb-16 lg:pt-16">
      <div className={`${wrap} grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-16`}>
        <div className="min-w-0 max-w-[48rem]">
          <Crumbs trail={trail} />
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="break-words font-heading text-[clamp(2.75rem,1.5rem+5vw,5.75rem)] font-normal leading-[1] tracking-[-0.025em] [text-wrap:balance]">
            {title}
          </h1>
          {lead && <p className="mt-6 max-w-[40rem] text-[17px] leading-[1.65] text-muted sm:text-[19px]">{lead}</p>}
        </div>
        {children && <div className="grid gap-3 sm:flex sm:flex-wrap lg:grid lg:justify-items-stretch">{children}</div>}
      </div>
    </section>
  );
}

function CategoryTile({ c, big, wide }) {
  return (
    <a href={`/flooring/${c.slug}`} className="group block text-ink no-underline">
      <span className={`block overflow-hidden bg-surface ${big ? 'aspect-[3/2] sm:aspect-[4/3] lg:aspect-[7/5]' : 'aspect-[3/2] sm:aspect-[4/3]'} ${wide ? 'md:aspect-[5/2] lg:aspect-[4/3]' : ''}`}>
        <Img
          src={c.texture}
          alt={c.textureAlt || ''}
          sizes={big ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </span>
      <span className="mt-5 flex items-end justify-between gap-4">
        <span className="min-w-0">
          <span className={`block font-heading leading-tight ${big ? 'text-[clamp(1.75rem,1.4rem+1vw,2.25rem)]' : 'text-[clamp(1.6rem,1.4rem+0.6vw,1.9rem)]'}`}>
            {c.title}
          </span>
          {c.short && <span className="mt-1.5 block text-[16px] leading-snug text-muted">{c.short}</span>}
        </span>
        <span className="grid size-11 flex-none place-items-center rounded-full border border-line text-primary transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-white">
          <ArrowRight size={18} aria-hidden="true" />
        </span>
      </span>
    </a>
  );
}

/** Tiles on a six-column grid: the leftovers of three run large, the rest three to a row. */
function CategoryGrid({ cats }) {
  const n = cats.length;
  const bigCount = n === 1 ? 1 : n % 3 === 2 ? 2 : n % 3 === 1 ? 4 : 0;
  return (
    <ul className="m-0 grid list-none gap-x-6 gap-y-12 p-0 md:grid-cols-2 lg:grid-cols-6 lg:gap-y-14">
      {cats.map((c, i) => {
        const big = i < bigCount;
        const wide = n % 2 === 1 && i === n - 1 && n > 1;
        const span = n === 1 ? 'md:col-span-2 lg:col-span-6' : `${wide ? 'md:col-span-2' : ''} ${big ? 'lg:col-span-3' : 'lg:col-span-2'}`;
        return (
          <li key={c.slug} className={span}>
            <CategoryTile c={c} big={big} wide={wide} />
          </li>
        );
      })}
    </ul>
  );
}

function Process({ b, cta = true }) {
  if (!b.process?.length) return null;
  return (
    <section className={`bg-primary-deep text-white ${pad}`} aria-labelledby="process-title">
      <div className={wrap}>
        <div className="mb-12 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow dark>How it works</Eyebrow>
            <h2 id="process-title" className={h2}>
              {b.process.map((s, i) => (i ? s.title.toLowerCase() : s.title)).join(', ')}.
            </h2>
          </div>
          {cta && (
            <a href="/estimate" className={`${light} self-start lg:self-auto`}>
              Book a Free Estimate
            </a>
          )}
        </div>
        <ol className="m-0 grid list-none gap-10 p-0 md:grid-cols-3 md:gap-0">
          {b.process.map((s, i) => (
            <li key={s.title} className={`border-t border-white/20 pt-7 md:pt-9 ${i ? 'md:pl-10' : ''} ${i < b.process.length - 1 ? 'md:pr-10' : ''}`}>
              <span className="block font-heading text-[clamp(3rem,2.4rem+2vw,4.5rem)] italic leading-none text-accent">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 font-heading text-[28px] font-normal leading-tight">{s.title}</h3>
              <p className="mt-3 max-w-[22rem] text-[17px] leading-[1.65] text-white/75">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function GalleryWall({ items, cats, filter = 'all', sizes }) {
  const label = Object.fromEntries(cats.map((c) => [c.slug, c.title]));
  return (
    <div className="columns-2 gap-3 sm:gap-5 lg:columns-3 lg:gap-6">
      {items.map((g, i) => (
        <figure
          key={g.image}
          hidden={filter !== 'all' && g.category !== filter}
          className="m-0 mb-6 break-inside-avoid sm:mb-8"
        >
          <div className={`overflow-hidden bg-surface ${MASONRY[i % MASONRY.length]}`}>
            <Img src={g.image} alt={g.alt || ''} sizes={sizes} className="h-full w-full object-cover" />
          </div>
          {(g.title || label[g.category]) && (
            <figcaption className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              {g.title && <span className="text-[16px] font-medium leading-snug">{g.title}</span>}
              {label[g.category] && (
                <span className="flex-none text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">{label[g.category]}</span>
              )}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

function Reviews({ b }) {
  const reviews = Array.isArray(b.reviews) ? b.reviews.filter((r) => r?.text) : [];
  if (!reviews.length) return null;
  const [lead, ...rest] = reviews;
  return (
    <section className={`bg-surface ${pad}`} aria-labelledby="reviews-title">
      <div className={wrap}>
        <div className="mb-12 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[40rem]">
            <Eyebrow>Reviews</Eyebrow>
            <h2 id="reviews-title" className={h2}>
              What customers say about their floors.
            </h2>
          </div>
          {b.rating && b.reviewCount && (
            <div className="flex items-center gap-4">
              <strong className="font-heading text-[64px] font-normal leading-none">{Number(b.rating).toFixed(1)}</strong>
              <span className="grid gap-1.5">
                <Stars value={b.rating} size={18} />
                <span className="text-[15px] font-medium text-muted">{b.reviewCount.toLocaleString()} Google reviews</span>
              </span>
            </div>
          )}
        </div>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
          <figure className="m-0">
            <span aria-hidden="true" className="block h-12 overflow-hidden font-heading text-[96px] leading-[0.95] text-accent">
              &ldquo;
            </span>
            <blockquote className="m-0 mt-2 font-heading text-[clamp(1.4rem,1.1rem+1.1vw,2rem)] leading-[1.4]">{lead.text}</blockquote>
            {lead.author && (
              <figcaption className="mt-6 text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">{lead.author}</figcaption>
            )}
          </figure>
          {rest.length > 0 && (
            <div>
              {rest.slice(0, 3).map((r) => (
                <figure key={r.text} className="m-0 border-t border-ink/15 py-7 first:pt-7">
                  <Stars value={5} size={14} />
                  <blockquote className="m-0 mt-3 text-[17px] leading-[1.65]">{r.text}</blockquote>
                  {r.author && (
                    <figcaption className="mt-3 text-[14px] font-semibold uppercase tracking-[0.1em] text-muted">{r.author}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EstimateBand({ b }) {
  const tel = telHref(b.phone);
  const area = b.serviceArea?.length ? b.serviceArea : null;
  return (
    <section className={pad} aria-labelledby="estimate-band">
      <div className={wrap}>
      <div className="grid gap-10 border-t border-line pt-[clamp(3rem,7vw,5.5rem)] lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-20">
        <div className="max-w-[42rem]">
          <Eyebrow>Free estimate</Eyebrow>
          <h2 id="estimate-band" className={h2}>
            {b.estimate?.title || 'Get a free estimate.'}
          </h2>
          {b.estimate?.text && <p className="mt-5 text-[17px] leading-[1.65] text-muted sm:text-[18px]">{b.estimate.text}</p>}
          {area && (
            <p className="mt-5 flex gap-2.5 text-[16px] leading-relaxed text-muted">
              <MapPin size={18} className="mt-1 flex-none text-primary" aria-hidden="true" />
              <span>
                Installing in {area.slice(0, -1).join(', ')}
                {area.length > 1 ? ` and ${area[area.length - 1]}` : area[0]}.
              </span>
            </p>
          )}
        </div>
        <div className="grid gap-3 sm:flex sm:flex-wrap lg:grid">
          <a href="/estimate" className={solid}>
            Book a Free Estimate <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a href={tel} className={outline}>
            <Phone size={17} aria-hidden="true" /> Call {b.phone}
          </a>
        </div>
      </div>
      </div>
    </section>
  );
}

function Footer({ b, cats }) {
  const tel = telHref(b.phone);
  return (
    <footer className="bg-primary-deep text-white/80">
      <Facts b={b} />
      <div className={`${wrap} grid gap-12 pb-12 pt-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1fr_1.25fr] lg:gap-12`}>
        <div className="grid content-start gap-5">
          {b.brand.logo ? (
            <a href="/" className="inline-flex w-fit bg-cream px-4 py-3" aria-label={`${b.name} home`}>
              <BrandMark b={b} className="max-h-12" />
            </a>
          ) : (
            <a href="/" className="flex min-h-11 items-center no-underline" aria-label={`${b.name} home`}>
              <BrandMark b={b} light />
            </a>
          )}
          {b.tagline && <p className="m-0 max-w-[22rem] text-[16px] leading-[1.65]">{b.tagline}</p>}
        </div>
        {cats.length > 0 && (
          <div>
            <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-accent">Flooring</h2>
            <ul className="-my-2 m-0 list-none p-0">
              {cats.map((c) => (
                <li key={c.slug}>
                  <a href={`/flooring/${c.slug}`} className="flex min-h-11 items-center text-white/85 no-underline hover:text-white">
                    {c.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-accent">Visit</h2>
          <a href={mapsHref(b)} className="block leading-[1.65] text-white/85 no-underline hover:text-white">
            {b.address}
            <br />
            {b.town}, {b.state} {b.zip}
          </a>
          {b.hours?.length > 0 && (
            <dl className="mt-4 grid gap-1.5">
              {b.hours.map(([d, h]) => (
                <div key={d} className="flex flex-wrap gap-x-2">
                  <dt className="text-white/60">{d}</dt>
                  <dd className="m-0 text-white/90">{h}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div>
          <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-[0.16em] text-accent">Contact</h2>
          <a href={tel} className="flex min-h-11 items-center font-heading text-[24px] text-white no-underline">
            {b.phone}
          </a>
          {b.email && (
            <a href={`mailto:${b.email}`} className="flex min-h-11 items-center text-white/85 no-underline [overflow-wrap:anywhere] hover:text-white">
              {b.email}
            </a>
          )}
          <ul className="m-0 mt-2 list-none p-0">
            {[b.gallery?.length && ['/gallery', 'Gallery'], ['/showroom', 'Showroom'], ['/estimate', 'Free Estimate']]
              .filter(Boolean)
              .map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="flex min-h-11 items-center text-white/85 no-underline hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>
      <div className={wrap}>
        <p className="m-0 border-t border-white/10 py-6 text-[14px] text-white/55">
          &copy; {new Date().getFullYear()} {b.name}
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------- pages */

function Home({ b, cats }) {
  const rating = ratingLine(b);
  const brands = [...new Set(cats.flatMap((c) => c.brands || []))].slice(0, 6);
  const about = b.about;
  const gallery = Array.isArray(b.gallery) ? b.gallery.slice(0, 6) : [];

  return (
    <main>
      <section aria-labelledby="hero-title">
        <div className="relative h-[clamp(300px,72vw,480px)] bg-surface md:h-[min(68vh,620px)] lg:h-[min(76vh,720px)]">
          <Img src={b.hero.image} alt={b.hero.imageAlt || ''} sizes="100vw" eager className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className={wrap}>
          <div className="relative -mt-16 grid gap-8 sm:-mt-28 lg:-mt-60 lg:grid-cols-[minmax(0,44rem)_minmax(0,1fr)] lg:items-end lg:gap-14">
            <div className="bg-cream px-5 pb-8 pt-7 shadow-[0_40px_70px_-50px_rgba(0,0,0,0.45)] sm:p-10 lg:p-14">
              {b.hero.eyebrow && <Eyebrow>{b.hero.eyebrow}</Eyebrow>}
              <h1
                id="hero-title"
                className="break-words font-heading text-[clamp(2.2rem,1.35rem+3.4vw,4.1rem)] font-normal leading-[1.05] tracking-[-0.02em] [text-wrap:balance]"
              >
                {b.hero.title}
              </h1>
              <p className="mt-5 max-w-[36rem] text-[17px] leading-[1.65] text-muted sm:text-[19px]">{b.hero.lead}</p>
              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
                <a href="/estimate" className={solid}>
                  Book a Free Estimate
                </a>
                {cats.length > 0 && (
                  <a href="/flooring" className={outline}>
                    Browse Flooring
                  </a>
                )}
              </div>
            </div>
            {(rating || brands.length > 0) && (
              <div className="grid gap-4 pb-2 lg:pb-14">
                {rating && (
                  <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-[16px] font-medium">
                    <Stars value={b.rating} size={17} /> <span>{rating}</span>
                  </p>
                )}
                {brands.length > 0 && (
                  <p className="m-0 max-w-[30rem] font-heading text-[20px] italic leading-[1.5] text-muted">
                    <span className="sr-only">Brands we carry: </span>
                    {brands.join(' · ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {cats.length > 0 && (
        <section className={pad} aria-labelledby="floors-title">
          <div className={wrap}>
            <div className="mb-12 flex flex-col gap-5 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[40rem]">
                <Eyebrow>Shop by floor</Eyebrow>
                <h2 id="floors-title" className={h2}>
                  The floors we sell and install.
                </h2>
              </div>
              <a href="/flooring" className="inline-flex min-h-11 items-center gap-2 text-[16px] font-semibold text-primary no-underline hover:underline">
                All Flooring <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
            <CategoryGrid cats={cats} />
          </div>
        </section>
      )}

      <Process b={b} />

      {about && (
        <section className={pad} aria-labelledby="about-title">
          <div className={`${wrap} grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20`}>
            <div className="overflow-hidden bg-surface">
              <Img
                src={about.image}
                alt={about.imageAlt || ''}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="aspect-[4/3] h-full w-full object-cover md:aspect-[4/5]"
              />
            </div>
            <div className="min-w-0">
              {about.eyebrow && <Eyebrow>{about.eyebrow}</Eyebrow>}
              <h2 id="about-title" className={h2}>
                {about.title}
              </h2>
              {paragraphs(about.text)
                .slice(0, 1)
                .map((p) => (
                  <p key={p} className="mt-5 text-[17px] leading-[1.7] text-muted sm:text-[18px]">
                    {p}
                  </p>
                ))}
              {about.points?.length > 0 && (
                <ul className="m-0 mt-8 list-none p-0">
                  {about.points.map((p) => (
                    <li key={p} className="flex items-center gap-3.5 border-t border-line py-3.5 text-[17px] font-medium">
                      <span aria-hidden="true" className="h-px w-4 flex-none bg-accent" />
                      {p}
                    </li>
                  ))}
                </ul>
              )}
              <a href="/showroom" className={`${outline} mt-8`}>
                Visit the Showroom
              </a>
            </div>
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section className={`${pad} pt-0`} aria-labelledby="gallery-title">
          <div className={wrap}>
            <div className="mb-10 flex flex-col gap-5 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-[40rem]">
                <Eyebrow>Gallery</Eyebrow>
                <h2 id="gallery-title" className={h2}>
                  Rooms we have finished.
                </h2>
              </div>
              <a href="/gallery" className="inline-flex min-h-11 items-center gap-2 text-[16px] font-semibold text-primary no-underline hover:underline">
                See the Gallery <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
            <GalleryWall items={gallery} cats={cats} sizes="(max-width: 1024px) 50vw, 33vw" />
          </div>
        </section>
      )}

      <Reviews b={b} />
      <EstimateBand b={b} />
    </main>
  );
}

function FlooringIndex({ b, cats }) {
  return (
    <main>
      <PageHead
        trail={[['/', 'Home'], [null, 'Flooring']]}
        title="Flooring"
        lead={`${cats.map((c) => c.title).join(', ').replace(/, ([^,]*)$/, ' and $1')}, sold and installed by ${b.shortName || b.name}.`}
      >
        <a href="/estimate" className={solid}>
          Book a Free Estimate
        </a>
      </PageHead>
      <div className={`${wrap} grid gap-[clamp(4rem,9vw,7rem)] pb-[clamp(4rem,9vw,7rem)]`}>
        {cats.map((c, i) => (
          <article key={c.slug} className="grid items-center gap-8 border-t border-line pt-10 md:grid-cols-2 lg:gap-20 lg:pt-14">
            <a href={`/flooring/${c.slug}`} className={`relative block ${i % 2 ? 'md:order-2' : ''}`} tabIndex={-1} aria-hidden="true">
              <span className="block overflow-hidden bg-surface">
                <Img src={c.image} alt="" sizes="(max-width: 768px) 100vw, 50vw" className="aspect-[4/3] w-full object-cover" />
              </span>
              <span className="absolute -bottom-6 right-4 block w-[28%] min-w-[96px] bg-cream p-2 sm:right-6 sm:p-2.5">
                <Img src={c.texture} alt="" sizes="160px" className="aspect-square w-full object-cover" />
              </span>
            </a>
            <div className="min-w-0 pt-4 md:pt-0">
              <span className="block font-heading text-[18px] italic text-accent">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="mt-2 font-heading text-[clamp(2.2rem,1.6rem+2vw,3.4rem)] font-normal leading-[1.05] tracking-[-0.015em]">
                <a href={`/flooring/${c.slug}`} className="text-ink no-underline hover:text-primary">
                  {c.title}
                </a>
              </h2>
              <p className="mt-4 text-[17px] leading-[1.7] text-muted sm:text-[18px]">{c.text || c.short}</p>
              {c.brands?.length > 0 && (
                <p className="mt-5 font-heading text-[19px] italic leading-[1.5] text-primary">{c.brands.join(' · ')}</p>
              )}
              <a href={`/flooring/${c.slug}`} className={`${outline} mt-7`}>
                Explore {c.title} <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>
      <Process b={b} />
      <EstimateBand b={b} />
    </main>
  );
}

function Category({ b, cats, c }) {
  const rooms = (b.gallery || []).filter((g) => g.category === c.slug);
  const others = cats.filter((o) => o.slug !== c.slug);
  return (
    <main>
      <PageHead trail={[['/', 'Home'], ['/flooring', 'Flooring'], [null, c.title]]} title={c.title} lead={c.text || c.short}>
        <a href="/estimate" className={solid}>
          Book a Free Estimate
        </a>
        {rooms.length > 0 && (
          <a href="#rooms" className={outline}>
            See {c.title} Rooms
          </a>
        )}
      </PageHead>

      <div className={wrap}>
        <figure className="relative m-0 pb-14 sm:pb-16">
          <div className="overflow-hidden bg-surface">
            <Img src={c.image} alt={c.imageAlt || ''} sizes="(max-width: 1320px) 100vw, 1320px" eager className="aspect-[4/3] w-full object-cover md:aspect-[2/1]" />
          </div>
          <div className="absolute bottom-0 right-3 w-[38%] max-w-[230px] bg-cream p-2.5 sm:right-8 sm:p-3.5">
            <Img src={c.texture} alt={c.textureAlt || ''} sizes="230px" className="aspect-square w-full object-cover" />
          </div>
        </figure>
      </div>

      {c.features?.length > 0 && (
        <section className="pb-[clamp(4rem,9vw,7rem)] pt-[clamp(2.5rem,5vw,4rem)]" aria-labelledby="why-title">
          <div className={wrap}>
            <Eyebrow>
              <span id="why-title">Why {c.title.toLowerCase()}</span>
            </Eyebrow>
            <ul className="m-0 mt-8 grid list-none gap-8 p-0 md:grid-cols-3 md:gap-10">
              {c.features.slice(0, 3).map((f) => (
                <li key={f.title} className="border-t border-ink/15 pt-6">
                  <h2 className="font-heading text-[26px] font-normal leading-tight sm:text-[28px]">{f.title}</h2>
                  <p className="mt-3 text-[17px] leading-[1.65] text-muted">{f.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {c.brands?.length > 0 && (
        <section className="bg-surface py-[clamp(3rem,7vw,4.5rem)]" aria-labelledby="brands-title">
          <div className={`${wrap} grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-center lg:gap-16`}>
            <div>
              <Eyebrow>In the showroom</Eyebrow>
              <h2 id="brands-title" className="font-heading text-[clamp(1.75rem,1.4rem+1.2vw,2.25rem)] font-normal leading-tight">
                {c.title} brands we carry
              </h2>
            </div>
            <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0 font-heading text-[clamp(1.35rem,1.1rem+1vw,2rem)] italic text-primary">
              {c.brands.map((name, i) => (
                <li key={name} className="flex items-center gap-6">
                  {name}
                  {i < c.brands.length - 1 && (
                    <span aria-hidden="true" className="text-accent">
                      &middot;
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {rooms.length > 0 && (
        <section id="rooms" className={`${pad} scroll-mt-28`} aria-labelledby="rooms-title">
          <div className={wrap}>
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Eyebrow>Finished rooms</Eyebrow>
                <h2 id="rooms-title" className={h2}>
                  {c.title} we have installed.
                </h2>
              </div>
              <a href="/gallery" className="inline-flex min-h-11 items-center gap-2 text-[16px] font-semibold text-primary no-underline hover:underline">
                Full Gallery <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
            <div className="grid gap-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-6">
              {rooms.slice(0, 2).map((g) => (
                <figure key={g.image} className="m-0">
                  <div className="overflow-hidden bg-surface">
                    <Img src={g.image} alt={g.alt || ''} sizes="(max-width: 768px) 100vw, 60vw" className="aspect-[4/3] w-full object-cover md:aspect-auto md:h-[clamp(320px,38vw,520px)]" />
                  </div>
                  {g.title && <figcaption className="mt-3 text-[16px] font-medium">{g.title}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section className={`${rooms.length ? 'pb-[clamp(3rem,7vw,5rem)]' : 'pb-[clamp(3rem,7vw,5rem)] pt-4'}`} aria-labelledby="others-title">
          <div className={wrap}>
            <h2 id="others-title" className="mb-6 font-heading text-[clamp(1.6rem,1.3rem+1vw,2.1rem)] font-normal">
              Other floors we carry
            </h2>
            <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {others.map((o) => (
                <li key={o.slug}>
                  <a
                    href={`/flooring/${o.slug}`}
                    className="group flex items-center gap-4 border border-line p-2.5 pr-4 text-ink no-underline transition-colors hover:border-primary"
                  >
                    <span className="block size-16 flex-none overflow-hidden bg-surface">
                      <Img src={o.texture} alt="" sizes="64px" className="h-full w-full object-cover" />
                    </span>
                    <span className="min-w-0 flex-1 font-heading text-[21px] leading-tight">{o.title}</span>
                    <ArrowUpRight size={18} className="flex-none text-primary" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <EstimateBand b={b} />
    </main>
  );
}

function Gallery({ b, cats }) {
  const [filter, setFilter] = useState('all');
  const items = b.gallery || [];
  const used = cats.filter((c) => items.some((g) => g.category === c.slug));
  return (
    <main>
      <PageHead
        trail={[['/', 'Home'], [null, 'Gallery']]}
        title="Gallery"
        lead={`Kitchens, baths, bedrooms and whole floors finished by ${b.shortName || b.name}.`}
      />
      <div className={`${wrap} pb-[clamp(3rem,7vw,5rem)]`}>
        {used.length > 1 && (
          <div role="group" aria-label="Show rooms by floor" className="-mx-1 mb-10 flex flex-wrap gap-2">
            {[{ slug: 'all', title: 'All Rooms' }, ...used].map((c) => (
              <button
                key={c.slug}
                type="button"
                aria-pressed={filter === c.slug}
                onClick={() => setFilter(c.slug)}
                className={`min-h-11 cursor-pointer rounded-full border px-5 text-[15px] font-medium transition-colors ${
                  filter === c.slug ? 'border-ink bg-ink text-cream' : 'border-line bg-transparent text-ink hover:border-ink'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}
        <GalleryWall items={items} cats={cats} filter={filter} sizes="(max-width: 1024px) 50vw, 33vw" />
      </div>
      <EstimateBand b={b} />
    </main>
  );
}

function Showroom({ b }) {
  const about = b.about;
  const tel = telHref(b.phone);
  return (
    <main>
      <PageHead
        trail={[['/', 'Home'], [null, 'Showroom']]}
        eyebrow={about?.eyebrow}
        title={about?.title || `Visit ${b.shortName || b.name}`}
        lead={`${b.address}, ${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`}
      >
        <a href={mapsHref(b)} className={solid}>
          <MapPin size={17} aria-hidden="true" /> Get Directions
        </a>
        <a href={tel} className={outline}>
          <Phone size={17} aria-hidden="true" /> {b.phone}
        </a>
      </PageHead>

      <div className={`${wrap} grid gap-12 pb-[clamp(4rem,9vw,7rem)] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-20`}>
        <div className="min-w-0">
          {about?.image && (
            <div className="overflow-hidden bg-surface">
              <Img src={about.image} alt={about.imageAlt || ''} sizes="(max-width: 1024px) 100vw, 55vw" eager className="aspect-[4/3] w-full object-cover" />
            </div>
          )}
          {paragraphs(about?.text).map((p) => (
            <p key={p} className="mt-6 text-[17px] leading-[1.75] text-muted first:mt-10 sm:text-[18px]">
              {p}
            </p>
          ))}
          {about?.points?.length > 0 && (
            <ul className="m-0 mt-8 grid list-none gap-x-8 p-0 sm:grid-cols-2">
              {about.points.map((p) => (
                <li key={p} className="flex items-center gap-3 border-t border-line py-3.5 text-[17px] font-medium">
                  <Check size={17} className="flex-none text-primary" aria-hidden="true" />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="self-start bg-surface p-6 sm:p-9 lg:sticky lg:top-[156px]" aria-label="Visit">
          <h2 className="font-heading text-[30px] font-normal leading-tight">Plan a visit</h2>
          <ul className="m-0 mt-6 grid list-none gap-1 p-0">
            {[
              [MapPin, mapsHref(b), `${b.address}, ${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`],
              [Phone, tel, b.phone],
              b.email && [Mail, `mailto:${b.email}`, b.email],
            ]
              .filter(Boolean)
              .map(([Icon, href, label]) => (
                <li key={href}>
                  <a href={href} className="flex min-h-11 items-start gap-3 py-1.5 text-[16px] font-medium text-ink no-underline hover:text-primary">
                    <Icon size={18} className="mt-0.5 flex-none text-primary" aria-hidden="true" />
                    <span className="min-w-0 break-words">{label}</span>
                  </a>
                </li>
              ))}
          </ul>
          {b.hours?.length > 0 && (
            <table className="mt-6 w-full border-collapse text-[16px]">
              <caption className="mb-2 flex items-center gap-2 text-left text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
                <Clock size={14} aria-hidden="true" /> Showroom Hours
              </caption>
              <tbody>
                {b.hours.map(([d, h]) => (
                  <tr key={d} className="border-t border-ink/10">
                    <th scope="row" className="py-3 pr-4 text-left font-normal text-muted">
                      {d}
                    </th>
                    <td className="py-3 text-right font-medium">{h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <a href={mapsHref(b)} className={`${outline} mt-7 w-full`}>
            Open in Google Maps <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </aside>
      </div>

      <Process b={b} />
      <Reviews b={b} />
      <EstimateBand b={b} />
    </main>
  );
}

function Estimate({ b, cats }) {
  const tel = telHref(b.phone);
  return (
    <main>
      <PageHead
        trail={[['/', 'Home'], [null, 'Free Estimate']]}
        title={b.estimate?.title || 'Get a free estimate.'}
        lead={b.estimate?.text}
      />
      <div className={`${wrap} grid items-start gap-12 pb-[clamp(4rem,9vw,7rem)] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-20`}>
        <div className="bg-white/70 p-5 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.4)] ring-1 ring-line sm:p-9 lg:p-11">
          <h2 className="mb-7 font-heading text-[28px] font-normal leading-tight">Tell us about the project</h2>
          <EnquiryForm
            b={{ ...b, shortName: b.shortName || b.name }}
            submitLabel="Request My Estimate"
            styles={{
              form: '',
              label: 'text-[15px] font-medium text-ink',
              field:
                'min-h-[50px] rounded-none border border-ink/20 bg-cream px-3.5 py-3 text-[16px] font-normal text-ink focus:border-primary focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-primary/30',
              button: `${solid} w-full border-0`,
              done: 'py-6 text-[17px] leading-relaxed',
            }}
            fields={[
              { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
              { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
              { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
              { name: 'address', label: 'Project Address', autoComplete: 'street-address' },
              {
                name: 'floor',
                label: 'Floor Type',
                type: 'select',
                required: true,
                options: [...cats.map((c) => c.title), 'Not sure yet'],
              },
              {
                name: 'size',
                label: 'How Much Floor?',
                type: 'select',
                options: ['One room', 'Two or three rooms', 'A whole floor', 'The whole house'],
              },
              { name: 'details', label: 'Anything Else?', type: 'textarea', wide: true },
            ]}
          />
        </div>
        <aside className="grid gap-10" aria-label="What happens next">
          {b.process?.length > 0 && (
            <div>
              <Eyebrow>What happens next</Eyebrow>
              <ol className="m-0 list-none p-0">
                {b.process.map((s, i) => (
                  <li key={s.title} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-3 border-t border-line py-5">
                    <span className="font-heading text-[30px] italic leading-none text-accent">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="block font-heading text-[22px] leading-tight">{s.title}</span>
                      <span className="mt-1.5 block text-[16px] leading-[1.6] text-muted">{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className="bg-primary-deep p-6 text-white sm:p-8">
            <p className="m-0 text-[15px] text-white/75">Rather talk it through?</p>
            <a href={tel} className="mt-1 flex min-h-11 items-center font-heading text-[30px] text-white no-underline">
              {b.phone}
            </a>
            {b.hours?.[0] && (
              <p className="m-0 mt-2 text-[16px] text-white/75">
                {b.hours[0][0]} {b.hours[0][1]}
              </p>
            )}
            <a href="/showroom" className="mt-4 inline-flex min-h-11 items-center gap-2 text-[16px] font-medium text-white underline-offset-4 hover:underline">
              Or visit the showroom <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </aside>
      </div>
      <Reviews b={b} />
    </main>
  );
}

/* -------------------------------------------------------------------- root */

export default function Flooring({ b, path = '' }) {
  const cats = categoriesOf(b);
  const parts = path.split('/');
  const cat = parts[0] === 'flooring' && parts[1] ? cats.find((c) => c.slug === parts[1]) : null;

  let page;
  let current = '';
  if (cat) {
    page = <Category b={b} cats={cats} c={cat} />;
    current = `flooring/${cat.slug}`;
  } else if (path === 'flooring' && cats.length) {
    page = <FlooringIndex b={b} cats={cats} />;
    current = 'flooring';
  } else if (path === 'gallery' && b.gallery?.length) {
    page = <Gallery b={b} cats={cats} />;
    current = 'gallery';
  } else if (path === 'showroom') {
    page = <Showroom b={b} />;
    current = 'showroom';
  } else if (path === 'estimate') {
    page = <Estimate b={b} cats={cats} />;
    current = 'estimate';
  } else {
    page = <Home b={b} cats={cats} />;
  }

  return (
    <div className="overflow-x-clip bg-cream font-body text-[16px] text-ink antialiased sm:text-[17px]" style={{ ...DEFAULT_TOKENS, ...brandVars(b.brand) }}>
      <Header b={b} cats={cats} current={current} />
      {page}
      <Footer b={b} cats={cats} />
    </div>
  );
}
