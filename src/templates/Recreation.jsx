/**
 * RECREATION - youth sports organizations (clubs, academies, leagues, camps and
 * training facilities for kids and teens: baseball, soccer, volleyball,
 * gymnastics, cheer, martial arts, swim and the like) and family attractions
 * (go-kart tracks, trampoline parks, family fun centers). A bright, rounded
 * site in the business's own colors and type, several pages, each prerendered
 * at its own address.
 *
 * Pages (from pages(b) below):
 *   ''                  home: hero, highlights, featured offerings, dates and times, parties teaser,
 *                       reviews, facts, closing band
 *   'programs'          every entry in b.programs, in brand-file order, each at #<slug>
 *   'programs/<slug>'   one page per entry that has text, points or rules. An entry with none of
 *                       them is a card and a row on 'programs' only, since a page would repeat it
 *   'parties'           only when b.parties has a title
 *   'about'             only when b.about, b.staff or b.gallery has anything in it
 *   'contact'           address with a map link, phone, email, hours, the enquiry form (anchor
 *                       #enquire) and b.faqs
 *
 * `kind` picks the wording wherever the brand file says nothing (KIND below):
 *                       sports                        attraction
 *   main action         Register                      Book Now              b.action.label overrides
 *   offerings           Programs / Program            Attractions / Attraction
 *   activities label    Sports                        Activities
 *   season, schedule    Season, Schedule              Dates, Times          (labels on each offering)
 *   rules heading       Requirements                  Rules
 *   parties             Parties & Events              Parties & Groups      b.parties.label overrides
 *   staff heading       Meet the coaches              Meet the team         b.staffTitle overrides
 *   enquiry form        age and program asked         visit date, group size and interest asked
 *   closing band        Questions about a program?    Planning a visit?     b.band overrides
 *
 * Every optional field's section, line or chip is left out when it is missing. Nothing is filled
 * in on the business's behalf: no price, program, coach, rating, safety or certification claim
 * appears unless the brand file carries it.
 *
 * BRAND FILE (src/brands/<slug>.json). Required unless marked optional.
 *
 *   template      "recreation"
 *   preview       optional. true on a prospect's preview (shows the preview bar); left out on a sample
 *   kind          "sports" for a youth club, academy, league, camp or training facility;
 *                 "attraction" for a go-kart track, trampoline park or family fun center.
 *                 Anything else reads as "sports"
 *   name          the business's full name, as on its own site: "Sunfield Youth Sports Academy"
 *   shortName     the name in running copy, and in type where there is no logo: "Sunfield Sports"
 *   tagline       optional. One line under the logo in the footer
 *   phone         "(281) 555-0148". Every call button dials it
 *   email         optional. On the contact page and in the footer
 *   address       street line, with suite: "6215 Bayway Dr, Suite 100"
 *   town, state   "Baytown", "TX"
 *   zip           optional. "77520"
 *   rating        optional. Google rating, a number: 4.9. Shown only with reviewCount (both or neither):
 *                 in the hero, the highlights and the reviews section, which is left out without them
 *   reviewCount   optional. Number of Google reviews, a number: 212
 *   since         optional. Year founded, a number: 2012. A highlight on the home page, a chip on about
 *   hours         [[days, hours], ...]: [["Mon – Fri", "3:30 PM – 9 PM"], ["Sunday", "Closed"]], shown
 *                 as written in the footer and on the contact page. [] when the business publishes none
 *   ages          optional. Who it serves, as the business says it, without the word "Ages": "4 to 18",
 *                 "3 and up", "All ages". A highlight, a sticker on the hero photo and a chip on about
 *   activities    optional. [short strings] the sports or activities offered: ["Baseball", "Soccer"].
 *                 Chips in the home highlights, under the KIND activities label
 *   registerUrl   optional. The business's own registration page (TeamSnap, LeagueApps, its own form).
 *                 Every main action button goes there when set
 *   bookingUrl    optional. The business's own booking or ticket page, used the same way when there is
 *                 no registerUrl. With neither, the main action opens /contact#enquire
 *   action        optional. { label } the main action's wording when the business uses its own:
 *                 "Register Now", "Buy Tickets", "Book a Session". Title Case
 *   band          optional. { title, text } the closing call to action on every page but contact.
 *                 Defaults to the KIND title and "Call <shortName> at <phone>, or send a question..."
 *   social        optional. { instagram, facebook, tiktok, youtube } full URLs, any of them, in the footer
 *   serviceArea   optional. [town names] as chips on the about and contact pages
 *
 *   brand {
 *     primary     the brand's main color: the hero, page heads and closing band, buttons and links.
 *                 One that white text reads on suits best; text on it is worked out either way, and
 *                 it is darkened where it is used for words on white
 *     primaryDeep optional. A darker shade, for hovers. Derived from primary when absent
 *     accent      optional. A bright second brand color: the hero's eyebrow and action button, the
 *                 shapes behind photos. White where there is none
 *     ink         optional. Body text, near black. Default #15202e
 *     muted       optional. Secondary text. Derived from ink when absent
 *     surface     optional. The pale ground of alternate sections and chips. A tint of primary when absent
 *     line        optional. Hairlines and card borders. Derived from ink when absent
 *     heading     heading font stack; a rounded or sturdy sans reads best:
 *                 "'Fredoka', 'Nunito', system-ui, sans-serif". A serif face is set at its regular weight
 *     body        body font stack: "'Nunito Sans', system-ui, sans-serif"
 *     fonts       the Google Fonts stylesheet URL loading both
 *     logo        optional. "/brands/<slug>/logo.webp", or null to set shortName in type
 *     logoMono, logoWidth, logoHeight, logoRatio, logoGround, logoReads, logoName
 *                 optional, written by `python3 -m scripts.autobuild.gate logo <file> <slug>`: the
 *                 logo cut to one color for a ground its own colors would not read on, the size the
 *                 header draws it, its shape, the ground it was cut from (the header keeps its own),
 *                 how much of its edge survives on eleven grays from black to white, and true when
 *                 the mark carries no name, which is then set beside it
 *   }
 *
 *   hero {
 *     eyebrow     optional. A short line over the headline, in a pill: "Baseball, softball, soccer and
 *                 volleyball in Baytown"
 *     title       the headline, short: "Where Baytown kids learn to love the game"
 *     lead        one or two sentences under it
 *     image       optional. The business's own photo of kids playing or the venue: "/brands/<slug>/hero"
 *                 (hero-800.webp and hero-1600.webp beside it) or an images.unsplash.com URL. Drawn
 *                 4:3 on a phone and 5:4 beside the words from lg up. Without one the hero is the
 *                 brand color alone
 *     imageAlt    what the photo shows; required with image
 *     position    optional. CSS object-position for the photo: "center 30%"
 *   }
 *
 *   programs      [ at least one, in the order the business lists them. For sports: programs, teams,
 *                 leagues, camps, clinics, lessons. For an attraction: rides and activities. {
 *     slug        url segment, lowercase-hyphenated, unique: "select-baseball", "go-karts"
 *     title       "Select Baseball", "Pro Karts"
 *     summary     one or two sentences for its card, its row and the top of its page
 *     text        optional. A paragraph, or [paragraphs], for its own page
 *     ages        optional. As stated, without the word "Ages": "8U – 14U", "4 to 6", "All ages"
 *     season      optional. The season or dates as stated: "Fall: August – November", "June 8 – July 31"
 *     schedule    optional. When it meets or runs as stated: "Tue and Thu, 6 – 8 PM", "Every 15 minutes"
 *     price       optional. The price exactly as the business states it, a string: "$165 per player",
 *                 "$25 per race". Never worked out, rounded or invented
 *     priceNote   optional. Small print under the price: "Uniform included", "Plus tax"
 *     points      optional. [short strings] what to expect: "Two practices a week", "Ten-minute races"
 *     rules       optional. [short strings] requirements as stated, such as height, age or gear:
 *                 "Drivers must be 54 inches or taller", "Cleats and shin guards required"
 *     image       optional. A photo of it; imageAlt required with it. A card without one, beside
 *                 cards with photos, has the brand color and a plain mark where its photo would be
 *   } ]           The first six are featured on the home page.
 *   programsIntro optional. The lead under the programs page title
 *
 *   schedule      optional. Dates for the business as a whole: a season, registration, sessions {
 *     title       optional. The headline, default "Mark the calendar"
 *     text        optional. A sentence or two
 *     rows        optional. [[label, value], ...]: [["Registration opens", "July 15"], ["First practice",
 *                 "August 11"]]
 *   }             Shown on the home and programs pages when it has text or rows.
 *
 *   parties       optional. Birthday parties, group events, team outings {
 *     label       optional. The nav, eyebrow and crumb wording, Title Case. Default from KIND
 *     title       the parties headline: "Birthday parties on the field"
 *     text        optional. A sentence or two on what a party is
 *     image       optional; imageAlt required with it
 *     packages    optional. [{ name, price (string as stated, optional), priceNote (optional),
 *                 includes ([short strings], optional) }]
 *     note        optional. Small print under the packages: deposits, minimums, waivers
 *     bookingUrl  optional. The business's own party booking page; without it the button opens
 *                 /contact#enquire
 *     action      optional. The party button's wording, Title Case. Default "Book a Party"
 *   }
 *
 *   about         optional. { title (optional, default "About <shortName>"), text (a paragraph or
 *                 [paragraphs]), image (optional), imageAlt (with image), points (optional [short
 *                 strings], facility facts as stated: "Indoor turf field", "Four batting cages") }
 *   staff         optional. [{ name, role (optional), bio (optional), image (optional), imageAlt (with
 *                 image) }] coaches or staff, only as the business names them
 *   staffTitle    optional. The heading over the staff, default from KIND
 *   gallery       optional. [{ image, imageAlt }] more photos for the about page
 *   faqs          optional. [{ q, a }] on the contact page
 *   reviews       optional. [{ author, text }] Google reviews quoted as written, up to six shown. They
 *                 appear only with rating and reviewCount
 *   facts         optional. Anything the business's site says that no field above holds - safety
 *                 policies, certifications, waivers, payment, discounts - only as the business states
 *                 it: [{ heading, text } or { heading, items: [strings] }] (see Facts in shared.jsx)
 */
