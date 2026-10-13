/**
 * Restaurant: a restaurant, cafe, taqueria, seafood or barbecue kitchen. A site
 * of up to four pages, drawn in the restaurant's own colors and type on a warm
 * light ground: home, menu, about and contact.
 *
 * BRAND FILE (src/brands/<slug>.json). Required fields are marked *; every other
 * field may be left out, and the section, line or button it feeds is left out
 * with it. Nothing is ever drawn in its place: no placeholder dish, price,
 * photo, rating or claim. Copy in the file is sentence case; names of dishes and
 * menu sections are as the restaurant writes them. src/brands/sample-restaurant.json
 * fills every field.
 *
 *   template*        "restaurant"
 *   preview          true on a prospect's preview (shows the preview strip and
 *                    counts views); left out on the sample
 *   name*            the restaurant's full name, as on Google: "Casa Marea Kitchen"
 *   shortName*       the name as people say it: "Casa Marea". Used in running
 *                    copy, and set in type when there is no logo
 *   cuisine*         what it serves, a short phrase that reads both as a label
 *                    and at the start of a sentence: "Tex-Mex and Gulf seafood",
 *                    "Vietnamese", "Barbecue". First item of the highlights row,
 *                    the hero's default eyebrow and the footer line
 *   phone*           "(281) 555-0172"; every Call button dials it
 *   email            shown on the contact page and in the footer
 *   address*         street line, with suite: "1820 Bayway Dr, Suite B"
 *   town*, state*    "Baytown", "TX"
 *   zip              "77520"
 *   rating           Google rating, a number: 4.7       } both or neither. With
 *   reviewCount      number of Google reviews: 812      } both, the highlights
 *                    row shows the rating and the home page has a reviews section
 *   since            year opened, a number: 2009. Highlights row and footer line
 *   hours*           rows of [days, time] in display order:
 *                    [["Mon – Thu", "11 AM – 9 PM"], ["Sunday", "Closed"]].
 *                    Days are day names or ranges ("Mon – Fri", "Tuesday",
 *                    "Daily", "Weekends") so today's row can be marked; a time
 *                    containing "Closed" is drawn as a closed day. Two sittings
 *                    go in one time: "11 AM – 2 PM, 5 – 9 PM"
 *
 *   orderUrl         the restaurant's own online ordering page (Toast, Square,
 *                    ChowNow, its own site). Adds Order Online buttons, which
 *                    lead every call to action
 *   reservationsUrl  its reservations page (OpenTable, Resy, Tock). Adds Reserve
 *                    a Table buttons
 *   deliveryLinks    [{ label*, href* }] delivery services the restaurant itself
 *                    links to: [{ "label": "DoorDash", "href": "https://..." }].
 *                    A line under the hero buttons and a list on the contact page
 *   serviceOptions   { dineIn, takeout, delivery, catering } the service options
 *                    of the Google listing, each true only when the restaurant or
 *                    its listing says so; each true one is an item in the
 *                    highlights row ("Dine-In", "Takeout", "Delivery",
 *                    "Catering"). Leave the others out. (Not `services`: other
 *                    templates and the build checks read that as a list.)
 *   catering         { title, text* } the restaurant's own words on catering or
 *                    large orders. With it (or with serviceOptions.catering)
 *                    the home page has a catering band and the contact page's
 *                    form asks for an event date and guest count; title
 *                    defaults to "Catering from <shortName>". Without either,
 *                    the form is a plain message form
 *   band             { title, text } the closing call to action on every page
 *                    but contact. title defaults to "Come hungry", text to the
 *                    address
 *
 *   brand*           colors as #rrggbb, fonts as CSS font-family stacks. The
 *                    page is drawn on a light ground with dark text
 *     primary*       buttons, icons and accents; text on it is picked for
 *                    contrast, and as text on the light ground it is darkened
 *                    until it reads
 *     primaryDeep    a dark shade of primary: the ground of the closing band and
 *                    of the hero's text on phones (darkened further if white
 *                    text would not read on it; default primary mixed toward black)
 *     accent         a warm second color: rules, the Today marker, tag fills,
 *                    eyebrows on dark grounds (default primary)
 *     ink*           body text, and the ground of the footer and the phone
 *                    action bar, so it must be dark
 *     muted          secondary text (default ink at 70%)
 *     bg             the page ground, light ("#fbf6ee"; default a warm white)
 *     surface        the tinted ground of alternate bands and cards (default
 *                    primary at 7% on bg)
 *     line           hairlines and borders (default ink at 13% on bg)
 *     heading*       display font stack: "'Fraunces', Georgia, serif". A serif is
 *                    set at its regular weight, a sans at bold
 *     body*          text font stack: "'Figtree', system-ui, sans-serif"
 *     fonts*         the Google Fonts stylesheet URL loading both
 *     logo           "/brands/<slug>/logo.webp", or null to set shortName in
 *                    type. Prepared by `python3 -m scripts.autobuild.gate logo`,
 *                    which also prints the fields below
 *     logoMono       "/brands/<slug>/logo-mono.webp", the logo cut to one color,
 *                    drawn in its place on a ground its own colors would not
 *                    read on
 *     logoWidth      drawn width in the header, px
 *     logoHeight     drawn height in the header, px; the logo is sized by it
 *     logoRatio      width over height of the file
 *     logoGround     the ground the logo was cut from; the header keeps its own
 *     logoReads      how much of the logo's edge survives on eleven grays from
 *                    black to white, which decides where its own colors stand
 *     logoName       true when the mark carries no name; the name is then set
 *                    beside it
 *
 *   hero*            the top of the home page: the restaurant's own photo full
 *                    width, the text over it on wide screens and under it on
 *                    phones
 *     eyebrow        small line above the headline (default "<cuisine> in <town>")
 *     title*         the headline: the restaurant's own tagline, or its name
 *                    when it has none
 *     lead*          one line on what it is: "Gulf shrimp, Tex-Mex plates and
 *                    margaritas by the bayou"
 *     image*         its best photo of food or the room: "/brands/<slug>/<name>"
 *                    (with -800 and -1600 webp beside it) or an
 *                    images.unsplash.com URL. Landscape, at least 1600px wide
 *     imageAlt*      what the photo shows
 *                    Under the lead: Order Online (orderUrl), Reserve a Table
 *                    (reservationsUrl), Call (always), View Menu (menu)
 *
 *   menu             the menu, in sections, as the restaurant prints it. With it
 *                    the site has a /menu page, the home page shows a few dishes
 *                    and every page offers View Menu. Never add a dish, a price or
 *                    a description the restaurant does not publish.
 *                    [{ slug, title*, note, items* }]
 *     slug           the section's anchor on the menu page, lowercase-and-hyphens
 *                    (default: made from title)
 *     title*         "Starters", "Tacos", "From the Gulf"
 *     note           one line under the section title: "Served with rice and
 *                    charro beans"
 *     items*         the dishes, each either a bare name ("Mexican rice") or
 *                    { name*, description, price, tags, featured, image, imageAlt }
 *       description  as the menu words it
 *       price        exactly as the restaurant states it, as a string: "$14",
 *                    "$12.95", "Market price", "Half 9 / Full 16". A bare number
 *                    is set in dollars. Left out, no price is drawn
 *       tags         dietary and other marks as the menu prints them, words
 *                    preferred: ["Vegetarian", "Gluten-free", "Spicy"]
 *       featured     true for the dishes the restaurant itself calls signature,
 *                    popular or favorites. The home page shows up to six featured
 *                    dishes; with none marked it shows the first dish of each
 *                    section
 *       image        a photo of that dish (path or Unsplash URL, as hero.image);
 *                    on the home card and as a thumbnail on the menu page
 *       imageAlt     what the photo shows
 *                    A section whose items are all bare names (sides, drinks,
 *                    sauces) is drawn as a compact list
 *   menuNote         a line under the whole menu: how prices work, the advisory
 *                    on raw or undercooked food
 *
 *   about            the restaurant's story. With it the site has an /about page
 *                    and the home page an about section linking to it
 *     eyebrow        small line over the title (default "About <shortName>")
 *     title*         headline
 *     text*          a paragraph, or a list of paragraphs, from its own site; the
 *                    home page shows the first
 *     image          a photo of the room, the team or the kitchen
 *     imageAlt       what it shows (required with image)
 *   team             [{ name*, role*, bio, image, imageAlt }] the chef, owners or
 *                    staff the restaurant itself names, on the about page.
 *                    role: "Chef and co-owner". image: a portrait
 *   gallery          [{ image*, imageAlt* }] more photos, on the about page
 *                    Team and gallery are drawn only on the about page, so they
 *                    need about
 *
 *   reviews          [{ author*, text* }] reviews quoted word for word from the
 *                    Google listing or the restaurant's site, author as shown
 *                    there. Drawn in the reviews section, so only with rating and
 *                    reviewCount; up to four
 *   social           { instagram, facebook, tiktok, yelp } full profile URLs,
 *                    any subset. Footer and contact page
 *   serviceArea      ["Baytown", "Mont Belvieu", ...] towns it delivers or
 *                    caters to, as it lists them; on the contact page
 *   facts            anything else its own site tells a customer that has no
 *                    field here (payment, parking, happy hour, policies); see
 *                    Facts in shared.jsx. A section above the home page footer
 *
 * PAGES. '' (home) is always drawn: hero, highlights row (when it has more than
 * the cuisine to show), featured dishes, hours and location, reviews, about,
 * catering, closing band, facts. 'menu' is drawn when the menu has a section
 * with an item, 'about' when about has a title and text, and 'contact' always:
 * address with a map link, phone, email, hours, delivery links, areas served,
 * social links and the enquiry form.
 */
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, ChefHat, Clock, Mail, MapPin, Navigation, Phone, ShoppingBag, Store, Truck, UtensilsCrossed } from 'lucide-react';
import { brandVars, displayVars, mapsHref, telHref } from '../site.js';
import { EnquiryForm, Facts, Img, Stars } from './shared.jsx';
import { Band, CallLabel, Footer, Header, MobileBar } from './restaurant/chrome.jsx';
import { hexOr, liftOn, mix, onColor, readable } from './restaurant/color.js';
import { useToday } from './restaurant/hours.js';
import { featuredOf, list, paragraphs, priceOf, sectionsOf } from './restaurant/menu.js';
import { Eyebrow, HoursTable, Socials, Tags, away, ghost, h2, hasSocial, label, outline, pad, solid, wrap } from './restaurant/ui.jsx';

