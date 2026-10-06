import { useEffect, useState } from 'react';
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
  Menu,
  Phone,
  ScanSearch,
  ShowerHead,
  Waves,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import { brandVars, mapsHref, ratingLine, telHref } from '../site.js';
import { EnquiryForm, Img, Stars, Facts } from './shared.jsx';

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

const NAV = [
  ['#services', 'Services'],
  ['#why', 'Why Us'],
  ['#reviews', 'Reviews'],
  ['#area', 'Service Area'],
  ['#schedule', 'Contact'],
];

const wrap = 'mx-auto w-full max-w-page px-gutter';
const pad = 'py-[clamp(4rem,9vw,7rem)]';
const anchor = 'scroll-mt-28 lg:scroll-mt-36';
const h2 =
  'font-heading text-[clamp(2rem,1.4rem+2.4vw,3rem)] font-extrabold leading-[1.06] tracking-[-0.01em] [text-wrap:balance] break-words';
const btn =
  'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-md px-6 text-[17px] font-bold no-underline transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

function Eyebrow({ children, dark = false }) {
  return (
    <p
      className={`mb-4 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.14em] ${
        dark ? 'text-white/85' : 'text-primary'
      }`}
    >
      <span className="h-0.5 w-7 flex-none bg-accent" aria-hidden="true" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/** The logo sized by height so tall and wide marks sit the same in the bar. */
function Mark({ b, className = '', textClass = '' }) {
  if (b.brand.logo) {
    return <img className={`block w-auto max-w-[46vw] object-contain ${className}`} src={b.brand.logo} alt={b.name} />;
  }
  return <span className={`block font-heading text-2xl font-extrabold leading-none ${textClass}`}>{b.shortName}</span>;
}

function Header({ b, tel }) {
  const [open, setOpen] = useState(false);
  const stick = b.preview ? 'top-11' : 'top-0';

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`sticky ${stick} z-30 border-b border-ink/10 bg-white`}>
      <div className={`${wrap} flex min-h-[68px] items-center gap-6 py-2.5 lg:min-h-[84px]`}>
        <a href="#top" className="flex min-h-[44px] flex-none items-center" aria-label={`${b.name} home`} onClick={() => setOpen(false)}>
          <Mark b={b} className="h-11 sm:h-12 lg:h-16" textClass="text-primary-deep" />
        </a>

        <nav aria-label="Main" className="mx-auto hidden items-center gap-6 lg:flex xl:gap-8">
          {NAV.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="flex min-h-[44px] items-center whitespace-nowrap text-[16px] font-semibold text-ink/80 no-underline transition hover:text-primary"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-5 lg:ml-0">
          <a href={tel} className="hidden min-h-[44px] content-center text-right leading-tight no-underline sm:grid lg:hidden xl:grid">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/60">Call Now</span>
            <strong className="whitespace-nowrap font-heading text-[22px] font-extrabold text-primary">{b.phone}</strong>
          </a>
          <a href="#schedule" className={`${btn} hidden bg-primary text-white hover:bg-primary-deep md:inline-flex`}>
            Schedule Service
          </a>
          <a
            href={tel}
            className="grid h-11 w-11 place-items-center rounded-md bg-primary text-white sm:hidden"
            aria-label={`Call ${b.phone}`}
          >
            <Phone size={20} aria-hidden="true" />
          </a>
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-md border border-ink/15 px-3.5 font-bold text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            <span>{open ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </div>

      <div
        id="site-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100dvh-8rem)] overflow-y-auto border-b border-ink/10 bg-white shadow-[0_24px_40px_-24px_rgba(0,0,0,0.35)] lg:hidden"
      >
        <nav aria-label="Mobile" className={`${wrap} pb-2 pt-1`}>
          <ul>
            {NAV.map(([href, label]) => (
              <li key={href} className="border-b border-ink/10">
                <a
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[56px] items-center justify-between font-heading text-[21px] font-extrabold text-ink no-underline"
                >
                  {label} <ArrowRight size={18} className="text-primary" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className={`${wrap} grid gap-3 pb-6 pt-4 sm:grid-cols-2`}>
          <a href="#schedule" onClick={() => setOpen(false)} className={`${btn} bg-primary text-white`}>
            Schedule Service
          </a>
          <a href={tel} className={`${btn} border-[1.5px] border-ink/20 text-ink`}>
            <Phone size={18} aria-hidden="true" /> {b.phone}
          </a>
          {b.hours?.length > 0 && (
            <p className="text-[15px] text-ink/65 sm:col-span-2">{b.hours.map(([d, h]) => `${d} ${h}`).join(' · ')}</p>
          )}
        </div>
      </div>
    </header>
  );
}

function Hero({ b, tel, rating }) {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-primary-deep text-white">
      <Img
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_45%]"
        src={b.hero.image}
        alt={b.hero.imageAlt}
        sizes="100vw"
        eager
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primaryDeep)_92%,transparent)_0%,color-mix(in_srgb,var(--primaryDeep)_80%,transparent)_60%,color-mix(in_srgb,var(--primaryDeep)_55%,transparent)_100%)] lg:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--primaryDeep)_95%,transparent)_0%,color-mix(in_srgb,var(--primaryDeep)_82%,transparent)_45%,color-mix(in_srgb,var(--primaryDeep)_10%,transparent)_100%)]"
        aria-hidden="true"
      />
      <div className={`${wrap} flex min-h-[min(78vh,700px)] items-center pb-16 pt-14 sm:pb-20 lg:py-24`}>
        <div className="w-full max-w-[44rem] lg:max-w-[41rem]">
          <Eyebrow dark>{b.hero.eyebrow}</Eyebrow>
          <h1 className="break-words font-heading text-[clamp(2.25rem,1.05rem+4vw,4.25rem)] font-extrabold leading-[1.03] tracking-[-0.015em] [text-wrap:balance]">
            {b.hero.title} <span className="text-accent">{b.hero.titleAccent}</span>
          </h1>
          <p className="mt-6 max-w-[36rem] text-[17px] leading-[1.6] text-white/90 sm:text-[19px]">{b.hero.lead}</p>
          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <a href="#schedule" className={`${btn} bg-accent text-ink hover:brightness-105`}>
              Schedule Service <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href={tel} className={`${btn} border-[1.5px] border-white/60 text-white hover:bg-white/10`}>
              <Phone size={18} aria-hidden="true" /> {b.phone}
            </a>
          </div>
          {rating && (
            <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-semibold text-white/90">
              <Stars value={b.rating} size={16} /> <span>{rating}</span>
            </p>
          )}
        </div>
      </div>
      {b.hero.mascot && (
        <figure className="pointer-events-none absolute bottom-0 right-2 m-0 hidden w-[clamp(150px,15vw,220px)] animate-peek drop-shadow-2xl md:block lg:right-[6%]">
          <img src={b.hero.mascot} alt="" width="220" height="218" className="h-auto w-full" />
          {b.hero.mascotLine && (
            <figcaption className="absolute -top-3 right-[70%] hidden whitespace-nowrap rounded-xl rounded-br-sm bg-white px-4 py-2.5 font-heading text-lg font-extrabold text-ink shadow-xl xl:block">
              {b.hero.mascotLine}
            </figcaption>
          )}
        </figure>
      )}
    </section>
  );
}

