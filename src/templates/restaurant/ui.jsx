import { Star } from 'lucide-react';
import { daysOf, isClosed } from './hours.js';
import { list } from './menu.js';

export const wrap = 'mx-auto w-full max-w-page px-gutter';
export const pad = 'py-[clamp(4rem,8vw,7rem)]';
export const h2 =
  'font-heading font-display text-[clamp(2rem,1.3rem+2.6vw,3.35rem)] leading-[1.06] [overflow-wrap:anywhere] [text-wrap:balance]';
export const label = 'mb-3 text-[13px] font-semibold uppercase tracking-[0.16em]';

const btn =
  'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-6 py-2.5 text-center text-[16px] font-semibold leading-tight no-underline transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
/** The main action: the brand color. */
export const solid = `${btn} bg-primary text-[color:var(--on-primary)] hover:bg-[color:var(--primary-hover)] focus-visible:outline-primary`;
/** A second action on a light ground. */
export const outline = `${btn} border-[1.5px] border-ink/20 text-ink hover:border-ink focus-visible:outline-ink`;
/** A second action on a dark ground or photo. */
export const ghost = `${btn} border-[1.5px] border-white/50 text-white hover:border-white hover:bg-white/10 focus-visible:outline-white`;
/** The main action on the deep band, where the brand color may not stand out. */
export const light = `${btn} bg-white text-ink hover:bg-ground focus-visible:outline-white`;

/** Opens a link the restaurant does not own (ordering, reservations, delivery) in a new tab. */
export const away = { target: '_blank', rel: 'noopener noreferrer' };

export function Eyebrow({ children, dark = false, className = '' }) {
  const tone = dark ? 'var(--accent-lit)' : 'var(--pt)';
  return (
    <p className={`mb-4 flex items-center gap-3 ${label} ${className}`} style={{ color: tone }}>
      <span aria-hidden="true" className="h-px w-8 flex-none" style={{ background: tone }} />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/** Dietary and other tags on a dish, as the menu prints them. */
export function Tags({ tags, className = '' }) {
  const items = list(tags).filter((t) => typeof t === 'string' && t.trim());
  if (!items.length) return null;
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Dietary notes">
      {items.map((t) => (
        <li key={t} className="rounded-full bg-[color:var(--tag)] px-2.5 py-0.5 text-[13px] font-medium text-ink">
          {t}
        </li>
      ))}
    </ul>
  );
}

/** Every hours row, today's marked once the browser knows what day it is. */
export function HoursTable({ hours, today, dark = false, className = '' }) {
  const rows = list(hours).filter((row) => Array.isArray(row) && row[0] && row[1]);
  if (!rows.length) return null;
  return (
    <table className={`w-full border-collapse ${className}`}>
      <caption className="sr-only">Opening hours</caption>
      <tbody>
        {rows.map(([day, time]) => {
          const now = today != null && daysOf(day).includes(today);
          return (
            <tr key={day} className={`border-b ${dark ? 'border-white/15' : 'border-line'}`}>
              <th scope="row" className="py-3.5 pr-4 text-left align-top font-medium">
                {day}
                {now && (
                  <span className="ml-2 inline-block rounded-full bg-accent px-2 py-0.5 align-[0.1em] text-[11px] font-bold uppercase tracking-[0.1em] text-[color:var(--on-accent)]">
                    Today
                  </span>
                )}
              </th>
              <td
                className={`py-3.5 text-right align-top ${
                  isClosed(time) ? (dark ? 'text-white/60' : 'text-muted') : 'font-semibold'
                }`}
              >
                {time}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const mark = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

function InstagramMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...mark}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...mark}>
      <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" />
    </svg>
  );
}

function TikTokMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...mark}>
      <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M14 3c.4 2.6 2.2 4.4 5 4.6" />
    </svg>
  );
}

function YelpMark({ size = 18 }) {
  return <Star size={size} strokeWidth={1.7} aria-hidden="true" />;
}

const SOCIAL = [
  ['instagram', 'Instagram', InstagramMark],
  ['facebook', 'Facebook', FacebookMark],
  ['tiktok', 'TikTok', TikTokMark],
  ['yelp', 'Yelp', YelpMark],
];

const socialOf = (b) => SOCIAL.filter(([key]) => typeof b.social?.[key] === 'string' && b.social[key]);

/** Whether the restaurant lists any profile this template draws. */
export const hasSocial = (b) => socialOf(b).length > 0;

/** The restaurant's own profiles, each a labelled link. Nothing when it lists none. */
export function Socials({ b, dark = false, className = '' }) {
  const links = socialOf(b);
  if (!links.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {links.map(([key, name, Mark]) => (
        <li key={key}>
          <a
            href={b.social[key]}
            {...away}
            aria-label={`${b.shortName} on ${name}`}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[15px] font-medium no-underline transition-colors ${
              dark ? 'border-white/25 text-white hover:border-white' : 'border-line text-ink hover:border-ink'
            }`}
          >
            <Mark size={17} />
            {name}
          </a>
        </li>
      ))}
    </ul>
  );
}
