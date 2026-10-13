/**
 * Salon: a hair salon or hair studio, drawn light and airy.
 *
 * BRAND FILE (src/brands/<slug>.json). Required fields are marked *, everything
 * else may be left out and its section or line disappears with it.
 *
 *   template*      "salon"
 *   preview        true on a prospect's preview (shows the preview bar); left out on the sample
 *   name*          the business's full name, as on Google ("Willow Room Hair Studio")
 *   shortName*     the name as it is said aloud ("Willow Room"); the wordmark when there is no logo
 *   phone*         "(281) 555-0163"; every call button dials it
 *   texts          true when the salon takes texts on that number; adds Text Us buttons (sms:)
 *   email          shown on the visit section and in the footer
 *   address*       street line, with suite ("4721 Garth Rd, Suite 140")
 *   town*, state*  "Baytown", "TX"
 *   zip            "77521"
 *   rating         Google rating, 4.9; shown only with reviewCount
 *   reviewCount    number of Google reviews, 263
 *   since          year founded, 2014; drawn as a badge on the hero
 *   hours*         [["Tuesday – Thursday", "10 AM – 7 PM"], ...] in display order; closed days as "Closed"
 *   booking        { url*, label } the salon's own online booking page (Vagaro, Square, GlossGenius...).
 *                  With it, every Book button opens that page in a new tab, labelled `label`
 *                  (default "Book Online"). Without it, the buttons are Call to Book and, when
 *                  `texts` is true, Text to Book.
 *   social         { instagram, facebook, tiktok } full profile URLs, any subset;
 *                  handle: "@willowroom.baytown", shown over the photo grid when instagram is set
 *
 *   brand*         colors as hex, fonts as CSS font-family stacks. This template is drawn on a
 *                  light ground, so bg must be light and ink dark.
 *     primary*     buttons and accents; text on it is picked for contrast automatically
 *     primaryDeep  darker primary for italic accents and hovers (default: primary mixed toward black)
 *     accent       soft secondary tone for ornaments and the hero badge (default: primary at 35%)
 *     ink*         body text
 *     muted        secondary text (default: ink at 70%)
 *     bg*          page ground, light ("#fbf7f3")
 *     panel        tinted band behind the menu and footer (default: primary at 8% on bg)
 *     surface      the printed menu card (default: white)
 *     line         hairlines and dotted leaders (default: ink at 14%)
 *     heading*     display serif stack ("'Playfair Display', Georgia, serif")
 *     body*        text sans stack ("'DM Sans', system-ui, sans-serif")
 *     fonts*       Google Fonts stylesheet URL for both faces, including italic for the heading
 *     logo         "/brands/<slug>/logo.webp", or null to set shortName in the heading face
 *     logoWidth    logo width in px in the header, 120-200 (default 160)
 *
 *   hero*          { eyebrow*, title*, titleAccent, lead*, image*, imageAlt*, collage }
 *     title        the headline; titleAccent is set after it in italic on its own line
 *     image        the tall arched photo; "/brands/<slug>/<name>" (with -800/-1600.webp beside it)
 *                  or an images.unsplash.com URL. Portrait or square crops work best.
 *     collage      up to two more photos, [{ image*, alt* }], set beside the arch at different heights
 *
 *   intro          { eyebrow, title*, text*, points, image, imageAlt } the studio, beside a photo.
 *                  points: up to six short facts ("Free color consultations")
 *
 *   menu*          the service menu, grouped. [{ group*, text, image, imageAlt, items* }]
 *     group        "Cut", "Color", "Treatments", "Styling"; Title Case
 *     text         one line under the group heading on the services page
 *     image        a photo for the group on the services page
 *     items        [{ name*, price, from, text, duration }]
 *       price      a number in dollars, only when the salon publishes it; no price draws no price
 *       from       true when price is a starting price ("$65+")
 *       text       one short line describing the service
 *       duration   "60 min", "2 hr", shown on the services page
 *   menuNote       a sentence on how prices work, under the menu
 *   policies       [{ title*, text* }] booking policies, on the services page
 *
 *   stylists       [{ name*, role*, image, imageAlt, bio, specialties }] the team.
 *                  image: a portrait, cropped to an arch; specialties: up to four short tags
 *
 *   gallery        [{ image*, alt* }] square photo grid of recent work, three or six photos
 *                  (drawn in whole rows of three; fewer than three hides it)
 *   reviews*       [{ author*, text* }] Google reviews, verbatim. The first is the pull quote,
 *                  so it should be the strongest; two or four more read best below it.
 *   visitImage     photo beside the visit section (default: hero image)
 *   visitImageAlt
 *
 * PAGES. The home page is always drawn. Two more are drawn when the brand has the content:
 *   /services      when the menu has at least two groups and eight services; the home page then
 *                  shows three services a group and links to the full menu
 *   /stylists      when any stylist has a bio
 */
