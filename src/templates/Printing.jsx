/**
 * Print shop and sign maker. A multi-page catalog: home, every product
 * category on its own page with a section per product, a request-a-quote
 * page, about and contact.
 *
 * Pages (see `pages` below):
 *   ''                         home
 *   'products'                 every category and its products
 *   'products/<category.slug>' one category, a section per product at #<product.slug>
 *   'quote'                    the quote form
 *   'about'                    the shop
 *   'contact'                  phone, address, hours and a short form
 *
 * Brand file shape this template reads (src/brands/<slug>.json).
 * Required unless marked optional.
 *
 *   template      "printing"
 *   preview       true for a prospect's preview; left out on the sample
 *   name          full business name ("Goose Creek Print & Sign")
 *   shortName     shorter name for running copy and the form's thank-you
 *   phone         "(281) 555-0163"
 *   email         optional. Shown in the header menu, contact page, quote page and footer
 *   address       street line
 *   town, state   "Baytown", "TX"
 *   zip           optional
 *   rating        optional, Google rating (4.8). Shown only with reviewCount
 *   reviewCount   optional, number of Google reviews
 *   since         optional, year the shop opened. Shown in the footer and about page as "Since 2009"
 *   hours         optional, [["Mon – Fri", "8 AM – 6 PM"], ...]
 *
 *   brand {
 *     primary       main color: buttons, links, the first category tint
 *     primaryDeep   optional, a dark of the primary for the promo band (falls back to a darkened primary)
 *     accent        bright second color: the announcement link, the quote band, highlighter under the hero line
 *     pop           optional, a third color for the process strip and tints (falls back to accent)
 *     ink           text color, and the footer ground
 *     surface       optional, pale page-section ground (falls back to a pale grey)
 *     cream         optional, pale warm ground for the quote page aside (falls back to surface)
 *     line          optional, hairline color (falls back to a light grey)
 *     heading       CSS font-family for headings ("'Space Grotesk', Arial, sans-serif")
 *     body          CSS font-family for text ("'Inter', system-ui, sans-serif")
 *     fonts         Google Fonts stylesheet URL loading both families
 *     logo          optional, path to a logo with a transparent or white ground; null sets the name in type
 *     logoWidth     optional, the logo's width in px in the header (default 190)
 *   }
 *   The text color on primary, accent and pop is worked out from the color
 *   itself, so any brand reads.
 *
 *   announcement  optional, the strip above the header {
 *     text        one sentence ("Business cards ordered by noon are ready the next business day.")
 *     linkLabel   optional, Title Case link label ("Start an Order")
 *     href        optional, a root-relative page of this site ("/quote", "/products/apparel")
 *   }
 *
 *   hero {
 *     eyebrow     short line above the headline
 *     title       headline, sentence case
 *     titleAccent optional, the end of the headline, set in the primary color on a highlighter stroke
 *     lead        one or two sentences
 *     image       photo path (/brands/<slug>/<name>, with -800.webp and -1600.webp beside it) or Unsplash URL
 *     imageAlt    alt text
 *   }
 *
 *   highlights    optional, 2 to 4 facts for the row under the hero, only what the
 *                 business actually offers: turnaround, in-house printing, pickup or delivery,
 *                 design help. [{ icon, title, text }]
 *                 icon: clock | printer | truck | store | palette | badge | upload | scissors | layers | pen
 *
 *   categories    the catalog, 2 to 8 categories, each its own page [{
 *     slug        url segment, lowercase-hyphenated ("business-cards")
 *     title       Title Case name ("Business Cards")
 *     icon        card | flag | shirt | car | gift | maximize | sticker | sign | file | package | image | megaphone
 *     blurb       one short line for cards and the mega menu
 *     intro       one or two sentences for the top of the category page
 *     image       optional, category photo (falls back to the first product photo)
 *     imageAlt    optional, alt text for it
 *     products    1 to 8 products [{
 *       slug        anchor on the category page, lowercase-hyphenated, unique in the site
 *       name        Title Case product name
 *       code        optional, a short shop spec code shown as a tag ("BC-14")
 *       text        one or two sentences
 *       details     optional, 2 to 6 short spec lines (stocks, sizes, minimums, finishes)
 *       turnaround  optional, "Next business day"
 *       featured    optional, true puts it in "Popular right now" on the home page
 *                   (when no product is featured, the first of each category is shown)
 *       image       optional, product photo; without one a tinted spec tile is drawn
 *       imageAlt    optional, alt text for it
 *     }]
 *   }]
 *
 *   promo         optional, the featured tile in the mega menu and the band on the home page {
 *     eyebrow     optional
 *     title
 *     text
 *     image       optional
 *     imageAlt    optional
 *     cta         optional, Title Case button label (default "Request a Quote")
 *     href        optional, root-relative page (default "/quote")
 *   }
 *
 *   process       optional, 3 or 4 ordering steps [{ title, text }], on home and the quote page
 *
 *   about         optional, the about page and the home intro to it {
 *     eyebrow     optional
 *     title
 *     text        array of paragraphs (a single string also works)
 *     image       optional
 *     imageAlt    optional
 *     points      optional, [{ title, text }]
 *   }
 *
 *   serviceArea   optional, towns delivered to or served, shown on the contact page
 *   reviews       optional, Google reviews [{ author, text, product? }], product being what they ordered
 */
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Car,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Flag,
  Gift,
  IdCard,
  Image as ImageIcon,
  Layers,
  Mail,
  MapPin,
  Maximize,
  Megaphone,
  Menu,
  Package,
  Palette,
  PenTool,
  Phone,
  Printer,
  Scissors,
  Search,
  Shirt,
  Signpost,
  Sticker,
  Store,
  Truck,
  Upload,
  X,
} from 'lucide-react';
import { brandVars, mapsHref, ratingLine, telHref } from '../site.js';
import { EnquiryForm, Img, Stars, Facts, StudioCredit } from './shared.jsx';
import { onColor } from './printing/color.js';

const CATEGORY_ICONS = {
  card: IdCard,
  flag: Flag,
  shirt: Shirt,
  car: Car,
  gift: Gift,
  maximize: Maximize,
  sticker: Sticker,
  sign: Signpost,
  file: FileText,
  package: Package,
  image: ImageIcon,
  megaphone: Megaphone,
};
const HIGHLIGHT_ICONS = {
  clock: Clock,
  printer: Printer,
  truck: Truck,
  store: Store,
  palette: Palette,
  badge: BadgeCheck,
  upload: Upload,
  scissors: Scissors,
  layers: Layers,
  pen: PenTool,
};

/** The four inks every tint and strip is drawn from, all brand colors. */
const INKS = ['primary', 'pop', 'accent', 'primaryDeep'];
const ink = (i) => `var(--${INKS[i % INKS.length]})`;
/** A brand ink pulled toward the text color, so a pale ink still reads as type. */
const inkText = (i) => `color-mix(in srgb, var(--${INKS[i % INKS.length]}) 72%, var(--ink))`;
const tint = (i, amount = 16) => `color-mix(in srgb, var(--${INKS[i % INKS.length]}) ${amount}%, #fff)`;

const wrap = 'mx-auto w-full max-w-page px-gutter';
const pad = 'py-[clamp(3.5rem,8vw,6.5rem)]';
const anchor = 'scroll-mt-[124px] lg:scroll-mt-[184px]';
const h1 =
  'font-heading text-[clamp(2.3rem,1.3rem+4vw,4.4rem)] font-bold leading-[1.02] tracking-[-0.035em] [text-wrap:balance] break-words';
