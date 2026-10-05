import { useState } from 'react';
import { ArrowRight, Building2, Home, KeyRound, Mail, MapPin, Palette, Phone, Search, Waves } from 'lucide-react';
import { brandVars, mapsHref, ratingLine, telHref } from '../site.js';
import { EnquiryForm, Img, Logo, Stars } from './shared.jsx';

const U = 'https://images.unsplash.com/';
const SAMPLE_LISTINGS = [
  { img: `${U}photo-1580587771525-78b9dba3b914`, price: 489000, street: '2214 Bayou Bend Ct', beds: 4, baths: 3, sqft: 2860, tag: 'New Listing' },
  { img: `${U}photo-1605276374104-dee2a0ed3cd6`, price: 325000, street: '508 Oakmont Dr', beds: 3, baths: 2, sqft: 1940, tag: 'Open House' },
  { img: `${U}photo-1564013799919-ab600027ffc6`, price: 615000, street: '17 Cedar Point Rd', beds: 5, baths: 4, sqft: 3420, tag: 'Waterfront' },
  { img: `${U}photo-1570129477492-45c003edd2be`, price: 274900, street: '1103 Pecan St', beds: 3, baths: 2, sqft: 1610, tag: 'Price Improved' },
  { img: `${U}photo-1628624747186-a941c476b7ef`, price: 398500, street: '4410 Lakeshore Ln', beds: 4, baths: 2.5, sqft: 2380, tag: 'New Listing' },
  { img: `${U}photo-1605146769289-440113cc3d00`, price: 352000, street: '92 Magnolia Way', beds: 3, baths: 2.5, sqft: 2105, tag: 'Open House' },
];
const DIVISION_ICONS = [Palette, Waves, Home, Building2, KeyRound];

const money = (n) => `$${n.toLocaleString()}`;
const eyebrow = 'mb-4 font-heading text-[13px] font-semibold uppercase tracking-[0.3em] text-accent';
const h2 = 'font-heading text-[clamp(2.1rem,4.2vw,3.3rem)] font-light leading-[1.08]';
const section = 'mx-auto max-w-page px-gutter py-[clamp(4.5rem,10vw,8rem)]';

