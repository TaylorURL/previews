import {
  ArrowRight,
  Building2,
  Check,
  Clock,
  Cog,
  Construction,
  Droplets,
  Filter,
  Flame,
  Gauge,
  Mail,
  MapPin,
  Phone,
  ScanSearch,
  ShowerHead,
  Waves,
  Wrench,
  Zap,
} from 'lucide-react';
import { brandVars, mapsHref, ratingLine, telHref } from '../site.js';
import { EnquiryForm, Img, Logo, Stars } from './shared.jsx';

const ICONS = {
  flame: Flame,
  zap: Zap,
  droplets: Droplets,
  waves: Waves,
  construction: Construction,
  search: ScanSearch,
  wrench: Wrench,
  gauge: Gauge,
  cog: Cog,
  filter: Filter,
  shower: ShowerHead,
  building: Building2,
};

const eyebrow = 'mb-3 text-[13px] font-bold uppercase tracking-[0.16em] text-primary';
const h2 = 'font-heading text-[clamp(2.3rem,4.8vw,3.6rem)] font-extrabold uppercase leading-[0.98]';
const pill =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold no-underline transition hover:-translate-y-0.5';

export default function Plumbing({ b }) {
  const tel = telHref(b.phone);
  const rating = ratingLine(b);
  const today = b.hours?.[0];
  const stick = b.preview ? 'top-11' : 'top-0';

  return (
    <div className="bg-white font-body text-ink antialiased" style={brandVars(b.brand)}>
      <div className="flex justify-center gap-4 bg-primary-deep px-gutter py-2 text-sm text-white/85 sm:justify-between">
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <Clock size={15} aria-hidden="true" /> {today ? `${today[0]} ${today[1]}` : 'Call for service'}
        </span>
        <a href={tel} className="inline-flex items-center gap-1.5 font-bold text-accent no-underline">
          <Phone size={15} aria-hidden="true" /> {b.phone}
        </a>
      </div>

      <header
        className={`sticky ${stick} z-30 flex items-center gap-8 border-b border-black/5 bg-white/95 px-gutter py-3 backdrop-blur`}
      >
        <a href="#top" className="flex flex-none" aria-label={`${b.name} home`}>
          <Logo b={b} className="max-w-[40vw]" textClass="uppercase text-primary-deep" />
        </a>
        <nav aria-label="Main" className="mr-auto hidden gap-7 font-semibold lg:flex">
          {[
            ['#services', 'Services'],
            ['#why', 'Why Us'],
            ['#reviews', 'Reviews'],
            ['#area', 'Service Area'],
          ].map(([href, label]) => (
            <a key={href} href={href} className="text-ink/70 no-underline transition hover:text-primary">
              {label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-5 lg:ml-0">
          <a href={tel} className="grid text-right leading-tight no-underline">
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/60 sm:block">Call Now</span>
            <strong className="font-heading text-lg text-primary-deep sm:text-2xl">{b.phone}</strong>
          </a>
          <a href="#schedule" className={`${pill} hidden bg-primary px-5 py-3 text-white sm:inline-flex`}>
            Schedule Service
          </a>
        </div>
      </header>

      <section id="top" className="relative isolate overflow-hidden bg-primary-deep text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0%_100%,color-mix(in_srgb,var(--primary)_55%,transparent),transparent_60%)]" />
        <div className="relative aspect-[4/3] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[50%] lg:[clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)]">
          <Img
            className="h-full w-full object-cover object-[center_45%]"
            src={b.hero.image}
            alt={b.hero.imageAlt}
            sizes="(max-width: 1024px) 100vw, 50vw"
            eager
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/60 to-transparent lg:hidden" />
        </div>
        <div className="mx-auto grid w-full max-w-page px-gutter pb-24 pt-10 lg:min-h-[min(80vh,720px)] lg:grid-cols-2 lg:items-center lg:pb-28 lg:pt-20">
          <div className="lg:pr-10">
            {rating && (
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
                <Stars value={b.rating} size={14} /> <span>{rating}</span>
              </p>
            )}
            <h1 className="font-heading text-[clamp(3rem,6.4vw,5.6rem)] font-extrabold uppercase leading-[0.92]">
              {b.hero.title} <em className="block italic text-accent">{b.hero.titleAccent}</em>
            </h1>
            <p className="mb-9 mt-6 max-w-xl text-lg text-white/85 sm:text-xl">{b.hero.lead}</p>
            <div className="flex flex-wrap gap-3">
              <a href="#schedule" className={`${pill} bg-accent px-7 py-4 text-lg text-ink shadow-lg shadow-black/20`}>
                Schedule Service <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a href={tel} className={`${pill} border-2 border-white/60 px-7 py-4 text-lg text-white hover:bg-white/10`}>
                <Phone size={18} aria-hidden="true" /> {b.phone}
              </a>
            </div>
          </div>
        </div>
        {b.hero.mascot && (
          <figure className="absolute bottom-0 right-3 m-0 w-28 animate-peek drop-shadow-2xl sm:w-36 lg:left-[46%] lg:right-auto lg:w-[clamp(170px,15vw,230px)]">
            <img src={b.hero.mascot} alt="" width="230" height="228" className="h-auto w-full" />
            <figcaption className="absolute -top-2 left-[78%] hidden whitespace-nowrap rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 font-heading text-lg font-extrabold uppercase text-ink shadow-xl lg:block">
              {b.hero.mascotLine}
            </figcaption>
          </figure>
        )}
      </section>

      <ul
        aria-label="Our promises"
        className="relative z-10 mx-4 -mt-8 grid grid-cols-1 divide-y divide-black/5 rounded-2xl bg-white shadow-[0_24px_50px_-24px_rgba(0,0,0,0.35)] sm:grid-cols-2 lg:mx-auto lg:-mt-10 lg:max-w-[1180px] lg:grid-cols-4 lg:divide-x lg:divide-y-0"
      >
        {b.promises.map((p) => (
          <li key={p} className="flex items-center gap-3 px-5 py-4 font-bold lg:py-6">
            <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-primary text-white">
              <Check size={16} strokeWidth={3} aria-hidden="true" />
            </span>
            {p}
          </li>
        ))}
      </ul>

      <section id="services" className="mx-auto max-w-page px-gutter py-[clamp(4.5rem,9vw,7rem)]">
        <div className="mb-12 max-w-2xl">
          <p className={eyebrow}>{b.hero.eyebrow}</p>
          <h2 className={h2}>What we fix</h2>
          <p className="mt-4 text-lg text-ink/75">
            Residential and commercial plumbing across {b.town}, from a dripping faucet to a full repipe.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4">
          {b.services.map((s) => {
            const Icon = ICONS[s.icon] || Wrench;
            return (
              <a
                key={s.title}
                href="#schedule"
                className="group flex flex-col rounded-2xl bg-surface p-7 no-underline transition duration-200 hover:-translate-y-1 hover:bg-primary-deep hover:text-white"
              >
                <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary text-white transition group-hover:bg-accent group-hover:text-ink">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="font-heading text-[1.4rem] font-bold uppercase leading-none">{s.title}</h3>
                <p className="mb-6 mt-2.5 opacity-75">{s.text}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 font-bold text-primary group-hover:text-accent">
                  Schedule <ArrowRight size={15} aria-hidden="true" />
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section
        id="why"
        className="mx-auto grid max-w-page items-center gap-[clamp(2.5rem,6vw,5.5rem)] px-gutter pb-[clamp(4.5rem,9vw,7rem)] md:grid-cols-2"
      >
        <div className="relative mr-4 md:mr-6">
          <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-2xl bg-accent md:translate-x-6 md:translate-y-6" />
          <Img
            className="relative aspect-[4/5] w-full rounded-2xl object-cover"
            src={b.crew.image}
            alt={b.crew.imageAlt}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div>
          <p className={eyebrow}>{b.crew.eyebrow}</p>
          <h2 className={h2}>{b.crew.title}</h2>
          <p className="mt-5 text-lg text-ink/80">{b.crew.text}</p>
          <ol className="mt-9 grid gap-6">
            {b.crew.points.map((p, i) => (
              <li key={p.title} className="flex gap-5 border-t border-black/10 pt-6">
                <span className="font-heading text-4xl font-extrabold leading-none text-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-heading text-[1.4rem] font-bold uppercase leading-none">{p.title}</h3>
                  <p className="mt-1.5 text-ink/75">{p.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="reviews"
        className="bg-primary-deep bg-[radial-gradient(circle_at_15%_20%,color-mix(in_srgb,var(--primary)_70%,transparent),transparent_55%)] text-white"
      >
        <div className="mx-auto grid max-w-page items-center gap-[clamp(2rem,5vw,4rem)] px-gutter py-[clamp(4rem,8vw,6rem)] lg:grid-cols-[260px_1fr]">
          <div className="grid justify-items-start gap-2">
            <strong className="font-heading text-8xl font-extrabold leading-[0.85]">{Number(b.rating).toFixed(1)}</strong>
            <Stars value={b.rating} size={22} />
            <span className="font-semibold text-white/80">{b.reviewCount?.toLocaleString()} Google reviews</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {b.reviews.map((r) => (
              <figure key={r.author} className="m-0 flex flex-col rounded-2xl bg-white p-7 text-ink">
                <Stars value={5} size={15} />
                <blockquote className="mb-5 mt-4 leading-relaxed">{r.text}</blockquote>
                <figcaption className="mt-auto font-bold">{r.author}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="area" className="relative isolate overflow-hidden text-white">
        <Img className="absolute inset-0 -z-20 h-full w-full object-cover" src={b.band.image} alt={b.band.imageAlt} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/80 to-black/35" />
        <div className="mx-auto max-w-page px-gutter py-[clamp(5rem,11vw,8.5rem)]">
          <h2 className={`${h2} max-w-[14ch]`}>{b.band.title}</h2>
          <p className="mb-8 mt-4 max-w-lg text-lg text-white/90">{b.band.text}</p>
          <ul className="flex max-w-3xl flex-wrap gap-2">
            {b.serviceArea.map((t) => (
              <li
                key={t}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3.5 py-2 text-sm font-semibold backdrop-blur"
              >
                <MapPin size={14} aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="schedule"
        className="mx-auto grid max-w-page items-start gap-[clamp(2rem,6vw,5rem)] px-gutter py-[clamp(4.5rem,9vw,7rem)] md:grid-cols-[1fr_1.15fr]"
      >
        <div>
          <p className={eyebrow}>Schedule service</p>
          <h2 className={h2}>Tell us what is going on.</h2>
          <p className="mb-8 mt-4 text-lg text-ink/75">A real person calls you back to confirm a time.</p>
          <ul className="mb-8 grid gap-3.5 font-semibold">
            {[
              [Phone, tel, b.phone],
              b.email && [Mail, `mailto:${b.email}`, b.email],
              [MapPin, mapsHref(b), `${b.address}, ${b.town}, ${b.state} ${b.zip || ''}`],
            ]
              .filter(Boolean)
              .map(([Icon, href, label]) => (
                <li key={href}>
                  <a href={href} className="flex items-center gap-3 no-underline">
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-surface text-primary">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    {label}
                  </a>
                </li>
              ))}
          </ul>
          {b.hours && (
            <table className="w-full max-w-sm border-collapse">
              <tbody>
                {b.hours.map(([d, h]) => (
                  <tr key={d} className="border-b border-black/10">
                    <th className="py-2.5 text-left font-semibold text-ink/70">{d}</th>
                    <td className="py-2.5 text-right font-semibold">{h}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="rounded-3xl border-t-[6px] border-primary bg-surface p-[clamp(1.5rem,4vw,2.5rem)]">
          <EnquiryForm
            b={b}
            submitLabel="Request Service"
            styles={{
              form: '',
              label: 'text-sm font-bold',
              field:
                'rounded-xl border border-black/15 bg-white px-3.5 py-3 font-normal text-ink focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary',
              button: 'rounded-full bg-primary py-4 text-lg font-extrabold text-white transition hover:brightness-110',
              done: 'py-4',
            }}
            fields={[
              { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
              { name: 'phone', label: 'Phone', type: 'tel', required: true, autoComplete: 'tel' },
              { name: 'address', label: 'Service Address', wide: true, autoComplete: 'street-address' },
              {
                name: 'service',
                label: 'What Do You Need?',
                type: 'select',
                required: true,
                wide: true,
                options: [...b.services.map((s) => s.title), 'Something else'],
              },
              { name: 'details', label: 'Details', type: 'textarea', wide: true },
            ]}
          />
        </div>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-x-12 gap-y-6 bg-primary-deep px-gutter pb-28 pt-12 text-white/80 md:pb-12">
        <div className="grid gap-3">
          <Logo b={b} textClass="uppercase text-white" />
          <p>
            {b.address}, {b.town}, {b.state} {b.zip}
          </p>
        </div>
        <div className="grid gap-1 font-bold">
          <a href={tel} className="text-white no-underline">
            {b.phone}
          </a>
          {b.email && (
            <a href={`mailto:${b.email}`} className="text-white no-underline">
              {b.email}
            </a>
          )}
        </div>
        <p className="basis-full text-sm text-white/60">
          &copy; {new Date().getFullYear()} {b.name}
        </p>
      </footer>

      <div className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-[1fr_1.6fr] gap-2 md:hidden">
        <a href={tel} className={`${pill} bg-ink py-4 text-white shadow-xl`}>
          <Phone size={18} aria-hidden="true" /> Call
        </a>
        <a href="#schedule" className={`${pill} bg-primary py-4 text-white shadow-xl`}>
          Schedule Service
        </a>
      </div>
    </div>
  );
}
