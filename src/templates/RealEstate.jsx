import { useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Bath,
  BedDouble,
  Building2,
  Clock,
  Hash,
  Home,
  KeyRound,
  Mail,
  MapPin,
  Menu,
  Palette,
  Phone,
  Ruler,
  Search,
  Star,
  Waves,
  X,
} from 'lucide-react';
import { brandVars, mapsHref, ratingLine, telHref } from '../site.js';
import { EnquiryForm, Img, Stars, Facts } from './shared.jsx';

const U = 'https://images.unsplash.com/';
const SAMPLE_LISTINGS = [
  { img: `${U}photo-1580587771525-78b9dba3b914`, price: 489000, street: '2214 Bayou Bend Ct', beds: 4, baths: 3, sqft: 2860, tag: 'New Listing' },
  { img: `${U}photo-1605276374104-dee2a0ed3cd6`, price: 325000, street: '508 Oakmont Dr', beds: 3, baths: 2, sqft: 1940, tag: 'Open House' },
  { img: `${U}photo-1564013799919-ab600027ffc6`, price: 615000, street: '17 Cedar Point Rd', beds: 5, baths: 4, sqft: 3420, tag: 'Waterfront' },
  { img: `${U}photo-1570129477492-45c003edd2be`, price: 274900, street: '1103 Pecan St', beds: 3, baths: 2, sqft: 1610, tag: 'Price Improved' },
  { img: `${U}photo-1628624747186-a941c476b7ef`, price: 398500, street: '4410 Lakeshore Ln', beds: 4, baths: 2.5, sqft: 2380, tag: 'New Listing' },
  { img: `${U}photo-1605146769289-440113cc3d00`, price: 352000, street: '92 Magnolia Way', beds: 3, baths: 2.5, sqft: 2105, tag: 'Open House' },
];
const DIVISION_ICONS = [Search, Home, KeyRound, Mail, Palette, Waves, Building2];
const NAV = [
  ['#services', 'Services'],
  ['#listings', 'Listings'],
  ['#about', 'About'],
  ['#areas', 'Areas'],
  ['#contact', 'Contact'],
];
const XL_COLS = ['', 'xl:grid-cols-1', 'xl:grid-cols-2', 'xl:grid-cols-3', 'xl:grid-cols-4'];

const money = (n) => `$${n.toLocaleString('en-US')}`;
const deep = 'bg-[color-mix(in_srgb,var(--primary)_78%,#000)]';
const wrap = 'mx-auto w-full max-w-page px-gutter';
const pad = 'py-[clamp(4rem,9vw,7rem)]';
const anchor = 'scroll-mt-[124px]';
const h2 = 'font-heading text-[clamp(1.85rem,1.3rem+2.2vw,2.75rem)] font-normal leading-[1.15] text-balance';
const btn =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-6 text-[15px] font-semibold no-underline transition-colors';
const btnSolid = `${btn} bg-primary text-white hover:bg-[color-mix(in_srgb,var(--primary)_82%,#000)]`;
const btnLine = `${btn} border border-primary/30 text-primary hover:border-primary hover:bg-primary/5`;
const btnLight = `${btn} bg-white text-primary hover:bg-cream`;
const btnGhost = `${btn} border border-white/35 text-white hover:border-white hover:bg-white/10`;

