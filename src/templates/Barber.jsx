import { ArrowUpRight, Clock, MapPin, Phone } from 'lucide-react';
import { brandVars, mapsHref, ratingLine, telHref } from '../site.js';
import { Img, Logo, Stars } from './shared.jsx';

const eyebrow =
  'mb-4 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em] text-muted before:h-px before:w-7 before:bg-primary';
const h2 = 'font-heading text-[clamp(2.2rem,4.6vw,3.6rem)] font-normal leading-[1.08]';
const btn =
  'inline-flex items-center gap-2 whitespace-nowrap border px-6 py-3.5 text-[13px] font-medium uppercase tracking-[0.14em] no-underline transition';
const ghost = `${btn} border-ink/35 text-ink hover:border-ink`;
const solid = `${btn} border-primary bg-primary text-white hover:brightness-110`;
const section = 'mx-auto max-w-page px-gutter py-[clamp(4.5rem,10vw,8rem)]';

export default function Barber({ b }) {
  const tel = telHref(b.phone);
  const directions = mapsHref(b);
  const rating = ratingLine(b);
  const names = b.menu.flatMap((g) => g.items.map((i) => i.name));
  const stick = b.preview ? 'top-11' : 'top-0';

  const ctas = (
    <div className="flex flex-wrap gap-3">
      <a className={solid} href={tel}>
        Call to Book
      </a>
      <a className={ghost} href={directions}>
        Get Directions <ArrowUpRight size={16} aria-hidden="true" />
      </a>
    </div>
  );

  return (
    <div className="bg-ground font-body font-light text-ink antialiased" style={brandVars(b.brand)}>
      <header
        className={`sticky ${stick} z-30 flex items-center gap-8 border-b border-line bg-ground/90 px-gutter py-3.5 backdrop-blur-md`}
      >
        <a href="#top" className="flex" aria-label={`${b.name} home`}>
          <Logo b={b} className="max-w-[36vw]" />
        </a>
        <nav aria-label="Main" className="mx-auto hidden gap-9 lg:flex">
          {[
            ['#story', 'Our Story'],
            ['#services', 'Services'],
            ['#reviews', 'Reviews'],
            ['#visit', 'Visit'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-[13px] font-normal uppercase tracking-[0.16em] text-muted no-underline transition hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>
        <a className={`${ghost} ml-auto px-3 py-2.5 text-[11px] sm:px-5 sm:text-[13px] lg:ml-0`} href={tel}>
          <Phone size={15} aria-label={`Call ${b.phone}`} /> <span className="hidden sm:inline">{b.phone}</span>
        </a>
      </header>

      <section
        id="top"
        className="mx-auto grid max-w-[1360px] items-center gap-[clamp(2.5rem,6vw,6rem)] px-gutter pb-[clamp(4rem,8vw,7rem)] pt-[clamp(3rem,7vw,6rem)] md:grid-cols-[1.05fr_1fr]"
      >
        <div>
          <p className={eyebrow}>{b.hero.eyebrow}</p>
          <h1 className="font-heading text-[clamp(3rem,6.6vw,5.6rem)] font-normal leading-[1.04]">{b.hero.title}</h1>
          <p className="mb-10 mt-6 max-w-md text-xl text-muted">{b.hero.lead}</p>
          {ctas}
          {rating && (
            <p className="mt-8 flex items-center gap-2.5 text-[15px] text-muted">
              <Stars value={b.rating} size={15} className="text-[#e7c26a]" /> {rating}
            </p>
          )}
        </div>
        <div className="relative pb-10 pl-6 sm:pb-12 sm:pl-12">
          <Img
            className="aspect-[4/5] w-full object-cover object-[center_30%] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]"
            src={b.hero.image}
            alt={b.hero.imageAlt}
            sizes="(max-width: 768px) 100vw, 45vw"
            eager
          />
          {b.hero.inset && (
            <figure className="absolute bottom-0 left-0 m-0 w-[46%] -rotate-3 bg-paper px-2.5 pt-2.5 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.7)]">
              <Img className="aspect-[5/4] w-full object-cover sepia-[0.15]" src={b.hero.inset} alt={b.hero.insetAlt} sizes="260px" />
              {b.since && (
                <figcaption className="py-2 text-center font-heading text-lg text-[#2a2522]">Est. {b.since}</figcaption>
              )}
            </figure>
          )}
        </div>
      </section>

      <div className="overflow-hidden bg-primary py-4 text-white" aria-hidden="true">
        <div className="flex w-max animate-ticker motion-reduce:animate-none">
          {[...names, ...names].map((n, i) => (
            <span key={i} className="flex items-center whitespace-nowrap px-6 font-heading text-lg">
              {n}
              <span className="ml-12 text-[10px] opacity-70">&#10022;</span>
            </span>
          ))}
        </div>
      </div>

      <section id="story" className={section}>
        <div className="mb-[clamp(2.5rem,5vw,4rem)] max-w-2xl">
          <p className={eyebrow}>{b.story.eyebrow}</p>
          <h2 className={h2}>{b.story.title}</h2>
        </div>
        <ol className="grid gap-[clamp(3rem,7vw,6rem)]">
          {b.story.chapters.map((c, i) => (
            <li key={c.title} className="grid items-center gap-[clamp(2rem,6vw,6rem)] md:grid-cols-2">
              <Img
                className={`aspect-[4/3] w-full object-cover grayscale-[0.25] ${i % 2 ? 'md:order-2' : ''}`}
                src={c.image}
                alt={c.alt}
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              <div>
                <span className="mb-2.5 block font-heading text-[clamp(2.6rem,5vw,4rem)] leading-none text-primary">
                  {c.year}
                </span>
                <h3 className="font-heading text-3xl font-normal">{c.title}</h3>
                <p className="mt-4 max-w-md text-lg text-muted">{c.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="services" className="border-y border-line bg-panel">
        <div className={section}>
          <div className="mb-[clamp(2.5rem,5vw,4rem)] max-w-2xl">
            <p className={eyebrow}>Services</p>
            <h2 className={h2}>The menu</h2>
          </div>
          <div className="grid gap-[clamp(2rem,4vw,3.5rem)] sm:grid-cols-2 lg:grid-cols-3">
            {b.menu.map((g) => (
              <div key={g.group}>
                <h3 className="mb-6 border-b border-line pb-4 font-heading text-2xl font-normal">{g.group}</h3>
                <ul className="grid gap-6">
                  {g.items.map((i) => (
                    <li key={i.name}>
                      <div className="flex items-baseline gap-2.5">
                        <strong className="text-lg font-medium">{i.name}</strong>
                        {i.price != null && (
                          <>
                            <span className="flex-1 border-b border-dotted border-muted/50" aria-hidden="true" />
                            <span className="font-heading text-lg text-[#e7c26a]">${i.price}</span>
                          </>
                        )}
                      </div>
                      <p className="mt-1 text-[15px] text-muted">{i.text}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {b.hairTypes && (
        <section className={section}>
          <div className="mb-[clamp(2.5rem,5vw,4rem)] max-w-2xl">
            <p className={eyebrow}>Every hair type</p>
            <h2 className={h2}>Straight to coily, we know how to cut it.</h2>
          </div>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {b.hairTypes.map((t) => (
              <li key={t.name} className="grid justify-items-center gap-1 bg-paper px-4 pb-7 pt-6 text-center text-[#1b1916]">
                <Img className="aspect-square w-[70%] object-contain mix-blend-multiply" src={t.image} alt="" sizes="200px" />
                <strong className="font-heading text-2xl font-normal">{t.name}</strong>
                <span className="text-sm tracking-[0.12em] opacity-60">{t.code}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="reviews" className={section}>
        <div className="mb-[clamp(2.5rem,5vw,4rem)]">
          <p className={eyebrow}>From the chair</p>
          {rating && (
            <p className="flex items-center gap-3 text-lg">
              <Stars value={b.rating} size={20} className="text-[#e7c26a]" /> {rating}
            </p>
          )}
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr_1fr]">
          {b.reviews.map((r, i) => (
            <figure
              key={r.author}
              className={`m-0 flex flex-col border p-8 ${i === 0 ? 'border-primary bg-primary text-white' : 'border-line bg-panel'}`}
            >
              <blockquote className={`mb-6 font-heading leading-snug ${i === 0 ? 'text-[1.6rem]' : 'text-xl'}`}>
                &ldquo;{r.text}&rdquo;
              </blockquote>
              <figcaption className="mt-auto text-xs font-medium uppercase tracking-[0.16em] opacity-75">{r.author}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="visit" className="grid border-t border-line md:grid-cols-2">
        <div className="w-full px-gutter py-[clamp(4rem,8vw,7rem)] md:max-w-[640px] md:justify-self-end">
          <p className={eyebrow}>Visit</p>
          <h2 className={`${h2} mb-9`}>Walk in or call ahead.</h2>
          <a className="flex gap-4 border-t border-line py-4 text-lg text-ink no-underline" href={directions}>
            <MapPin size={18} className="mt-1 flex-none text-primary" aria-hidden="true" />
            <span>
              {b.address}
              <br />
              {b.town}, {b.state} {b.zip}
            </span>
          </a>
          <a className="flex gap-4 border-t border-line py-4 text-lg text-ink no-underline" href={tel}>
            <Phone size={18} className="mt-1 flex-none text-primary" aria-hidden="true" />
            <span>{b.phone}</span>
          </a>
          <div className="mb-8 flex gap-4 border-y border-line py-4 text-lg">
            <Clock size={18} className="mt-1 flex-none text-primary" aria-hidden="true" />
            <table className="flex-1 border-collapse">
              <tbody>
                {b.hours.map(([d, h]) => (
                  <tr key={d}>
                    <th className="pb-1.5 text-left font-light text-muted">{d}</th>
                    <td className="pb-1.5 text-right">{h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ctas}
        </div>
        <Img className="h-full min-h-[420px] w-full object-cover" src={b.visitImage || b.hero.image} alt="" sizes="(max-width: 768px) 100vw, 50vw" />
      </section>

      <footer className="grid justify-items-center gap-3 border-t border-line px-gutter pb-28 pt-14 text-center text-sm text-muted md:pb-14">
        <Logo b={b} className="max-w-[160px]" />
        <p>
          {b.address}, {b.town}, {b.state} {b.zip} &middot;{' '}
          <a href={tel} className="text-ink no-underline">
            {b.phone}
          </a>
        </p>
        <p>
          &copy; {new Date().getFullYear()} {b.name}
        </p>
      </footer>

      <div className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-2 gap-2 md:hidden">
        <a href={tel} className="inline-flex items-center justify-center gap-2 bg-primary py-4 font-medium uppercase tracking-[0.08em] text-white no-underline shadow-xl">
          <Phone size={17} aria-hidden="true" /> Call
        </a>
        <a
          href={directions}
          className="inline-flex items-center justify-center gap-2 bg-paper py-4 font-medium uppercase tracking-[0.08em] text-[#1b1916] no-underline shadow-xl"
        >
          <MapPin size={17} aria-hidden="true" /> Directions
        </a>
      </div>
    </div>
  );
}