export default function RealEstate({ b }) {
  const tel = telHref(b.phone);
  const rating = ratingLine(b);
  const [filter, setFilter] = useState('All');
  const tags = ['All', ...new Set(SAMPLE_LISTINGS.map((l) => l.tag))];
  const listings = filter === 'All' ? SAMPLE_LISTINGS : SAMPLE_LISTINGS.filter((l) => l.tag === filter);
  const featured = b.divisions.filter((d) => d.image);
  const others = b.divisions.filter((d) => !d.image);

  return (
    <div className="bg-white font-body text-ink antialiased" style={brandVars(b.brand)}>
      <header className={`absolute inset-x-0 ${b.preview ? 'top-11' : 'top-0'} z-20 flex items-center gap-10 px-gutter py-5 text-white`}>
        <a href="#top" className="flex" aria-label={`${b.name} home`}>
          <Logo b={b} className="max-w-[40vw]" />
        </a>
        <nav aria-label="Main" className="ml-auto hidden gap-10 lg:flex">
          {[
            ['#services', 'Services'],
            ['#listings', 'Listings'],
            ['#about', 'About'],
            ['#contact', 'Contact'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="font-heading text-[13px] uppercase tracking-[0.2em] no-underline transition hover:text-accent">
              {label}
            </a>
          ))}
        </nav>
        <a
          href={tel}
          className="ml-auto inline-flex items-center gap-2 border border-white/60 p-3 text-sm font-semibold no-underline transition hover:bg-white hover:text-primary sm:px-4 sm:py-2.5 lg:ml-0"
        >
          <Phone size={15} aria-label={`Call ${b.phone}`} /> <span className="hidden whitespace-nowrap sm:inline">{b.phone}</span>
        </a>
      </header>

      <section id="top" className="relative isolate flex min-h-[min(100vh,920px)] items-center bg-primary text-white">
        <Img className="absolute inset-0 -z-20 h-full w-full object-cover" src={b.hero.image} alt={b.hero.imageAlt} eager />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_70%,transparent)_0%,transparent_30%),linear-gradient(0deg,color-mix(in_srgb,var(--primary)_88%,transparent)_0%,color-mix(in_srgb,var(--primary)_25%,transparent)_60%)]" />
        <div className="mx-auto w-full max-w-[1100px] px-gutter pb-20 pt-36 text-center">
          <p className="mb-5 font-heading text-[13px] font-semibold uppercase tracking-[0.3em] text-white/85">{b.hero.eyebrow}</p>
          <h1 className="font-heading text-[clamp(2.6rem,7.2vw,6rem)] font-light uppercase leading-[1.02] tracking-[0.04em]">
            {b.hero.title}
          </h1>
          <p className="mx-auto mb-11 mt-6 max-w-xl text-lg text-white/90">{b.hero.lead}</p>
          <form
            role="search"
            className="mx-auto grid max-w-[940px] grid-cols-2 bg-white p-2 text-left shadow-[0_30px_70px_-25px_rgba(0,0,0,0.55)] lg:grid-cols-[2.2fr_1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              document.getElementById('listings').scrollIntoView();
            }}
          >
            <label className="col-span-2 flex items-center gap-2.5 border-b border-line pl-4 text-primary lg:col-span-1 lg:border-b-0 lg:border-r">
              <Search size={18} aria-hidden="true" />
              <span className="sr-only">City, neighborhood or ZIP</span>
              <input className="w-full bg-transparent px-2 py-4 text-ink outline-none" placeholder="City, neighborhood, ZIP or address" />
            </label>
            <select aria-label="Price" defaultValue="" className="border-r border-line bg-transparent px-4 py-4 text-ink outline-none">
              <option value="">Any Price</option>
              <option>Under $300k</option>
              <option>$300k – $600k</option>
              <option>$600k – $1M</option>
              <option>$1M+</option>
            </select>
            <select aria-label="Bedrooms" defaultValue="" className="bg-transparent px-4 py-4 text-ink outline-none lg:border-r lg:border-line">
              <option value="">Any Beds</option>
              <option>2+ Beds</option>
              <option>3+ Beds</option>
              <option>4+ Beds</option>
              <option>5+ Beds</option>
            </select>
            <button
              type="submit"
              className="col-span-2 cursor-pointer bg-primary px-8 py-4 font-heading font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-accent lg:col-span-1"
            >
              Search Homes
            </button>
          </form>
        </div>
      </section>

      <section aria-label="At a glance" className="flex flex-wrap justify-center bg-primary py-2 text-white sm:py-0">
        {rating && (
          <div className="flex items-center gap-2.5 px-6 py-3 text-[15px] sm:border-r sm:border-white/15 sm:py-5">
            <Stars value={b.rating} size={15} className="text-accent" />
            {rating}
          </div>
        )}
        {b.strapline && (
          <div className="px-6 py-3 font-heading text-[13px] uppercase tracking-[0.2em] sm:py-5">{b.strapline}</div>
        )}
        {b.mlsId && <div className="px-6 py-3 text-[15px] sm:border-l sm:border-white/15 sm:py-5">MLS ID #{b.mlsId}</div>}
      </section>

      <section id="services" className={section}>
        <div className="mb-[clamp(2.4rem,5vw,3.6rem)] max-w-2xl">
          <p className={eyebrow}>What we do</p>
          <h2 className={h2}>Everything a move needs, under one roof.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featured.map((d) => (
            <a key={d.title} href="#contact" className="group relative block overflow-hidden text-white no-underline">
              <Img
                className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                src={d.image}
                alt=""
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(transparent,color-mix(in_srgb,var(--primary)_92%,transparent))] px-8 pb-8 pt-16">
                <h3 className="font-heading text-3xl font-normal">{d.title}</h3>
                <p className="mb-4 mt-2.5 max-w-md text-white/90">{d.text}</p>
                <span className="inline-flex items-center gap-1.5 font-heading text-[13px] font-semibold uppercase tracking-[0.2em] text-accent">
                  Talk to an Agent <ArrowRight size={15} aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </div>
        {others.length > 0 && (
          <div className="mt-6 grid divide-y divide-line border border-line sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {others.map((d, i) => {
              const Icon = DIVISION_ICONS[i] || Building2;
              return (
                <article key={d.title} className="px-7 py-8">
                  <Icon size={26} strokeWidth={1.5} className="text-accent" aria-hidden="true" />
                  <h3 className="mb-2.5 mt-5 font-heading text-xl font-normal">{d.title}</h3>
                  <p className="text-[15px] text-ink/75">{d.text}</p>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section id="listings" className="bg-cream">
        <div className={section}>
          <div className="mb-[clamp(2.4rem,5vw,3.6rem)] flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className={eyebrow}>Featured listings</p>
              <h2 className={h2}>Homes for sale near {b.town}</h2>
              {b.preview && <p className="mt-3 text-[15px] text-ink/70">Sample homes. Live MLS listings load here on the finished site.</p>}
            </div>
            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter listings">
              {tags.map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={filter === t}
                  onClick={() => setFilter(t)}
                  className={`cursor-pointer border px-4 py-2 text-sm transition ${
                    filter === t ? 'border-primary bg-primary text-white' : 'border-line bg-white text-ink hover:border-primary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <article key={l.street} className="group">
                <div className="relative mb-4 overflow-hidden">
                  <Img
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    src={l.img}
                    alt={`${l.street}, ${b.town}`}
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <span className="absolute left-4 top-4 bg-white px-2.5 py-1.5 font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    {l.tag}
                  </span>
                </div>
                <strong className="font-heading text-[1.7rem] font-normal text-primary">{money(l.price)}</strong>
                <p className="mb-3 mt-0.5 text-ink/70">
                  {l.street}, {b.town}
                </p>
                <ul className="flex gap-5 border-t border-line pt-3 text-sm">
                  <li>{l.beds} Beds</li>
                  <li>{l.baths} Baths</li>
                  <li>{l.sqft.toLocaleString()} Sq Ft</li>
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className={`${section} grid items-center gap-[clamp(2.5rem,6vw,6rem)] md:grid-cols-2`}>
        <Img className="aspect-[5/6] w-full object-cover" src={b.about.image} alt={b.about.imageAlt} sizes="(max-width: 768px) 100vw, 50vw" />
        <div>
          <p className={eyebrow}>About {b.shortName}</p>
          <h2 className={h2}>{b.about.title}</h2>
          <p className="mt-6 text-lg leading-relaxed text-ink/80">{b.about.text}</p>
          <h3 className="mb-4 mt-10 font-heading text-[13px] font-semibold uppercase tracking-[0.3em] text-accent">Where we work</h3>
          <ul className="flex flex-wrap gap-2">
            {b.areas.map((a) => (
              <li key={a} className="border border-line px-4 py-2 text-[15px]">
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-primary text-center text-white">
        <div className={section}>
          <p className={eyebrow}>Client stories</p>
          {rating && (
            <p className="mb-12 inline-flex items-center gap-2.5 text-lg">
              <Stars value={b.rating} size={18} className="text-accent" /> {rating}
            </p>
          )}
          <div className="grid gap-[clamp(1.5rem,4vw,3rem)] text-left md:grid-cols-3">
            {b.reviews.map((r) => (
              <figure key={r.author} className="m-0 border-t border-white/25 pt-7">
                <blockquote className="mb-6 font-heading text-[1.55rem] font-light leading-snug">&ldquo;{r.text}&rdquo;</blockquote>
                <figcaption className="grid gap-0.5">
                  <strong className="font-semibold">{r.author}</strong>
                  {r.where && <span className="text-sm text-white/70">{r.where}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className={`${section} grid gap-[clamp(2.5rem,6vw,6rem)] md:grid-cols-[1fr_1.2fr]`}>
        <div>
          <p className={eyebrow}>Let&rsquo;s talk</p>
          <h2 className={h2}>Thinking of buying or selling?</h2>
          <p className="mb-8 mt-5 text-lg text-ink/80">Tell us where you are and where you want to be.</p>
          {[
            [Phone, tel, b.phone],
            [Mail, `mailto:${b.email}`, b.email],
            [MapPin, mapsHref(b), `${b.address}, ${b.town}, ${b.state} ${b.zip || ''}`],
          ].map(([Icon, href, label]) => (
            <a key={href} href={href} className="flex items-center gap-3 border-t border-line py-4 font-semibold text-primary no-underline">
              <Icon size={17} className="flex-none text-accent" aria-hidden="true" /> {label}
            </a>
          ))}
        </div>
        <div className="bg-cream p-[clamp(1.5rem,4vw,2.5rem)]">
          <EnquiryForm
            b={b}
            submitLabel="Send Message"
            styles={{
              form: '',
              label: 'font-heading text-xs font-semibold uppercase tracking-[0.18em]',
              field: 'border border-line bg-white px-3.5 py-3 font-body text-base normal-case tracking-normal text-ink outline-none focus:border-primary',
              button: 'bg-primary py-4 font-heading font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-accent',
              done: 'py-6',
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
      </section>

      <footer className="grid justify-items-center gap-3 bg-[color-mix(in_srgb,var(--primary)_88%,#000)] px-gutter py-14 text-center text-sm text-white/70">
        <Logo b={b} className="max-w-[170px]" textClass="text-white" />
        <p>
          {b.name} &middot; {b.address}, {b.town}, {b.state} {b.zip}
          {b.mlsId ? ` · MLS ID #${b.mlsId}` : ''}
        </p>
        <p>Equal Housing Opportunity &middot; &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
