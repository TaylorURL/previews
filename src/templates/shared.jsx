import { useId, useState } from 'react';
import {
  Anchor,
  Award,
  BadgeCheck,
  Banknote,
  Check,
  Briefcase,
  Building2,
  Calculator,
  CalendarCheck,
  Clock,
  FileText,
  Flame,
  Gauge,
  Gavel,
  GraduationCap,
  Hammer,
  Handshake,
  Heart,
  House,
  KeyRound,
  Languages as LanguagesIcon,
  Leaf,
  MapPin,
  Phone,
  Quote,
  Scale,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Star,
  Thermometer,
  Toothbrush,
  Truck,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { luminance, pic, telHref } from '../site.js';

export function Stars({ value = 5, size = 16, className = 'text-star' }) {
  const full = Math.round(value);
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z"
            fill={i < full ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
      ))}
    </span>
  );
}

/** A responsive image from a brand file path or an Unsplash URL. */
export function Img({ src, alt = '', sizes = '100vw', className, eager = false, ...rest }) {
  const { src: url, srcSet } = pic(src);
  // A business with no photo for this slot draws nothing here. Without this an
  // <img> with no src renders as a broken picture on every template.
  if (!url) return null;
  return (
    <img
      {...rest}
      className={className}
      src={url}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  );
}

/** `value` when it is a #rrggbb color, `fallback` when it is not. */
export function hexOr(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value || '').trim()) ? String(value).trim() : fallback;
}

/** `hex` moved toward `target` by `share` (0 to 1), as CSS color-mix would draw it. */
export function mixHex(hex, target, share) {
  const parse = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = parse(hexOr(hex, '#ffffff'));
  const t = parse(hexOr(target, '#000000'));
  return `#${a.map((v, i) => Math.round(v + (t[i] - v) * share).toString(16).padStart(2, '0')).join('')}`;
}

// How much of a mark has to survive on a ground for it to be drawn there in its
// own colors; below this it is drawn as its one-color cut.
const READS = 0.75;

/**
 * How much of the logo survives on `ground`, from 0 to 1, read off logoReads:
 * what the build measured on grays from black to white, taken at the gray as
 * light as this ground. A brand file from before it reads only on a ground
 * close to the one it was made for.
 */
export function logoStands(brand, ground) {
  const level = brand.logoReads;
  if (!Array.isArray(level) || level.length < 2) {
    return Math.abs(luminance(ground) - luminance(hexOr(brand.logoGround, '#ffffff'))) <= 0.25 ? 1 : 0;
  }
  // The ground as the gray the build tried the mark on: its luma, as an image
  // library turns a color picture gray.
  const gray = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hexOr(hex, '#ffffff').slice(i, i + 2), 16) / 255);
    return (0.299 * r + 0.587 * g + 0.114 * b) * (level.length - 1);
  };
  const at = gray(ground);
  const i = Math.min(level.length - 2, Math.floor(at));
  // A mark drawn for one of those grays (white, black) reads in full only on it:
  // its pale or dark tints vanish on a ground just off it, so a ground between
  // it and the next gray is held to that gray (a silver mark drawn for white
  // loses its highlights on a pale gray footer).
  const drawn = gray(brand.logoGround);
  const native = Math.abs(drawn - Math.round(drawn)) < 0.01 ? Math.round(drawn) : -1;
  if (native === i + 1 && at < native - 0.01) return level[i];
  if (native === i && at > native + 0.01) return level[i + 1];
  return level[i] + (level[i + 1] - level[i]) * (at - i);
}

/**
 * The logo, sized by its shape rather than squeezed into a box: the build
 * writes logoHeight (and logoWidth, logoRatio) from the file, so a badge is
 * drawn taller than a long wordmark and neither is centered inside empty
 * space. A brand file from before that keeps its width as a ceiling. The
 * header is 82% of the size on a phone.
 *
 * The logo never brings a box or a ground of its own: the build cuts its
 * background away, and the template's header and footer keep their own
 * colors. `ground` is the color behind the mark where it is drawn. Where
 * enough of the mark stands out from it, the mark is drawn in its own colors;
 * where it does not (a dark mark on a dark footer, a white mark on a white
 * header), its one-color cut (logoMono) is painted in the ink of that spot,
 * white on a dark ground and the brand's ink on a light one, unless `ink`
 * names another. A mark with no name in it (logoName) carries the name beside
 * it.
 */
