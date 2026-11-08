/**
 * Outdoor work: landscaping, painting, concrete, fencing and tree service,
 * businesses that sell a result people can see. The home page leads with the
 * business's own photos and asks for an estimate: their best photo in the
 * hero, their work in a gallery straight under it, then what they do, who
 * they are, what customers say, where they work with an estimate form, and a
 * closing band. A site of several pages: home, one page per service group,
 * about, and contact.
 *
 * It reads the same brand file as the heating-and-air template (Hvac.jsx), so
 * an hvac brand file for a landscaper works here by changing only
 * "template". Fields this template has no place for (plan, financing,
 * sameDay) are ignored; a section whose field is absent is left out, never
 * filled with invented words.
 *
 * Brand file shape (src/brands/<slug>.json). Required fields are marked (req).
 *
 *   template     (req) "outdoor"
 *   preview            true on a prospect's preview; leave it out on a sample.
 *                      On a preview no stock (images.unsplash.com) photo is
 *                      ever shown in the hero or the gallery
 *   ask                Read for the hvac shape and ignored: every button here
 *                      asks for an estimate. It is called free ("Free
 *                      Estimate", or the business's own word: quote,
 *                      consultation, inspection) only where the brand file's
 *                      own words offer one free
 *   name         (req) Full business name, used in the footer and the title
 *   shortName    (req) The name as people say it; used in copy and buttons
 *   summary      (req) One sentence on what the business does and where.
 *                      Under the services heading and in the footer
 *   phone        (req) "(512) 938-2043", the Google listing's number
 *   phones             [{ label: "Español", number: "(512) 620-1812" }] other
 *                      lines. With one, a strip above the header names every
 *                      line, and the estimate section, menu and footer list
 *                      them all
 *   languages          ["English", "Spanish"]. Two or more join that strip
 *   email              Contact page and footer
 *   address      (req) Street line
 *   town         (req) "Lockhart"
 *   state        (req) "TX"
 *   zip                "78644"
 *   rating             Google rating, 4.9. Shown only with reviewCount: in the
 *                      hero, on the hero photo's corner and in the reviews
 *   reviewCount        Number of Google reviews
 *   since              Year founded. Under the hero, on the about photo
 *   hours              [["Mon – Fri", "7 AM – 6 PM"], ...]
 *
 *   brand        (req) Colors and type, set as CSS custom properties:
 *     primary    (req) Buttons, marks and the closing band. Its words turn
 *                      ink on a light color and white on a dark one
 *     primaryDeep      Its dark shade. The hero, the page openings without a
 *                      photo and the footer stand on it when it is dark
 *                      enough for white words; else on the primary taken most
 *                      of the way to a near-black
 *     accent           The headline's second half and the main button on the
 *                      dark ground, when it stands out there; else the primary
 *                      or white
 *     ink, muted, line, surface   As Hvac.jsx; derived when absent
 *     heading    (req) CSS font stack for headings, set large in the hero
 *     body       (req) CSS font stack for body text
 *     fonts      (req) Google Fonts stylesheet URL loading both faces
 *     logo, logoMono, logoWidth, logoHeight, logoRatio, logoGround,
 *     logoReads, logoName   As BrandLogo in shared.jsx reads them
 *
 *   heroStyle          "split" (the words beside the hero photo, which runs to
 *                      the screen's right edge), "photo" (the photo across the
 *                      whole hero, the words over its shaded left side) or
 *                      "type" (no photo: the words large on the dark ground
 *                      over contour lines drawn from the name, with the
 *                      service groups beside them). Absent: "split" with a
 *                      hero photo, "type" without. On a phone both photo
 *                      styles show the photo first, the headline over its foot
 *   tone               "bold" (the default: heavy headings, tight tracking) or
 *                      "classic" (lighter headings, looser tracking)
 *   emergency          { title, text } only when the business answers 24/7.
 *                      A strip above the header and a card on the contact page
 *   licenses           [{ label, number }]. Under the hero, about page, footer
 *   credentials        [{ label, detail }] certifications, memberships,
 *                      insurance. With the licenses
 *
 *   hero         (req) Home page opening:
 *     eyebrow    (req) Short line above the headline
 *     title      (req) Headline
 *     titleAccent      Its second half, set in the accent
 *     lead       (req) One or two sentences under it
 *     image            "/brands/<slug>/<name>" (-800/-1600.webp beside it). The
 *                      business's best photo of its work
 *     imageAlt         What it shows (required with image)
 *
 *   projects           [{ title, text, image, imageAlt, town, scope }] the
 *                      business's own jobs, its own names for them. The home
 *                      gallery shows these (up to 8) when present, titled
 *   groups       (req) Service groups, one page each. Each:
 *     slug, title, summary, intro (req)   As Hvac.jsx
 *     icon             Ignored here
 *     image            The group page's photo. Without projects the gallery
 *                      is made of these, captioned with the group and linked
 *                      to its page
 *     imageAlt         What it shows
 *     services         [{ slug, title, text, points }] the group page's list,
 *                      and chips under the group on the home page
 *
 *   about              About page and the home page's about section:
 *     eyebrow, title (req), text (req, paragraphs)
 *     image            Beside the words. When the groups bring fewer than
 *                      three photos it joins the gallery instead, and the home
 *                      page's about section goes without it
 *     imageAlt
 *     values           [{ title, text }] promises, numbered. Shown where
 *                      highlights are absent
 *   highlights         [{ title, text, icon }] 2 to 4 things that set the
 *                      business apart, under its about words. icon is a free
 *                      word (family, shield, clock, leaf, tree, truck...)
 *   owner              { name, role, text, image } under the about words; the
 *                      image takes the about photo's place
 *   steps              [{ title, text }] how a job goes, 2 to 4, only where
 *                      the business describes it
 *   promo              { eyebrow, title, text, price, priceNote, image,
 *                      imageAlt } an offer the business runs, as a band
 *   reviews            [{ author, text, source, rating }] quoted word for
 *                      word; up to 3 on the home page, 6 on the about page,
 *                      each with its source (Google when absent)
 *   faqs               [{ q, a }] home page questions
 *   serviceArea        ["Lockhart", ...] towns served, beside the estimate form
 *   facts              As Facts in shared.jsx, above the home page's footer
 */