const h2 =
  'font-heading text-[clamp(1.85rem,1.3rem+2.2vw,2.9rem)] font-bold leading-[1.05] tracking-[-0.03em] [text-wrap:balance] break-words';
const btn =
  'inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl px-6 text-[16px] font-semibold no-underline transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const btnPrimary = `${btn} bg-primary text-[color:var(--on-primary)] hover:brightness-110`;
const btnAccent = `${btn} bg-accent text-[color:var(--on-accent)] hover:brightness-105`;
const btnLine = `${btn} border-2 border-ink/15 bg-white text-ink hover:border-ink/40`;

const list = (v) => (Array.isArray(v) ? v : []);
const paragraphs = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const productHref = (c, p) => `/products/${c.slug}#${p.slug}`;

export function pages(b) {
  const cats = list(b.categories).filter((c) => c.slug);
  return ['products', ...cats.map((c) => `products/${c.slug}`), 'quote', 'about', 'contact'];
}

/* ------------------------------------------------------------------ marks */

/** A strip of the four brand inks, the shop's color bar. */
function InkBar({ className = 'h-1.5' }) {
  return (
    <div className={`grid grid-cols-4 ${className}`} aria-hidden="true">
      {INKS.map((n) => (
        <span key={n} style={{ background: `var(--${n})` }} />
      ))}
    </div>
  );
}

/** Four ink squares, the eyebrow's mark. */
function InkDots({ size = 7 }) {
  return (
    <span className="inline-grid flex-none grid-cols-2 gap-[2px]" aria-hidden="true">
      {INKS.map((n) => (
        <span key={n} className="block rounded-[2px]" style={{ width: size, height: size, background: `var(--${n})` }} />
      ))}
    </span>
  );
}

/** A printer's registration mark. */
function Reg({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <circle cx="12" cy="12" r="6" />
      <path d="M12 0v24M0 12h24" />
    </svg>
  );
}

function Eyebrow({ children, dark = false }) {
  return (
    <p
      className={`mb-4 flex items-center gap-2.5 font-heading text-[13px] font-semibold uppercase tracking-[0.16em] ${
        dark ? 'text-white/80' : 'text-ink/65'
      }`}
    >
      <InkDots />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/** The logo sized by height, or the name in type when there is none. */
function Mark({ b, className = '', textClass = '' }) {
  if (b.brand.logo) {
    return (
      <img
        className={`block h-auto max-w-[52vw] object-contain ${className}`}
        src={b.brand.logo}
        alt={b.name}
        style={{ width: b.brand.logoWidth || 190 }}
      />
    );
  }
  return <span className={`block font-heading text-[22px] font-bold leading-none tracking-[-0.02em] ${textClass}`}>{b.shortName}</span>;
}

/** A product's photo on its tint, or a spec tile when it has none. */
function ProductVisual({ product, category, index, sizes, eager = false, className = '' }) {
  const Icon = CATEGORY_ICONS[category.icon] || Printer;
  return (
    <div className={`relative overflow-hidden rounded-2xl ${className}`} style={{ background: tint(index, 18) }}>
      {product.image ? (
        <Img
          className="absolute inset-[7%] h-[86%] w-[86%] rounded-xl object-cover shadow-[0_18px_40px_-22px_rgba(0,0,0,0.55)]"
          src={product.image}
          alt={product.imageAlt || product.name}
          sizes={sizes}
          eager={eager}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-[8%]" style={{ color: inkText(index) }}>
          <Reg className="absolute left-4 top-4 h-5 w-5 opacity-50" />
          <Reg className="absolute bottom-4 right-4 h-5 w-5 opacity-50" />
          <span className="absolute h-[62%] w-[52%] rotate-[5deg] rounded-xl bg-white/55" aria-hidden="true" />
          <div className="relative grid h-[62%] w-[52%] min-w-[150px] -rotate-2 content-between overflow-hidden rounded-xl bg-white p-[6%] text-left shadow-[0_22px_40px_-24px_rgba(0,0,0,0.5)]">
            <InkBar className="absolute inset-x-0 top-0 h-1.5" />
            <span className="mt-2 grid h-11 w-11 place-items-center rounded-lg" style={{ background: tint(index, 22) }}>
              <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className="grid gap-1">
              {product.code && (
                <span className="font-heading text-[clamp(1.25rem,0.9rem+1.2vw,1.9rem)] font-bold leading-none tracking-[-0.02em] text-ink">
                  {product.code}
                </span>
              )}
              <span className="text-[13px] font-medium leading-snug text-ink/60">{product.name}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- header */

function SearchLink({ className = '' }) {
  return (
    <a
      href="/quote"
      className={`group flex min-h-[48px] min-w-0 items-center gap-3 rounded-xl border-2 border-line bg-surface pl-4 pr-1.5 text-ink no-underline transition hover:border-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${className}`}
      aria-label="What do you need printed? Request a quote"
    >
      <Search size={18} className="flex-none text-ink/50" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate text-[16px] text-ink/60">What do you need printed?</span>
      <span className="flex min-h-[38px] flex-none items-center gap-1.5 rounded-lg bg-primary px-3.5 text-[14px] font-semibold text-[color:var(--on-primary)]">
        <span className="hidden sm:inline">Get a Quote</span>
        <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </a>
  );
}

function MegaMenu({ b, cats, open, id }) {
  const promo = b.promo;
  return (
    <div
      id={id}
      hidden={!open}
      className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-190px)] overflow-y-auto border-y border-line bg-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.35)]"
    >
      <div className={`${wrap} grid grid-cols-[minmax(0,1fr)_260px] gap-8 py-8 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-10`}>
        <div className="grid grid-cols-3 gap-x-8 gap-y-8">
          {cats.map((c, i) => {
            const Icon = CATEGORY_ICONS[c.icon] || Printer;
            return (
              <div key={c.slug} className="min-w-0">
                <a
                  href={`/products/${c.slug}`}
                  className="group flex min-h-[44px] items-center gap-3 font-heading text-[17px] font-bold text-ink no-underline hover:text-primary"
                >
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-lg" style={{ background: tint(i, 22), color: inkText(i) }}>
                    <Icon size={19} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">{c.title}</span>
                </a>
                <ul className="mt-2 grid border-l-2 pl-3" style={{ borderColor: tint(i, 45) }}>
                  {list(c.products).map((p) => (
                    <li key={p.slug}>
                      <a
                        href={productHref(c, p)}
                        className="flex min-h-[36px] items-center py-1 text-[16px] lg:text-[15px] leading-snug text-ink/75 no-underline hover:text-primary hover:underline"
                      >
                        {p.name}
                      </a>
                    </li>
                  ))}
                </ul>
                <a
                  href={`/products/${c.slug}`}
                  className="mt-1 inline-flex min-h-[40px] items-center gap-1 pl-3 text-[14px] font-semibold text-primary no-underline hover:underline"
                >
                  All {c.title} <ChevronRight size={15} aria-hidden="true" />
                </a>
              </div>
            );
          })}
        </div>
        <a
          href={promo?.href || '/quote'}
          className="group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl bg-primary-deep p-6 text-white no-underline"
        >
          {promo?.image && (
            <Img
              className="absolute inset-0 h-full w-full object-cover opacity-55 transition duration-500 group-hover:scale-105"
              src={promo.image}
              alt=""
              sizes="300px"
            />
          )}
          <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,color-mix(in_srgb,var(--primaryDeep)_92%,transparent)_75%)]" aria-hidden="true" />
          <span className="relative">
            <span className="mb-3 inline-flex rounded-full bg-accent px-3 py-1 text-[12px] font-bold uppercase tracking-[0.12em] text-[color:var(--on-accent)]">
              {promo?.eyebrow || 'Custom Jobs'}
            </span>
            <span className="block font-heading text-[24px] font-bold leading-tight">{promo?.title || 'Something not listed?'}</span>
            <span className="mt-2 block text-[16px] lg:text-[15px] leading-snug text-white/85">
              {promo?.text || 'Send us the size, quantity and deadline and we will quote it.'}
            </span>
            <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-accent">
              {promo?.cta || 'Request a Quote'} <ArrowRight size={16} aria-hidden="true" />
            </span>
          </span>
        </a>
      </div>
    </div>
  );
}