import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, Mail, MapPin, Menu, MessageCircle, Phone, X } from 'lucide-react';
import { brandVars, mapsHref, ratingLine, telHref } from '../site.js';
import { Img, Stars, Facts, StudioCredit } from './shared.jsx';
import { onColor } from './salon/color.js';
import { SOCIAL } from './salon/icons.jsx';

const wrap = 'mx-auto w-full max-w-page px-gutter';
const pad = 'py-[clamp(4.5rem,10vw,8.5rem)]';
const eyebrow = 'mb-5 text-[13px] font-medium uppercase tracking-[0.22em] text-muted';
const h2 = 'font-heading text-[clamp(2.2rem,1.5rem+2.8vw,3.9rem)] font-normal leading-[1.08] tracking-[-0.01em] [overflow-wrap:anywhere] [text-wrap:balance]';
const btn =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-3 text-[15px] font-medium no-underline transition-colors duration-200';
const solid = `${btn} bg-primary text-[color:var(--on-primary)] hover:bg-primary-deep hover:text-white`;
const ghost = `${btn} border border-ink/25 text-ink hover:border-ink hover:bg-ink/[0.03]`;
const arch = 'rounded-b-[1.75rem] rounded-t-[999px]';
const small = 'text-[12px] font-medium uppercase tracking-[0.2em] text-muted';

const slugify = (s) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const money = (i) => (i.price == null ? null : `$${i.price}${i.from ? '+' : ''}`);

function hasMenuPage(b) {
  return b.menu.length >= 2 && b.menu.reduce((n, g) => n + g.items.length, 0) >= 8;
}

function hasStylistPage(b) {
  return Boolean(b.stylists?.some((s) => s.bio));
}

/** The extra pages this business's site has, beyond the home page. */
export function pages(b) {
  return [hasMenuPage(b) && 'services', hasStylistPage(b) && 'stylists'].filter(Boolean);
}

/** The salon's own wordmark: its logo, or its short name set in the heading face. */
function Wordmark({ b, size = 'header' }) {
  if (b.brand.logo) {
    const w = b.brand.logoWidth || 160;
    return (
      <img
        className="block h-auto max-h-14 max-w-[52vw] object-contain lg:max-h-16"
        src={b.brand.logo}
        alt={b.name}
        style={{ width: size === 'footer' ? Math.round(w * 1.15) : w }}
      />
    );
  }
  const long = b.shortName.length > 16;
  return (
    <span className="grid justify-items-center text-center leading-none">
      <span
        className={`font-heading font-normal tracking-[-0.01em] text-ink ${
          size === 'footer'
            ? 'text-[clamp(2rem,1.4rem+2.4vw,3rem)]'
            : long
              ? 'text-[1.2rem] sm:text-[1.45rem] lg:text-[1.6rem]'
              : 'text-[1.55rem] sm:text-[1.75rem] lg:text-[2rem]'
        }`}
      >
        {b.shortName}
      </span>
      <span
        className={`mt-1 font-body font-medium uppercase text-muted ${
          size === 'footer' ? 'text-[12px] tracking-[0.34em]' : 'text-[9px] tracking-[0.32em] sm:text-[10px]'
        }`}
      >
        {b.town}, {b.state}
      </span>
    </span>
  );
}

/** A line of a printed menu: the name, a dotted leader, the price. */
function Leader({ name, value, nameClass = '', valueClass = '' }) {
  return (
    <span className="flex items-baseline gap-3">
      <span className={`min-w-0 ${nameClass}`}>{name}</span>
      {value != null && (
        <>
          <span aria-hidden="true" className="min-w-6 flex-1 translate-y-[-0.28em] border-b-2 border-dotted border-line" />
          <span className={`flex-none whitespace-nowrap tabular-nums ${valueClass}`}>{value}</span>
        </>
      )}
    </span>
  );
}

function Hours({ hours, className = '' }) {
  return (
    <dl className={`m-0 grid gap-2.5 ${className}`}>
      {hours.map(([d, h]) => (
        <div key={d} className="flex items-baseline gap-3">
          <dt className="min-w-0">{d}</dt>
          <span aria-hidden="true" className="min-w-6 flex-1 translate-y-[-0.28em] border-b-2 border-dotted border-line" />
          <dd className={`m-0 flex-none whitespace-nowrap ${/closed/i.test(h) ? 'text-muted' : ''}`}>{h}</dd>
        </div>
      ))}
    </dl>
  );
}