function Eyebrow({ children, dark = false }) {
  return (
    <p
      className={`mb-4 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.18em] ${dark ? 'text-white/80' : 'text-primary'}`}
    >
      <span aria-hidden="true" className="h-px w-8 flex-none bg-accent" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/** The logo sized by height, so square, wide and stacked marks all sit the same in the bar. */
function BrandMark({ b, className = '' }) {
  if (b.brand.logo) {
    return (
      <img
        className={`block h-auto w-auto ${className}`}
        src={b.brand.logo}
        alt={b.name}
        style={{ maxWidth: `min(${b.brand.logoWidth || 220}px, 100%)` }}
      />
    );
  }
  return <span className="block font-heading text-xl font-semibold leading-tight text-white sm:text-2xl">{b.shortName}</span>;
}

export default function RealEstate({ b }) {
  const tel = telHref(b.phone);
  const rating = ratingLine(b);
  const hours = Array.isArray(b.hours) ? b.hours : [];
  const reviews = Array.isArray(b.reviews) ? b.reviews : [];
  const areas = Array.isArray(b.areas) ? b.areas : [];
  const address = `${b.address}, ${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  // 'none' is a business that does not sell homes - a vacation rental manager,
  // an apartment locator, a cash buyer - so it gets no homes for sale, no home
  // search and no link to either.
  const hasListings = b.listings !== 'none';
  const nav = hasListings ? NAV : NAV.filter(([href]) => href !== '#listings');
  const toAreas = hasListings ? '#listings' : '#contact';
  const tags = ['All', ...new Set(SAMPLE_LISTINGS.map((l) => l.tag))];
  const listings = filter === 'All' ? SAMPLE_LISTINGS : SAMPLE_LISTINGS.filter((l) => l.tag === filter);
  const featured = b.divisions.filter((d) => d.image);
  const others = b.divisions.filter((d) => !d.image);
  const showReviews = reviews.length > 0 || Boolean(rating);

  const trust = [
    rating && [Star, rating],
    b.strapline && [BadgeCheck, b.strapline],
    hours[0] && [Clock, `${hours[0][0]}  ${hours[0][1]}`],
    b.mlsId && [Hash, `MLS ID #${b.mlsId}`],
    areas.length > 1 && [MapPin, `${areas.length} communities served`],
  ]
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="bg-white font-body text-base text-ink antialiased" style={brandVars(b.brand)}>
      <div className={`${deep} hidden text-[13px] text-white/85 lg:block`}>
        <div className={`${wrap} flex h-10 items-center justify-between gap-6`}>
          <div className="flex min-w-0 items-center gap-7">
            <span className="flex min-w-0 items-center gap-2">
              <MapPin size={14} className="flex-none text-accent" aria-hidden="true" />
              <span className="truncate">{address}</span>
            </span>
            {hours[0] && (
              <span className="flex flex-none items-center gap-2">
                <Clock size={14} className="text-accent" aria-hidden="true" />
                {hours[0][0]} &nbsp;{hours[0][1]}
              </span>
            )}
          </div>
          <a href={tel} className="flex flex-none items-center gap-2 font-semibold text-white no-underline hover:underline">
            <Phone size={14} className="text-accent" aria-hidden="true" />
            {b.phone}
          </a>
        </div>
      </div>

      <header className={`sticky ${b.preview ? 'top-11' : 'top-0'} z-40 border-b border-white/10 bg-primary text-white`}>
        <div className={`${wrap} flex h-[72px] items-center gap-4 lg:h-20 lg:gap-8`}>
          <a href="#top" className="flex min-h-12 min-w-0 max-w-[58vw] items-center no-underline sm:max-w-[260px]" aria-label={`${b.name} home`}>
            <BrandMark b={b} className="max-h-11 lg:max-h-[52px]" />
          </a>
          <nav aria-label="Main" className="ml-auto hidden items-center gap-6 lg:flex xl:gap-8">
            {nav.map(([href, label]) => (
              <a key={href} href={href} className="inline-flex min-h-11 items-center text-[15px] font-semibold text-white/85 no-underline transition-colors hover:text-white">
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex flex-none items-center gap-2 lg:ml-0 lg:gap-3">
            <a href={tel} className={`${btnGhost} hidden !px-4 xl:inline-flex`}>
              <Phone size={16} aria-hidden="true" /> <span className="whitespace-nowrap">{b.phone}</span>
            </a>
            <a href="#contact" className={`${btnLight} hidden lg:inline-flex`}>
              Get in Touch
            </a>
            <a href={tel} aria-label={`Call ${b.phone}`} className="grid size-11 place-items-center rounded-lg border border-white/35 text-white lg:hidden">
              <Phone size={18} aria-hidden="true" />
            </a>
            <button
              type="button"
              className="grid size-11 cursor-pointer place-items-center rounded-lg border border-white/35 bg-transparent text-white lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div
          id="site-menu"
          hidden={!menuOpen}
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-116px)] overflow-y-auto border-t border-white/10 bg-primary shadow-[0_24px_40px_-20px_rgba(0,0,0,0.5)] lg:hidden"
        >
          <nav aria-label="Mobile" className={`${wrap} grid py-3`}>
            {nav.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-12 items-center justify-between border-b border-white/10 text-lg font-semibold text-white no-underline"
              >
                {label} <ArrowRight size={18} className="text-white/50" aria-hidden="true" />
              </a>
            ))}
            <div className="grid gap-2.5 py-5 sm:grid-cols-2">
              <a href={tel} className={btnGhost} onClick={() => setMenuOpen(false)}>
                <Phone size={16} aria-hidden="true" /> {b.phone}
              </a>
              <a href="#contact" className={btnLight} onClick={() => setMenuOpen(false)}>
                Get in Touch
              </a>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section id="top" className="relative isolate overflow-hidden bg-primary text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(55%_70%_at_88%_8%,color-mix(in_srgb,var(--accent)_24%,transparent),transparent_70%),radial-gradient(45%_60%_at_0%_100%,rgba(0,0,0,0.28),transparent_70%)]"
          />
          <div className={`${wrap} grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-16 lg:pb-24 lg:pt-20`}>
            <div className="min-w-0">
              {b.hero.eyebrow && <Eyebrow dark>{b.hero.eyebrow}</Eyebrow>}
              <h1 className="break-words font-heading text-[clamp(2.15rem,1.35rem+3.4vw,3.6rem)] font-normal leading-[1.1] text-balance lg:text-[clamp(2.6rem,3.7vw,4rem)]">
                {b.hero.title}
              </h1>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/85 sm:text-lg">{b.hero.lead}</p>
              {hasListings && (
              <form
                role="search"
                aria-label="Search homes"
                className="mt-8 grid grid-cols-2 gap-2 rounded-xl bg-white p-2 text-ink shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] sm:grid-cols-[1fr_1fr_auto]"
                onSubmit={(event) => {
                  event.preventDefault();
                  document.getElementById('listings').scrollIntoView();
                }}
              >
                <label className="col-span-2 flex h-[52px] items-center gap-2.5 rounded-lg bg-cream pl-4 text-primary sm:col-span-3">
                  <Search size={18} className="flex-none" aria-hidden="true" />
                  <span className="sr-only">City, neighborhood or ZIP</span>
                  <input
                    className="h-full w-full min-w-0 bg-transparent pr-3 text-base text-ink outline-none placeholder:text-ink/55"
                    placeholder="City, neighborhood or ZIP"
                  />
                </label>
                <select aria-label="Price" defaultValue="" className="h-[52px] min-w-0 rounded-lg bg-cream px-3 text-base text-ink outline-none">
                  <option value="">Any Price</option>
                  <option>Under $300k</option>
                  <option>$300k – $600k</option>
                  <option>$600k – $1M</option>
                  <option>$1M+</option>
                </select>
                <select aria-label="Bedrooms" defaultValue="" className="h-[52px] min-w-0 rounded-lg bg-cream px-3 text-base text-ink outline-none">
                  <option value="">Any Beds</option>
                  <option>2+ Beds</option>
                  <option>3+ Beds</option>
                  <option>4+ Beds</option>
                  <option>5+ Beds</option>
                </select>
                <button type="submit" className={`${btnSolid} col-span-2 h-[52px] cursor-pointer sm:col-span-1`}>
                  <Search size={17} aria-hidden="true" /> Search Homes
                </button>
              </form>
              )}
              {areas.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="mr-1 text-xs font-bold uppercase tracking-[0.16em] text-white/60">Or start in</span>
                  {areas.slice(0, 4).map((a) => (
                    <a
                      key={a}
                      href={toAreas}
                      className="inline-flex min-h-11 items-center rounded-full border border-white/30 px-4 text-sm font-semibold text-white no-underline transition-colors hover:border-white hover:bg-white/10"
                    >
                      {a}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="relative min-w-0 pb-6 lg:pb-0">
              <Img
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)] lg:aspect-[5/6]"
                src={b.hero.image}
                alt={b.hero.imageAlt}
                sizes="(max-width: 1024px) 100vw, 45vw"
                eager
              />
              {(rating || b.strapline) && (
                <div className="absolute bottom-0 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-3.5 rounded-xl bg-white px-4 py-3 text-ink shadow-[0_24px_50px_-20px_rgba(0,0,0,0.55)] sm:left-5 lg:-left-8 lg:bottom-10 lg:px-5 lg:py-4">
                  {rating ? (
                    <>
                      <strong className="font-heading text-[1.75rem] font-bold leading-none text-primary">{Number(b.rating).toFixed(1)}</strong>
                      <span className="grid gap-1">
                        <Stars value={b.rating} size={14} className="text-star" />
                        <span className="text-[13px] text-ink/70">{b.reviewCount.toLocaleString('en-US')} Google reviews</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <BadgeCheck size={22} className="flex-none text-primary" aria-hidden="true" />
                      <span className="text-sm font-semibold">{b.strapline}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {trust.length > 0 && (
          <section aria-label="At a glance" className="border-b border-line">
            <ul className={`mx-auto grid max-w-page gap-px bg-line sm:grid-cols-2 ${XL_COLS[trust.length]}`}>
              {trust.map(([Icon, text]) => (
                <li
                  key={text}
                  className="flex items-center gap-3 bg-white px-gutter py-4 text-[15px] font-semibold sm:justify-center sm:px-5 sm:py-6 sm:text-center sm:[&:last-child:nth-child(odd)]:col-span-2 xl:[&:last-child:nth-child(odd)]:col-span-1"
                >
                  <Icon size={20} className="flex-none text-accent" aria-hidden="true" />
                  <span className="whitespace-pre-wrap">{text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section id="services" className={`${anchor} ${pad}`}>
          <div className={wrap}>
            <div className="mb-[clamp(2.25rem,5vw,3.5rem)] max-w-2xl">
              <Eyebrow>What we do</Eyebrow>
              <h2 className={h2}>Everything a move needs, under one roof.</h2>
            </div>
            {featured.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                {featured.map((d) => (
                  <a key={d.title} href="#contact" className="group flex flex-col overflow-hidden rounded-2xl bg-cream text-ink no-underline">
                    <div className="overflow-hidden">
                      <Img
                        className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                        src={d.image}
                        alt=""
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6 lg:p-8">
                      <h3 className="font-heading text-2xl font-normal leading-snug lg:text-[1.65rem]">{d.title}</h3>
                      <p className="mb-5 mt-3 max-w-lg leading-relaxed text-ink/75">{d.text}</p>
                      <span className="mt-auto inline-flex items-center gap-1.5 font-semibold text-primary">
                        Talk to an Agent <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
            {others.length > 0 && (
              <div className={`mt-6 grid gap-4 sm:grid-cols-2 lg:gap-6 ${XL_COLS[Math.min(others.length, 4)]}`}>
                {others.map((d, i) => {
                  const Icon = DIVISION_ICONS[i % DIVISION_ICONS.length];
                  return (
                    <article key={d.title} className="rounded-2xl border border-line p-6">
                      <span className="grid size-11 place-items-center rounded-xl bg-primary/[0.08] text-primary">
                        <Icon size={22} strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <h3 className="mb-2 mt-5 font-heading text-lg font-normal leading-snug">{d.title}</h3>
                      <p className="leading-relaxed text-ink/75">{d.text}</p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {hasListings && (
        <section id="listings" className={`${anchor} ${pad} bg-cream`}>
          <div className={wrap}>
            <div className="mb-[clamp(2rem,4vw,3rem)] flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <Eyebrow>Featured listings</Eyebrow>
                <h2 className={h2}>Homes for sale near {b.town}</h2>
                {b.preview && <p className="mt-3 text-[15px] text-ink/70">Sample homes. Live MLS listings load here on the finished site.</p>}
              </div>
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter listings">
                {tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={filter === t}
                    onClick={() => setFilter(t)}
                    className={`min-h-11 cursor-pointer rounded-full border px-4 text-sm font-semibold transition-colors ${
                      filter === t ? 'border-primary bg-primary text-white' : 'border-line bg-white text-ink hover:border-primary'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => (
                <article key={l.street} className="group overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                  <div className="relative overflow-hidden">
                    <Img
                      className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      src={l.img}
                      alt={`${l.street}, ${b.town}`}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <span className="absolute left-3.5 top-3.5 rounded-md bg-white px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                      {l.tag}
                    </span>
                  </div>
                  <div className="p-5 lg:p-6">
                    <strong className="block font-heading text-2xl font-bold text-primary">{money(l.price)}</strong>
                    <p className="mt-1 text-[15px] text-ink/70">
                      {l.street}, {b.town}, {b.state}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-4 text-sm">
                      <li className="flex items-center gap-1.5">
                        <BedDouble size={16} className="text-accent" aria-hidden="true" /> {l.beds} Beds
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Bath size={16} className="text-accent" aria-hidden="true" /> {l.baths} Baths
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Ruler size={16} className="text-accent" aria-hidden="true" /> {l.sqft.toLocaleString('en-US')} Sq Ft
                      </li>
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        )}

        <section id="about" className={`${anchor} ${pad}`}>
          <div className={`${wrap} grid items-center gap-[clamp(2.5rem,6vw,5.5rem)] lg:grid-cols-2`}>
            <div className="relative isolate">
              <Img
                className="aspect-[4/3] w-full rounded-2xl object-cover lg:aspect-[5/6]"
                src={b.about.image}
                alt={b.about.imageAlt}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <span aria-hidden="true" className="absolute -bottom-3 -right-3 -z-10 hidden h-2/3 w-2/3 rounded-2xl bg-accent/20 sm:block" />
            </div>
            <div className="min-w-0">
              <Eyebrow>About {b.shortName}</Eyebrow>
              <h2 className={h2}>{b.about.title}</h2>
              <p className="mt-6 text-[17px] leading-[1.75] text-ink/80">{b.about.text}</p>
              <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
                <a href="#contact" className={btnSolid}>
                  Get in Touch
                </a>
                <a href={tel} className={btnLine}>
                  <Phone size={16} aria-hidden="true" /> {b.phone}
                </a>
              </div>
            </div>
          </div>
        </section>

        {areas.length > 0 && (
          <section id="areas" className={`${anchor} pb-[clamp(4rem,9vw,7rem)]`}>
            <div className={wrap}>
              <div className="mb-[clamp(2rem,4vw,3rem)] max-w-2xl">
                <Eyebrow>Where we work</Eyebrow>
                <h2 className={h2}>Homes in and around {b.town}</h2>
              </div>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
                {areas.map((a) => (
                  <li key={a}>
                    <a
                      href={toAreas}
                      className="group flex h-full flex-col justify-between gap-3 rounded-xl border border-line p-4 text-ink no-underline transition-colors hover:border-primary lg:p-5"
                    >
                      <span className="break-words font-heading text-[17px] leading-snug">{a}</span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                        {hasListings ? 'View Homes' : 'Get in Touch'} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {showReviews && (
          <section id="reviews" className={`${anchor} ${reviews.length ? pad : 'py-14 lg:py-16'} bg-primary text-white`}>
            <div className={`${wrap} grid gap-10 ${reviews.length ? 'xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-16' : ''}`}>
              <div className={reviews.length ? '' : 'md:flex md:items-end md:justify-between md:gap-10'}>
                <div>
                  <Eyebrow dark>Client stories</Eyebrow>
                  {rating ? (
                    <div className={`flex flex-wrap items-center gap-x-5 gap-y-3 ${reviews.length ? 'xl:block' : ''}`}>
                      <strong className="font-heading text-[clamp(3.5rem,8vw,5.5rem)] font-light leading-none">{Number(b.rating).toFixed(1)}</strong>
                      <span className={`grid gap-2 ${reviews.length ? 'xl:mt-4' : ''}`}>
                        <Stars value={b.rating} size={20} className="text-star" />
                        <span className="text-white/80">from {b.reviewCount.toLocaleString('en-US')} Google reviews</span>
                      </span>
                    </div>
                  ) : (
                    <h2 className={h2}>What clients say</h2>
                  )}
                </div>
                {rating && (
                  <a href={mapsHref(b)} className={`${btnGhost} mt-7 w-full flex-none sm:w-auto ${reviews.length ? '' : 'md:mt-0'}`}>
                    Read Reviews on Google
                  </a>
                )}
              </div>
              {reviews.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {reviews.map((r) => (
                    <figure
                      key={r.author}
                      className="m-0 flex flex-col rounded-2xl border border-white/15 bg-white/[0.06] p-6 md:[&:last-child:nth-child(odd)]:col-span-2 lg:[&:last-child:nth-child(odd)]:col-span-1"
                    >
                      <Stars value={5} size={14} className="text-star" />
                      <blockquote className="mb-6 mt-4 font-heading text-[17px] font-light leading-[1.65]">&ldquo;{r.text}&rdquo;</blockquote>
                      <figcaption className="mt-auto grid gap-0.5">
                        <strong className="font-semibold">{r.author}</strong>
                        {r.where && <span className="text-sm text-white/70">{r.where}</span>}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section id="contact" className={`${anchor} ${pad} bg-cream`}>
          <div className={wrap}>
            <div className="grid gap-10 rounded-3xl border border-line bg-white p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16 lg:p-14">
              <div className="min-w-0">
                <Eyebrow>Let&rsquo;s talk</Eyebrow>
                <h2 className={h2}>Thinking of buying or selling?</h2>
                <p className="mb-7 mt-4 text-[17px] leading-relaxed text-ink/75">Tell us where you are and where you want to be.</p>
                {[
                  [Phone, tel, b.phone],
                  [Mail, `mailto:${b.email}`, b.email],
                  [MapPin, mapsHref(b), address],
                ].map(([Icon, href, label]) => (
                  <a
                    key={href}
                    href={href}
                    className="flex min-h-12 items-center gap-3 border-t border-line py-3.5 font-semibold text-primary no-underline [overflow-wrap:anywhere] hover:underline"
                  >
                    <Icon size={18} className="flex-none text-accent" aria-hidden="true" /> {label}
                  </a>
                ))}
                {hours.length > 0 && (
                  <div className="mt-5 rounded-xl bg-cream px-5 py-4">
                    <h3 className="mb-2 text-[13px] font-bold uppercase tracking-[0.14em]">Office Hours</h3>
                    <dl className="grid gap-1.5 text-[15px]">
                      {hours.map(([day, time]) => (
                        <div key={day} className="flex justify-between gap-4">
                          <dt>{day}</dt>
                          <dd className="m-0 text-right font-semibold">{time}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <EnquiryForm
                  b={b}
                  submitLabel="Send Message"
                  styles={{
                    form: '',
                    label: 'text-sm font-semibold text-ink',
                    field:
                      'min-h-12 rounded-lg border border-line bg-cream px-3.5 py-3 font-body text-base font-normal text-ink outline-none transition-colors focus:border-primary focus:bg-white',
                    button: `${btnSolid} mt-2 h-14 w-full`,
                    done: 'rounded-xl bg-cream p-6',
                  }}
                  fields={[
                    { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
                    { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
                    { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
                    { name: 'goal', label: 'I Want To', type: 'select', options: ['Buy a home', 'Sell my home', 'Buy and sell', 'Something else'] },
                    { name: 'message', label: 'Message', type: 'textarea', wide: true },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Facts b={b} />
      <footer className={`${deep} pb-28 pt-14 text-[15px] text-white/75 lg:pb-10 lg:pt-20`}>
        <div className={`${wrap} grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.2fr_1.3fr] lg:gap-12`}>
          <div className="min-w-0">
            <a href="#top" className="inline-flex max-w-[240px] no-underline" aria-label={`${b.name} home`}>
              <BrandMark b={b} className="max-h-14" />
            </a>
            {b.strapline && <p className="mt-5 font-semibold text-white">{b.strapline}</p>}
            <p className="mt-2 leading-relaxed">
              {b.address}
              <br />
              {b.town}, {b.state} {b.zip}
            </p>
          </div>
          <nav aria-label="Footer">
            <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.16em] text-white">Explore</h2>
            <ul className="grid gap-1">
              {nav.map(([href, label]) => (
                <li key={href}>
                  <a href={href} className="inline-flex min-h-9 items-center text-white/75 no-underline hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="min-w-0">
            <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.16em] text-white">Contact</h2>
            <ul className="grid gap-1">
              <li>
                <a href={tel} className="inline-flex min-h-9 items-center text-white/75 no-underline hover:text-white">
                  {b.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${b.email}`} className="inline-flex min-h-9 items-center text-white/75 no-underline [overflow-wrap:anywhere] hover:text-white">
                  {b.email}
                </a>
              </li>
            </ul>
          </div>
          {hours.length > 0 && (
            <div>
              <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.16em] text-white">Hours</h2>
              <dl className="grid gap-2">
                {hours.map(([day, time]) => (
                  <div key={day} className="flex flex-wrap justify-between gap-x-4">
                    <dt>{day}</dt>
                    <dd className="m-0 text-white">{time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
        <div className={`${wrap} mt-12`}>
          <div className="flex flex-col gap-2 border-t border-white/15 pt-6 text-[13px] text-white/60 sm:flex-row sm:flex-wrap sm:justify-between">
            <p>
              &copy; {new Date().getFullYear()} {b.name}
              {b.mlsId ? ` · MLS ID #${b.mlsId}` : ''}
            </p>
            <p>Equal Housing Opportunity</p>
          </div>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-2.5 border-t border-line bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 lg:hidden">
        <a href={tel} className={btnLine}>
          <Phone size={16} aria-hidden="true" /> Call
        </a>
        <a href="#contact" className={btnSolid}>
          Get in Touch
        </a>
      </div>
    </div>
  );
}
