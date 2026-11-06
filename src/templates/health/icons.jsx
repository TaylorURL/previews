/**
 * The health template's icons: lucide's thin-line set, plus three drawn here
 * in the same 24px grid and stroke that lucide has no match for (a tooth, an
 * implant, a spine). A treatment gets its icon from the words in its title
 * first, since those say what it is better than a key chosen for another
 * template; then from its brand-file `icon` key; then the practice's own mark.
 */
import {
  Activity,
  Apple,
  Armchair,
  Award,
  Baby,
  BadgeCheck,
  Bone,
  Brain,
  CircleDot,
  ClipboardCheck,
  Crown,
  Dumbbell,
  Footprints,
  Gem,
  Hand,
  HeartHandshake,
  HeartPulse,
  Languages,
  Leaf,
  Moon,
  MoveVertical,
  PersonStanding,
  ScanLine,
  ShieldCheck,
  Siren,
  Smile,
  Sparkles,
  Stethoscope,
  Sun,
  Trophy,
  Users,
  Waves,
  WandSparkles,
  Zap,
  Car,
  Clock,
  CreditCard,
  Heart,
  House,
  Star,
  Timer,
  Wallet,
} from 'lucide-react';

function drawn(children, name) {
  function Icon({ size = 24, strokeWidth = 1.75, className = '', ...rest }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...rest}
      >
        {children}
      </svg>
    );
  }
  Icon.displayName = name;
  return Icon;
}

export const Tooth = drawn(
  <>
    <path d="M7.6 3.4c-2.6 0-3.9 2-3.9 4.8 0 2.8.9 5.2 1.7 7.4.7 2 1 4.9 2.6 4.9 1.6 0 1.7-2.7 2.3-4.3.4-1 1-1.4 1.7-1.4s1.3.4 1.7 1.4c.6 1.6.7 4.3 2.3 4.3 1.6 0 1.9-2.9 2.6-4.9.8-2.2 1.7-4.6 1.7-7.4 0-2.8-1.3-4.8-3.9-4.8-1.9 0-3.1 1.1-4.4 1.1S9.5 3.4 7.6 3.4Z" />
    <path d="M12 4.5c.9.5 1.9.8 3 .9" />
  </>,
  'Tooth',
);

export const Implant = drawn(
  <>
    <path d="M8.2 2.8h7.6a2.6 2.6 0 0 1 2.6 2.6v.9a3 3 0 0 1-3 3H8.6a3 3 0 0 1-3-3v-.9a2.6 2.6 0 0 1 2.6-2.6Z" />
    <path d="M9 11.6h6l-1.7 9.6h-2.6Z" />
    <path d="M9.3 14.4h5.4M9.8 17.3h4.4" />
  </>,
  'Implant',
);

export const Spine = drawn(
  <>
    <rect x="9.6" y="1.9" width="6" height="2.6" rx="1.1" />
    <path d="M7.4 3.2h1.6M16.2 3.2h1.6" />
    <rect x="8.7" y="6.3" width="6" height="2.6" rx="1.1" />
    <path d="M6.5 7.6h1.6M15.3 7.6h1.6" />
    <rect x="8.3" y="10.7" width="6" height="2.6" rx="1.1" />
    <path d="M6.1 12.0h1.6M14.9 12.0h1.6" />
    <rect x="8.9" y="15.1" width="6" height="2.6" rx="1.1" />
    <path d="M6.7 16.4h1.6M15.5 16.4h1.6" />
    <rect x="10.0" y="19.5" width="6" height="2.6" rx="1.1" />
    <path d="M7.8 20.8h1.6M16.6 20.8h1.6" />
  </>,
  'Spine',
);