function Socials({ b, className = '' }) {
  const links = SOCIAL.filter(([key]) => b.social?.[key]);
  if (!links.length) return null;
  return (
    <ul className={`m-0 flex list-none gap-2 p-0 ${className}`}>
      {links.map(([key, label, Mark]) => (
        <li key={key}>
          <a
            href={b.social[key]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${b.shortName} on ${label}`}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 text-ink no-underline transition-colors hover:border-ink"
          >
            <Mark size={18} />
          </a>
        </li>
      ))}
    </ul>
  );
}

function Heading({ kicker, title, text, center = false, as: Tag = 'h2', className = '' }) {
  return (
    <div className={`${center ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      {kicker && <p className={eyebrow}>{kicker}</p>}
      <Tag className={Tag === 'h1' ? 'font-heading text-[clamp(2.6rem,1.6rem+4vw,5.25rem)] font-normal leading-[1.04] tracking-[-0.015em] [text-wrap:balance]' : h2}>
        {title}
      </Tag>
      {text && <p className={`mt-6 text-lg leading-relaxed text-muted ${center ? 'mx-auto' : ''} max-w-[38rem]`}>{text}</p>}
    </div>
  );
}

export default function Salon({ b, path = '' }) {
  const [open, setOpen] = useState(false);
  const menuPage = hasMenuPage(b);
  const stylistPage = hasStylistPage(b);
  const page = (path === 'services' && menuPage) || (path === 'stylists' && stylistPage) ? path : '';
  const home = (hash) => (page ? `/${hash}` : hash);

  const tel = telHref(b.phone);
  const sms = tel.replace('tel:', 'sms:');
  const directions = mapsHref(b);
  const rating = ratingLine(b);
  const city = `${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;
  const stick = b.preview ? 'top-11' : 'top-0';
  const anchor = b.preview ? 'scroll-mt-[120px] lg:scroll-mt-[140px]' : 'scroll-mt-[76px] lg:scroll-mt-[96px]';
  const gallery = (b.gallery || []).slice(0, Math.floor((b.gallery?.length || 0) / 3) * 3);
  const extras = (b.hero.collage || []).slice(0, 2);

  const book = b.booking?.url
    ? { href: b.booking.url, label: b.booking.label || 'Book Online', external: true, Icon: CalendarDays }
    : { href: tel, label: 'Call to Book', external: false, Icon: Phone };
  const second = b.booking?.url
    ? b.texts
      ? { href: sms, label: 'Text Us', short: 'Text', Icon: MessageCircle }
      : { href: tel, label: 'Call the Salon', short: 'Call', Icon: Phone }
    : b.texts
      ? { href: sms, label: 'Text to Book', short: 'Text', Icon: MessageCircle }
      : { href: directions, label: 'Get Directions', short: 'Directions', Icon: MapPin };
  const out = (o) => (o.external ? { target: '_blank', rel: 'noopener noreferrer' } : {});

  const left = [
    [menuPage ? '/services' : home('#services'), 'Services', 'services'],
    b.stylists?.length && [stylistPage ? '/stylists' : home('#stylists'), 'Stylists', 'stylists'],
    gallery.length && [home('#gallery'), 'Gallery'],
  ].filter(Boolean);
  const right = [
    Array.isArray(b.reviews) && b.reviews.length > 0 && [home('#reviews'), 'Reviews'],
    [home('#visit'), 'Visit'],
  ].filter(Boolean);
  const nav = [...left, ...right];

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => e.key === 'Escape' && setOpen(false);
    const wide = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener('keydown', close);
    window.addEventListener('resize', wide);
    return () => {
      window.removeEventListener('keydown', close);
      window.removeEventListener('resize', wide);
    };
  }, [open]);

  const navLink = ([href, text, key]) => (
    <a
      key={href}
      href={href}
      aria-current={key && key === page ? 'page' : undefined}
      className="relative inline-flex min-h-11 min-w-11 items-center justify-center whitespace-nowrap text-[15px] text-ink no-underline after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform hover:after:scale-x-100 aria-[current=page]:after:scale-x-100"
    >
      {text}
    </a>
  );

  const ctas = (light = false) => (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <a className={solid} href={book.href} {...out(book)}>
        <book.Icon size={17} aria-hidden="true" /> {book.label}
      </a>
      <a className={light ? `${btn} border border-white/40 text-white hover:border-white` : ghost} href={second.href}>
        <second.Icon size={17} aria-hidden="true" /> {second.label}
      </a>
    </div>
  );

  const header = (
    <header className={`sticky ${stick} z-40 border-b border-line bg-ground/90 backdrop-blur-md`}>
      <div
        className={`${wrap} grid h-[68px] grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3 lg:h-[88px] lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-8 xl:gap-12`}
      >
        <button
          type="button"
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-ink/15 bg-transparent text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="salon-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex xl:gap-9">
          <a
            href={tel}
            className="mr-auto hidden min-h-11 items-center gap-2 whitespace-nowrap text-[15px] text-muted no-underline hover:text-ink xl:inline-flex"
          >
            <Phone size={15} aria-hidden="true" /> {b.phone}
          </a>
          <span className="ml-auto flex items-center gap-7 xl:ml-0 xl:gap-9">{left.map(navLink)}</span>
        </nav>
        <a
          href={page ? '/' : '#top'}
          className="flex min-h-11 min-w-0 items-center justify-center justify-self-center no-underline"
          aria-label={`${b.name} home`}
          onClick={() => setOpen(false)}
        >
          <Wordmark b={b} />
        </a>
        <div className="hidden items-center gap-7 lg:flex xl:gap-9">
          {right.map(navLink)}
          <a className={`${solid} ml-auto min-h-11 px-6 py-2.5`} href={book.href} {...out(book)}>
            {book.label}
          </a>
        </div>
        <a
          href={book.href}
          {...out(book)}
          aria-label={book.label}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-[color:var(--on-primary)] lg:hidden"
        >
          <book.Icon size={19} aria-hidden="true" />
        </a>
      </div>
      <div
        id="salon-menu"
        hidden={!open}
        className={`absolute inset-x-0 top-full overflow-y-auto border-b border-line bg-ground lg:hidden ${
          b.preview ? 'max-h-[calc(100dvh-112px)]' : 'max-h-[calc(100dvh-68px)]'
        }`}
      >
        <nav aria-label="Mobile" className={`${wrap} pt-3`}>
          <a
            href={page ? '/' : '#top'}
            onClick={() => setOpen(false)}
            className="flex min-h-14 items-center justify-between border-b border-line py-3 font-heading text-[1.85rem] leading-tight text-ink no-underline"
          >
            Home <ArrowRight size={20} className="text-muted" aria-hidden="true" />
          </a>
          {nav.map(([href, text, key]) => (
            <a
              key={href}
              href={href}
              aria-current={key && key === page ? 'page' : undefined}
              onClick={() => setOpen(false)}
              className="flex min-h-14 items-center justify-between border-b border-line py-3 font-heading text-[1.85rem] leading-tight text-ink no-underline aria-[current=page]:italic"
            >
              {text} <ArrowRight size={20} className="text-muted" aria-hidden="true" />
            </a>
          ))}
        </nav>
        <div className={`${wrap} py-7`}>{ctas()}</div>
        <div className={`${wrap} grid gap-6 pb-10`}>
          <div>
            <p className={`${small} mb-3`}>Hours</p>
            <Hours hours={b.hours} className="max-w-md text-base" />
          </div>
          <Socials b={b} />
        </div>
      </div>
    </header>
  );

  const footer = (
    <footer className="bg-panel">
      <div className={`${wrap} grid justify-items-center gap-8 pb-10 pt-[clamp(4rem,8vw,6rem)] text-center`}>
        <a href={page ? '/' : '#top'} className="no-underline" aria-label={`${b.name} home`}>
          <Wordmark b={b} size="footer" />
        </a>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-8 gap-y-1">
          {nav.map(([href, text]) => (
            <a key={href} href={href} className="inline-flex min-h-11 min-w-11 items-center justify-center text-base text-ink no-underline hover:underline">
              {text}
            </a>
          ))}
        </nav>
        <div className="grid gap-1 text-base leading-relaxed text-muted">
          <a href={directions} className="inline-flex min-h-11 items-center justify-center text-muted no-underline hover:text-ink">
            {b.address}, {city}
          </a>
          <span className="flex flex-wrap justify-center gap-x-6">
            <a href={tel} className="inline-flex min-h-11 items-center text-ink no-underline hover:underline">
              {b.phone}
            </a>
            {b.email && (
              <a
                href={`mailto:${b.email}`}
                className="inline-flex min-h-11 items-center text-ink no-underline [overflow-wrap:anywhere] hover:underline"
              >
                {b.email}
              </a>
            )}
          </span>
        </div>
        <Socials b={b} />
      </div>
      <div className={`${wrap} pb-28 md:pb-10`}>
        <p className="m-0 border-t border-line pt-6 text-center text-[13px] text-muted">
          &copy; {new Date().getFullYear()} {b.name}
          <StudioCredit b={b} />
        </p>
      </div>
    </footer>
  );

  const bar = (
    <div className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-1.5 rounded-full bg-ink p-1.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)] md:hidden">
      <a
        href={book.href}
        {...out(book)}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-3 text-[15px] font-medium text-[color:var(--on-primary)] no-underline"
      >
        <book.Icon size={17} aria-hidden="true" /> {book.label}
      </a>
      <a
        href={second.href}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-3 text-[15px] font-medium text-[color:var(--bg)] no-underline"
      >
        <second.Icon size={17} aria-hidden="true" /> {second.short}
      </a>
    </div>
  );

  const band = (
    <section className="px-gutter pb-[clamp(4rem,8vw,7rem)]">
      <div className="mx-auto grid max-w-page justify-items-center gap-6 rounded-[2rem] bg-primary-deep px-6 py-[clamp(3.5rem,7vw,5.5rem)] text-center text-white">
        <p className="m-0 text-[13px] font-medium uppercase tracking-[0.22em] text-white/70">{b.shortName}</p>
        <h2 className={`${h2} max-w-2xl`}>Book your next appointment</h2>
        <p className="m-0 max-w-xl text-lg leading-relaxed text-white/80">
          {b.address}, {city} &middot; {b.phone}
        </p>
        <div className="mt-2">{ctas(true)}</div>
      </div>
    </section>
  );

  const root = {
    '--primaryDeep': 'color-mix(in srgb, var(--primary) 62%, #000)',
    '--accent': 'color-mix(in srgb, var(--primary) 35%, var(--bg))',
    '--muted': 'color-mix(in srgb, var(--ink) 70%, var(--bg))',
    '--panel': 'color-mix(in srgb, var(--primary) 8%, var(--bg))',
    '--surface': '#ffffff',
    '--line': 'color-mix(in srgb, var(--ink) 14%, var(--bg))',
    ...brandVars(b.brand),
    '--on-primary': onColor(b.brand.primary),
  };

  return (
    <div className="min-w-0 overflow-x-clip bg-ground font-body text-[17px] text-ink antialiased" style={root}>
      {header}
      <main>
        {page === 'services' && <ServicesPage b={b} book={book} out={out} band={band} />}
        {page === 'stylists' && <StylistsPage b={b} book={book} out={out} band={band} />}
        {page === '' && (
          <Home
            b={b}
            anchor={anchor}
            ctas={ctas}
            rating={rating}
            extras={extras}
            gallery={gallery}
            menuPage={menuPage}
            stylistPage={stylistPage}
            tel={tel}
            city={city}
            directions={directions}
          />
        )}
      </main>
      {!path && <Facts b={b} />}
      {footer}
      {bar}
    </div>
  );
}

function Home({ b, anchor, ctas, rating, extras, gallery, menuPage, stylistPage, tel, city, directions }) {
  // A business with no reviews quoted has no reviews section; its rating, when
  // it has one, still shows under the hero.
  const [quote, ...rest] = Array.isArray(b.reviews) ? b.reviews : [];
  const others = rest.slice(0, 4);
  const ig = b.social?.instagram;

  return (
    <>
      <section
        id="top"
        className={`${wrap} grid items-center gap-x-[clamp(2rem,5vw,5.5rem)] gap-y-12 pb-[clamp(4.5rem,9vw,8rem)] pt-[clamp(2.25rem,5vw,4.5rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]`}
      >
        <div className="min-w-0">
          <p className={eyebrow}>{b.hero.eyebrow}</p>
          <h1 className="font-heading text-[clamp(2.6rem,1.45rem+3.6vw,4.7rem)] font-normal leading-[1.04] tracking-[-0.015em] [overflow-wrap:anywhere] [text-wrap:balance]">
            {b.hero.title}
            {b.hero.titleAccent && <em className="mt-1 block font-normal italic text-primary-deep">{b.hero.titleAccent}</em>}
          </h1>
          <p className="mb-9 mt-7 max-w-[33rem] text-lg leading-relaxed text-muted sm:text-xl">{b.hero.lead}</p>
          {ctas()}
          {rating && (
            <a
              href={quote ? '#reviews' : undefined}
              className="mt-8 inline-flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 text-base text-muted no-underline hover:text-ink"
            >
              <Stars value={b.rating} size={16} />
              <span>{rating}</span>
            </a>
          )}
        </div>

        <div
          className={`relative min-w-0 ${
            extras.length ? 'aspect-[20/21] sm:aspect-[6/5] lg:aspect-[20/21]' : 'mx-auto aspect-[4/5] w-full max-w-[560px]'
          }`}
        >
          <Img
            className={`absolute object-cover ${arch} ${
              extras.length ? 'right-0 top-0 h-[90%] w-[66%] sm:w-[56%] lg:w-[66%]' : 'inset-0 h-full w-full'
            }`}
            src={b.hero.image}
            alt={b.hero.imageAlt}
            sizes="(max-width: 640px) 66vw, (max-width: 1024px) 52vw, 36vw"
            eager
          />
          {extras[0] && (
            <Img
              className="absolute bottom-0 left-0 aspect-[4/5] w-[42%] rounded-[1.5rem] object-cover ring-[6px] ring-ground sm:left-[10%] sm:w-[36%] sm:ring-8 lg:left-0 lg:w-[42%]"
              src={extras[0].image}
              alt={extras[0].alt}
              sizes="(max-width: 1024px) 40vw, 24vw"
            />
          )}
          {extras[1] && (
            <Img
              className="absolute left-[3%] top-[3%] aspect-[3/4] w-[27%] rounded-[1.25rem] object-cover sm:left-[15%] sm:w-[22%] lg:left-[3%] lg:w-[27%]"
              src={extras[1].image}
              alt={extras[1].alt}
              sizes="(max-width: 1024px) 27vw, 16vw"
            />
          )}
          {b.since && (
            <span
              className={`absolute grid h-[clamp(5.5rem,4rem+5vw,7.5rem)] w-[clamp(5.5rem,4rem+5vw,7.5rem)] place-content-center rounded-full bg-accent text-center text-primary-deep shadow-[0_12px_30px_-14px_rgba(0,0,0,0.35)] ${
                extras.length ? 'bottom-[1%] right-[4%]' : '-bottom-4 right-4'
              }`}
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.24em] sm:text-[11px]">Since</span>
              <span className="font-heading text-[clamp(1.35rem,1rem+1.2vw,1.85rem)] italic leading-none">{b.since}</span>
            </span>
          )}
        </div>
      </section>

      {b.intro && (
        <section className={`border-t border-line ${pad}`}>
          <div
            className={`${wrap} grid items-center gap-x-[clamp(2rem,7vw,7rem)] gap-y-12 ${b.intro.image ? 'md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]' : ''}`}
          >
            {b.intro.image && (
              <Img
                className="aspect-[4/5] w-full rounded-[2rem] object-cover md:max-h-[680px]"
                src={b.intro.image}
                alt={b.intro.imageAlt || ''}
                sizes="(max-width: 768px) 100vw, 42vw"
              />
            )}
            <div className={`min-w-0 ${b.intro.image ? '' : 'mx-auto max-w-3xl text-center'}`}>
              {b.intro.eyebrow && <p className={eyebrow}>{b.intro.eyebrow}</p>}
              <h2 className={h2}>{b.intro.title}</h2>
              <p className={`mt-7 max-w-[36rem] text-lg leading-relaxed text-muted ${b.intro.image ? '' : 'mx-auto'}`}>
                {b.intro.text}
              </p>
              {b.intro.points?.length > 0 && (
                <ul className="m-0 mt-10 grid list-none gap-0 p-0 sm:grid-cols-2 sm:gap-x-10">
                  {b.intro.points.slice(0, 6).map((p) => (
                    <li key={p} className="flex items-center gap-3 border-t border-line py-4 text-base text-left">
                      <span aria-hidden="true" className="h-1.5 w-1.5 flex-none rotate-45 bg-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      <section id="services" className={`bg-panel ${pad} ${anchor}`}>
        <div className={wrap}>
          <div className="mx-auto max-w-[1080px] rounded-[2rem] bg-surface px-[clamp(1.25rem,5vw,5rem)] py-[clamp(3rem,6vw,5.5rem)] shadow-[0_30px_60px_-40px_rgba(60,30,20,0.35)] outline outline-1 outline-offset-[-10px] outline-line sm:outline-offset-[-14px]">
            <div className="mb-[clamp(2.5rem,5vw,4rem)] text-center">
              <p className={eyebrow}>Services{b.menu.some((g) => g.items.some((i) => i.price != null)) ? ' and prices' : ''}</p>
              <h2 className={h2}>
                The <em className="italic">menu</em>
              </h2>
            </div>
            <div className="grid gap-x-[clamp(2.5rem,6vw,5.5rem)] gap-y-12 lg:grid-cols-2">
              {b.menu.map((g) => (
                <div key={g.group} className="min-w-0">
                  <h3 className="mb-6 flex items-center gap-4 font-heading text-[1.6rem] font-normal italic leading-tight">
                    <span className="min-w-0">{g.group}</span>
                    <span aria-hidden="true" className="h-px flex-1 bg-line" />
                  </h3>
                  <ul className="m-0 grid list-none gap-5 p-0">
                    {(menuPage ? g.items.slice(0, 3) : g.items).map((i) => (
                      <li key={i.name} className="grid gap-1">
                        <Leader name={i.name} value={money(i)} nameClass="text-[17px] font-medium" valueClass="font-heading text-lg" />
                        {i.text && <p className="m-0 text-base leading-relaxed text-muted">{i.text}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {b.menuNote && (
              <p className="mx-auto mb-0 mt-12 max-w-xl border-t border-line pt-8 text-center text-base italic leading-relaxed text-muted">
                {b.menuNote}
              </p>
            )}
          </div>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            {menuPage && (
              <a className={ghost} href="/services">
                Full Menu and Prices <ArrowRight size={17} aria-hidden="true" />
              </a>
            )}
            {!menuPage && ctas()}
          </div>
        </div>
      </section>

      {b.stylists?.length > 0 && (
        <section id="stylists" className={`${wrap} ${pad} ${anchor}`}>
          <div className="mb-[clamp(2.5rem,5vw,4rem)] flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <Heading kicker="The team" title="Meet the stylists" />
            {stylistPage && (
              <a className={`${ghost} self-start md:self-auto`} href="/stylists">
                About the Team <ArrowRight size={17} aria-hidden="true" />
              </a>
            )}
          </div>
          <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-10 p-0 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {b.stylists.map((s, i) => (
              <li key={s.name} className={`min-w-0 ${i % 2 ? 'lg:mt-14' : ''}`}>
                {s.image && (
                  <Img
                    className={`mb-5 aspect-[3/4] w-full object-cover ${arch}`}
                    src={s.image}
                    alt={s.imageAlt || s.name}
                    sizes="(max-width: 1024px) 46vw, 22vw"
                  />
                )}
                <h3 className="font-heading text-[1.5rem] font-normal leading-tight sm:text-[1.75rem]">{s.name}</h3>
                <p className={`${small} mt-2`}>{s.role}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {quote && (
        <section id="reviews" className={`border-t border-line ${pad} ${anchor}`}>
          <div className={wrap}>
            <figure className="m-0 mx-auto max-w-[62rem] text-center">
              <span aria-hidden="true" className="block font-heading text-[5rem] leading-[0.6] text-accent sm:text-[7rem]">
                &ldquo;
              </span>
              <blockquote className="m-0 mt-4 font-heading text-[clamp(1.55rem,1rem+2.1vw,2.7rem)] italic leading-[1.3] [text-wrap:balance]">
                {quote.text}
              </blockquote>
              <figcaption className="mt-8 grid justify-items-center gap-3">
                <span className={small}>{quote.author}</span>
                {rating && (
                  <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-base text-muted">
                    <Stars value={b.rating} size={16} /> {rating}
                  </span>
                )}
              </figcaption>
            </figure>
            {others.length > 0 && (
              <div className={`mx-auto mt-[clamp(3.5rem,7vw,5.5rem)] grid max-w-[62rem] gap-x-12 gap-y-8 ${others.length > 1 ? 'md:grid-cols-2' : ''}`}>
                {others.map((r) => (
                  <figure key={r.author + r.text.slice(0, 12)} className="m-0 border-t border-line pt-7">
                    <blockquote className="m-0 text-lg leading-relaxed">&ldquo;{r.text}&rdquo;</blockquote>
                    <figcaption className={`${small} mt-4`}>{r.author}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {gallery.length > 0 && (
        <section id="gallery" className={`bg-panel ${pad} ${anchor}`}>
          <div className={`${wrap} max-w-[1120px]`}>
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <Heading kicker={ig ? 'On Instagram' : 'Recent work'} title={b.social?.handle && ig ? b.social.handle : 'Fresh from the chair'} />
              {ig && (
                <a className={`${ghost} self-start sm:self-auto`} href={ig} target="_blank" rel="noopener noreferrer">
                  Follow Along <ArrowUpRight size={17} aria-hidden="true" />
                </a>
              )}
            </div>
            <ul className="m-0 grid list-none grid-cols-3 gap-1.5 p-0 sm:gap-3 lg:gap-4">
              {gallery.map((g) => (
                <li key={g.image} className="overflow-hidden rounded-[0.75rem] sm:rounded-[1.25rem]">
                  <Img
                    className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-[1.04]"
                    src={g.image}
                    alt={g.alt}
                    sizes="(max-width: 1120px) 33vw, 360px"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section id="visit" className={`${wrap} ${pad} ${anchor}`}>
        <div className="grid items-center gap-x-[clamp(2rem,7vw,7rem)] gap-y-12 md:grid-cols-2">
          <div className="min-w-0">
            <Heading kicker="Visit" title="Come see us" />
            <div className="mt-10 grid gap-0 text-[17px]">
              <a className="flex gap-4 border-t border-line py-4 text-ink no-underline hover:underline" href={directions}>
                <MapPin size={19} className="mt-0.5 flex-none text-primary" aria-hidden="true" />
                <span>
                  {b.address}
                  <br />
                  {city}
                </span>
              </a>
              <a className="flex min-h-11 items-center gap-4 border-t border-line py-4 text-ink no-underline hover:underline" href={tel}>
                <Phone size={19} className="flex-none text-primary" aria-hidden="true" />
                <span>
                  {b.phone}
                  {b.texts && <span className="text-muted"> &middot; calls and texts</span>}
                </span>
              </a>
              {b.email && (
                <a
                  className="flex min-h-11 items-center gap-4 border-t border-line py-4 text-ink no-underline [overflow-wrap:anywhere] hover:underline"
                  href={`mailto:${b.email}`}
                >
                  <Mail size={19} className="flex-none text-primary" aria-hidden="true" />
                  <span className="min-w-0">{b.email}</span>
                </a>
              )}
              <div className="flex gap-4 border-y border-line py-5">
                <Clock size={19} className="mt-0.5 flex-none text-primary" aria-hidden="true" />
                <Hours hours={b.hours} className="min-w-0 flex-1" />
              </div>
            </div>
            <div className="mt-9">{ctas()}</div>
          </div>
          <Img
            className="aspect-[4/5] w-full rounded-[2rem] object-cover md:max-h-[720px]"
            src={b.visitImage || b.hero.image}
            alt={b.visitImageAlt || ''}
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </div>
      </section>
    </>
  );
}

function ServicesPage({ b, book, out, band }) {
  return (
    <>
      <section className={`${wrap} pb-[clamp(3rem,6vw,5rem)] pt-[clamp(3rem,7vw,6rem)] text-center`}>
        <Heading as="h1" center kicker={`${b.shortName} · ${b.town}`} title="Services and prices" text={b.menuNote} />
        <nav aria-label="Service groups" className="mt-10 flex flex-wrap justify-center gap-2.5">
          {b.menu.map((g) => (
            <a
              key={g.group}
              href={`#${slugify(g.group)}`}
              className="inline-flex min-h-11 items-center rounded-full border border-ink/15 px-5 text-[15px] text-ink no-underline transition-colors hover:border-ink"
            >
              {g.group}
            </a>
          ))}
        </nav>
      </section>

      <div className="border-t border-line">
        {b.menu.map((g, gi) => (
          <section
            key={g.group}
            id={slugify(g.group)}
            className={`${b.preview ? 'scroll-mt-[120px] lg:scroll-mt-[140px]' : 'scroll-mt-[76px] lg:scroll-mt-[96px]'} ${gi % 2 ? 'bg-panel' : ''}`}
          >
            <div
              className={`${wrap} grid items-start gap-x-[clamp(2rem,6vw,6rem)] gap-y-10 py-[clamp(4rem,8vw,7rem)] ${
                g.image ? 'md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]' : ''
              }`}
            >
              {g.image && (
                <Img
                  className={`aspect-[5/4] w-full max-w-[520px] object-cover md:sticky md:top-[140px] md:aspect-[4/5] ${arch} ${gi % 2 ? 'md:order-2 md:justify-self-end' : ''}`}
                  src={g.image}
                  alt={g.imageAlt || ''}
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              )}
              <div className={`min-w-0 ${g.image ? '' : 'mx-auto w-full max-w-3xl'}`}>
                <p className={eyebrow}>{String(gi + 1).padStart(2, '0')}</p>
                <h2 className={h2}>
                  <em className="italic">{g.group}</em>
                </h2>
                {g.text && <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{g.text}</p>}
                <ul className="m-0 mt-10 grid list-none p-0">
                  {g.items.map((i) => (
                    <li key={i.name} className="grid gap-1.5 border-t border-line py-6 last:border-b">
                      <Leader
                        name={i.name}
                        value={money(i)}
                        nameClass="font-heading text-[1.35rem] leading-snug sm:text-[1.5rem]"
                        valueClass="font-heading text-[1.35rem] sm:text-[1.5rem]"
                      />
                      {(i.text || i.duration) && (
                        <p className="m-0 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-base leading-relaxed text-muted">
                          {i.text && <span className="min-w-0">{i.text}</span>}
                          {i.duration && <span className={`${small} whitespace-nowrap`}>{i.duration}</span>}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
                <a className={`${solid} mt-9 w-full sm:w-auto`} href={book.href} {...out(book)}>
                  <book.Icon size={17} aria-hidden="true" /> {book.label}
                </a>
              </div>
            </div>
          </section>
        ))}
      </div>

      {b.policies?.length > 0 && (
        <section className={`${wrap} ${pad}`}>
          <Heading kicker="Before you book" title="Good to know" className="mb-12" />
          <ul className={`m-0 grid list-none gap-4 p-0 md:grid-cols-2 ${b.policies.length >= 3 ? 'lg:grid-cols-3' : ''}`}>
            {b.policies.map((p) => (
              <li key={p.title} className="rounded-[1.5rem] border border-line p-7 sm:p-8">
                <h3 className="font-heading text-[1.4rem] font-normal italic leading-snug">{p.title}</h3>
                <p className="m-0 mt-3 text-base leading-relaxed text-muted">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className={b.policies?.length ? '' : 'pt-[clamp(4rem,8vw,7rem)]'}>{band}</div>
    </>
  );
}

function StylistsPage({ b, book, out, band }) {
  return (
    <>
      <section className={`${wrap} pb-[clamp(3rem,6vw,5rem)] pt-[clamp(3rem,7vw,6rem)] text-center`}>
        <Heading as="h1" center kicker={`${b.shortName} · ${b.town}`} title="Meet the stylists" />
      </section>
      <section className={`${wrap} pb-[clamp(4.5rem,9vw,8rem)]`}>
        <ul className="m-0 grid list-none gap-x-[clamp(2rem,5vw,5rem)] gap-y-[clamp(3.5rem,7vw,6rem)] p-0 md:grid-cols-2">
          {b.stylists.map((s, i) => (
            <li
              key={s.name}
              className={`grid min-w-0 content-start lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-x-10 ${i % 2 ? 'md:mt-24' : ''}`}
            >
              {s.image && (
                <Img
                  className={`mb-8 aspect-[4/5] w-full object-cover lg:mb-0 ${arch}`}
                  src={s.image}
                  alt={s.imageAlt || s.name}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 45vw, 22vw"
                />
              )}
              <div className="grid min-w-0 content-start">
                <p className={small}>{s.role}</p>
                <h2 className="mt-3 font-heading text-[clamp(2rem,1.5rem+1.8vw,3rem)] font-normal leading-tight">{s.name}</h2>
                {s.bio && <p className="m-0 mt-4 max-w-[34rem] text-lg leading-relaxed text-muted">{s.bio}</p>}
                {s.specialties?.length > 0 && (
                  <ul className="m-0 mt-6 flex list-none flex-wrap gap-2 p-0">
                    {s.specialties.slice(0, 4).map((t) => (
                      <li key={t} className="rounded-full bg-panel px-4 py-2 text-[15px]">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                <a className={`${ghost} mt-8 w-full sm:w-auto sm:justify-self-start`} href={book.href} {...out(book)}>
                  Book with {s.name} <ArrowRight size={17} aria-hidden="true" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>
      {band}
    </>
  );
}