export default function Plumbing({ b }) {
  const tel = telHref(b.phone);
  const rating = ratingLine(b);
  const first = b.hours?.[0];
  const street = [b.address, b.town].filter(Boolean).join(', ');
  const full = `${street}, ${b.state}${b.zip ? ` ${b.zip}` : ''}`;

  return (
    <div className="overflow-x-clip bg-white font-body text-[16px] text-ink antialiased" style={brandVars(b.brand)}>
      <div className="bg-primary-deep text-[14px] text-white/80">
        <div className={`${wrap} flex min-h-[40px] items-center justify-center gap-6 py-1.5 sm:min-h-[44px] sm:justify-between sm:py-0`}>
          <p className="flex min-w-0 items-center gap-2">
            <Clock size={15} className="flex-none text-accent" aria-hidden="true" />
            <span className="truncate">
              {first ? `${first[0]} ${first[1]}` : 'Call for service'}
              <span className="hidden md:inline">
                {' '}
                &middot; {street}, {b.state}
              </span>
            </span>
          </p>
          <a href={tel} className="hidden min-h-[44px] flex-none items-center gap-1.5 font-bold text-accent no-underline sm:inline-flex">
            <Phone size={15} aria-hidden="true" /> {b.phone}
          </a>
        </div>
      </div>

      <Header b={b} tel={tel} />
      <Hero b={b} tel={tel} rating={rating} />

      {b.promises?.length > 0 && (
        <div className="bg-primary text-white">
          <ul aria-label="Our promises" className={`${wrap} grid divide-y divide-white/15 py-2 sm:grid-cols-2 sm:gap-x-8 sm:divide-y-0 sm:py-5 lg:grid-cols-4`}>
            {b.promises.map((p) => (
              <li key={p} className="flex items-center gap-3 py-3 text-[16px] font-semibold leading-snug">
                <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-accent text-ink">
                  <Check size={15} strokeWidth={3} aria-hidden="true" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      <section id="services" className={`${anchor} ${pad}`}>
        <div className={wrap}>
          <div className="mb-10 grid gap-5 lg:mb-14 lg:grid-cols-[1fr_minmax(0,28rem)] lg:items-end lg:gap-16">
            <div>
              <Eyebrow>Services</Eyebrow>
              <h2 className={h2}>What we fix</h2>
            </div>
            <p className="text-[17px] leading-[1.6] text-ink/70 sm:text-[18px]">
              Residential and commercial plumbing across {b.town}, from a dripping faucet to a full repipe.
            </p>
          </div>
          <ul className="grid gap-x-12 md:grid-cols-2">
            {b.services.map((s) => {
              const Icon = ICONS[s.icon] || Wrench;
              return (
                <li key={s.title} className="border-t border-ink/10">
                  <a
                    href="#schedule"
                    className="group flex gap-4 py-5 text-ink no-underline sm:gap-5 sm:py-6"
                  >
                    <span className="grid h-12 w-12 flex-none place-items-center rounded-lg bg-surface text-primary transition group-hover:bg-primary group-hover:text-white">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-heading text-[19px] font-extrabold leading-tight sm:text-[20px]">
                        {s.title}
                      </span>
                      <span className="mt-1.5 block leading-[1.55] text-ink/70">{s.text}</span>
                    </span>
                    <ArrowRight
                      size={18}
                      className="mt-1 hidden flex-none text-primary transition group-hover:translate-x-1 sm:block"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section id="why" className={`${anchor} bg-surface ${pad}`}>
        <div className={`${wrap} grid items-center gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20`}>
          <Img
            className="aspect-[4/3] w-full rounded-lg object-cover md:aspect-[4/5]"
            src={b.crew.image}
            alt={b.crew.imageAlt}
            sizes="(max-width: 768px) 100vw, 45vw"
          />
          <div>
            <Eyebrow>{b.crew.eyebrow}</Eyebrow>
            <h2 className={h2}>{b.crew.title}</h2>
            <p className="mt-5 text-[17px] leading-[1.65] text-ink/80 sm:text-[18px]">{b.crew.text}</p>
            <ol className="mt-8 grid">
              {b.crew.points.map((p, i) => (
                <li key={p.title} className="flex gap-4 border-t border-ink/10 py-5 sm:gap-5">
                  <span className="w-9 flex-none font-heading text-[26px] font-extrabold leading-none text-primary">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-heading text-[19px] font-extrabold leading-tight sm:text-[20px]">{p.title}</h3>
                    <p className="mt-1.5 leading-[1.55] text-ink/70">{p.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="reviews" className={`${anchor} ${pad}`}>
        <div className={wrap}>
          <div className="mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Eyebrow>Reviews</Eyebrow>
              <h2 className={h2}>What customers say</h2>
            </div>
            {b.rating && (
              <div className="flex items-center gap-4">
                <strong className="font-heading text-[52px] font-extrabold leading-none">{Number(b.rating).toFixed(1)}</strong>
                <div className="grid gap-1.5">
                  <Stars value={b.rating} size={18} />
                  {b.reviewCount && (
                    <span className="text-[15px] font-semibold text-ink/70">
                      {b.reviewCount.toLocaleString()} Google reviews
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {b.reviews.map((r) => (
              <figure key={r.author} className="m-0 flex flex-col rounded-lg border border-ink/10 bg-white p-6 sm:p-7">
                <Stars value={5} size={15} />
                <blockquote className="mb-5 mt-4 leading-[1.65] text-ink/85">{r.text}</blockquote>
                <figcaption className="mt-auto font-bold text-ink/75">{r.author}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section id="area" className={`${anchor} relative isolate overflow-hidden bg-primary-deep text-white`}>
        <Img className="absolute inset-0 -z-20 h-full w-full object-cover" src={b.band.image} alt={b.band.imageAlt} />
        <div
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--primaryDeep)_94%,transparent),color-mix(in_srgb,var(--primaryDeep)_78%,transparent)_60%,color-mix(in_srgb,var(--primaryDeep)_45%,transparent))]"
          aria-hidden="true"
        />
        <div className={`${wrap} py-[clamp(4.5rem,10vw,7.5rem)]`}>
          <div className="max-w-[48rem]">
            <Eyebrow dark>Service area</Eyebrow>
            <h2 className={h2}>{b.band.title}</h2>
            <p className="mt-4 max-w-[36rem] text-[17px] leading-[1.6] text-white/90 sm:text-[18px]">{b.band.text}</p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {b.serviceArea.map((t) => (
                <li
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 py-2 text-[14px] font-semibold"
                >
                  <MapPin size={14} className="flex-none text-accent" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
            <a href={tel} className={`${btn} mt-9 w-full bg-accent text-ink hover:brightness-105 sm:w-auto`}>
              <Phone size={18} aria-hidden="true" /> Call {b.phone}
            </a>
          </div>
        </div>
      </section>

      <section id="schedule" className={`${anchor} bg-surface ${pad}`}>
        <div className={`${wrap} grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-20`}>
          <div>
            <Eyebrow>Schedule service</Eyebrow>
            <h2 className={h2}>Tell us what is going on.</h2>
            <p className="mb-8 mt-4 text-[17px] leading-[1.6] text-ink/75 sm:text-[18px]">
              A real person calls you back to confirm a time.
            </p>
            <ul className="mb-8 grid gap-3 font-semibold">
              {[
                [Phone, tel, b.phone],
                b.email && [Mail, `mailto:${b.email}`, b.email],
                [MapPin, mapsHref(b), full],
              ]
                .filter(Boolean)
                .map(([Icon, href, label]) => (
                  <li key={href}>
                    <a href={href} className="flex min-h-[44px] items-center gap-3 text-ink no-underline hover:text-primary">
                      <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-white text-primary">
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 break-words">{label}</span>
                    </a>
                  </li>
                ))}
            </ul>
            {b.hours?.length > 0 && (
              <table className="w-full max-w-md border-collapse">
                <caption className="sr-only">Opening hours</caption>
                <tbody>
                  {b.hours.map(([d, h]) => (
                    <tr key={d} className="border-b border-ink/10">
                      <th scope="row" className="py-3 pr-4 text-left font-semibold text-ink/70">
                        {d}
                      </th>
                      <td className="py-3 text-right font-semibold">{h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="rounded-xl bg-white p-5 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.3)] sm:p-8 lg:p-10">
            <h3 className="mb-6 font-heading text-[24px] font-extrabold leading-tight">Request service</h3>
            <EnquiryForm
              b={b}
              submitLabel="Request Service"
              styles={{
                form: '',
                label: 'text-[14px] font-bold',
                field:
                  'min-h-[48px] rounded-md border border-ink/20 bg-white px-3.5 py-3 text-[16px] font-normal text-ink focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-primary',
                button:
                  'min-h-[52px] rounded-md bg-primary py-3.5 text-[17px] font-bold text-white transition hover:bg-primary-deep',
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
        </div>
      </section>

      <Facts b={b} />
      <footer className="bg-primary-deep pb-24 text-white/75 md:pb-0">
        <div className={`${wrap} grid gap-10 pb-12 pt-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-12`}>
          <div className="grid content-start gap-4">
            {b.brand.logo ? (
              <span className="inline-flex w-fit rounded-lg bg-white px-3 py-2">
                <Mark b={b} className="h-14" />
              </span>
            ) : (
              <Mark b={b} textClass="text-white" />
            )}
            <p className="max-w-xs leading-[1.6]">
              Plumbing in {b.town}, {b.state} and the communities around it.
            </p>
          </div>
          <div>
            <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-accent">Services</h2>
            <ul className="-my-2.5 grid">
              {b.services.slice(0, 4).map((s) => (
                <li key={s.title}>
                  <a href="#services" className="flex min-h-[44px] items-center text-white/80 no-underline hover:text-white">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          {b.hours?.length > 0 && (
            <div>
              <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-accent">Hours</h2>
              <dl className="grid gap-2">
                {b.hours.map(([d, h]) => (
                  <div key={d} className="flex flex-wrap gap-x-2">
                    <dt className="text-white/60">{d}</dt>
                    <dd className="m-0 text-white/90">{h}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          <div>
            <h2 className="mb-4 text-[13px] font-bold uppercase tracking-[0.14em] text-accent">Contact</h2>
            <a href={tel} className="flex min-h-[44px] items-center font-heading text-[24px] font-extrabold text-white no-underline">
              {b.phone}
            </a>
            {b.email && (
              <a href={`mailto:${b.email}`} className="flex min-h-[44px] items-center break-all text-white/85 no-underline hover:text-white">
                {b.email}
              </a>
            )}
            <a href={mapsHref(b)} className="block py-2.5 leading-[1.6] text-white/80 no-underline hover:text-white">
              {b.address}
              <br />
              {b.town}, {b.state} {b.zip}
            </a>
          </div>
        </div>
        <div className={wrap}>
          <p className="border-t border-white/10 py-6 text-[14px] text-white/55">
            &copy; {new Date().getFullYear()} {b.name}
          </p>
        </div>
      </footer>

      <div
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-white/10 bg-primary-deep md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <a
          href={tel}
          className="flex min-h-[56px] items-center justify-center gap-2 px-2 text-[16px] font-bold text-white no-underline"
        >
          <Phone size={18} className="flex-none" aria-hidden="true" /> Call Now
        </a>
        <a
          href="#schedule"
          className="flex min-h-[56px] items-center justify-center bg-accent px-2 text-[16px] font-bold text-ink no-underline"
        >
          Schedule Service
        </a>
      </div>
    </div>
  );
}