function Header({ b, cats, tel, current }) {
  const [menu, setMenu] = useState(false);
  const [mega, setMega] = useState(false);
  const [section, setSection] = useState(null);
  const megaRef = useRef(null);
  const triggerRef = useRef(null);
  const timer = useRef(0);
  const openedAt = useRef(0);
  const quiet = useRef(false);
  const stick = b.preview ? 'top-11' : 'top-0';

  const show = () => {
    clearTimeout(timer.current);
    if (!mega) openedAt.current = Date.now();
    setMega(true);
  };
  const hide = (delay = 140) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMega(false), delay);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!mega && !menu) return undefined;
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (mega) {
        setMega(false);
        quiet.current = true;
        triggerRef.current?.focus();
        quiet.current = false;
      }
      setMenu(false);
    };
    const onDown = (event) => {
      if (mega && megaRef.current && !megaRef.current.contains(event.target)) setMega(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [mega, menu]);

  const navLink = (href, label, key) => (
    <a
      href={href}
      aria-current={current === key ? 'page' : undefined}
      className={`relative flex min-h-[48px] items-center px-3 text-[16px] lg:text-[15px] font-semibold no-underline transition hover:text-primary ${
        current === key ? 'text-primary after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t after:bg-primary' : 'text-ink/80'
      }`}
    >
      {label}
    </a>
  );

  return (
    <header className={`sticky ${stick} z-40 border-b border-line bg-white`}>
      <div className={`${wrap} flex min-h-[64px] items-center gap-4 py-2 lg:min-h-[78px] lg:gap-8`}>
        <a href="/" className="flex min-h-[44px] min-w-0 flex-none items-center" aria-label={`${b.name} home`}>
          <Mark b={b} className="max-h-[40px] lg:max-h-[46px]" textClass="text-ink" />
        </a>
        <SearchLink className="hidden max-w-[560px] flex-1 lg:flex" />
        <div className="ml-auto flex flex-none items-center gap-2 sm:gap-3">
          <a href={tel} className="hidden min-h-[44px] items-center gap-2.5 text-ink no-underline hover:text-primary xl:flex">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-surface text-primary">
              <Phone size={17} aria-hidden="true" />
            </span>
            <span className="grid leading-tight">
              <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink/55">Call the Shop</span>
              <strong className="whitespace-nowrap font-heading text-[18px] font-bold">{b.phone}</strong>
            </span>
          </a>
          <a href="/quote" className={`${btnAccent} hidden !min-h-[48px] sm:inline-flex`}>
            Request a Quote
          </a>
          <a
            href={tel}
            aria-label={`Call ${b.phone}`}
            className="grid h-11 w-11 place-items-center rounded-xl border-2 border-line text-primary sm:hidden"
          >
            <Phone size={19} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-ink px-3.5 font-semibold text-white lg:hidden"
            aria-expanded={menu}
            aria-controls="print-menu"
            onClick={() => setMenu((v) => !v)}
          >
            {menu ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
            <span>{menu ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>

      <div className="hidden border-t border-line lg:block">
        <div className={`${wrap} flex items-center justify-between gap-6`}>
          <nav aria-label="Main" className="-ml-3 flex items-center">
            <div
              ref={megaRef}
              onMouseEnter={show}
              onMouseLeave={() => hide()}
              onFocus={() => !quiet.current && show()}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) hide(0);
              }}
            >
              <button
                ref={triggerRef}
                type="button"
                aria-expanded={mega}
                aria-controls="print-mega"
                onClick={() => {
                  if (mega && Date.now() - openedAt.current > 350) setMega(false);
                  else show();
                }}
                className={`relative flex min-h-[48px] cursor-pointer items-center gap-1.5 px-3 text-[16px] lg:text-[15px] font-semibold transition hover:text-primary ${
                  mega || current.startsWith('products') ? 'text-primary' : 'text-ink/80'
                } ${current === 'products' || (current.startsWith('products/') && !cats.slice(0, 3).some((c) => current === `products/${c.slug}`)) ? 'after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t after:bg-primary' : ''}`}
              >
                Products <ChevronDown size={16} className={`transition ${mega ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <MegaMenu b={b} cats={cats} open={mega} id="print-mega" />
            </div>
            {cats.slice(0, 3).map((c) => (
              <span key={c.slug} className="hidden xl:contents">
                {navLink(`/products/${c.slug}`, c.title, `products/${c.slug}`)}
              </span>
            ))}
            {navLink('/quote', 'Request a Quote', 'quote')}
            {navLink('/about', 'About', 'about')}
            {navLink('/contact', 'Contact', 'contact')}
          </nav>
          <p className="flex min-w-0 items-center gap-2 text-[14px] text-ink/65">
            <MapPin size={15} className="flex-none text-primary" aria-hidden="true" />
            <span className="truncate">
              {b.address}, {b.town}
            </span>
          </p>
        </div>
      </div>

      <div
        id="print-menu"
        hidden={!menu}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-112px)] overflow-y-auto border-b border-line bg-white shadow-[0_24px_40px_-24px_rgba(0,0,0,0.35)] lg:hidden"
      >
        <div className={`${wrap} pb-6 pt-4`}>
          <SearchLink />
          <nav aria-label="Mobile" className="mt-4">
            <p className="pb-2 pt-1 font-heading text-[13px] font-semibold uppercase tracking-[0.16em] text-ink/55">Products</p>
            <ul className="border-t border-line">
              {cats.map((c, i) => {
                const Icon = CATEGORY_ICONS[c.icon] || Printer;
                const isOpen = section === c.slug;
                return (
                  <li key={c.slug} className="border-b border-line">
                    <h2 className="m-0">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`m-${c.slug}`}
                        onClick={() => setSection(isOpen ? null : c.slug)}
                        className="flex min-h-[56px] w-full cursor-pointer items-center gap-3 text-left font-heading text-[18px] font-bold text-ink"
                      >
                        <span className="grid h-9 w-9 flex-none place-items-center rounded-lg" style={{ background: tint(i, 22), color: inkText(i) }}>
                          <Icon size={17} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">{c.title}</span>
                        <ChevronDown size={19} className={`flex-none text-ink/50 transition ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                      </button>
                    </h2>
                    <ul id={`m-${c.slug}`} hidden={!isOpen} className="pb-3 pl-12">
                      <li>
                        <a href={`/products/${c.slug}`} className="flex min-h-[44px] items-center gap-1 font-semibold text-primary no-underline">
                          All {c.title} <ChevronRight size={16} aria-hidden="true" />
                        </a>
                      </li>
                      {list(c.products).map((p) => (
                        <li key={p.slug}>
                          <a href={productHref(c, p)} className="flex min-h-[44px] items-center text-[16px] text-ink/80 no-underline">
                            {p.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
            <ul className="mt-2">
              {[
                ['/products', 'All Products'],
                ['/quote', 'Request a Quote'],
                ['/about', 'About'],
                ['/contact', 'Contact'],
              ].map(([href, label]) => (
                <li key={href} className="border-b border-line">
                  <a href={href} className="flex min-h-[54px] items-center justify-between font-heading text-[18px] font-bold text-ink no-underline">
                    {label} <ArrowRight size={18} className="text-primary" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a href="/quote" className={btnAccent}>
              Request a Quote
            </a>
            <a href={tel} className={btnLine}>
              <Phone size={17} aria-hidden="true" /> {b.phone}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function Announcement({ b }) {
  const a = b.announcement;
  if (!a?.text) return null;
  return (
    <div className="bg-ink text-[16px] text-white lg:text-[14px]">
      <div className={`${wrap} flex min-h-[40px] items-center justify-center gap-3 py-2 text-center`}>
        <InkDots size={6} />
        <p className="m-0 min-w-0 leading-snug">
          {a.text}{' '}
          {a.linkLabel && a.href && (
            <a href={a.href} className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-accent underline-offset-4 hover:underline">
              {a.linkLabel} <ArrowRight size={14} aria-hidden="true" />
            </a>
          )}
        </p>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- sections */

function Crumbs({ trail }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[14px] text-ink/60">
        {trail.map(([href, label], i) => (
          <li key={label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="flex-none text-ink/35" aria-hidden="true" />}
            {href ? (
              <a href={href} className="inline-flex min-h-[44px] items-center text-ink/70 no-underline hover:text-primary hover:underline">
                {label}
              </a>
            ) : (
              <span aria-current="page" className="font-semibold text-ink">
                {label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** The plain page top for inner pages. */
function PageHead({ trail, eyebrow, title, lead, children }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-surface">
      <Reg className="absolute right-[4%] top-8 hidden h-7 w-7 text-ink/20 md:block" />
      <div className={`${wrap} pb-12 pt-8 sm:pb-14 sm:pt-10`}>
        <Crumbs trail={trail} />
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className={`${h1} max-w-[18ch]`}>{title}</h1>
        {lead && <p className="mt-5 max-w-[40rem] text-[17px] leading-[1.6] text-ink/75 sm:text-[19px]">{lead}</p>}
        {children}
      </div>
      <InkBar />
    </section>
  );
}

function Highlights({ b }) {
  const items = list(b.highlights).slice(0, 4);
  if (!items.length) return null;
  const cols = ['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-2 lg:grid-cols-3', 'sm:grid-cols-2 xl:grid-cols-4'][items.length];
  return (
    <section aria-label="How we work" className="border-b border-line bg-white">
      <ul className={`${wrap} grid gap-x-8 py-4 sm:py-8 ${cols}`}>
        {items.map((h, i) => {
          const Icon = HIGHLIGHT_ICONS[h.icon] || BadgeCheck;
          return (
            <li key={h.title} className="flex gap-4 border-b border-line py-4 last:border-0 sm:border-0">
              <span className="grid h-12 w-12 flex-none place-items-center rounded-xl" style={{ background: tint(i, 20), color: inkText(i) }}>
                <Icon size={22} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <strong className="block font-heading text-[18px] font-bold leading-tight">{h.title}</strong>
                {h.text && <span className="mt-1 block text-[16px] lg:text-[15px] leading-[1.5] text-ink/70">{h.text}</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CategoryCard({ c, i, eager = false }) {
  const products = list(c.products);
  const image = c.image || products.find((p) => p.image)?.image;
  const alt = c.image ? c.imageAlt || c.title : products.find((p) => p.image)?.imageAlt || c.title;
  return (
    <article className="group relative flex flex-col rounded-[22px] p-3 transition duration-200 hover:-translate-y-1" style={{ background: tint(i, 16) }}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white">
        {image && (
          <Img
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            src={image}
            alt={alt}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            eager={eager}
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-ink shadow-sm">
          {products.length} {products.length === 1 ? 'Product' : 'Products'}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <h3 className="font-heading text-[22px] font-bold leading-tight tracking-[-0.02em]">
          <a href={`/products/${c.slug}`} className="text-ink no-underline after:absolute after:inset-0 after:rounded-[22px] after:content-[''] focus-visible:outline-none">
            {c.title}
          </a>
        </h3>
        {c.blurb && <p className="mt-2 text-[16px] leading-[1.5] text-ink/70">{c.blurb}</p>}
        <span className="mt-auto flex items-center gap-2.5 pt-5 font-semibold text-ink">
          Shop {c.title}
          <span
            className="grid h-7 w-7 flex-none place-items-center rounded-full transition group-hover:translate-x-1"
            style={{ background: ink(i), color: `var(--on-${INKS[i % INKS.length]})` }}
          >
            <ArrowRight size={15} aria-hidden="true" />
          </span>
        </span>
      </div>
      <span className="pointer-events-none absolute inset-0 rounded-[22px] ring-primary ring-offset-2 group-focus-within:ring-2" aria-hidden="true" />
    </article>
  );
}

function ProductCard({ c, p, i }) {
  return (
    <article className="group relative flex flex-col">
      <ProductVisual product={p} category={c} index={i} className="aspect-square" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
      <div className="flex flex-1 flex-col pt-4">
        <p className="flex flex-wrap items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-ink/55">
          {c.title}
          {p.code && <span className="rounded-md border border-line px-1.5 py-0.5 font-heading normal-case tracking-normal text-ink/70">{p.code}</span>}
        </p>
        <h3 className="mt-1.5 font-heading text-[19px] font-bold leading-snug tracking-[-0.01em]">
          <a href={productHref(c, p)} className="text-ink no-underline after:absolute after:inset-0 after:content-[''] group-hover:text-primary">
            {p.name}
          </a>
        </h3>
        {p.turnaround && (
          <p className="mt-2 flex items-center gap-1.5 text-[16px] lg:text-[15px] text-ink/70">
            <Clock size={15} className="flex-none text-primary" aria-hidden="true" /> {p.turnaround}
          </p>
        )}
      </div>
    </article>
  );
}

function Reviews({ b }) {
  const reviews = list(b.reviews);
  const rating = ratingLine(b);
  if (!reviews.length && !rating) return null;
  return (
    <section className={`${pad} bg-white`}>
      <div className={wrap}>
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>Reviews</Eyebrow>
            <h2 className={h2}>What customers say about the work</h2>
          </div>
          {rating && (
            <div className="flex items-center gap-4 rounded-2xl bg-surface px-5 py-4">
              <strong className="font-heading text-[44px] font-bold leading-none tracking-[-0.03em]">{Number(b.rating).toFixed(1)}</strong>
              <span className="grid gap-1">
                <Stars value={b.rating} size={17} />
                <span className="text-[16px] lg:text-[15px] font-medium text-ink/70">{b.reviewCount.toLocaleString()} Google reviews</span>
              </span>
            </div>
          )}
        </div>
        {reviews.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:gap-5">
            {reviews.slice(0, 4).map((r, i) => (
              <figure key={`${r.author}-${i}`} className="relative m-0 flex flex-col overflow-hidden rounded-2xl border border-line bg-white p-6 pl-8 sm:p-8 sm:pl-10">
                <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: ink(i) }} aria-hidden="true" />
                <Stars value={5} size={15} />
                <blockquote className="mb-5 mt-4 text-[17px] leading-[1.6] text-ink/85">{r.text}</blockquote>
                <figcaption className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-[16px] lg:text-[15px]">
                  <strong className="font-semibold">{r.author}</strong>
                  {r.product && <span className="text-ink/55">· {r.product}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function Process({ b, compact = false }) {
  const steps = list(b.process).slice(0, 4);
  if (!steps.length) return null;
  if (compact) {
    return (
      <ol className="grid gap-4">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-4">
            <span
              className="grid h-9 w-9 flex-none place-items-center rounded-lg font-heading text-[16px] font-bold"
              style={{ background: ink(i), color: `var(--on-${INKS[i % 4]})` }}
            >
              {i + 1}
            </span>
            <span className="min-w-0">
              <strong className="block font-heading text-[17px] font-bold">{s.title}</strong>
              <span className="mt-0.5 block text-[16px] lg:text-[15px] leading-[1.5] text-ink/70">{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <section className={`${pad} bg-surface`}>
      <div className={wrap}>
        <div className="mb-10 max-w-2xl">
          <Eyebrow>How ordering works</Eyebrow>
          <h2 className={h2}>From file to finished, in {steps.length} steps.</h2>
        </div>
        <ol className={`grid gap-4 sm:grid-cols-2 ${steps.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {steps.map((s, i) => (
            <li key={s.title} className="relative overflow-hidden rounded-2xl bg-white p-6 pt-0">
              <span className="-mx-6 mb-6 block h-1.5" style={{ background: ink(i) }} aria-hidden="true" />
              <span className="font-heading text-[44px] font-bold leading-none tracking-[-0.04em]" style={{ color: inkText(i) }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 font-heading text-[20px] font-bold leading-tight">{s.title}</h3>
              <p className="mt-2 leading-[1.55] text-ink/70">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function QuoteBand({ b, tel }) {
  return (
    <section className="relative overflow-hidden bg-accent text-[color:var(--on-accent)]">
      <Reg className="absolute -right-6 -top-6 h-40 w-40 opacity-15" />
      <div className={`${wrap} grid items-center gap-8 py-[clamp(3rem,7vw,5rem)] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16`}>
        <div>
          <h2 className={h2}>Tell us what you need printed.</h2>
          <p className="mt-3 max-w-[38rem] text-[17px] leading-[1.6] opacity-85 sm:text-[18px]">
            Product, quantity, size and when you need it. You get a proof and a price before anything prints.
          </p>
        </div>
        <div className="grid gap-3 sm:flex sm:flex-wrap">
          <a href="/quote" className={`${btn} bg-ink text-white hover:bg-ink/90`}>
            Request a Quote <ArrowRight size={18} aria-hidden="true" />
          </a>
          <a href={tel} className={`${btn} border-2 border-[color:color-mix(in_srgb,currentColor_30%,transparent)] bg-white/30 hover:bg-white/50`}>
            <Phone size={18} aria-hidden="true" /> {b.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer({ b, tel }) {
  const hours = list(b.hours);
  const heading = 'mb-4 font-heading text-[13px] font-semibold uppercase tracking-[0.16em] text-white/55';
  const link = 'flex min-h-[44px] items-center text-white/85 no-underline hover:text-accent';
  return (
    <footer className="bg-ink text-white/75">
      <div className={`${wrap} grid gap-10 pb-12 pt-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1.1fr] lg:gap-12`}>
        <div className="grid content-start gap-5">
          {b.brand.logo ? (
            <span className="inline-flex w-fit rounded-xl bg-white px-4 py-3">
              <Mark b={b} className="max-h-[44px]" />
            </span>
          ) : (
            <Mark b={b} textClass="text-white" />
          )}
          <p className="max-w-sm leading-[1.6]">
            A print shop in {b.town}, {b.state}
            {b.since ? `, since ${b.since}` : ''}.
          </p>
        </div>
        <div>
          <h2 className={heading}>Shop</h2>
          <ul className="-my-1 grid">
            {[
              ['/products', 'All Products'],
              ['/quote', 'Request a Quote'],
              ['/about', 'About'],
              ['/contact', 'Contact'],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} className={link}>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className={heading}>Visit</h2>
          <a href={tel} className="flex min-h-[44px] items-center font-heading text-[24px] font-bold text-white no-underline hover:text-accent">
            {b.phone}
          </a>
          {b.email && (
            <a href={`mailto:${b.email}`} className={`${link} break-all`}>
              {b.email}
            </a>
          )}
          <a href={mapsHref(b)} className="block py-2 leading-[1.6] text-white/85 no-underline hover:text-accent">
            {b.address}
            <br />
            {b.town}, {b.state} {b.zip}
          </a>
          {hours.length > 0 && (
            <dl className="mt-3 grid gap-1.5 text-[16px] lg:text-[15px]">
              {hours.map(([d, h]) => (
                <div key={d} className="flex flex-wrap gap-x-2">
                  <dt className="text-white/55">{d}</dt>
                  <dd className="m-0 text-white/90">{h}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
      <div className={wrap}>
        <p className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-6 text-[15px] text-white/50">
          <span>
            &copy; {new Date().getFullYear()} {b.name}
            <StudioCredit b={b} />
          </span>
          <Reg className="h-4 w-4" />
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ pages */

function Home({ b, cats, tel }) {
  const rating = ratingLine(b);
  const all = cats.flatMap((c) => list(c.products).map((p) => [c, p]));
  // Featured products first, then the first of each category, then the
  // rest, cut to a full row of four (or two on a small catalog).
  const firsts = cats.filter((c) => list(c.products)[0]).map((c) => [c, c.products[0]]);
  const pool = [...new Set([...all.filter(([, p]) => p.featured), ...firsts, ...all].map(([c, p]) => `${c.slug}/${p.slug}`))].map((k) =>
    all.find(([c, p]) => `${c.slug}/${p.slug}` === k),
  );
  const popular = pool.slice(0, pool.length >= 8 ? 8 : pool.length >= 4 ? 4 : pool.length - (pool.length % 2));
  const lead = popular[0];
  const promo = b.promo;
  const about = b.about;

  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className={`${wrap} grid items-center gap-10 pb-14 pt-8 sm:pt-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-14 lg:pb-20 lg:pt-16`}>
          <div className="min-w-0">
            {b.hero.eyebrow && <Eyebrow>{b.hero.eyebrow}</Eyebrow>}
            <h1 className={h1}>
              {b.hero.title}{' '}
              {b.hero.titleAccent && (
                <span className="box-decoration-clone bg-[linear-gradient(transparent_64%,color-mix(in_srgb,var(--accent)_75%,transparent)_64%,color-mix(in_srgb,var(--accent)_75%,transparent)_92%,transparent_92%)] text-primary">
                  {b.hero.titleAccent}
                </span>
              )}
            </h1>
            <p className="mt-6 max-w-[36rem] text-[17px] leading-[1.6] text-ink/75 sm:text-[19px]">{b.hero.lead}</p>
            <SearchLink className="mt-7 max-w-[560px] lg:hidden" />
            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap lg:mt-8">
              <a href="/quote" className={btnPrimary}>
                Request a Quote <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a href="/products" className={btnLine}>
                Browse Products
              </a>
            </div>
            {rating && (
              <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-[16px] lg:text-[15px] font-medium text-ink/75">
                <Stars value={b.rating} size={16} /> <span>{rating}</span>
              </p>
            )}
          </div>
          <div className="relative min-w-0">
            <div className="relative rounded-[28px] p-3 sm:p-4" style={{ background: tint(0, 16) }}>
              <Reg className="absolute -left-2.5 -top-2.5 h-5 w-5 text-ink/40" />
              <Reg className="absolute -bottom-2.5 -right-2.5 h-5 w-5 text-ink/40" />
              <Img
                className="aspect-[4/3] w-full rounded-[20px] object-cover lg:aspect-[5/4]"
                src={b.hero.image}
                alt={b.hero.imageAlt}
                sizes="(max-width: 1024px) 100vw, 48vw"
                eager
              />
              <InkBar className="absolute inset-x-8 bottom-0 h-1.5 overflow-hidden rounded-t" />
            </div>
            {lead && (
              <a
                href={productHref(lead[0], lead[1])}
                className="relative -mt-8 ml-4 flex w-fit max-w-[calc(100%-2rem)] items-center gap-3 rounded-2xl bg-white p-3 pr-5 text-ink no-underline shadow-[0_24px_50px_-24px_rgba(0,0,0,0.45)] sm:absolute sm:-bottom-6 sm:-left-4 sm:m-0 lg:-left-8"
              >
                <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-accent text-[color:var(--on-accent)]">
                  <Clock size={22} aria-hidden="true" />
                </span>
                <span className="grid min-w-0 leading-tight">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink/55">Popular</span>
                  <strong className="truncate font-heading text-[17px] font-bold">{lead[1].name}</strong>
                  {lead[1].turnaround && <span className="text-[14px] text-ink/70">{lead[1].turnaround}</span>}
                </span>
              </a>
            )}
          </div>
        </div>
      </section>

      <Highlights b={b} />

      <section className={`${pad} bg-white`}>
        <div className={wrap}>
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <Eyebrow>Shop by category</Eyebrow>
              <h2 className={h2}>What we print</h2>
            </div>
            <a href="/products" className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-primary no-underline hover:underline">
              See Every Product <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((c, i) => (
              <CategoryCard key={c.slug} c={c} i={i} />
            ))}
          </div>
        </div>
      </section>

      {popular.length > 0 && (
        <section className={`${pad} border-t border-line bg-white`}>
          <div className={wrap}>
            <div className="mb-10 max-w-2xl">
              <Eyebrow>Popular right now</Eyebrow>
              <h2 className={h2}>The jobs customers order most</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
              {popular.map(([c, p], i) => (
                <ProductCard key={p.slug} c={c} p={p} i={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {promo?.title && (
        <section className="relative isolate overflow-hidden bg-primary-deep text-white">
          <div className={`${wrap} grid items-center gap-10 py-[clamp(3.5rem,8vw,6rem)] lg:grid-cols-2 lg:gap-16`}>
            <div className="min-w-0">
              {promo.eyebrow && <Eyebrow dark>{promo.eyebrow}</Eyebrow>}
              <h2 className={h2}>{promo.title}</h2>
              <p className="mt-4 max-w-[34rem] text-[17px] leading-[1.6] text-white/85 sm:text-[18px]">{promo.text}</p>
              <a href={promo.href || '/quote'} className={`${btnAccent} mt-8 w-full sm:w-auto`}>
                {promo.cta || 'Request a Quote'} <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            {promo.image && (
              <div className="relative overflow-hidden rounded-[22px]">
                <Img className="aspect-[16/10] w-full object-cover" src={promo.image} alt={promo.imageAlt || ''} sizes="(max-width: 1024px) 100vw, 50vw" />
                <InkBar className="absolute inset-x-0 bottom-0 h-2.5" />
              </div>
            )}
          </div>
        </section>
      )}

      <Process b={b} />

      {about?.title && (
        <section className={`${pad} bg-white`}>
          <div className={`${wrap} grid items-center gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20`}>
            {about.image && (
              <Img className="aspect-[4/3] w-full rounded-[22px] object-cover" src={about.image} alt={about.imageAlt || ''} sizes="(max-width: 768px) 100vw, 45vw" />
            )}
            <div className={about.image ? '' : 'md:col-span-2 max-w-3xl'}>
              <Eyebrow>{about.eyebrow || 'About the shop'}</Eyebrow>
              <h2 className={h2}>{about.title}</h2>
              <p className="mt-5 text-[17px] leading-[1.65] text-ink/75 sm:text-[18px]">{paragraphs(about.text)[0]}</p>
              <a href="/about" className="mt-6 inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-primary no-underline hover:underline">
                About {b.shortName} <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      )}

      <Reviews b={b} />
      <QuoteBand b={b} tel={tel} />
    </>
  );
}

function Catalog({ b, cats, tel }) {
  const count = cats.reduce((n, c) => n + list(c.products).length, 0);
  return (
    <>
      <PageHead
        trail={[['/', 'Home'], [null, 'Products']]}
        eyebrow="The catalog"
        title="Everything we print"
        lead={`${cats.length} categories and ${count} products, every one quoted to your size, quantity and deadline.`}
      >
        <ul className="mt-7 flex flex-wrap gap-2">
          {cats.map((c, i) => (
            <li key={c.slug}>
              <a
                href={`#${c.slug}`}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-4 text-[16px] lg:text-[15px] font-semibold text-ink no-underline ring-1 ring-line hover:ring-primary"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: ink(i) }} aria-hidden="true" />
                {c.title}
              </a>
            </li>
          ))}
        </ul>
      </PageHead>
      <div className={`${wrap} ${pad} grid gap-[clamp(3rem,6vw,5rem)]`}>
        {cats.map((c, i) => {
          const products = list(c.products);
          const image = c.image || products.find((p) => p.image)?.image;
          return (
            <section key={c.slug} id={c.slug} className={`${anchor} grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14`}>
              <a href={`/products/${c.slug}`} className="group block rounded-[24px] p-3 no-underline" style={{ background: tint(i, 16) }}>
                {image && (
                  <Img
                    className="aspect-[4/3] w-full rounded-[18px] object-cover"
                    src={image}
                    alt={c.imageAlt || c.title}
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    eager={i === 0}
                  />
                )}
                <span className="flex items-center justify-between gap-3 px-2 pb-1 pt-4 font-semibold text-ink">
                  <span>Open {c.title}</span>
                  <ArrowRight size={18} className="transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </a>
              <div className="min-w-0">
                <p className="mb-3 font-heading text-[14px] font-semibold tracking-[0.12em] text-ink/50">
                  {String(i + 1).padStart(2, '0')} / {String(cats.length).padStart(2, '0')}
                </p>
                <h2 className={h2}>{c.title}</h2>
                {c.intro && <p className="mt-4 max-w-[40rem] text-[17px] leading-[1.6] text-ink/75">{c.intro}</p>}
                <ul className="mt-6 border-t border-line">
                  {products.map((p) => (
                    <li key={p.slug} className="border-b border-line">
                      <a
                        href={productHref(c, p)}
                        className="group flex min-h-[60px] flex-wrap items-center gap-x-4 gap-y-1 py-3 text-ink no-underline"
                      >
                        <span className="min-w-0 flex-1 font-heading text-[18px] font-bold group-hover:text-primary">{p.name}</span>
                        {p.turnaround && <span className="text-[16px] text-ink/60 lg:text-[14px]">{p.turnaround}</span>}
                        <ArrowRight size={17} className="flex-none text-primary transition group-hover:translate-x-1" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })}
      </div>
      <QuoteBand b={b} tel={tel} />
    </>
  );
}

function Category({ b, cats, c, tel }) {
  const i = cats.indexOf(c);
  const products = list(c.products);
  const image = c.image || products.find((p) => p.image)?.image;
  const others = cats.filter((x) => x !== c);
  return (
    <>
      <section className="relative overflow-hidden border-b border-line" style={{ background: tint(i, 12) }}>
        <div className={`${wrap} grid items-center gap-10 pb-12 pt-8 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-14 lg:pb-16`}>
          <div className="min-w-0">
            <Crumbs trail={[['/', 'Home'], ['/products', 'Products'], [null, c.title]]} />
            <Eyebrow>{`${products.length} ${products.length === 1 ? 'product' : 'products'}`}</Eyebrow>
            <h1 className={h1}>{c.title}</h1>
            {c.intro && <p className="mt-5 max-w-[38rem] text-[17px] leading-[1.6] text-ink/75 sm:text-[19px]">{c.intro}</p>}
            <ul className="mt-7 flex flex-wrap gap-2" aria-label={`Jump to a ${c.title} product`}>
              {products.map((p) => (
                <li key={p.slug}>
                  <a
                    href={`#${p.slug}`}
                    className="inline-flex min-h-[44px] items-center rounded-full bg-white px-4 text-[16px] lg:text-[15px] font-semibold text-ink no-underline ring-1 ring-ink/10 hover:ring-primary"
                  >
                    {p.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {image && (
            <div className="relative">
              <Img
                className="aspect-[4/3] w-full rounded-[24px] object-cover shadow-[0_30px_60px_-34px_rgba(0,0,0,0.6)]"
                src={image}
                alt={c.imageAlt || c.title}
                sizes="(max-width: 1024px) 100vw, 44vw"
                eager
              />
              <Reg className="absolute -right-3 -top-3 h-6 w-6 text-ink/40" />
            </div>
          )}
        </div>
        <InkBar />
      </section>

      <div className={`${wrap} py-[clamp(2.5rem,6vw,4.5rem)]`}>
        {products.map((p, n) => (
          <section
            key={p.slug}
            id={p.slug}
            aria-labelledby={`${p.slug}-title`}
            className={`${anchor} grid items-center gap-8 border-b border-line py-[clamp(2.5rem,5vw,4rem)] last:border-0 md:grid-cols-2 lg:gap-16`}
          >
            <ProductVisual
              product={p}
              category={c}
              index={i + n}
              className={`aspect-[4/3] ${n % 2 ? 'md:order-2' : ''}`}
              sizes="(max-width: 768px) 100vw, 46vw"
            />
            <div className="min-w-0">
              <p className="mb-3 flex flex-wrap items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-ink/55">
                <span>{c.title}</span>
                {p.code && <span className="rounded-md bg-surface px-2 py-1 font-heading normal-case tracking-normal text-ink/75">{p.code}</span>}
              </p>
              <h2 id={`${p.slug}-title`} className="font-heading text-[clamp(1.6rem,1.2rem+1.5vw,2.3rem)] font-bold leading-[1.1] tracking-[-0.025em]">
                {p.name}
              </h2>
              <p className="mt-4 text-[17px] leading-[1.6] text-ink/75 sm:text-[18px]">{p.text}</p>
              {list(p.details).length > 0 && (
                <ul className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {p.details.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-[16px] leading-snug">
                      <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full" style={{ background: tint(i + n, 30), color: inkText(i + n) }}>
                        <Check size={13} strokeWidth={3} aria-hidden="true" />
                      </span>
                      {d}
                    </li>
                  ))}
                </ul>
              )}
              {p.turnaround && (
                <p className="mt-6 flex items-center gap-2 rounded-xl bg-surface px-4 py-3 text-[16px] lg:text-[15px]">
                  <Clock size={17} className="flex-none text-primary" aria-hidden="true" />
                  <span>
                    <span className="text-ink/60">Turnaround:</span> <strong className="font-semibold">{p.turnaround}</strong>
                  </span>
                </p>
              )}
              <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
                <a href="/quote" className={btnPrimary}>
                  Request a Quote <ArrowRight size={18} aria-hidden="true" />
                </a>
                <a href={tel} className={btnLine}>
                  <Phone size={17} aria-hidden="true" /> {b.phone}
                </a>
              </div>
            </div>
          </section>
        ))}
      </div>

      {others.length > 0 && (
        <section className={`${pad} border-t border-line bg-surface`}>
          <div className={wrap}>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className={h2}>More from the shop</h2>
              <a href="/products" className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-primary no-underline hover:underline">
                All Products <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((o) => {
                const k = cats.indexOf(o);
                const Icon = CATEGORY_ICONS[o.icon] || Printer;
                return (
                  <li key={o.slug}>
                    <a href={`/products/${o.slug}`} className="group flex min-h-[76px] items-center gap-4 rounded-2xl bg-white p-4 text-ink no-underline ring-1 ring-line hover:ring-primary">
                      <span className="grid h-12 w-12 flex-none place-items-center rounded-xl" style={{ background: tint(k, 22), color: inkText(k) }}>
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block font-heading text-[18px] font-bold">{o.title}</strong>
                        {o.blurb && <span className="mt-0.5 block text-[16px] leading-snug text-ink/65 lg:text-[15px]">{o.blurb}</span>}
                      </span>
                      <ArrowRight size={18} className="flex-none text-primary transition group-hover:translate-x-1" aria-hidden="true" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}
      <QuoteBand b={b} tel={tel} />
    </>
  );
}

function ContactList({ b, tel }) {
  return (
    <ul className="grid gap-2">
      {[
        [Phone, tel, b.phone],
        b.email && [Mail, `mailto:${b.email}`, b.email],
        [MapPin, mapsHref(b), `${b.address}, ${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`],
      ]
        .filter(Boolean)
        .map(([Icon, href, label]) => (
          <li key={href}>
            <a href={href} className="flex min-h-[48px] items-center gap-3 font-semibold text-ink no-underline hover:text-primary">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-white text-primary ring-1 ring-line">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0 break-words">{label}</span>
            </a>
          </li>
        ))}
    </ul>
  );
}

function HoursTable({ b }) {
  const hours = list(b.hours);
  if (!hours.length) return null;
  return (
    <table className="w-full border-collapse text-[16px]">
      <caption className="sr-only">Opening hours</caption>
      <tbody>
        {hours.map(([d, h]) => (
          <tr key={d} className="border-b border-line last:border-0">
            <th scope="row" className="py-3 pr-4 text-left font-medium text-ink/65">
              {d}
            </th>
            <td className="py-3 text-right font-semibold">{h}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const formStyles = {
  form: '',
  label: 'text-[15px] font-semibold text-ink',
  field:
    'min-h-[50px] rounded-xl border-2 border-line bg-white px-3.5 py-3 text-[16px] font-normal text-ink focus:border-primary focus:outline-none',
  button: `${btnPrimary} w-full`,
  done: 'rounded-xl bg-surface p-5 text-[16px]',
};

function Quote({ b, cats, tel }) {
  const options = cats.flatMap((c) => list(c.products).map((p) => p.name));
  return (
    <>
      <PageHead
        trail={[['/', 'Home'], [null, 'Request a Quote']]}
        eyebrow="Request a quote"
        title="Tell us what you need printed"
        lead="Fill in what you know. We reply with a price and a proof, and nothing prints until you approve it."
      />
      <section className={`${pad} bg-white`}>
        <div className={`${wrap} grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:gap-14`}>
          <div className="rounded-[24px] border border-line p-5 sm:p-8 lg:p-10">
            <h2 className="mb-6 font-heading text-[24px] font-bold leading-tight tracking-[-0.02em]">Job details</h2>
            <EnquiryForm
              b={b}
              submitLabel="Send Quote Request"
              styles={formStyles}
              fields={[
                { name: 'product', label: 'Product', type: 'select', required: true, wide: true, options: [...options, 'Something else'] },
                { name: 'quantity', label: 'Quantity', type: 'number', required: true },
                { name: 'size', label: 'Size', },
                { name: 'deadline', label: 'Needed By', type: 'date' },
                { name: 'fileReady', label: 'Is Your File Print-Ready?', type: 'select', options: ['Yes, I have a print-ready file', 'No, I need design help', 'Not sure'] },
                { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
                { name: 'company', label: 'Business or Group', autoComplete: 'organization' },
                { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
                { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
                { name: 'notes', label: 'Notes', type: 'textarea', wide: true },
              ]}
            />
          </div>
          <aside className="grid gap-6 lg:sticky lg:top-[200px]">
            {list(b.process).length > 0 && (
              <div className="rounded-[24px] bg-cream p-6 sm:p-8">
                <h2 className="mb-5 font-heading text-[20px] font-bold">What happens next</h2>
                <Process b={b} compact />
              </div>
            )}
            <div className="rounded-[24px] bg-surface p-6 sm:p-8">
              <h2 className="mb-2 font-heading text-[20px] font-bold">Rather talk it through?</h2>
              <p className="mb-4 text-[16px] leading-[1.55] text-ink/70">
                {b.email ? 'Call the shop, or email your artwork with the job details.' : 'Call the shop and we will price it on the phone.'}
              </p>
              <ContactList b={b} tel={tel} />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

function About({ b, tel }) {
  const about = b.about || {};
  const points = list(about.points);
  return (
    <>
      <PageHead
        trail={[['/', 'Home'], [null, 'About']]}
        eyebrow={about.eyebrow || (b.since ? `Since ${b.since}` : 'About the shop')}
        title={about.title || `About ${b.shortName}`}
      />
      <section className={`${pad} bg-white`}>
        <div className={`${wrap} grid items-start gap-10 lg:grid-cols-2 lg:gap-16`}>
          {about.image && (
            <div className="rounded-[26px] p-3" style={{ background: tint(1, 16) }}>
              <Img className="aspect-[4/3] w-full rounded-[20px] object-cover" src={about.image} alt={about.imageAlt || ''} sizes="(max-width: 1024px) 100vw, 48vw" eager />
            </div>
          )}
          <div className={about.image ? '' : 'max-w-3xl lg:col-span-2'}>
            {paragraphs(about.text).map((t) => (
              <p key={t.slice(0, 32)} className="mb-5 text-[17px] leading-[1.7] text-ink/80 sm:text-[18px]">
                {t}
              </p>
            ))}
            {points.length > 0 && (
              <ul className="mt-8 grid gap-4">
                {points.map((p, i) => (
                  <li key={p.title} className="flex gap-4 rounded-2xl bg-surface p-5">
                    <span className="mt-1 h-10 w-1.5 flex-none rounded-full" style={{ background: ink(i) }} aria-hidden="true" />
                    <span>
                      <strong className="block font-heading text-[18px] font-bold">{p.title}</strong>
                      <span className="mt-1 block leading-[1.55] text-ink/70">{p.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
      <Highlights b={b} />
      <Reviews b={b} />
      <QuoteBand b={b} tel={tel} />
    </>
  );
}

function Contact({ b, tel }) {
  const area = list(b.serviceArea);
  return (
    <>
      <PageHead
        trail={[['/', 'Home'], [null, 'Contact']]}
        eyebrow="Contact"
        title="Visit the shop or give us a call"
        lead={`Walk in at ${b.address}, call ${b.phone}, or send a message below.`}
      />
      <section className={`${pad} bg-white`}>
        <div className={`${wrap} grid items-start gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16`}>
          <div className="grid gap-8">
            <div>
              <h2 className="mb-4 font-heading text-[22px] font-bold">Reach us</h2>
              <ContactList b={b} tel={tel} />
            </div>
            {list(b.hours).length > 0 && (
              <div>
                <h2 className="mb-2 font-heading text-[22px] font-bold">Hours</h2>
                <HoursTable b={b} />
              </div>
            )}
            {area.length > 0 && (
              <div>
                <h2 className="mb-4 font-heading text-[22px] font-bold">Pickup and delivery area</h2>
                <ul className="flex flex-wrap gap-2">
                  {area.map((t, i) => (
                    <li key={t} className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-2 text-[16px] lg:text-[15px] font-medium">
                      <span className="h-2 w-2 rounded-full" style={{ background: ink(i) }} aria-hidden="true" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <a href={mapsHref(b)} className={`${btnLine} w-full sm:w-fit`}>
              <MapPin size={17} aria-hidden="true" /> Get Directions
            </a>
          </div>
          <div className="rounded-[24px] border border-line p-5 sm:p-8 lg:p-10">
            <h2 className="mb-2 font-heading text-[24px] font-bold tracking-[-0.02em]">Send a message</h2>
            <p className="mb-6 text-[16px] text-ink/70">
              Pricing a job? The{' '}
              <a href="/quote" className="font-semibold text-primary">
                quote form
              </a>{' '}
              asks for the details we need.
            </p>
            <EnquiryForm
              b={b}
              submitLabel="Send Message"
              styles={formStyles}
              fields={[
                { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
                { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel' },
                { name: 'email', label: 'Email', type: 'email', required: true, wide: true, autoComplete: 'email' },
                { name: 'message', label: 'Message', type: 'textarea', required: true, wide: true },
              ]}
            />
          </div>
        </div>
      </section>
      <QuoteBand b={b} tel={tel} />
    </>
  );
}

export default function Printing({ b, path = '' }) {
  const tel = telHref(b.phone);
  const cats = list(b.categories).filter((c) => c.slug && c.title);
  const category = path.startsWith('products/') ? cats.find((c) => `products/${c.slug}` === path) : null;
  const page = category ? 'category' : ['products', 'quote', 'about', 'contact'].includes(path) ? path : 'home';
  const brand = b.brand;
  const style = {
    '--primaryDeep': `color-mix(in srgb, ${brand.primary} 55%, #000)`,
    '--pop': 'var(--accent)',
    '--surface': '#f3f5f8',
    '--line': '#e3e7ed',
    '--cream': 'var(--surface)',
    ...brandVars(brand),
    '--on-primary': onColor(brand.primary),
    '--on-accent': onColor(brand.accent),
    '--on-pop': onColor(brand.pop || brand.accent),
    '--on-primaryDeep': '#fff',
  };

  return (
    <div className="overflow-x-clip bg-white font-body text-[16px] text-ink antialiased" style={style}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-14 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3">
        Skip to Content
      </a>
      <Announcement b={b} />
      <Header b={b} cats={cats} tel={tel} current={category ? path : page} />
      <main id="main">
        {page === 'home' && <Home b={b} cats={cats} tel={tel} />}
        {page === 'products' && <Catalog b={b} cats={cats} tel={tel} />}
        {page === 'category' && <Category b={b} cats={cats} c={category} tel={tel} />}
        {page === 'quote' && <Quote b={b} cats={cats} tel={tel} />}
        {page === 'about' && <About b={b} tel={tel} />}
        {page === 'contact' && <Contact b={b} tel={tel} />}
      </main>
      {!path && <Facts b={b} />}
      <Footer b={b} tel={tel} />
    </div>
  );
}