// First match wins, so the narrow words come before the broad ones.
const BY_WORDS = [
  [/implant/i, Implant],
  [/emergenc|urgent|same[- ]day|toothache|walk-?ins?/i, Siren],
  [/whiten|bleach|zoom/i, Sparkles],
  [/veneer|cosmetic|aesthetic|esthetic|bonding|makeover|smile design|botox|filler/i, WandSparkles],
  [/invisalign|aligner|orthodont|braces|straighten/i, Smile],
  [/crown|bridge|onlay|inlay/i, Crown],
  [/denture|partials?\b/i, Smile],
  [/sedation|nitrous|anxi|relax|laughing gas|iv\b/i, Moon],
  [/sleep|apnea|snor|airway/i, Moon],
  [/tmj|tmd|jaw|bite|grind/i, Activity],
  [/pediatric|child|kids?\b|infant|baby|babies/i, Baby],
  [/prenatal|pregnan|webster|postpartum/i, HeartHandshake],
  [/periodont|gum|scaling|root planing/i, HeartPulse],
  [/x-?rays?|scan|imaging|cbct|3d|digital/i, ScanLine],
  [/laser|e-?stim|electric|ultrasound|shockwave/i, Zap],
  [/decompress|traction/i, MoveVertical],
  [/massage|soft tissue|myofascial|cupping|trigger point|graston|faktr/i, Hand],
  [/acupunct|needl/i, CircleDot],
  [/rehab|exercise|strength|stretch|physical therap|therapeutic|mobility/i, Dumbbell],
  [/sport|athlet/i, Trophy],
  [/injur|accident|auto\b|whiplash|car\b/i, Car],
  [/headache|migraine|concuss/i, Brain],
  [/posture|ergonom|scoliosis/i, PersonStanding],
  [/orthotic|foot|feet|gait/i, Footprints],
  [/nutrition|diet|weight|supplement/i, Apple],
  [/wellness|holistic|biological|natural|functional/i, Leaf],
  [/chiropract|adjust|spin|back|neck|subluxation|manipulat|activator/i, Spine],
  [/clean|hygien|prevent|check-?ups?|exams?|routine/i, ShieldCheck],
  [/family|all ages/i, Users],
  [/root canal|endodont|extraction|wisdom|oral surgery|surgical|filling|restor|general|dentist/i, Tooth],
];

// The keys the professional template's brand files carry, read for this template.
const BY_KEY = {
  smile: null,
  stethoscope: Stethoscope,
  bone: null,
  heart: HeartPulse,
  shield: ShieldCheck,
  'shield-check': ShieldCheck,
  'clipboard-check': ClipboardCheck,
  users: Users,
  footprints: Footprints,
  award: Award,
  gem: Gem,
  house: House,
  sparkles: Sparkles,
  baby: Baby,
  moon: Moon,
  sun: Sun,
  leaf: Leaf,
  zap: Zap,
  hand: Hand,
  armchair: Armchair,
  timer: Timer,
  waves: Waves,
  brain: Brain,
  bone2: Bone,
};

/** The practice's own mark: a tooth for a dental office, a spine for a chiropractor. */
export const kindIcon = (kind) => (kind === 'chiropractic' ? Spine : Tooth);

export function treatmentIcon(s, kind) {
  const words = `${s.title || ''} ${s.slug || ''}`;
  for (const [pattern, Icon] of BY_WORDS) if (pattern.test(words)) return Icon;
  return BY_KEY[s.icon] || kindIcon(kind);
}

// A highlight's icon is a free word; these are the words it is likely to be.
const HIGHLIGHT = [
  [/family|owned|kids|children/i, Users],
  [/years?|since|experience|decades?/i, Award],
  [/star|review|rated|rating/i, Star],
  [/insur|ppo|plan|accept/i, ShieldCheck],
  [/financ|pay|price|cost|afford|cash|wallet/i, Wallet],
  [/card|credit/i, CreditCard],
  [/language|spanish|español|bilingual|vietnamese|chinese/i, Languages],
  [/same[- ]day|emergenc|urgent|walk/i, Siren],
  [/hours?|evening|weekend|saturday|time|clock/i, Clock],
  [/tech|digital|laser|3d|scan|cbct/i, ScanLine],
  [/gentle|comfort|anxi|sedation|relax|calm/i, HeartHandshake],
  [/care|heart|love|compassion/i, Heart],
  [/certif|board|licensed|accredit|credential|award/i, BadgeCheck],
  [/natural|holistic|wellness|biological/i, Leaf],
  [/smile|cosmetic|whiten/i, Sparkles],
  [/doctor|dentist|chiropractor|dr\b/i, Stethoscope],
];

export function highlightIcon(h, kind) {
  const words = `${h.icon || ''} ${h.title || ''}`;
  for (const [pattern, Icon] of HIGHLIGHT) if (pattern.test(words)) return Icon;
  return kind === 'chiropractic' ? Spine : BadgeCheck;
}