import { Check, Clock3, Mail, MapPin, Phone, ShieldCheck, Siren } from 'lucide-react';
import { brandVars, mapsHref, ratingLine, telHref } from '../site.js';
import { Facts, Img, Stars, hexOr, mixHex } from './shared.jsx';
import { EmergencyStrip, Footer, Header, LineStrip, MobileBar } from './outdoor/Chrome.jsx';
import Gallery from './outdoor/Gallery.jsx';
import { HomeHero, PageHero } from './outdoor/Hero.jsx';
import { AboutBlock, ClosingBand, Estimate, EstimateForm, Faqs, Promo, Reviews, Services, Steps } from './outdoor/Sections.jsx';
import { Actions, Eyebrow, Unbroken, WithArrow, h2, lead, pad, wrap } from './outdoor/ui.jsx';
import { areaOf, askOf, contrast, darkActionOf, deepOf, galleryOf, groupsOf, list, onColor, phonesOf } from './outdoor/util.js';

/** The pages beyond home: one per service group, about, contact. */
export function pages(b) {
  return [...groupsOf(b).map((g) => g.slug), b.about ? 'about' : null, 'contact'].filter(Boolean);
}

/** A name lowered to run in a sentence, keeping its initialisms ('HOA') and the towns in it. */
function lowered(title, b) {
  const towns = [b.town, ...list(b.serviceArea)].filter(Boolean);
  let out = String(title)
    .split(/(\s+)/)
    .map((w) => (/^[^a-z]*[A-Z][^a-z]*$/.test(w) && w.length > 1 ? w : w.toLowerCase()))
    .join('');
  for (const t of towns) out = out.replace(new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), t);
  return out;
}