import { Ticket, Trophy } from 'lucide-react';
import { brandVars, displayVars, telHref } from '../site.js';
import { Facts } from './shared.jsx';
import { CtaBand, Footer, Header, MobileBar } from './recreation/chrome.jsx';
import { onColor, readableOnWhite } from './recreation/color.js';
import { AboutPage, ContactPage, HomePage, PartiesPage, ProgramPage, ProgramsPage } from './recreation/pages.jsx';
import { keepQuery, list, paras } from './recreation/ui.jsx';

const KIND = {
  sports: {
    action: 'Register',
    offerings: 'Programs',
    offering: 'Program',
    activities: 'Sports',
    season: 'Season',
    schedule: 'Schedule',
    rules: 'Requirements',
    parties: 'Parties & Events',
    staff: 'Meet the coaches',
    staffEyebrow: 'Coaches',
    featured: 'Find the right program',
    lead: (b) => `Each program at ${b.shortName}, and how to get started. Call ${b.phone} with any question.`,
    ask: 'Ask about a program',
    askText: 'Tell us the age of your athlete and the program you have in mind.',
    topic: 'a program or registration',
    band: 'Questions about a program?',
    mark: Trophy,
  },
  attraction: {
    action: 'Book Now',
    offerings: 'Attractions',
    offering: 'Attraction',
    activities: 'Activities',
    season: 'Dates',
    schedule: 'Times',
    rules: 'Rules',
    parties: 'Parties & Groups',
    staff: 'Meet the team',
    staffEyebrow: 'Team',
    featured: 'Things to do',
    lead: (b) => `Each attraction at ${b.shortName}, and what to know before you go. Call ${b.phone} with any question.`,
    ask: 'Ask about a visit',
    askText: 'Tell us the day you have in mind and how many are coming.',
    topic: 'a visit, a party or a group',
    band: 'Planning a visit?',
    mark: Ticket,
  },
};