export function BrandLogo({ b, className = '', textClass = '', scale = 1, ground = '#ffffff', ink = null }) {
  const brand = b.brand;
  // Marked so the layout check can tell a header that sets the name in type
  // from one that has no mark at all: a brand with no logo of its own is drawn
  // this way on purpose, and that is not a header missing its logo.
  const name = <span data-logo-name="" className={`block font-heading text-[22px] font-bold leading-tight ${textClass}`}>{b.shortName}</span>;
  if (!brand.logo) return name;
  const backdrop = hexOr(ground, '#ffffff');
  const own = logoStands(brand, backdrop) >= READS;
  if (!own && !brand.logoMono) return name;
  const src = own ? brand.logo : brand.logoMono;
  // On a pale tint, the white a mark carries at its rim (a keyline drawn for
  // a dark ground, a patch left from its own) is multiplied into the ground
  // rather than standing off it as a fringe; on white it is drawn as it is.
  const pale = luminance(backdrop) >= 0.8 && backdrop.toLowerCase() !== '#ffffff';
  const hidden = own ? (pale ? 'mix-blend-multiply' : '') : 'opacity-0';
  let mark;
  if (brand.logoHeight) {
    const h = Math.round(brand.logoHeight * scale);
    mark = (
      <img
        data-logo=""
        className={`block h-[calc(var(--logo-h)*0.82)] w-auto max-w-[min(48vw,100%)] object-contain object-left sm:max-w-[min(62vw,100%)] lg:h-[var(--logo-h)] ${hidden} ${className}`}
        style={{ '--logo-h': `${h}px` }}
        src={src}
        alt={b.name}
        width={Math.round(brand.logoWidth * scale)}
        height={h}
      />
    );
  } else {
    mark = (
      <img
        data-logo=""
        className={`block h-auto max-h-[44px] w-auto object-contain object-left lg:max-h-[56px] ${hidden} ${className}`}
        style={{ maxWidth: `min(${Math.round((brand.logoWidth || 200) * scale)}px, 62vw)` }}
        src={src}
        alt={b.name}
      />
    );
  }
  if (!own) {
    // The cut sizes the box as the logo would and is hidden; the box is
    // painted in the ink and shows only through the cut's shape.
    const paint = ink || (luminance(backdrop) < 0.4 ? '#ffffff' : hexOr(brand.ink, '#14181f'));
    const cut = `url(${brand.logoMono}) center / contain no-repeat`;
    mark = (
      <span data-logo-cut="" className="block w-fit max-w-full" style={{ WebkitMask: cut, mask: cut, backgroundColor: paint }}>
        {mark}
      </span>
    );
  }
  if (!brand.logoName) return mark;
  // A symbol with no name in it carries the name beside it, set in type. On a
  // phone the name wraps onto a second line rather than being cut short; a
  // long name is set smaller, so its lines stay inside the header's height.
  const size = b.shortName.length > 24 ? 'text-[13px] leading-[1.15] lg:text-[16px]' : 'text-[17px] leading-[1.1] lg:text-[21px]';
  return (
    <span className="flex w-fit min-w-0 items-center gap-3">
      <span className="flex-none">{mark}</span>
      <span className={`block max-w-[15ch] font-heading font-bold sm:max-w-none ${size} ${textClass} whitespace-normal`}>
        {b.shortName}
      </span>
    </span>
  );
}

/** The logo when the business has one, its name set in type when it does not. */
export function Logo({ b, className = '', textClass = '', ground = '#ffffff' }) {
  return <BrandLogo b={b} className={className} textClass={`font-heading text-2xl ${textClass}`} ground={ground} />;
}

/**
 * The enquiry form. On a preview it goes nowhere and says so on submit,
 * rather than pretending a message was sent. The template passes the
 * classes for each part in `styles`.
 */
export function EnquiryForm({ b, fields, submitLabel, styles }) {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div className={`grid gap-1 ${styles.done}`} role="status">
        <strong>Thanks. On the live site, this goes straight to {b.shortName}.</strong>
        <span>Nothing was sent from this preview.</span>
      </div>
    );
  }
  return (
    <form
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${styles.form}`}
      onSubmit={(event) => {
        event.preventDefault();
        setSent(true);
      }}
    >
      {fields.map((f) => (
        <label key={f.name} className={`grid gap-1.5 ${styles.label} ${f.wide ? 'sm:col-span-2' : ''}`}>
          <span>{f.label}</span>
          {f.type === 'select' ? (
            <select className={`w-full ${styles.field}`} name={f.name} required={f.required} defaultValue="">
              <option value="" disabled>
                Choose One
              </option>
              {f.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea className={`w-full ${styles.field}`} name={f.name} rows={4} required={f.required} />
          ) : (
            <input
              className={`w-full ${styles.field}`}
              name={f.name}
              type={f.type || 'text'}
              required={f.required}
              autoComplete={f.autoComplete}
            />
          )}
        </label>
      ))}
      <button type="submit" className={`cursor-pointer sm:col-span-2 ${styles.button}`}>
        {submitLabel}
      </button>
    </form>
  );
}

/** Sites whose names are not written as their address is. */
const SITE_NAMES = { linkedin: 'LinkedIn', youtube: 'YouTube', tiktok: 'TikTok' };

/**
 * An item that only names where a page is ('Facebook: facebook.com/…'), as the
 * link it stands for under its own label, so it is not set out as a bare
 * address. A bare address ('facebook.com/SierraSmilesDentistryofPasadena') is
 * named for its site, as a long one would otherwise break mid-word.
 */
function pageOf(item) {
  const m = String(item).match(/^(?:([^:]{1,40}):\s*)?((?:https?:\/\/)?(?:www\.)?([\w-]+)(?:\.[\w-]+)+\/\S*)$/i);
  if (!m) return null;
  const site = m[3].toLowerCase();
  const label = m[1]?.trim() || SITE_NAMES[site] || site[0].toUpperCase() + site.slice(1);
  return { label, href: /^https?:\/\//i.test(m[2]) ? m[2] : `https://${m[2]}` };
}