/* -------------------------------------------------------------------- home */

function Home({ b, groups }) {
  const { photos, spare } = galleryOf(b);
  const ask = askOf(b);
  // Each section that has something to show, in order, on grounds that alternate from white.
  const sections = [
    photos.length > 0 &&
      ((ground) => (
        <section key="work" id="work" className={`${pad} scroll-mt-32 ${ground === 'paper' ? 'bg-[color:var(--paper)]' : 'bg-white'}`}>
          <div className={wrap}>
            <div className="mb-10 flex flex-col gap-5 sm:mb-14 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow>Our work</Eyebrow>
                <h2 className={h2}>See our work up close</h2>
              </div>
              <a href="/contact" className="group inline-flex min-h-[44px] items-center font-heading text-[17px] font-bold text-[color:var(--pt)] no-underline">
                <WithArrow text={ask.get} />
              </a>
            </div>
            <Gallery photos={photos} />
          </div>
        </section>
      )),
    groups.length > 0 && ((ground) => <Services key="services" b={b} groups={groups} ground={ground} />),
    b.promo?.title && ((ground) => <Promo key="promo" b={b} ground={ground} />),
    list(b.steps).length > 1 && ((ground) => <Steps key="steps" b={b} ground={ground} />),
    (b.about || list(b.highlights).length > 0) && ((ground) => <AboutBlock key="about" b={b} spare={spare} ground={ground} />),
    (list(b.reviews).length > 0 || ratingLine(b)) && ((ground) => <Reviews key="reviews" b={b} ground={ground} />),
    list(b.faqs).length > 0 && ((ground) => <Faqs key="faqs" b={b} ground={ground} />),
    (ground) => <Estimate key="estimate" b={b} groups={groups} ground={ground} />,
  ].filter(Boolean);
  return (
    <>
      <HomeHero b={b} />
      {sections.map((draw, i) => draw(i % 2 ? 'paper' : 'white'))}
      <ClosingBand b={b} />
    </>
  );
}

/* ------------------------------------------------------------- group pages */

