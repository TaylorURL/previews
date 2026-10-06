import {
  BadgeCheck,
  Car,
  CarBattery,
  ClipboardCheck,
  Cog,
  Disc,
  Disc3,
  Droplet,
  Engine,
  Fan,
  Fuel,
  Gauge,
  KeyRound,
  ScanLine,
  ShieldCheck,
  Snowflake,
  Thermometer,
  Truck,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';

/** The icon names a service group may ask for in the brand file. */
export const ICONS = {
  droplet: Droplet,
  oil: Droplet,
  disc: Disc,
  brakes: Disc,
  engine: Engine,
  diagnostics: ScanLine,
  scan: ScanLine,
  gauge: Gauge,
  snowflake: Snowflake,
  fan: Fan,
  thermometer: Thermometer,
  wind: Wind,
  tire: Disc3,
  wheel: Disc3,
  battery: CarBattery,
  zap: Zap,
  wrench: Wrench,
  cog: Cog,
  transmission: Cog,
  car: Car,
  truck: Truck,
  fuel: Fuel,
  key: KeyRound,
  inspection: ClipboardCheck,
  shield: ShieldCheck,
  badge: BadgeCheck,
};

export const iconFor = (name) => ICONS[name] || Wrench;

export const wrap = 'mx-auto w-full max-w-page px-gutter';
/** Padding that lines a full-bleed edge up with the content column. */
export const edgeL = 'pl-[calc(max(0px,(100vw_-_1320px)/2)_+_clamp(16px,4vw,64px))]';
export const edgeLlg = 'lg:pl-[calc(max(0px,(100vw_-_1320px)/2)_+_clamp(16px,4vw,64px))]';
export const edgeR = 'pr-[calc(max(0px,(100vw_-_1320px)/2)_+_clamp(16px,4vw,64px))]';
export const pad = 'py-[clamp(4rem,8vw,6.5rem)]';
export const h2 =
  'font-heading text-[clamp(2rem,1.35rem+2.3vw,3.05rem)] font-bold leading-[1.04] tracking-[-0.01em] [text-wrap:balance] break-words';
export const cardTitle = 'font-heading font-bold uppercase leading-[1.1] tracking-[0.02em]';
const btn =
  'inline-flex min-h-[52px] items-center justify-center gap-2.5 px-6 py-2 text-center font-heading text-[16px] font-bold uppercase leading-tight tracking-[0.06em] no-underline transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
export const solid = `${btn} bg-primary text-[color:var(--on-primary)] hover:brightness-110 focus-visible:outline-primary`;
export const ghostDark = `${btn} border-[1.5px] border-white/50 text-white hover:border-white hover:bg-white/10 focus-visible:outline-white`;
export const outline = `${btn} border-[1.5px] border-ink/25 text-ink hover:border-primary hover:text-primary focus-visible:outline-primary`;
export const onDark = 'text-[color:var(--primary-lit)]';

export function Eyebrow({ children, dark = false, className = '' }) {
  return (
    <p
      className={`mb-4 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.16em] ${
        dark ? 'text-white/80' : 'text-primary'
      } ${className}`}
    >
      <span className={`h-1 w-7 flex-none ${dark ? 'bg-accent' : 'bg-primary'}`} aria-hidden="true" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/** The site's own address for one of its pages. */
export const href = (path = '') => `/${path}`;