const hasAbout = (b) => Boolean(b.about?.title && paragraphs(b.about.text).length);
const offersCatering = (b) => Boolean(b.catering?.text || b.serviceOptions?.catering);

/** The pages beyond the home page this restaurant's site has. */
export function pages(b) {
  return [sectionsOf(b).length > 0 && 'menu', hasAbout(b) && 'about', 'contact'].filter(Boolean);
}

/** The restaurant's own online actions, in the order they lead: ordering, then reservations. */
function actionsOf(b) {
  return [
    b.orderUrl && { href: b.orderUrl, label: 'Order Online', Icon: ShoppingBag },
    b.reservationsUrl && { href: b.reservationsUrl, label: 'Reserve a Table', Icon: CalendarDays },
  ].filter(Boolean);
}

const deliveryOf = (b) => list(b.deliveryLinks).filter((d) => d?.label && d?.href);

/* ------------------------------------------------------------------ parts */

function PageHead({ eyebrow, title, text, children }) {
  return (
    <section className="border-b border-line bg-surface">
      <div className={`${wrap} pb-[clamp(2.75rem,5vw,4rem)] pt-[clamp(2.75rem,6vw,5rem)]`}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="max-w-[22ch] font-heading font-display text-[clamp(2.6rem,1.6rem+4vw,5rem)] leading-[1.02] [overflow-wrap:anywhere] [text-wrap:balance]">
          {title}
        </h1>
        {text && <p className="mt-5 max-w-[40rem] text-[18px] leading-relaxed text-muted sm:text-xl">{text}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

/** Order, reserve, call and the menu, as the hero and the menu page offer them. */
function Actions({ b, tel, actions, hasMenu, dark = false }) {
  const [first, ...rest] = actions;
  const second = dark ? ghost : outline;
  return (
    <div className="grid gap-3 sm:flex sm:flex-wrap">
      {first && (
        <a href={first.href} {...away} className={solid}>
          <first.Icon size={18} aria-hidden="true" /> {first.label}
        </a>
      )}
      {rest.map((a) => (
        <a key={a.href} href={a.href} {...away} className={second}>
          <a.Icon size={18} aria-hidden="true" /> {a.label}
        </a>
      ))}
      <div className={`grid gap-3 sm:contents ${hasMenu ? 'grid-cols-2' : ''}`}>
        <a href={tel} className={first ? second : solid}>
          <Phone size={18} aria-hidden="true" /> <CallLabel b={b} />
        </a>
        {hasMenu && (
          <a href="/menu" className={second}>
            <BookOpen size={18} aria-hidden="true" /> View Menu
          </a>
        )}
      </div>
    </div>
  );
}

function Delivery({ b, dark = false }) {
  const links = deliveryOf(b);
  if (!links.length) return null;
  return (
    <p className={`mt-5 flex flex-wrap items-center gap-x-4 text-[15px] ${dark ? 'text-white/80' : 'text-muted'}`}>
      <span>Order delivery on</span>
      {links.map((d) => (
        <a
          key={d.href}
          href={d.href}
          {...away}
          className={`inline-flex min-h-11 items-center gap-1 font-semibold underline underline-offset-4 ${
            dark ? 'text-white decoration-white/40 hover:decoration-white' : 'text-ink decoration-ink/30 hover:decoration-ink'
          }`}
        >
          {d.label} <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      ))}
    </p>
  );
}

function DishCard({ d }) {
  const price = priceOf(d);
  return (
    <article className="flex h-full overflow-hidden rounded-[1.25rem] bg-surface sm:flex-col">
      {d.image && (
        <Img
          className="w-28 flex-none object-cover sm:aspect-[4/3] sm:w-full"
          src={d.image}
          alt={d.imageAlt || ''}
          sizes="(max-width: 640px) 112px, (max-width: 1024px) 50vw, 33vw"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
        {!d.image && <span aria-hidden="true" className="mb-5 block h-1 w-10 rounded-full bg-accent" />}
        <div className="flex items-baseline justify-between gap-3 sm:gap-4">
          <h3 className="min-w-0 font-heading font-display-2 text-[1.2rem] leading-snug [overflow-wrap:anywhere] sm:text-[1.35rem]">{d.name}</h3>
          {price && <span className="max-w-[45%] flex-none text-right font-semibold tabular-nums text-[color:var(--pt)]">{price}</span>}
        </div>
        {d.description && <p className="mt-1.5 text-[15px] leading-relaxed text-muted sm:mt-2 sm:text-[16px]">{d.description}</p>}
        <Tags tags={d.tags} className="mt-auto pt-3 sm:pt-4" />
      </div>
    </article>
  );
}

/** One dish line on the menu page: the name, a dotted leader, the price, then what it is. */
function MenuItem({ item }) {
  const price = priceOf(item);
  // A price of several parts ("For one $19 / For two $34") reads better on its own line.
  const long = price && price.length > 14;
  return (
    <li className="flex gap-4 border-t border-line py-5">
      {item.image && (
        <Img
          className="h-20 w-20 flex-none rounded-xl object-cover sm:h-24 sm:w-24"
          src={item.image}
          alt={item.imageAlt || ''}
          sizes="96px"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <h3 className="min-w-0 font-heading font-display-2 text-[1.2rem] leading-snug [overflow-wrap:anywhere] sm:text-[1.3rem]">{item.name}</h3>
          {price && !long && (
            <>
              <span aria-hidden="true" className="min-w-4 flex-1 translate-y-[-0.3em] border-b-2 border-dotted border-line" />
              <span className="flex-none whitespace-nowrap font-semibold tabular-nums">{price}</span>
            </>
          )}
        </div>
        {long && <p className="mt-1 font-semibold tabular-nums">{price}</p>}
        {item.description && <p className="mt-1.5 text-[16px] leading-relaxed text-muted">{item.description}</p>}
        <Tags tags={item.tags} className="mt-3" />
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ home */

function Hero({ b, tel, actions, hasMenu }) {
  const shade = {
    backgroundImage:
      'linear-gradient(90deg, rgba(16,10,7,0.86) 0%, rgba(16,10,7,0.6) 42%, rgba(16,10,7,0.12) 78%), linear-gradient(0deg, rgba(16,10,7,0.55) 0%, rgba(16,10,7,0) 50%)',
  };
  return (
    <section id="top" className="relative isolate bg-[color:var(--deep)] text-white lg:flex lg:min-h-[clamp(620px,84vh,820px)] lg:items-end">
      <div className="relative aspect-[3/2] w-full overflow-hidden sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto">
        <Img className="h-full w-full object-cover" src={b.hero.image} alt={b.hero.imageAlt} sizes="100vw" eager />
        <div aria-hidden="true" className="absolute inset-0 hidden lg:block" style={shade} />
      </div>
      <div className={`${wrap} relative pb-12 pt-9 sm:pb-14 sm:pt-11 lg:pb-[clamp(4rem,9vh,6.5rem)] lg:pt-40`}>
        <div>
          <Eyebrow dark>{b.hero.eyebrow || `${b.cuisine} in ${b.town}`}</Eyebrow>
          <h1 className="max-w-[46rem] font-heading font-display text-[clamp(2.5rem,1.45rem+4.3vw,5.4rem)] leading-[1.02] [overflow-wrap:anywhere] [text-wrap:balance]">
            {b.hero.title}
          </h1>
          <p className="mt-5 max-w-[36rem] text-[18px] leading-relaxed text-white/90 sm:text-xl">{b.hero.lead}</p>
          <div className="mt-8">
            <Actions b={b} tel={tel} actions={actions} hasMenu={hasMenu} dark />
          </div>
          <Delivery b={b} dark />
        </div>
      </div>
    </section>
  );
}

function Highlights({ b }) {
  const s = b.serviceOptions || {};
  const rated = b.rating && b.reviewCount;
  const items = [
    ['cuisine', UtensilsCrossed, b.cuisine],
    rated && ['rating', null, `${Number(b.rating).toFixed(1)} from ${Number(b.reviewCount).toLocaleString()} Google reviews`],
    b.since && ['since', Clock, `Since ${b.since}`],
    s.dineIn && ['dine-in', Store, 'Dine-In'],
    s.takeout && ['takeout', ShoppingBag, 'Takeout'],
    s.delivery && ['delivery', Truck, 'Delivery'],
    offersCatering(b) && ['catering', ChefHat, 'Catering'],
  ].filter(Boolean);
  // The cuisine alone is already the hero's eyebrow; the row is for what it adds.
  if (items.length < 2) return null;
  return (
    <section id="glance" aria-label="At a glance" className="border-b border-line bg-surface">
      <ul className={`${wrap} flex flex-wrap items-center gap-x-8 gap-y-3 py-5 text-[16px] font-medium`}>
        {items.map(([key, Icon, text]) => (
          <li key={key} className="flex min-h-8 items-center gap-2.5">
            {Icon ? (
              <Icon size={19} className="flex-none text-[color:var(--pt)]" aria-hidden="true" />
            ) : (
              <Stars value={b.rating} size={16} />
            )}
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Featured({ b, dishes, hasMenu }) {
  if (!dishes.length) return null;
  const cols = { 1: 'max-w-xl', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[dishes.length] || 'sm:grid-cols-2 lg:grid-cols-3';
  return (
    <section id="featured" className={pad}>
      <div className={wrap}>
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:mb-14">
          <div>
            <Eyebrow>From the kitchen</Eyebrow>
            <h2 className={h2}>A taste of the menu</h2>
          </div>
          {hasMenu && (
            <a href="/menu" className={`${outline} self-start sm:self-auto`}>
              View Full Menu <ArrowRight size={18} aria-hidden="true" />
            </a>
          )}
        </div>
        <ul className={`grid gap-4 sm:gap-5 lg:gap-7 ${cols}`}>
          {dishes.map((d, i) => (
            <li key={`${d.name}-${i}`} className="min-w-0">
              <DishCard d={d} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Visit({ b, tel, today }) {
  return (
    <section id="hours" className={`bg-surface ${pad}`}>
      <div className={`${wrap} grid gap-12 lg:grid-cols-2 lg:gap-20`}>
        <div className="min-w-0">
          <Eyebrow>Visit</Eyebrow>
          <h2 className={h2}>Hours and location</h2>
          <a href={mapsHref(b)} {...away} className="mt-8 flex gap-3 text-[19px] leading-relaxed text-ink no-underline hover:underline">
            <MapPin size={21} className="mt-1 flex-none text-[color:var(--pt)]" aria-hidden="true" />
            <span>
              {b.address}
              <br />
              {b.town}, {b.state} {b.zip}
            </span>
          </a>
          {b.email && (
            <a href={`mailto:${b.email}`} className="mt-3 flex min-h-11 items-center gap-3 text-[17px] text-ink no-underline [overflow-wrap:anywhere] hover:underline">
              <Mail size={20} className="flex-none text-[color:var(--pt)]" aria-hidden="true" />
              <span className="min-w-0">{b.email}</span>
            </a>
          )}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <a href={mapsHref(b)} {...away} className={solid}>
              <Navigation size={18} aria-hidden="true" /> Directions
            </a>
            <a href={tel} className={outline}>
              <Phone size={18} aria-hidden="true" /> <CallLabel b={b} />
            </a>
          </div>
        </div>
        <div className="min-w-0 lg:pt-3">
          <p className={`${label} text-muted`}>Hours</p>
          <HoursTable hours={b.hours} today={today} className="text-[17px]" />
        </div>
      </div>
    </section>
  );
}

function Reviews({ b }) {
  if (!(b.rating && b.reviewCount)) return null;
  const quotes = list(b.reviews).filter((r) => r?.text && r?.author).slice(0, 4);
  return (
    <section id="reviews" className={pad}>
      <div className={`${wrap} grid gap-12 ${quotes.length ? 'lg:grid-cols-[minmax(0,0.75fr)_minmax(0,2fr)] lg:gap-16' : ''}`}>
        <div className="min-w-0">
          <Eyebrow>Reviews</Eyebrow>
          <h2 className={h2}>{Number(b.rating).toFixed(1)} stars on Google</h2>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[17px] text-muted">
            <Stars value={b.rating} size={18} />
            <span>From {Number(b.reviewCount).toLocaleString()} reviews</span>
          </p>
          <a href={mapsHref(b)} {...away} className={`${outline} mt-8`}>
            Read Reviews on Google <ArrowUpRight size={18} aria-hidden="true" />
          </a>
        </div>
        {quotes.length > 0 && (
          <ul className={`grid gap-5 ${{ 1: '', 3: 'md:grid-cols-3' }[quotes.length] ?? 'md:grid-cols-2'}`}>
            {quotes.map((r) => (
              <li key={r.text.slice(0, 32)} className="min-w-0">
                <figure className="m-0 flex h-full flex-col rounded-[1.25rem] border border-line p-6 sm:p-7">
                  <span aria-hidden="true" className="font-heading text-[3.5rem] leading-[0.7] text-accent">
                    &ldquo;
                  </span>
                  <blockquote className="m-0 mt-3 text-[17px] leading-relaxed">{r.text}</blockquote>
                  <figcaption className="mt-auto pt-5 text-[15px] font-semibold text-muted">{r.author}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function AboutTeaser({ b }) {
  if (!hasAbout(b)) return null;
  const a = b.about;
  const [first] = paragraphs(a.text);
  return (
    <section id="about" className={`border-t border-line ${pad}`}>
      <div className={`${wrap} grid items-center gap-10 ${a.image ? 'lg:grid-cols-2 lg:gap-20' : ''}`}>
        {a.image && (
          <Img className="aspect-[4/3] w-full rounded-[1.5rem] object-cover" src={a.image} alt={a.imageAlt || ''} sizes="(max-width: 1024px) 100vw, 50vw" />
        )}
        <div className={`min-w-0 ${a.image ? '' : 'max-w-3xl'}`}>
          <Eyebrow>{a.eyebrow || `About ${b.shortName}`}</Eyebrow>
          <h2 className={h2}>{a.title}</h2>
          <p className="mt-6 text-[18px] leading-relaxed text-muted">{first}</p>
          <a href="/about" className={`${outline} mt-8`}>
            More About {b.shortName} <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Catering({ b }) {
  if (!offersCatering(b)) return null;
  const c = b.catering || {};
  return (
    <section id="catering" className="py-[clamp(3rem,6vw,5rem)]">
      <div className={wrap}>
        <div className="grid gap-7 rounded-[1.75rem] border border-line bg-surface p-6 sm:p-10 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-12 lg:p-14">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-[color:var(--on-primary)]">
            <ChefHat size={28} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <Eyebrow>Catering</Eyebrow>
            <h2 className="font-heading font-display text-[clamp(1.8rem,1.3rem+1.8vw,2.6rem)] leading-[1.1] [text-wrap:balance]">
              {c.title || `Catering from ${b.shortName}`}
            </h2>
            {c.text && <p className="mt-4 max-w-[42rem] text-[17px] leading-relaxed text-muted">{c.text}</p>}
          </div>
          <a href="/contact#enquiry" className={`${solid} self-start lg:self-center`}>
            Ask About Catering <ArrowRight size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Home({ b, tel, actions, sections, today }) {
  const hasMenu = sections.length > 0;
  return (
    <>
      <Hero b={b} tel={tel} actions={actions} hasMenu={hasMenu} />
      <Highlights b={b} />
      <Featured b={b} dishes={featuredOf(sections)} hasMenu={hasMenu} />
      <Visit b={b} tel={tel} today={today} />
      <Reviews b={b} />
      <AboutTeaser b={b} />
      <Catering b={b} />
    </>
  );
}

/* ------------------------------------------------------------------ pages */

function MenuPage({ b, tel, actions, sections }) {
  const stick = b.preview ? 'top-[116px] lg:top-[132px]' : 'top-[72px] lg:top-[88px]';
  const anchor = b.preview ? 'scroll-mt-[184px] lg:scroll-mt-[200px]' : 'scroll-mt-[140px] lg:scroll-mt-[156px]';
  return (
    <>
      <PageHead eyebrow={`${b.shortName} · ${b.town}`} title="Menu">
        <Actions b={b} tel={tel} actions={actions} hasMenu={false} />
        <Delivery b={b} />
      </PageHead>
      {sections.length > 1 && (
        <nav aria-label="Menu sections" className={`sticky ${stick} z-30 border-b border-line bg-ground/95 backdrop-blur-md`}>
          <ul className={`${wrap} flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}>
            {sections.map((s) => (
              <li key={s.slug} className="flex-none">
                <a
                  href={`#${s.slug}`}
                  className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-line px-4 text-[15px] font-medium text-ink no-underline transition-colors hover:border-ink"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {sections.map((s, i) => (
        <section key={s.slug} id={s.slug} className={`${anchor} ${i % 2 ? 'bg-surface' : ''} py-[clamp(3rem,6vw,5rem)]`}>
          <div className={wrap}>
            <div className="mb-8 max-w-3xl">
              <h2 className="font-heading font-display text-[clamp(1.9rem,1.4rem+1.8vw,2.75rem)] leading-tight [overflow-wrap:anywhere]">{s.title}</h2>
              {s.note && <p className="mt-3 text-[17px] leading-relaxed text-muted">{s.note}</p>}
            </div>
            {s.simple ? (
              <ul className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
                {s.items.map((item, i) => (
                  <li key={`${item.name}-${i}`} className="flex items-center gap-3 border-t border-line py-3.5 text-[17px]">
                    <span aria-hidden="true" className="h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                    <span className="min-w-0">{item.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="grid gap-x-14 lg:grid-cols-2">
                {s.items.map((item, i) => (
                  <MenuItem key={`${item.name}-${i}`} item={item} />
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}
      {b.menuNote && (
        <div className="border-t border-line">
          <p className={`${wrap} py-8 text-[15px] italic leading-relaxed text-muted`}>{b.menuNote}</p>
        </div>
      )}
    </>
  );
}

function AboutPage({ b }) {
  const a = b.about;
  const team = list(b.team).filter((p) => p?.name && p?.role);
  const gallery = list(b.gallery).filter((g) => g?.image);
  const galleryCols = gallery.length === 1 ? 'max-w-3xl' : gallery.length === 2 || gallery.length === 4 ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-3';
  return (
    <>
      <PageHead eyebrow={a.eyebrow || `About ${b.shortName}`} title={a.title} />
      <section id="story" className={pad}>
        <div className={`${wrap} grid items-start gap-12 ${a.image ? 'lg:grid-cols-2 lg:gap-20' : ''}`}>
          <div className="grid max-w-[40rem] content-start gap-5 text-[18px] leading-[1.75] text-ink/85">
            {paragraphs(a.text).map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          {a.image && (
            <Img
              className="aspect-[4/5] w-full rounded-[1.5rem] object-cover lg:sticky lg:top-32"
              src={a.image}
              alt={a.imageAlt || ''}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
        </div>
      </section>
      {team.length > 0 && (
        <section id="team" className={`border-t border-line ${pad}`}>
          <div className={wrap}>
            <Eyebrow>{b.shortName}</Eyebrow>
            <h2 className={h2}>Meet the team</h2>
            <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((p) => (
                <li key={p.name} className="min-w-0">
                  {p.image && (
                    <Img
                      className="mb-5 aspect-[4/5] w-full rounded-[1.25rem] object-cover"
                      src={p.image}
                      alt={p.imageAlt || p.name}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                  <h3 className="font-heading font-display-2 text-[1.55rem] leading-tight">{p.name}</h3>
                  <p className="mt-1.5 text-[14px] font-semibold uppercase tracking-[0.14em] text-[color:var(--pt)]">{p.role}</p>
                  {p.bio && <p className="mt-3 text-[17px] leading-relaxed text-muted">{p.bio}</p>}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {gallery.length > 0 && (
        <section id="gallery" className={`bg-surface ${pad}`}>
          <div className={wrap}>
            <Eyebrow>Gallery</Eyebrow>
            <h2 className={h2}>{b.shortName} in pictures</h2>
            <ul className={`mt-10 grid gap-3 sm:gap-4 ${galleryCols}`}>
              {gallery.map((g, i) => (
                <li key={g.image} className={`min-w-0 ${gallery.length % 2 && i === 0 && gallery.length > 1 ? 'col-span-2 lg:col-span-1' : ''}`}>
                  <Img
                    className="aspect-[4/3] h-full w-full rounded-[1rem] object-cover"
                    src={g.image}
                    alt={g.imageAlt || ''}
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}

const field =
  'min-h-12 w-full rounded-xl border border-line bg-ground px-4 py-3 font-body text-[16px] font-normal text-ink outline-none transition-colors focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20';

function ContactPage({ b, tel, today }) {
  const catering = offersCatering(b);
  const delivery = deliveryOf(b);
  const area = list(b.serviceArea).filter(Boolean);
  const full = `${b.address}, ${b.town}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;
  const anchor = b.preview ? 'scroll-mt-[136px] lg:scroll-mt-[152px]' : 'scroll-mt-[92px] lg:scroll-mt-[108px]';
  const rows = [
    [MapPin, mapsHref(b), full, true],
    [Phone, tel, b.phone, false],
    b.email && [Mail, `mailto:${b.email}`, b.email, false],
  ].filter(Boolean);
  const fields = catering
    ? [
        { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
        { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
        { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
        { name: 'date', label: 'Event Date', type: 'date' },
        { name: 'guests', label: 'Number of Guests', type: 'number' },
        { name: 'details', label: 'Details', type: 'textarea', wide: true },
      ]
    : [
        { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
        { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'email' },
        { name: 'phone', label: 'Phone', type: 'tel', autoComplete: 'tel', wide: true },
        { name: 'message', label: 'Message', type: 'textarea', required: true, wide: true },
      ];
  return (
    <>
      <PageHead eyebrow={`${b.town}, ${b.state}`} title={`Contact ${b.shortName}`} />
      <section id="contact" className={pad}>
        <div className={`${wrap} grid items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16`}>
          <div className="grid min-w-0 content-start gap-10">
            <ul className="border-t border-line">
              {rows.map(([Icon, href, text, out]) => (
                <li key={href} className="border-b border-line">
                  <a
                    href={href}
                    {...(out ? away : {})}
                    className="flex min-h-[64px] items-center gap-4 py-3 text-[17px] font-medium text-ink no-underline [overflow-wrap:anywhere] hover:text-[color:var(--pt)]"
                  >
                    <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-surface text-[color:var(--pt)]">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">{text}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div>
              <h2 className={`${label} text-muted`}>Hours</h2>
              <HoursTable hours={b.hours} today={today} className="text-[17px]" />
            </div>
            {delivery.length > 0 && (
              <div>
                <h2 className={`${label} text-muted`}>Delivery</h2>
                <ul className="flex flex-wrap gap-2">
                  {delivery.map((d) => (
                    <li key={d.href}>
                      <a href={d.href} {...away} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line px-4 text-[15px] font-medium text-ink no-underline hover:border-ink">
                        {d.label} <ArrowUpRight size={15} aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {area.length > 0 && (
              <div>
                <h2 className={`${label} text-muted`}>Areas Served</h2>
                <p className="text-[17px] leading-relaxed">{area.join(', ')}</p>
              </div>
            )}
            {hasSocial(b) && (
              <div>
                <h2 className={`${label} text-muted`}>Follow</h2>
                <Socials b={b} />
              </div>
            )}
          </div>
          <div id="enquiry" className={`${anchor} min-w-0 rounded-[1.5rem] border border-line bg-surface p-5 sm:p-8 lg:p-10`}>
            <h2 className="font-heading font-display text-[clamp(1.7rem,1.35rem+1.3vw,2.25rem)] leading-tight">
              {catering ? b.catering?.title || `Catering from ${b.shortName}` : 'Send a message'}
            </h2>
            {catering && b.catering?.text && <p className="mt-3 text-[17px] leading-relaxed text-muted">{b.catering.text}</p>}
            <div className="mt-7">
              <EnquiryForm
                b={b}
                submitLabel={catering ? 'Send Request' : 'Send Message'}
                styles={{
                  form: '',
                  label: 'text-[15px] font-semibold text-ink',
                  field,
                  button: `${solid} mt-1 w-full`,
                  done: 'rounded-xl bg-ground p-5 text-ink',
                }}
                fields={fields}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------- root */

export default function Restaurant({ b, path = '' }) {
  const today = useToday();
  const tel = telHref(b.phone);
  const sections = sectionsOf(b);
  const hasMenu = sections.length > 0;
  const about = hasAbout(b);
  const page = path === 'menu' && hasMenu ? 'menu' : path === 'about' && about ? 'about' : path === 'contact' ? 'contact' : '';
  const actions = actionsOf(b);
  const nav = [hasMenu && ['/menu', 'Menu', 'menu'], about && ['/about', 'About', 'about'], ['/contact', 'Contact', 'contact']].filter(Boolean);

  const brand = b.brand || {};
  const bg = hexOr(brand.bg, '#fbf7f1');
  const ink = hexOr(brand.ink, '#231a15');
  const primary = hexOr(brand.primary, '#b4432a');
  const accent = hexOr(brand.accent, primary);
  // The ground white text sits on: the brand's dark shade, darker still when it needs to be.
  const deep = readable(hexOr(brand.primaryDeep, mix(primary, '#000000', 0.45)), '#ffffff', '#000000', 5.5);
  const style = {
    '--bg': bg,
    '--accent': primary,
    '--muted': 'color-mix(in srgb, var(--ink) 70%, var(--bg))',
    '--surface': 'color-mix(in srgb, var(--primary) 7%, var(--bg))',
    '--line': 'color-mix(in srgb, var(--ink) 13%, var(--bg))',
    '--primaryDeep': deep,
    ...displayVars(brand),
    ...brandVars(brand),
    '--deep': deep,
    '--primary-hover': `color-mix(in srgb, ${primary} 84%, #000)`,
    '--on-primary': onColor(primary, ink),
    '--on-accent': onColor(accent, ink),
    '--pt': readable(primary, mix(primary, bg, 0.93), '#000000', 4.6),
    '--accent-lit': liftOn(accent, [deep, ink]),
    '--tag': `color-mix(in srgb, ${accent} 22%, ${bg})`,
  };

  return (
    <div className="min-w-0 overflow-x-clip bg-ground font-body text-[17px] text-ink antialiased" style={style}>
      <Header b={b} nav={nav} current={page} tel={tel} actions={actions} hasMenu={hasMenu} today={today} />
      <main>
        {page === '' && <Home b={b} tel={tel} actions={actions} sections={sections} today={today} />}
        {page === 'menu' && <MenuPage b={b} tel={tel} actions={actions} sections={sections} />}
        {page === 'about' && <AboutPage b={b} />}
        {page === 'contact' && <ContactPage b={b} tel={tel} today={today} />}
      </main>
      {page !== 'contact' && <Band b={b} tel={tel} actions={actions} />}
      {!path && <Facts b={b} />}
      <Footer b={b} nav={nav} tel={tel} actions={actions} ink={ink} />
      <MobileBar b={b} tel={tel} actions={actions} hasMenu={hasMenu} current={page} />
    </div>
  );
}
