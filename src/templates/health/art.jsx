/**
 * The health template's drawn pieces: the soft shapes behind a hero, the
 * treatments arranged around the practice's mark where a hero has no photo,
 * and the drawn street plan behind the directions card. All of it is drawn in
 * CSS and SVG from the brand's own colors; none of it is a picture of anything
 * real, so it carries no facts of its own.
 */
import { MapPin } from 'lucide-react';
import { kindIcon, treatmentIcon } from './icons.jsx';

/** Pale washes of the brand's colors and a fading dot grid, so a light hero reads as made rather than blank. */
export function Backdrop({ strong = false, Mark = null }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -right-[18%] -top-[30%] size-[62rem] max-w-none rounded-full"
        style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--primary) 16%, transparent), transparent)' }}
      />
      <div
        className="absolute -bottom-[38%] -left-[22%] size-[46rem] max-w-none rounded-full"
        style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--accent) 11%, transparent), transparent)' }}
      />
      <div
        className={`absolute right-[4%] top-[8%] hidden h-[22rem] w-[30rem] lg:block ${strong ? 'opacity-90' : 'opacity-60'}`}
        style={{
          backgroundImage: 'radial-gradient(color-mix(in srgb, var(--primary) 30%, transparent) 1.3px, transparent 1.6px)',
          backgroundSize: '20px 20px',
          WebkitMaskImage: 'radial-gradient(closest-side, #000 30%, transparent)',
          maskImage: 'radial-gradient(closest-side, #000 30%, transparent)',
        }}
      />
      {Mark && (
        <div className="absolute -right-28 -top-[5.5rem] size-[19rem] opacity-80 sm:-right-16 lg:hidden">
          <div className="absolute inset-0 rounded-full border border-primary/10" />
          <div className="absolute inset-[16%] rounded-full border border-dashed border-primary/15" />
          <div className="absolute inset-[32%] grid place-items-center rounded-full bg-white/70">
            <Mark size={56} strokeWidth={1.2} className="-translate-x-3 translate-y-3 text-primary/35" />
          </div>
        </div>
      )}
    </div>
  );
}

// Where the treatments sit around the mark: clear of the disc in the middle and of each other.
const SPOTS = ['left-0 top-[9%]', 'right-0 top-[25%]', 'left-[2%] bottom-[19%]'];

/**
 * A hero's picture when the practice has no photo good enough to lead: its
 * mark in the middle of soft rings, a few of its own treatments around it,
 * each a link to its page, and the office's address on a card.
 */
export function Orbit({ b, services, hasPage }) {
  const Mark = kindIcon(b.kind);
  const picks = services.filter((s) => s.title.length <= 26).slice(0, 3);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[31rem]">
      <div aria-hidden="true" className="absolute inset-[4%] rounded-full" style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--primary) 12%, transparent), color-mix(in srgb, var(--primary) 4%, transparent) 70%, transparent)' }} />
      <div aria-hidden="true" className="absolute inset-[4%] rounded-full border border-primary/15" />
      <div aria-hidden="true" className="absolute inset-[17%] rounded-full border border-dashed border-primary/20" />
      <div aria-hidden="true" className="absolute inset-[30%] grid place-items-center rounded-full bg-white shadow-[0_30px_60px_-30px_color-mix(in_srgb,var(--primary)_55%,transparent),0_0_0_10px_color-mix(in_srgb,var(--primary)_6%,transparent)]">
        <Mark size={84} strokeWidth={1.25} className="text-primary" />
      </div>
      <span aria-hidden="true" className="absolute left-[19%] top-[44%] size-3 rounded-full bg-accent/70" />
      <span aria-hidden="true" className="absolute right-[15%] top-[60%] size-2 rounded-full bg-primary/50" />
      <span aria-hidden="true" className="absolute left-[48%] top-[13%] size-2.5 rounded-full bg-primary/30" />
      <ul>
        {picks.map((s, i) => {
          const Icon = treatmentIcon(s, b.kind);
          const body = (
            <>
              <span className="grid size-9 flex-none place-items-center rounded-full bg-[var(--tint)] text-primary">
                <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="whitespace-nowrap pr-1">{s.title}</span>
            </>
          );
          const cls = 'flex items-center gap-2.5 rounded-full bg-white py-2 pl-2 pr-4 text-[15px] font-semibold text-ink no-underline shadow-[0_18px_36px_-22px_rgba(16,32,48,0.5)] ring-1 ring-black/[0.04]';
          return (
            <li key={s.slug} className={`absolute ${SPOTS[i]}`}>
              {hasPage(s) ? (
                <a href={`/services/${s.slug}`} className={`${cls} transition hover:-translate-y-0.5`}>
                  {body}
                </a>
              ) : (
                <span className={cls}>{body}</span>
              )}
            </li>
          );
        })}
      </ul>
      {b.address && (
        <div className="absolute bottom-[1%] right-0 flex max-w-[17rem] items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_24px_48px_-26px_rgba(16,32,48,0.55)] ring-1 ring-black/[0.04]">
          <span className="grid size-10 flex-none place-items-center rounded-xl bg-primary text-white">
            <MapPin size={19} aria-hidden="true" />
          </span>
          <span className="min-w-0 text-[14.5px] leading-snug">
            <span className="block font-semibold text-ink">{b.address}</span>
            <span className="block text-muted">
              {b.town}, {b.state} {b.zip}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

/** A street plan drawn for the directions card: soft blocks, a few roads and a pin. It is no map of the real streets. */
export function MapArt() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" fill="none">
      <rect width="600" height="420" style={{ fill: 'color-mix(in srgb, var(--primary) 11%, #fff)' }} />
      <g style={{ fill: 'color-mix(in srgb, var(--primary) 3%, #fff)' }}>
        <rect x="24" y="22" width="150" height="96" rx="14" />
        <rect x="204" y="22" width="120" height="96" rx="14" />
        <rect x="354" y="22" width="222" height="96" rx="14" />
        <rect x="24" y="148" width="96" height="118" rx="14" />
        <rect x="150" y="148" width="174" height="118" rx="14" />
        <rect x="354" y="148" width="100" height="118" rx="14" />
        <rect x="484" y="148" width="92" height="118" rx="14" />
        <rect x="24" y="296" width="200" height="102" rx="14" />
        <rect x="254" y="296" width="140" height="102" rx="14" />
        <rect x="424" y="296" width="152" height="102" rx="14" />
      </g>
      <path d="M-20 360 C 140 330, 220 250, 340 210 S 520 150, 640 70" stroke="#fff" strokeWidth="18" strokeLinecap="round" />
      <path d="M-20 360 C 140 330, 220 250, 340 210 S 520 150, 640 70" style={{ stroke: 'color-mix(in srgb, var(--primary) 14%, transparent)' }} strokeWidth="2" strokeDasharray="2 10" strokeLinecap="round" />
      <circle cx="339" cy="207" r="46" style={{ fill: 'color-mix(in srgb, var(--primary) 12%, transparent)' }} />
      <circle cx="339" cy="207" r="24" style={{ fill: 'color-mix(in srgb, var(--primary) 18%, transparent)' }} />
      <path d="M339 150c-17 0-30 13-30 30 0 23 30 50 30 50s30-27 30-50c0-17-13-30-30-30Z" style={{ fill: 'var(--primary)' }} />
      <circle cx="339" cy="180" r="10" fill="#fff" />
    </svg>
  );
}