/** About how many lines a fact's card stands in a third of the page: its heading, its text and each item. */
function factLines(fact) {
  const lines = (s) => Math.ceil(String(s).length / 40);
  return 3 + (fact.text ? lines(fact.text) : 0) + (fact.items ?? []).reduce((n, item) => n + lines(item) + 0.5, 0);
}

/**
 * What the business's own website says that no section of the template has a
 * place for: license numbers, certifications, affiliations, payment methods,
 * languages spoken, warranties, specials, policies, and the like. A preview
 * must not drop anything their current site tells a customer, so the routine
 * puts every such fact here rather than leaving it out.
 *
 *   "facts": [
 *     { "heading": "Licenses", "items": ["Texas Master Plumber M-12345"] },
 *     { "heading": "Payment", "text": "Cash, card and financing through ..." }
 *   ]
 *
 * It is a section of its own on the home page, just above the footer, in the
 * page's own colors. The footer stays the short list a local business needs:
 * name, contact, hours, a few links and the copyright line.
 *
 * The facts run down columns one after another, as a newspaper sets them, so a
 * long one and a short one side by side leave no hole under the short one.
 * Each sits behind a rule of its own and its items are marked as a list.
 */
export function Facts({ b }) {
  const facts = (b.facts ?? []).filter((fact) => fact?.heading && (fact.text || fact.items?.length));
  if (!facts.length) return null;
  const rule = { borderColor: 'color-mix(in srgb, currentColor 18%, transparent)' };
  // Each fact in turn goes to the shortest of three columns, so a long policy
  // beside two short notes leaves no hole under them and no card stands alone
  // in a row of its own.
  const columns = [[], [], []];
  const heights = [0, 0, 0];
  for (const fact of facts) {
    const col = heights.indexOf(Math.min(...heights));
    columns[col].push(fact);
    heights[col] += factLines(fact) + 1;
  }
  return (
    // The same container every template sets its own sections in, so the
    // rules down the left of each block stand on the page's margin rather
    // than outside it.
    <section aria-label={`About ${b.name}`} className="mx-auto w-full max-w-page px-gutter">
      {/* Three columns of their own on the desktop, each stacked down from the
          top. Below it the column wrappers step aside and the cards flow down
          two balanced columns instead. */}
      {/* Each block is a card on a wash of the ground it sits on, so the section reads as laid out
          rather than as loose text: no default bullets, and a list marked with its own rule. */}
      <div className="border-t pt-12 sm:columns-2 sm:gap-5 lg:grid lg:grid-cols-3 lg:items-start" style={rule}>
        {columns.filter((col) => col.length).map((col, i) => (
          <div key={i} className="contents lg:block lg:min-w-0">
            {col.map((fact) => (
              <div
                key={fact.heading}
                className="mb-5 min-w-0 break-inside-avoid rounded-2xl border p-5"
                style={{ ...rule, backgroundColor: 'color-mix(in srgb, currentColor 4%, transparent)' }}
              >
                <h2 className="font-heading text-[15px] font-bold uppercase tracking-[0.1em] opacity-100">{fact.heading}</h2>
                {fact.text && <p className="mt-2.5 text-[16px] leading-relaxed opacity-80">{fact.text}</p>}
                {fact.items?.length > 0 && (
                  <ul className="mt-2.5 grid text-[16px] leading-relaxed opacity-80">
                    {fact.items.map((item) => {
                      const page = pageOf(item);
                      return (
                        <li key={item} className="break-words border-t py-1.5 first:border-0 first:pt-0 last:pb-0" style={rule}>
                          {page ? (
                            <a href={page.href} className="no-underline hover:underline hover:opacity-100" rel="noopener">
                              {page.label}
                            </a>
                          ) : (
                            item
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Where the studio posts, as taylorurl.com holds them: the Facebook Page in
 * src/app/data/reputation/facebook.js and the Instagram account beside the
 * menu in src/app/constants/navigation.js. They are written again here rather
 * than imported, since this repo builds on its own, so a page that moves there
 * moves here too.
 *
 * Each carries the tags that say a visit came off a preview's footer, added to
 * whatever query the address already has: the Page is a numbered profile, and
 * its `?id=` has to survive the tagging.
 */
const STUDIO_FOLLOW = [
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61591005089902' },
  { label: 'Instagram', href: 'https://www.instagram.com/taylorwebdev/' },
].map(({ label, href }) => {
  const url = new URL(href);
  url.searchParams.set('utm_source', 'preview');
  url.searchParams.set('utm_medium', 'footer');
  url.searchParams.set('utm_campaign', 'follow');
  return { label, href: url.toString() };
});

/**
 * The studio's credit under a preview's copyright line, with the two places
 * an owner can follow its work.
 *
 * It sits on the copyright line rather than in a section of its own because
 * the footer is the business's, and the credit is the one line in it that is
 * not. It takes the line's own size and ink, so it reads as part of whichever
 * footer it lands in, and draws nothing on a page that is not a preview: a
 * template's sample, or a site that has gone live in its owner's name, carries
 * no credit.
 */
export function StudioCredit({ b }) {
  if (!b.preview) return null;
  return (
    <span className="mt-1 block">
      Designed by TaylorURL
      {STUDIO_FOLLOW.map(({ label, href }) => (
        <span key={label}>
          {' · '}
          <a href={href} target="_blank" rel="noopener" className="underline underline-offset-2">
            {label}
          </a>
        </span>
      ))}
    </span>
  );
}

/* -------------------------------------------------------------------------
 * The optional brand fields every template may draw: heroStyle, tone,
 * highlights, phones, languages, reviews, credentials, owner and steps. Each
 * reader returns only what is real and well formed, so a section whose field
 * is absent or broken is left out rather than drawn empty.
 * ---------------------------------------------------------------------- */

const arr = (v) => (Array.isArray(v) ? v : []);
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const digits = (v) =>
  String(v || '')
    .replace(/\D/g, '')
    .replace(/^1(?=\d{10}$)/, '');

/**
 * How the home page opens: "photo" (the photo across the band under a wash
 * that keeps the words legible), "split" (the words beside the photo) or
 * "type" (no photo: a designed band of type in the brand's own colors). A
 * brand that names none opens with `fallback` when it has a photo (the
 * template's own photo hero, "split" unless it says otherwise) and with type
 * when it has none; one that asks for a photo style without a photo gets type.
 */
export function heroStyleOf(b, fallback = 'split') {
  if (!b?.hero?.image) return 'type';
  if (['photo', 'split', 'type'].includes(b.heroStyle)) return b.heroStyle;
  return fallback;
}

/** "bold" (heavy type, tight tracking, strong color) unless the brand says "classic" (lighter, roomier, quieter). */
export function toneOf(b) {
  return b?.tone === 'classic' ? 'classic' : 'bold';
}

/** Up to four things that set the business apart: [{ title, text, icon }]. */
export function highlightsOf(b) {
  return arr(b?.highlights)
    .filter((h) => h && str(h.title))
    .slice(0, 4);
}

/**
 * Every phone line the business gives, the main one first, as
 * [{ label, number, href, main }]. `phone` is the Google listing's number and
 * `phones` adds labelled lines ("Español"); a line there with the main number
 * only labels it, rather than listing it twice.
 */
export function phonesOf(b) {
  const main = { label: '', number: str(b?.phone), main: true };
  const extra = [];
  const seen = new Set([digits(main.number)]);
  for (const p of arr(b?.phones)) {
    const number = str(p?.number);
    const label = str(p?.label);
    const key = digits(number);
    if (key.length < 7) continue;
    if (key === digits(main.number)) {
      if (label && !main.label) main.label = label;
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    extra.push({ label, number, main: false });
  }
  return [main, ...extra].filter((p) => p.number).map((p) => ({ ...p, href: telHref(p.number) }));
}

/**
 * A line's label when it says something: "Español" or "After hours", not
 * "Main" or "Phone", which only stand beside another line's label.
 */
export function telling(label) {
  return /^(main|phone|office|call|tel|telephone|number)$/i.test(str(label)) ? '' : str(label);
}

/** The labelled lines beyond the main phone. */
export const extraPhonesOf = (b) => phonesOf(b).filter((p) => !p.main);

/** The languages the business serves customers in: ["English", "Spanish"]. */
export function languagesOf(b) {
  return arr(b?.languages).map(str).filter(Boolean);
}

/**
 * Reviews quoted word for word: [{ author, text, source, rating }]. A
 * testimonial on their own site may carry no author's name, so only its
 * words are required; it is then credited to where it was left.
 */
export function reviewsOf(b) {
  return arr(b?.reviews).filter((r) => r && str(r.text) && (str(r.author) || sourceOf(r)));
}

/** Licenses, certifications, memberships, carriers: [{ label, detail }]. */
export function credentialsOf(b) {
  return arr(b?.credentials).filter((c) => c && str(c.label));
}

/** How working with the business goes, two to five steps: [{ title, text }]. */
export function stepsOf(b) {
  const steps = arr(b?.steps).filter((s) => s && str(s.title));
  return steps.length >= 2 ? steps.slice(0, 5) : [];
}

/** The owner or founding partner: { name, role, text, image }, or null. */
export function ownerOf(b) {
  const o = b?.owner;
  return o && typeof o === 'object' && str(o.name) ? o : null;
}

/** Up to two initials for a name, past an honorific or "The": "David Salazar" is "DS". */
export function initialsOf(name) {
  return String(name || '')
    .replace(/^(the|dr|mr|mrs|ms|mx)\.?\s+/i, '')
    .split(/[\s&,-]+/)
    .filter((w) => /^[a-z0-9]/i.test(w))
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

/** Where a review was left, as a reader would say it: "Google review", "Website testimonial". */
export function sourceOf(review) {
  const s = str(review?.source) || str(review?.where);
  if (!s) return '';
  if (/their site|our site|website|own site/i.test(s)) return 'Website testimonial';
  if (/^(google|facebook|yelp|nextdoor|angi|bbb|houzz|thumbtack|homeadvisor|avvo)$/i.test(s)) return `${s[0].toUpperCase()}${s.slice(1)} review`;
  return s;
}

/**
 * The icon a highlight's free word stands for ("family", "award", "spanish"),
 * read from the word or, without one, from its title. Anything unknown is a
 * plain check badge.
 */
const HIGHLIGHT_ICONS = [
  [/famil|owner|people|user|team|crew|staff|veteran|local.?own/, Users],
  [/award|medal|trophy|best|winner|top.?rated/, Award],
  [/insur|shield|warrant|guarant|protect|safe|bond/, ShieldCheck],
  [/language|spanish|espa|bilingual|habla/, LanguagesIcon],
  [/clock|time|fast|quick|hour|24|emergenc|same.?day|prompt|open/, Clock],
  [/star|rating|review|rated/, Star],
  [/map|local|location|area|town|pin|region|nearby|county/, MapPin],
  [/price|money|dollar|cost|financ|pay|afford|free|quote|estimate|fee/, Banknote],
  [/calendar|schedul|appoint|book/, CalendarCheck],
  [/tool|wrench|repair|service|fix|maint/, Wrench],
  [/home|house|residen/, House],
  [/leaf|eco|green|lawn|garden|tree|plant|organic/, Leaf],
  [/heart|care|love|kind|compassion|patient/, Heart],
  [/phone|call/, Phone],
  [/truck|van|fleet|mobile|deliver|tow/, Truck],
  [/hand|trust|honest|relationship|partner|integrity/, Handshake],
  [/gavel|trial|verdict|court|litigat/, Gavel],
  [/scale|law|legal|justice|attorney|case/, Scale],
  [/building|commercial|office|business|industr/, Building2],
  [/hammer|build|construct|craft/, Hammer],
  [/spark|clean|quality|detail|premium/, Sparkles],
  [/zap|power|electric|bolt|energy|generator/, Zap],
  [/thermo|temperat|hvac|air/, Thermometer],
  [/flame|heat|fire|furnace/, Flame],
  [/snow|cool|cold/, Snowflake],
  [/graduat|educat|degree|school|train|experien|year|since/, GraduationCap],
  [/calcul|tax|account|cpa|bookkeep|audit/, Calculator],
  [/key|title|closing|escrow|deed/, KeyRound],
  [/file|document|paper|form|contract/, FileText],
  [/briefcase|career|professional/, Briefcase],
];
/** The icon names the copy writer picks from (scripts/autobuild/write.py ICONS), each its own drawing. */
const ICON_NAMES = {
  family: Users,
  users: Users,
  language: LanguagesIcon,
  clock: Clock,
  calendar: CalendarCheck,
  shield: ShieldCheck,
  award: Award,
  badge: BadgeCheck,
  wrench: Wrench,
  leaf: Leaf,
  home: House,
  building: Building2,
  truck: Truck,
  phone: Phone,
  dollar: Banknote,
  star: Star,
  heart: Heart,
  map: MapPin,
  check: Check,
  hammer: Hammer,
  tooth: Toothbrush,
  scale: Scale,
  calculator: Calculator,
  spark: Sparkles,
  anchor: Anchor,
  gauge: Gauge,
};
export function highlightIcon(word) {
  const w = String(word || '').trim().toLowerCase();
  if (ICON_NAMES[w]) return ICON_NAMES[w];
  for (const [re, Icon] of HIGHLIGHT_ICONS) if (re.test(w)) return Icon;
  return BadgeCheck;
}

const COLS_4 = { 1: '', 2: 'sm:grid-cols-2', 3: 'md:grid-cols-3', 4: 'sm:grid-cols-2 xl:grid-cols-4' };

/**
 * The highlights as a row of two to four, each an icon, a title and its line.
 * The template dresses each part through `styles`:
 * { list, item, icon, title, text }. `iconSize` sizes the icon.
 */
export function Highlights({ items, styles = {}, iconSize = 22, label = 'What sets us apart' }) {
  if (!items?.length) return null;
  return (
    <ul aria-label={label} className={`grid ${COLS_4[items.length] || COLS_4[4]} ${styles.list || 'gap-4'}`}>
      {items.map((h) => {
        const Icon = highlightIcon(h.icon || h.title);
        return (
          <li key={h.title} className={`flex min-w-0 gap-4 ${styles.item || ''}`}>
            <span className={`grid flex-none place-items-center ${styles.icon || ''}`}>
              <Icon size={iconSize} aria-hidden="true" />
            </span>
            <span className="block min-w-0">
              <span className={`block ${styles.title || 'font-semibold'}`}>{h.title}</span>
              {str(h.text) && <span className={`block ${styles.text || ''}`}>{h.text}</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Phone lines as links, each with its label: "Español (512) 938-2043". `lines`
 * comes from phonesOf or extraPhonesOf. `styles`: { list, item, label, number }.
 * `icon` draws a handset before each line; `nowrap` keeps them on one row, for a bar.
 */
export function PhoneLines({ lines, styles = {}, icon = false, iconSize = 15, className = '', nowrap = false }) {
  if (!lines?.length) return null;
  return (
    <ul className={`flex ${nowrap ? 'flex-nowrap' : 'flex-wrap'} ${styles.list || 'gap-x-5 gap-y-1'} ${className}`}>
      {lines.map((p) => (
        <li key={p.number} className="min-w-0">
          <a href={p.href} className={`inline-flex min-h-[44px] flex-wrap items-center gap-x-2 no-underline ${styles.item || ''}`}>
            {icon && <Phone size={iconSize} className="flex-none" aria-hidden="true" />}
            {p.label && <span className={styles.label || 'opacity-75'}>{p.label}</span>}
            <span className={`whitespace-nowrap ${styles.number || 'font-semibold'}`}>{p.number}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The languages spoken, on one line behind a languages icon: "English · Spanish". */
export function Languages({ items, className = '', iconSize = 15 }) {
  if (!items?.length) return null;
  return (
    <p className={`inline-flex items-center gap-2 ${className}`}>
      <LanguagesIcon size={iconSize} className="flex-none" aria-hidden="true" />
      <span>
        <span className="sr-only">Languages spoken: </span>
        {items.join(' · ')}
      </span>
    </p>
  );
}

/**
 * Up to `max` reviews quoted word for word, each with its author, where it was
 * left, and its stars only when the review gives them. `styles`:
 * { list, item, mark, text, author, source }.
 */
export function ReviewQuotes({ reviews, max = 3, styles = {}, starClass = 'text-star', quoteMark = true }) {
  const items = arr(reviews).slice(0, max);
  if (!items.length) return null;
  const cols = items.length === 1 ? '' : items.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';
  return (
    <ul className={`grid ${cols} ${styles.list || 'gap-5'}`}>
      {items.map((r, i) => (
        <li key={i} className={`flex min-w-0 flex-col ${styles.item || ''}`}>
          <figure className="m-0 flex flex-1 flex-col">
            {(quoteMark || Number(r.rating) > 0) && (
              <span className="flex items-center justify-between gap-3">
                {quoteMark ? <Quote size={26} className={styles.mark || 'opacity-25'} aria-hidden="true" /> : <span />}
                {Number(r.rating) > 0 && <Stars value={Math.min(5, Number(r.rating))} size={14} className={starClass} />}
              </span>
            )}
            <blockquote className={`m-0 mb-6 flex-1 ${quoteMark || Number(r.rating) > 0 ? 'mt-4' : ''} ${styles.text || ''}`}>&ldquo;{str(r.text)}&rdquo;</blockquote>
            <figcaption className={`mt-auto ${styles.author || ''}`}>
              {str(r.author) && <span className="font-semibold">{r.author}</span>}
              {str(r.author) && sourceOf(r) && <span className={styles.source || 'opacity-70'}> &middot; </span>}
              {sourceOf(r) && <span className={styles.source || 'opacity-70'}>{sourceOf(r)}</span>}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

/**
 * Licenses, certifications, memberships and carriers, each its label and its
 * detail ("State Bar of Texas", "Licensed since 2004"). `styles`:
 * { list, item, icon, label, detail }. `icon` is the lucide icon before each.
 */
export function Credentials({ items, styles = {}, icon: Icon = BadgeCheck, iconSize = 18 }) {
  if (!items?.length) return null;
  return (
    <ul className={`grid ${styles.list || 'gap-3'}`}>
      {items.map((c) => (
        <li key={`${c.label}|${c.detail || ''}`} className={`flex min-w-0 items-start gap-3 ${styles.item || ''}`}>
          {Icon && <Icon size={iconSize} className={`mt-0.5 flex-none ${styles.icon || ''}`} aria-hidden="true" />}
          <span className="block min-w-0">
            <span className={`block break-words ${styles.label || 'font-semibold'}`}>{c.label}</span>
            {str(c.detail) && <span className={`block break-words ${styles.detail || 'opacity-75'}`}>{c.detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

const STEP_COLS = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-2 xl:grid-cols-4', 5: 'md:grid-cols-3 xl:grid-cols-5' };

/** How working with the business goes, as numbered steps. `styles`: { list, item, number, title, text }. */
export function Steps({ items, styles = {} }) {
  if (!items?.length) return null;
  return (
    <ol className={`grid ${STEP_COLS[items.length] || ''} ${styles.list || 'gap-x-6 gap-y-8'}`}>
      {items.map((s, i) => (
        <li key={s.title} className={`min-w-0 ${styles.item || ''}`}>
          <span aria-hidden="true" className={`block ${styles.number || ''}`}>
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className={styles.title || ''}>{s.title}</h3>
          {str(s.text) && <p className={styles.text || ''}>{s.text}</p>}
        </li>
      ))}
    </ol>
  );
}

/**
 * The owner or founding partner: their photo, or their initials where there is
 * none, with their name, role and a line or two. `styles`:
 * { box, photo, initials, name, role, text }.
 */
export function Owner({ owner, styles = {}, sizes = '200px' }) {
  if (!owner) return null;
  return (
    <figure className={`m-0 flex min-w-0 ${styles.box || 'items-start gap-5'}`}>
      {owner.image ? (
        <Img src={owner.image} alt={owner.imageAlt || owner.name} sizes={sizes} className={`flex-none object-cover object-top ${styles.photo || 'h-20 w-20 rounded-full'}`} />
      ) : (
        <span aria-hidden="true" className={`grid flex-none place-items-center ${styles.initials || 'h-20 w-20 rounded-full'}`}>
          {initialsOf(owner.name)}
        </span>
      )}
      <figcaption className="min-w-0">
        <span className={`block ${styles.name || 'font-semibold'}`}>{owner.name}</span>
        {str(owner.role) && <span className={`block ${styles.role || ''}`}>{owner.role}</span>}
        {str(owner.text) && <span className={`block ${styles.text || ''}`}>{owner.text}</span>}
      </figcaption>
    </figure>
  );
}

/** The Google rating as a badge: the figure, its stars and the count. `styles`: { box, value, count }. */
export function RatingBadge({ b, styles = {}, starClass = 'text-star', size = 16 }) {
  if (!b?.rating || !b?.reviewCount) return null;
  return (
    <div className={`flex items-center ${styles.box || 'gap-3.5'}`}>
      <strong className={`leading-none ${styles.value || ''}`}>{Number(b.rating).toFixed(1)}</strong>
      <span className="grid gap-1">
        <Stars value={Number(b.rating)} size={size} className={starClass} />
        <span className={styles.count || ''}>{Number(b.reviewCount).toLocaleString('en-US')} Google reviews</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------ type hero */

/** A fine repeating pattern, drawn in white at the strength the tone asks for. */
function patternTile(kind) {
  if (kind === 'dots') return { size: 22, body: <circle cx="11" cy="11" r="1.3" fill="#fff" fillOpacity="0.2" /> };
  if (kind === 'diagonal') return { size: 16, body: <path d="M-4 20L20 -4" stroke="#fff" strokeOpacity="0.07" strokeWidth="1" /> };
  return { size: 44, body: <path d="M44 0H0V44" fill="none" stroke="#fff" strokeOpacity="0.08" strokeWidth="1" /> };
}

/**
 * The ground of a hero with no photo, the brand's own colors with depth: a
 * gradient from `from` to `to`, a glow of `glow` from the top right and a
 * fainter one of `glow2` low on the left, a fine `pattern` ('grid', 'dots',
 * 'diagonal' or 'none') that fades out toward the words, and the template's
 * own `motif` (a Motif, or any drawing in currentColor) laid over the right.
 * The classic tone draws all of it quieter. It is a backdrop only: hidden from
 * readers, behind the hero's content, which sets `isolate` on its section.
 */
export function TypeGround({ from, to, glow, glow2, pattern = 'grid', motif = null, tone = 'bold', className = '' }) {
  const id = `tg${useId().replace(/[^a-z0-9]/gi, '')}`;
  const quiet = tone === 'classic';
  const tile = patternTile(pattern);
  const fade = 'linear-gradient(100deg, transparent 10%, rgba(0,0,0,0.55) 45%, #000 85%)';
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`} style={{ background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(70% 80% at 92% 0%, color-mix(in srgb, ${glow} ${quiet ? 30 : 58}%, transparent), transparent 72%)` }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(50% 60% at 0% 100%, color-mix(in srgb, ${glow2 || glow} ${quiet ? 14 : 28}%, transparent), transparent 72%)` }} />
      {pattern !== 'none' && (
        <svg className="absolute inset-0 h-full w-full" style={{ opacity: quiet ? 0.55 : 1, maskImage: fade, WebkitMaskImage: fade }}>
          <defs>
            <pattern id={id} width={tile.size} height={tile.size} patternUnits="userSpaceOnUse">
              {tile.body}
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${id})`} />
        </svg>
      )}
      {motif}
      {/* A soft shade at the foot, so the band settles onto the page below it rather than stopping flat. */}
      <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.18), transparent)' }} />
    </div>
  );
}

/**
 * A large line drawing for the right of a type hero, in currentColor, so the
 * template colors it: 'chevrons' (nested roof lines), 'rings' (circles spreading
 * from the right edge, as air or sound does) or 'arcs' (fine arcs from the top
 * right corner, as an engraved certificate's). `accent` colors one line of it.
 */
export function Motif({ kind = 'rings', className = '', accent = null, strokeWidth = 1.25, fade = false }) {
  // `fade` lets the drawing die away toward the left, so lines that run under the words end softly, not cut.
  const mask = fade ? { maskImage: 'linear-gradient(to right, transparent 0%, #000 55%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 55%)' } : undefined;
  const common = { 'aria-hidden': true, fill: 'none', stroke: 'currentColor', className: `absolute ${className}`, style: mask };
  if (kind === 'chevrons') {
    return (
      <svg viewBox="0 0 640 640" preserveAspectRatio="xMaxYMax meet" {...common}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path
            key={i}
            d={`M-20 ${380 + i * 64} L320 ${110 + i * 64} L660 ${380 + i * 64}`}
            strokeWidth={i === 1 && accent ? strokeWidth * 2.4 : strokeWidth * (i === 0 ? 2.4 : 1)}
            stroke={i === 1 && accent ? accent : 'currentColor'}
            strokeLinejoin="miter"
            strokeOpacity={i === 1 && accent ? 0.6 : 1 - i * 0.11}
          />
        ))}
      </svg>
    );
  }
  if (kind === 'arcs') {
    return (
      <svg viewBox="0 0 640 640" preserveAspectRatio="xMaxYMin meet" {...common}>
        {Array.from({ length: 11 }, (_, i) => (
          <circle key={i} cx="640" cy="0" r={110 + i * 52} strokeWidth={i === 3 && accent ? strokeWidth * 1.6 : strokeWidth} stroke={i === 3 && accent ? accent : 'currentColor'} strokeOpacity={i === 3 && accent ? 0.45 : 1 - i * 0.07} />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 640 640" preserveAspectRatio="xMaxYMid meet" {...common}>
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx="640" cy="320" r={90 + i * 66} strokeWidth={i === 2 && accent ? strokeWidth * 2 : strokeWidth} stroke={i === 2 && accent ? accent : 'currentColor'} strokeOpacity={i === 2 && accent ? 0.7 : 1 - i * 0.09} />
      ))}
    </svg>
  );
}

/**
 * The business's mark drawn large and faint, as a type hero's watermark: its
 * one-color cut painted in `color` when the mark is about as tall as it is wide
 * (a long wordmark that large reads as a banner, not a mark), else the first
 * letter of its name in the heading face, unless `letter` is false. `size` is
 * a CSS length; `className` places it.
 */
export function Watermark({ b, color = '#ffffff', size = '420px', className = '', letter = true }) {
  const brand = b?.brand || {};
  const ratio = Number(brand.logoRatio) || (brand.logoWidth && brand.logoHeight ? brand.logoWidth / brand.logoHeight : 0);
  if (brand.logo && brand.logoMono && ratio > 0 && ratio <= 1.6) {
    const cut = `url(${brand.logoMono}) center / contain no-repeat`;
    return <span aria-hidden="true" className={`pointer-events-none absolute block ${className}`} style={{ width: size, height: `calc(${size} / ${ratio})`, WebkitMask: cut, mask: cut, backgroundColor: color }} />;
  }
  if (!letter) return null;
  const initial = initialsOf(b?.shortName || b?.name).slice(0, 1);
  if (!initial) return null;
  return (
    <span aria-hidden="true" className={`pointer-events-none absolute block select-none font-heading font-bold leading-[0.8] ${className}`} style={{ color, fontSize: size }}>
      {initial}
    </span>
  );
}
