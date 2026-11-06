/**
 * The outdoor template's type, buttons and small pieces, shared by its pages.
 */
import { ArrowRight, Phone } from 'lucide-react';
import { telHref } from '../../site.js';
import { askOf, unbrokenWords } from './util.js';

export const wrap = 'mx-auto w-full max-w-page px-gutter';
export const pad = 'py-[clamp(4.5rem,9vw,7.5rem)]';
// Heading weight and tracking come from the tone and the face (set on the root).
export const display = 'font-heading [font-weight:var(--h-weight)] tracking-[var(--h-track)] [text-wrap:balance] break-words';
export const h2 = `${display} text-[clamp(2.1rem,1.35rem+2.7vw,3.5rem)] leading-[1.04] text-ink`;
export const lead = 'text-[17px] leading-[1.7] text-muted sm:text-[18px]';

const btn =
  'group/btn inline-flex min-h-[54px] items-center justify-center gap-3 rounded-full px-6 font-heading text-[16px] font-bold no-underline transition duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
export const btnMain = `${btn} bg-[color:var(--cta)] pr-2 text-[color:var(--cta-ink)] hover:brightness-110 focus-visible:outline-[color:var(--cta)]`;
export const btnMainDark = `${btn} bg-[color:var(--cta-dark)] pr-2 text-[color:var(--cta-dark-ink)] hover:brightness-110 focus-visible:outline-white`;
export const btnLine = `${btn} border border-ink/15 bg-white/60 text-ink hover:border-ink/40 focus-visible:outline-ink`;
export const btnLineDark = `${btn} border border-white/30 bg-white/[0.06] text-white backdrop-blur-sm hover:border-white/60 hover:bg-white/10 focus-visible:outline-white`;

/** The arrow at the end of a main button, in a disc of its own. */
export function Go({ dark = false }) {
  return (
    <span
      className={`grid h-10 w-10 flex-none place-items-center rounded-full transition group-hover/btn:translate-x-0.5 ${
        dark ? 'bg-[color:var(--cta-dark-disc)]' : 'bg-[color:var(--cta-disc)]'
      }`}
      aria-hidden="true"
    >
      <ArrowRight size={18} />
    </span>
  );
}

export function Eyebrow({ children, light = false, className = '' }) {
  return (
    <p
      className={`mb-5 flex items-center gap-3 font-heading text-[13px] font-bold uppercase leading-[1.4] tracking-[0.18em] ${
        light ? 'text-white/80' : 'text-[color:var(--pt)]'
      } ${className}`}
    >
      <span className={`h-px w-7 flex-none ${light ? 'bg-white/60' : 'bg-[color:var(--pt)]'}`} aria-hidden="true" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/** A heading with each hyphenated word held whole. */
export function Unbroken({ children }) {
  return unbrokenWords(children).map((part, i) =>
    i % 2 ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** The two things every opening asks: the estimate, and a call. */
export function Actions({ b, dark = false, className = '', phone = true }) {
  const ask = askOf(b);
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${className}`}>
      <a href="/contact" className={dark ? btnMainDark : btnMain}>
        <span className="pl-1">{ask.act}</span>
        <Go dark={dark} />
      </a>
      {phone && (
        <a href={telHref(b.phone)} className={dark ? btnLineDark : btnLine}>
          <Phone size={17} aria-hidden="true" /> {b.phone}
        </a>
      )}
    </div>
  );
}

/** A title split so its last word keeps the arrow after it on the same line. */
export function WithArrow({ text, size = 17, className = '' }) {
  const words = String(text || '').trim();
  const last = words.split(/\s+/).pop();
  // One span, so a flex parent keeps the space before the last word rather than trimming it.
  return (
    <span>
      {words.slice(0, words.length - last.length)}
      <span className="whitespace-nowrap">
        {last}
        <ArrowRight size={size} className={`ml-1.5 inline-block align-[-3px] transition group-hover:translate-x-1 ${className}`} aria-hidden="true" />
      </span>
    </span>
  );
}