function GroupPage({ b, groups, group }) {
  const services = list(group.services).filter((s) => s?.title);
  const others = groups.filter((g) => g.slug !== group.slug);
  const ask = askOf(b);
  const anchor = b.preview ? 'scroll-mt-[150px]' : 'scroll-mt-[110px]';
  const stick = b.preview ? 'lg:top-[156px]' : 'lg:top-[112px]';
  return (
    <>
      <PageHero
        b={b}
        crumbs={[group.title]}
        eyebrow={`${b.shortName} · ${b.town}`}
        title={group.title}
        text={group.intro}
        image={group.image}
        imageAlt={group.imageAlt}
        aside={
          // Its own services to jump to; else, so the dark ground is not left
          // half empty, the business's other work as the about page lists it.
          services.length > 1 ? (
            <nav aria-label={`${group.title} services`} className="hidden rounded-[28px] border border-white/15 bg-white/[0.06] p-7 backdrop-blur-sm lg:block">
              <p className="font-heading text-[13px] font-bold uppercase tracking-[0.18em] text-white/60">On this page</p>
              <ol className="mt-3 grid">
                {services.map((s, i) => (
                  <li key={s.slug} className="border-t border-white/15 first:border-0">
                    <a href={`#${s.slug}`} className="flex min-h-[52px] items-center gap-4 py-2.5 font-heading text-[17px] font-bold text-white no-underline hover:underline">
                      <span className="w-7 flex-none text-[14px] tabular-nums text-white/45">{String(i + 1).padStart(2, '0')}</span>
                      <span className="min-w-0">{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : (
            groups.length > 1 && (
              <nav aria-label="What we do" className="hidden rounded-[28px] border border-white/15 bg-white/[0.06] p-7 backdrop-blur-sm lg:block">
                <p className="font-heading text-[13px] font-bold uppercase tracking-[0.18em] text-white/60">What we do</p>
                <ul className="mt-3 grid">
                  {groups.map((g) => (
                    <li key={g.slug} className="border-t border-white/15 first:border-0">
                      <a
                        href={`/${g.slug}`}
                        aria-current={g.slug === group.slug ? 'page' : undefined}
                        className={`flex min-h-[52px] items-center gap-3 py-2.5 font-heading text-[17px] font-bold no-underline hover:underline ${g.slug === group.slug ? 'text-white' : 'text-white/70'}`}
                      >
                        <span className="min-w-0 flex-1">{g.title}</span>
                        {g.slug === group.slug && <Check size={17} className="flex-none text-white/60" aria-hidden="true" />}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )
          )
        }
      >
        <Actions b={b} dark={!group.image} className="mt-8" />
      </PageHero>

      <section className={`${pad} bg-white`}>
        <div className={`${wrap} grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16`}>
          <div className="min-w-0">
            {services.length > 0 ? (
              <ol className="grid border-b border-ink/15">
                {services.map((s, i) => (
                  <li key={s.slug || i} id={s.slug} className={`${anchor} grid gap-x-6 gap-y-3 border-t border-ink/15 py-9 sm:grid-cols-[3.25rem_minmax(0,1fr)]`}>
                    <span className="font-heading text-[15px] font-bold tabular-nums text-[color:var(--pt)] sm:pt-2">{String(i + 1).padStart(2, '0')}</span>
                    <div className="min-w-0">
                      <h2 className="font-heading text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-bold leading-[1.15] tracking-[-0.02em] text-ink">
                        <Unbroken>{s.title}</Unbroken>
                      </h2>
                      {s.text && <p className="mt-3 max-w-[44rem] text-[16px] leading-[1.7] text-muted [overflow-wrap:break-word] sm:text-[17px]">{s.text}</p>}
                      {list(s.points).length > 0 && (
                        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                          {list(s.points).map((p) => (
                            <li key={p} className="flex min-w-0 gap-3 text-[16px] leading-[1.5] text-ink [overflow-wrap:break-word]">
                              <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-[color:var(--cta)] text-[color:var(--cta-ink)]">
                                <Check size={12} strokeWidth={3} aria-hidden="true" />
                              </span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div>
                <Eyebrow>{group.title}</Eyebrow>
                <h2 className={h2}>Tell us about the job</h2>
                <p className={`mt-5 max-w-xl ${lead}`}>Send a few details, or call, and we will talk the job through with you.</p>
                <Actions b={b} className="mt-8" />
              </div>
            )}
          </div>
          <aside className={`min-w-0 self-start rounded-[28px] border border-line bg-white p-6 shadow-[0_40px_80px_-50px_rgba(10,20,10,0.5)] sm:p-8 lg:sticky ${stick}`}>
            <h2 className="font-heading text-[22px] font-extrabold leading-tight tracking-[-0.02em] text-ink">
              <Unbroken>{`${ask.act} for ${group.title}`}</Unbroken>
            </h2>
            <p className="mb-6 mt-1.5 text-[16px] text-muted">
              Or call{' '}
              <a href={telHref(b.phone)} className="font-semibold text-[color:var(--pt)] no-underline hover:underline">
                {b.phone}
              </a>
            </p>
            <EstimateForm b={b} groups={groups} need={group.title} />
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className={`${pad} bg-[color:var(--paper)]`}>
          <div className={wrap}>
            <Eyebrow>More we do</Eyebrow>
            <h2 className={`${h2} mb-10`}>Other services</h2>
            <ul className={`grid gap-4 ${others.length === 1 ? '' : others.length % 3 === 0 || others.length > 4 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}>
              {others.map((g) => (
                <li key={g.slug}>
                  <a href={`/${g.slug}`} className="group flex h-full flex-col rounded-[22px] bg-white p-6 no-underline transition hover:-translate-y-0.5 sm:p-7">
                    <span className="font-heading text-[20px] font-bold leading-snug text-ink group-hover:text-[color:var(--pt)]">
                      <WithArrow text={g.title} />
                    </span>
                    {g.summary && <span className="mt-2 block text-[16px] leading-[1.6] text-muted">{g.summary}</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ClosingBand b={b} title={`${ask.get} for ${lowered(group.title, b)}`} />
    </>
  );
}

/* -------------------------------------------------------------------- about */

function AboutPage({ b, groups }) {
  const about = b.about;
  const story = list(about.text).slice(1);
  const rating = ratingLine(b);
  const creds = [
    ...list(b.licenses).map((l) => ({ label: l.label, detail: l.number })),
    ...list(b.credentials).map((c) => ({ label: c.label, detail: c.detail })),
  ].filter((c) => c.label);
  const points = list(b.highlights).length ? list(b.highlights) : list(about.values);
  const area = areaOf(b);
  const side = b.since || rating || creds.length || b.owner?.name || area.length;
  return (
    <>
      <PageHero
        b={b}
        crumbs={['About']}
        eyebrow={about.eyebrow || 'About us'}
        title={about.title}
        text={list(about.text)[0]}
        image={about.image}
        imageAlt={about.imageAlt}
        aside={
          groups.length > 0 && (
            <nav aria-label="What we do" className="hidden rounded-[28px] border border-white/15 bg-white/[0.06] p-7 backdrop-blur-sm lg:block">
              <p className="font-heading text-[13px] font-bold uppercase tracking-[0.18em] text-white/60">What we do</p>
              <ul className="mt-3 grid">
                {groups.map((g) => (
                  <li key={g.slug} className="border-t border-white/15 first:border-0">
                    <a href={`/${g.slug}`} className="flex min-h-[52px] items-center py-2.5 font-heading text-[17px] font-bold text-white no-underline hover:underline">
                      {g.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )
        }
      >
        <Actions b={b} dark={!about.image} className="mt-8" />
      </PageHero>

      {(story.length > 0 || side) && (
        <section className={`${pad} bg-white`}>
          <div className={`${wrap} grid gap-12 ${story.length > 0 && side ? 'lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-20' : ''}`}>
            {story.length > 0 && (
              <div className="min-w-0">
                <h2 className={h2}>Our story</h2>
                {story.map((p) => (
                  <p key={p} className={`mt-5 ${lead}`}>
                    {p}
                  </p>
                ))}
              </div>
            )}
            {side && (
              <aside className={`grid content-start gap-4 ${story.length ? '' : 'md:grid-cols-2'}`}>
                {(b.since || rating) && (
                  <div className={`grid gap-4 ${b.since && rating ? 'grid-cols-2' : ''}`}>
                    {b.since && (
                      <div className="rounded-[22px] bg-[color:var(--paper)] p-5">
                        <p className="text-[14px] text-muted">In business since</p>
                        <p className="mt-1 font-heading text-[32px] font-extrabold tracking-[-0.03em] text-ink">{b.since}</p>
                      </div>
                    )}
                    {rating && (
                      <a href={mapsHref(b)} className="rounded-[22px] bg-[color:var(--paper)] p-5 no-underline">
                        <p className="text-[14px] text-muted">Google rating</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 font-heading text-[32px] font-extrabold tracking-[-0.03em] text-ink">
                          {Number(b.rating).toFixed(1)} <Stars value={b.rating} size={17} />
                        </p>
                        <p className="mt-1 text-[14px] text-muted">From {b.reviewCount.toLocaleString()} reviews</p>
                      </a>
                    )}
                  </div>
                )}
                {b.owner?.name && (
                  <div className="flex gap-4 rounded-[22px] border border-line p-5">
                    {b.owner.image && (
                      <Img className="h-20 w-20 flex-none rounded-full object-cover" src={b.owner.image} alt={b.owner.name} sizes="80px" />
                    )}
                    <div className="min-w-0">
                      <p className="font-heading text-[18px] font-bold text-ink">{b.owner.name}</p>
                      {b.owner.role && <p className="text-[15px] text-muted">{b.owner.role}</p>}
                      {b.owner.text && <p className="mt-2 text-[16px] leading-[1.6] text-muted">{b.owner.text}</p>}
                    </div>
                  </div>
                )}
                {creds.length > 0 && (
                  <div className="rounded-[22px] border border-line p-6">
                    <h2 className="flex items-center gap-2 font-heading text-[17px] font-bold text-ink">
                      <ShieldCheck size={19} className="text-[color:var(--pt)]" aria-hidden="true" /> Licenses and credentials
                    </h2>
                    <dl className="mt-4 grid gap-3">
                      {creds.map((c) => (
                        <div key={c.label} className="flex flex-wrap justify-between gap-x-4 border-t border-line pt-3 text-[16px]">
                          <dt className={c.detail ? 'text-muted' : 'font-semibold text-ink'}>{c.label}</dt>
                          {c.detail && <dd className="m-0 font-semibold text-ink">{c.detail}</dd>}
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
                {area.length > 0 && (
                  <div className="rounded-[22px] border border-line p-6">
                    <h2 className="flex items-center gap-2 font-heading text-[17px] font-bold text-ink">
                      <MapPin size={19} className="text-[color:var(--pt)]" aria-hidden="true" /> Where we work
                    </h2>
                    <p className="mt-3 text-[16px] leading-[1.6] text-muted">{area.join(', ')}</p>
                  </div>
                )}
              </aside>
            )}
          </div>
        </section>
      )}

      {points.length > 0 && (
        <section className={`${pad} bg-[color:var(--paper)]`}>
          <div className={wrap}>
            <Eyebrow>Why {b.shortName}</Eyebrow>
            <ul className={`mt-2 grid gap-4 ${points.length === 4 ? 'md:grid-cols-2 xl:grid-cols-4' : points.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              {points.slice(0, 6).map((p, i) => (
                <li key={p.title} className="rounded-[22px] bg-white p-6 sm:p-7">
                  <span className="font-heading text-[30px] font-extrabold leading-none tabular-nums text-[color:var(--pt)]">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-5 font-heading text-[19px] font-bold leading-snug text-ink">{p.title}</h3>
                  {p.text && <p className="mt-2 text-[16px] leading-[1.6] text-muted">{p.text}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Reviews b={b} max={6} ground={points.length > 0 ? 'white' : 'paper'} />
      <ClosingBand b={b} />
    </>
  );
}

/* ------------------------------------------------------------------ contact */

function ContactPage({ b, groups }) {
  const ask = askOf(b);
  const hours = list(b.hours);
  const area = areaOf(b);
  const full = [b.address, `${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`].filter(Boolean).join(', ');
  return (
    <>
      <PageHero
        b={b}
        crumbs={['Contact']}
        eyebrow={ask.free ? `${ask.act}s` : 'Estimates'}
        title="Tell us about your project"
        text="Send the details and we will call to talk it through, or pick up the phone and talk to us now."
        aside={
          <div className="rounded-[28px] border border-white/15 bg-white/[0.06] p-7 backdrop-blur-sm">
            <p className="font-heading text-[13px] font-bold uppercase tracking-[0.18em] text-white/60">Call us</p>
            {phonesOf(b).map((p) => (
              <a key={p.number} href={telHref(p.number)} className="mt-2 flex min-h-[48px] flex-wrap items-baseline gap-x-3 font-heading text-[30px] font-extrabold tracking-[-0.02em] text-white no-underline hover:underline">
                {p.number}
                {p.label && phonesOf(b).length > 1 && <span className="font-body text-[15px] font-medium tracking-normal text-white/65">{p.label}</span>}
              </a>
            ))}
            <p className="mt-4 border-t border-white/15 pt-4 text-[16px] leading-[1.6] text-white/75">{full}</p>
          </div>
        }
      />
      <section className={`${pad} bg-white`}>
        <div className={`${wrap} grid items-start gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-14`}>
          <div className="rounded-[28px] border border-line p-5 shadow-[0_40px_80px_-50px_rgba(10,20,10,0.45)] sm:p-9 lg:p-10">
            <h2 className="mb-6 font-heading text-[26px] font-extrabold tracking-[-0.02em] text-ink">{ask.free ? `Request your ${ask.noun}` : 'Request an estimate'}</h2>
            <EstimateForm b={b} groups={groups} full />
          </div>
          <aside className="grid gap-4">
            {b.emergency?.title && (
              <a href={telHref(b.phone)} className="flex gap-4 rounded-[22px] bg-[color:var(--alarm)] p-6 text-[color:var(--alarm-ink)] no-underline">
                <Siren size={24} className="mt-0.5 flex-none" aria-hidden="true" />
                <span className="min-w-0">
                  <strong className="block font-heading text-[18px]">{b.emergency.title}</strong>
                  {b.emergency.text && <span className="mt-1 block text-[16px] leading-[1.55] opacity-90">{b.emergency.text}</span>}
                  <span className="mt-3 block font-heading text-[20px] font-extrabold">{b.phone}</span>
                </span>
              </a>
            )}
            <ul className="grid gap-1 rounded-[22px] border border-line p-3">
              {[
                ...phonesOf(b).map((p) => [Phone, telHref(p.number), p.label && phonesOf(b).length > 1 ? `${p.number} (${p.label})` : p.number]),
                b.email && [Mail, `mailto:${b.email}`, b.email.split(/(?=\.[^.]*\.)|(?<=@)/).flatMap((p, i) => (i ? [<wbr key={i} />, p] : [p]))],
                [MapPin, mapsHref(b), full],
              ]
                .filter(Boolean)
                .map(([Icon, href, label]) => (
                  <li key={href}>
                    <a href={href} className="flex min-h-[56px] items-center gap-3 rounded-2xl px-2 font-medium text-ink no-underline hover:bg-[color:var(--paper)]">
                      <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[color:var(--paper)] text-[color:var(--pt)]">
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 [overflow-wrap:break-word]">{label}</span>
                    </a>
                  </li>
                ))}
            </ul>
            {hours.length > 0 && (
              <div className="rounded-[22px] bg-[color:var(--paper)] p-6">
                <h2 className="flex items-center gap-2 font-heading text-[17px] font-bold text-ink">
                  <Clock3 size={18} className="text-[color:var(--pt)]" aria-hidden="true" /> Hours
                </h2>
                <table className="mt-3 w-full border-collapse text-[16px]">
                  <tbody>
                    {hours.map(([d, h]) => (
                      <tr key={d} className="border-b border-line last:border-0">
                        <th scope="row" className="py-2.5 pr-4 text-left font-medium text-muted">
                          {d}
                        </th>
                        <td className="py-2.5 text-right font-semibold text-ink">{h}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {area.length > 0 && (
              <div className="rounded-[22px] border border-line p-6">
                <h2 className="flex items-center gap-2 font-heading text-[17px] font-bold text-ink">
                  <MapPin size={18} className="text-[color:var(--pt)]" aria-hidden="true" /> Where we work
                </h2>
                <p className="mt-3 text-[16px] leading-[1.6] text-muted">{area.join(', ')}</p>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}

/* --------------------------------------------------------------------- root */

/** The brand's main color darkened until it reads as text on white. */
function textShade(hex) {
  let c = hex;
  for (let i = 0; i < 8 && contrast(c, '#ffffff') < 4.5; i += 1) c = mixHex(c, '#000000', 0.18);
  return c;
}

/**
 * The headline's second half on the dark ground: the accent or main color where it reads there, lifted toward white until it does.
 * Over a photo the shade lets the photo through, so the ground is lighter and as green as the garden; there `min` is raised.
 */
function highlightOn(brand, deep, min = 4.5) {
  for (const base of [brand.accent, brand.primary].map((v) => hexOr(v, null)).filter(Boolean)) {
    for (const lift of [0, 0.2, 0.4]) {
      const c = lift ? mixHex(base, '#ffffff', lift) : base;
      if (contrast(c, deep) >= min) return c;
    }
  }
  return '#ffffff';
}

const disc = (ink) => (ink === '#fff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.09)');

export default function Outdoor({ b, path = '' }) {
  const groups = groupsOf(b);
  const group = groups.find((g) => g.slug === path);
  const page = group ? 'group' : path === 'about' && b.about ? 'about' : path === 'contact' ? 'contact' : 'home';
  const current = page === 'home' ? '' : path;
  const brand = b.brand;
  const primary = hexOr(brand.primary, '#2f6b3a');
  const deep = deepOf(brand);
  const darkAction = darkActionOf(brand, deep);
  const alarm = hexOr(brand.accent, primary);
  const serif = /serif/.test(String(brand.heading || '').replace(/sans-serif/g, ''));
  const classic = b.tone === 'classic';
  const hasWork = galleryOf(b).photos.length > 0;

  const style = {
    '--ink': '#141a16',
    '--primaryDeep': deep,
    '--accent': primary,
    '--muted': 'color-mix(in srgb, var(--ink) 70%, #fff)',
    '--line': 'color-mix(in srgb, var(--ink) 12%, #fff)',
    '--surface': 'color-mix(in srgb, var(--primary) 6%, #fff)',
    ...brandVars(brand),
    '--paper': 'color-mix(in srgb, var(--primary) 4%, #f6f4ee)',
    '--deep': deep,
    '--pt': textShade(primary),
    '--hl': highlightOn(brand, deep),
    '--hl-photo': highlightOn(brand, deep, 7),
    '--cta': primary,
    '--cta-ink': onColor(primary),
    '--cta-disc': disc(onColor(primary)),
    '--cta-dark': darkAction,
    '--cta-dark-ink': onColor(darkAction),
    '--cta-dark-disc': disc(onColor(darkAction)),
    '--on-primary': onColor(primary),
    '--on-primary-line': onColor(primary) === '#fff' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.25)',
    '--alarm': alarm,
    '--alarm-ink': onColor(alarm),
    '--h-weight': classic ? (serif ? 400 : 600) : serif ? 600 : 800,
    '--h-track': classic ? (serif ? '-0.005em' : '-0.015em') : serif ? '-0.015em' : '-0.035em',
  };

  return (
    // Heading type is tracked tight, which also narrows the word space; a face with a slim space would run words together.
    // Figures are set lining, so a serif face's old-style numerals never make a phone number dance.
    <div className="min-w-0 overflow-x-clip bg-white font-body text-[16px] text-ink antialiased [font-variant-numeric:lining-nums] [&_.font-heading]:[word-spacing:0.08em]" style={style}>
      <EmergencyStrip b={b} />
      <LineStrip b={b} />
      <Header b={b} groups={groups} current={current} hasWork={hasWork} />
      <main>
        {page === 'home' && <Home b={b} groups={groups} />}
        {page === 'group' && <GroupPage b={b} groups={groups} group={group} />}
        {page === 'about' && <AboutPage b={b} groups={groups} />}
        {page === 'contact' && <ContactPage b={b} groups={groups} />}
      </main>
      {!path && list(b.facts).length > 0 && (
        <div className="py-[clamp(3rem,6vw,5rem)]">
          <Facts b={b} />
        </div>
      )}
      <Footer b={b} groups={groups} deep={deep} hasWork={hasWork} />
      <MobileBar b={b} />
    </div>
  );
}
