import { useState } from 'react';
import { luminance, pic } from '../site.js';

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
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hexOr(ground, '#ffffff').slice(i, i + 2), 16) / 255);
  const at = (0.299 * r + 0.587 * g + 0.114 * b) * (level.length - 1);
  const i = Math.min(level.length - 2, Math.floor(at));
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
  const name = <span className={`block font-heading text-[22px] font-bold leading-tight ${textClass}`}>{b.shortName}</span>;
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
