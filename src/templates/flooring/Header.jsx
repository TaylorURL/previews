import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Clock, MapPin, Menu, Phone, X } from 'lucide-react';
import { telHref } from '../../site.js';
import { Img } from '../shared.jsx';
import { BrandMark, btn, wrap } from './parts.jsx';

/**
 * The flooring mega menu: hover or focus opens it, a click opens and closes
 * it for anyone without a pointer that hovers, and Escape or a click outside
 * puts it away.
 */
function FlooringMenu({ b, cats, current }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const trigger = useRef(null);
  const timer = useRef(0);
  const fresh = useRef(false);

  const show = () => {
    clearTimeout(timer.current);
    if (!open) {
      fresh.current = true;
      setTimeout(() => (fresh.current = false), 350);
    }
    setOpen(true);
  };
  const hide = (delay = 140) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), delay);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const onDown = (event) => {
      if (box.current && !box.current.contains(event.target)) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const first = b.hours?.[0];

  return (
    <div
      ref={box}
      className="flex h-full items-stretch"
      onMouseEnter={show}
      onMouseLeave={() => hide()}
      onFocus={show}
      onBlur={(event) => {
        if (!box.current?.contains(event.relatedTarget)) hide(0);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls="flooring-menu"
        onClick={() => (fresh.current ? setOpen(true) : setOpen((v) => !v))}
        className={`flex min-h-11 cursor-pointer items-center gap-1.5 border-0 bg-transparent px-0 text-[16px] font-medium transition-colors hover:text-primary ${
          current.startsWith('flooring') ? 'text-primary' : 'text-ink'
        }`}
      >
        Flooring
        <ChevronDown size={16} aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <div
        id="flooring-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full border-y border-line bg-cream shadow-[0_40px_60px_-40px_rgba(0,0,0,0.35)]"
      >
        <div className={`${wrap} grid grid-cols-12 gap-10 py-10`}>
          <div className="col-span-8">
            <p className="mb-5 text-[13px] font-semibold uppercase tracking-[0.16em] text-muted">Shop by Floor</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              {cats.map((c) => (
                <li key={c.slug}>
                  <a
                    href={`/flooring/${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-4 rounded-sm p-2 text-ink no-underline transition-colors hover:bg-surface focus-visible:bg-surface"
                  >
                    <span className="block size-[68px] flex-none overflow-hidden bg-surface">
                      <Img
                        src={c.texture}
                        alt=""
                        sizes="68px"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-heading text-[22px] leading-tight">{c.title}</span>
                      {c.short && <span className="mt-1 block text-[15px] leading-snug text-muted">{c.short}</span>}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="/flooring"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-primary no-underline hover:underline"
            >
              All Flooring <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="col-span-4 flex flex-col bg-surface p-7">
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.16em] text-muted">Visit the Showroom</p>
            <p className="flex gap-2.5 text-[16px] leading-snug">
              <MapPin size={18} className="mt-0.5 flex-none text-primary" aria-hidden="true" />
              <span>
                {b.address}
                <br />
                {b.town}, {b.state} {b.zip}
              </span>
            </p>
            {first && (
              <p className="mt-3 flex gap-2.5 text-[16px] leading-snug">
                <Clock size={18} className="mt-0.5 flex-none text-primary" aria-hidden="true" />
                <span>
                  {first[0]} {first[1]}
                </span>
              </p>
            )}
            <div className="mt-auto grid gap-2 pt-6">
              <a href="/showroom" onClick={() => setOpen(false)} className={`${btn} border border-ink/25 text-ink hover:border-ink`}>
                Plan a Visit
              </a>
              <a href="/estimate" onClick={() => setOpen(false)} className={`${btn} bg-primary text-white hover:bg-primary-deep`}>
                Free Estimate
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const linkClass = (active) =>
  `flex min-h-11 items-center text-[16px] font-medium no-underline transition-colors hover:text-primary ${
    active ? 'text-primary' : 'text-ink'
  }`;

export default function Header({ b, cats, current }) {
  const [open, setOpen] = useState(false);
  const [floorsOpen, setFloorsOpen] = useState(false);
  const tel = telHref(b.phone);
  const stick = b.preview ? 'top-11' : 'top-0';
  const hasGallery = b.gallery?.length > 0;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const first = b.hours?.[0];

  return (
    <>
      <div className="hidden bg-primary-deep text-[14px] text-white/80 md:block">
        <div className={`${wrap} flex h-10 items-center justify-between gap-6`}>
          <p className="m-0 flex min-w-0 items-center gap-2">
            <MapPin size={14} className="flex-none text-accent" aria-hidden="true" />
            <span className="truncate">
              {b.address}, {b.town}, {b.state}
              {first && (
                <span className="hidden lg:inline">
                  {' '}
                  &nbsp;&middot;&nbsp; {first[0]} {first[1]}
                </span>
              )}
            </span>
          </p>
          <a href={tel} className="flex min-h-10 flex-none items-center gap-2 font-semibold text-white no-underline hover:underline">
            <Phone size={14} className="text-accent" aria-hidden="true" /> {b.phone}
          </a>
        </div>
      </div>

      <header className={`sticky ${stick} z-40 border-b border-line bg-cream`}>
        <div className={`${wrap} flex h-[72px] items-center gap-4 lg:grid lg:h-[88px] lg:grid-cols-[1fr_auto_1fr] lg:gap-8`}>
          <nav aria-label="Main" className="hidden h-full items-stretch gap-9 lg:flex">
            {cats.length > 0 && <FlooringMenu b={b} cats={cats} current={current} />}
            {hasGallery && (
              <a href="/gallery" className={linkClass(current === 'gallery')} aria-current={current === 'gallery' ? 'page' : undefined}>
                Gallery
              </a>
            )}
            <a href="/showroom" className={linkClass(current === 'showroom')} aria-current={current === 'showroom' ? 'page' : undefined}>
              Showroom
            </a>
          </nav>

          <a href="/" className="flex min-h-11 min-w-0 items-center no-underline lg:justify-center" aria-label={`${b.name} home`}>
            <BrandMark b={b} className="max-h-11 lg:max-h-[52px]" />
          </a>

          <div className="ml-auto flex flex-none items-center gap-2 lg:justify-end lg:gap-6">
            <a href={tel} className="hidden min-h-11 items-center whitespace-nowrap text-[16px] font-medium text-ink no-underline hover:text-primary xl:flex">
              {b.phone}
            </a>
            <a href="/estimate" className={`${btn} hidden bg-primary text-white hover:bg-primary-deep sm:inline-flex`}>
              Free Estimate
            </a>
            <a
              href={tel}
              aria-label={`Call ${b.phone}`}
              className="grid size-11 place-items-center rounded-full border border-line text-ink lg:hidden"
            >
              <Phone size={18} aria-hidden="true" />
            </a>
            <button
              type="button"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-0 bg-primary-deep px-4 text-[15px] font-medium text-white lg:hidden"
            >
              {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
              {open ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        <div
          id="site-menu"
          hidden={!open}
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-116px)] overflow-y-auto border-b border-line bg-cream shadow-[0_30px_50px_-30px_rgba(0,0,0,0.4)] lg:hidden"
        >
          <nav aria-label="Mobile" className={`${wrap} pb-6 pt-2`}>
            <ul className="m-0 list-none p-0">
              {cats.length > 0 && (
                <li className="border-b border-line">
                  <button
                    type="button"
                    aria-expanded={floorsOpen}
                    aria-controls="mobile-flooring"
                    onClick={() => setFloorsOpen((v) => !v)}
                    className="flex min-h-[60px] w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-left font-heading text-[26px] text-ink"
                  >
                    Flooring
                    <ChevronDown size={22} aria-hidden="true" className={`text-primary transition-transform ${floorsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <ul id="mobile-flooring" hidden={!floorsOpen} className="m-0 grid list-none gap-1 p-0 pb-4">
                    {cats.map((c) => (
                      <li key={c.slug}>
                        <a
                          href={`/flooring/${c.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex min-h-[56px] items-center gap-3.5 text-[17px] font-medium text-ink no-underline"
                        >
                          <span className="block size-12 flex-none overflow-hidden bg-surface">
                            <Img src={c.texture} alt="" sizes="48px" className="h-full w-full object-cover" />
                          </span>
                          {c.title}
                        </a>
                      </li>
                    ))}
                    <li>
                      <a
                        href="/flooring"
                        onClick={() => setOpen(false)}
                        className="flex min-h-11 items-center gap-2 text-[16px] font-semibold text-primary no-underline"
                      >
                        All Flooring <ArrowRight size={16} aria-hidden="true" />
                      </a>
                    </li>
                  </ul>
                </li>
              )}
              {[hasGallery && ['/gallery', 'Gallery'], ['/showroom', 'Showroom'], ['/estimate', 'Free Estimate']]
                .filter(Boolean)
                .map(([href, label]) => (
                  <li key={href} className="border-b border-line">
                    <a
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[60px] items-center justify-between font-heading text-[26px] text-ink no-underline"
                    >
                      {label} <ArrowRight size={20} className="text-primary" aria-hidden="true" />
                    </a>
                  </li>
                ))}
            </ul>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a href="/estimate" onClick={() => setOpen(false)} className={`${btn} bg-primary text-white`}>
                Book a Free Estimate
              </a>
              <a href={tel} className={`${btn} border border-ink/25 text-ink`}>
                <Phone size={17} aria-hidden="true" /> {b.phone}
              </a>
            </div>
            <p className="mt-5 text-[16px] leading-relaxed text-muted">
              {b.address}, {b.town}, {b.state}
              {first && (
                <>
                  <br />
                  {first[0]} {first[1]}
                </>
              )}
            </p>
          </nav>
        </div>
      </header>
    </>
  );
}