const programsOf = (b) => list(b.programs).filter((p) => p?.slug && p?.title);
/** An offering has a page of its own when it has more to say than its card. */
const hasPage = (p) => paras(p.text).length > 0 || list(p.points).length > 0 || list(p.rules).length > 0;
const hasParties = (b) => Boolean(b.parties?.title);
const hasAbout = (b) =>
  Boolean(paras(b.about?.text).length || b.about?.image || list(b.about?.points).length) ||
  list(b.staff).some((s) => s?.name) ||
  list(b.gallery).some((g) => g?.image);

export function pages(b) {
  return [
    'programs',
    ...programsOf(b)
      .filter(hasPage)
      .map((p) => `programs/${p.slug}`),
    hasParties(b) && 'parties',
    hasAbout(b) && 'about',
    'contact',
  ].filter(Boolean);
}

export default function Recreation({ b, path = '' }) {
  const k = KIND[b.kind] || KIND.sports;
  const programs = programsOf(b);
  const partyLabel = b.parties?.label || k.parties;
  const ctx = {
    k,
    tel: telHref(b.phone),
    programs,
    hasPage,
    hasParties: hasParties(b),
    partyLabel,
    action: { label: b.action?.label || k.action, href: b.registerUrl || b.bookingUrl || '/contact#enquire' },
    nav: [
      ['programs', k.offerings, 'programs'],
      hasParties(b) && ['parties', partyLabel, 'parties'],
      hasAbout(b) && ['about', 'About', 'about'],
      ['contact', 'Contact', 'contact'],
    ].filter(Boolean),
  };

  const [first, second] = path.split('/');
  const program = first === 'programs' && second ? programs.find((p) => p.slug === second && hasPage(p)) : null;
  let page;
  let section = first;
  if (program) page = <ProgramPage b={b} ctx={ctx} p={program} />;
  else if (path === 'programs') page = <ProgramsPage b={b} ctx={ctx} />;
  else if (path === 'parties' && ctx.hasParties) page = <PartiesPage b={b} ctx={ctx} />;
  else if (path === 'about' && hasAbout(b)) page = <AboutPage b={b} ctx={ctx} />;
  else if (path === 'contact') page = <ContactPage b={b} ctx={ctx} />;
  else {
    page = <HomePage b={b} ctx={ctx} />;
    section = '';
  }

  const brand = b.brand;
  const accent = brand.accent || '#ffffff';
  return (
    <div
      className="min-w-0 overflow-x-clip bg-white font-body text-[16px] text-ink antialiased"
      style={{
        '--ink': '#15202e',
        '--muted': 'color-mix(in srgb, var(--ink) 72%, #fff)',
        '--surface': 'color-mix(in srgb, var(--primary) 7%, #fff)',
        '--line': 'color-mix(in srgb, var(--ink) 12%, #fff)',
        '--primaryDeep': 'color-mix(in srgb, var(--primary) 72%, #000)',
        ...displayVars(brand),
        ...brandVars(brand),
        '--accent': accent,
        '--on-primary': onColor(brand.primary),
        '--on-accent': onColor(accent),
        '--pt': readableOnWhite(brand.primary),
      }}
      onClickCapture={keepQuery}
    >
      <Header b={b} ctx={ctx} section={section} />
      <main>{page}</main>
      {!path && <Facts b={b} />}
      {section !== 'contact' && <CtaBand b={b} ctx={ctx} />}
      <Footer b={b} ctx={ctx} />
      <MobileBar b={b} ctx={ctx} />
    </div>
  );
}
