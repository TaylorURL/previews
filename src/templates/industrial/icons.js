/**
 * The icons the industrial template draws: a capability group's, keyed by the
 * same words the hvac brand files use (so a file moved across keeps its
 * icons), and an industry's or a highlight's, read off its name.
 */
import {
  Anchor,
  BadgeCheck,
  BatteryCharging,
  Building2,
  Cable,
  Car,
  ChartLine,
  Church,
  CircuitBoard,
  ClipboardList,
  Clock3,
  Container,
  DraftingCompass,
  Droplets,
  Factory,
  Fan,
  Flame,
  FlaskConical,
  Fuel,
  Gauge,
  HardHat,
  GraduationCap,
  Hospital,
  House,
  Landmark,
  Leaf,
  Lightbulb,
  Medal,
  Microscope,
  PencilRuler,
  Pickaxe,
  Plane,
  Plug,
  Power,
  Settings,
  ShieldCheck,
  Ship,
  ShoppingCart,
  Snowflake,
  Sun,
  Thermometer,
  Timer,
  Tractor,
  TrainFront,
  Truck,
  Users,
  Utensils,
  Waves,
  Wind,
  Wrench,
  Zap,
  Briefcase,
  Boxes,
  Award,
  Flag,
} from 'lucide-react';

const GROUP = {
  snowflake: Snowflake,
  flame: Flame,
  wind: Wind,
  zap: Zap,
  wrench: Wrench,
  'air-vent': Fan,
  thermometer: Thermometer,
  fan: Fan,
  heater: Flame,
  gauge: Gauge,
  filter: Settings,
  droplets: Droplets,
  waves: Waves,
  circuit: CircuitBoard,
  plug: Plug,
  power: Power,
  ev: Plug,
  lightbulb: Lightbulb,
  shield: ShieldCheck,
  sun: Sun,
  home: House,
  building: Building2,
  cable: Cable,
  settings: Settings,
  leaf: Leaf,
  battery: BatteryCharging,
  car: Car,
  timer: Timer,
  compass: DraftingCompass,
  ruler: PencilRuler,
  chart: ChartLine,
  clipboard: ClipboardList,
  'hard-hat': HardHat,
  briefcase: Briefcase,
  ship: Ship,
  anchor: Anchor,
  factory: Factory,
  truck: Truck,
  boxes: Boxes,
};

export function groupIcon(name) {
  return GROUP[name] || Settings;
}

const INDUSTRY = [
  [/petro|chemic/i, FlaskConical],
  [/refin|downstream|plant/i, Factory],
  [/oil|gas|upstream|midstream|pipeline|lng|fuel|energy/i, Fuel],
  [/power|electric|utilit/i, Zap],
  [/offshore|subsea|stevedor|port/i, Anchor],
  [/marine|ship|vessel|maritime|tanker|barge/i, Ship],
  [/aero|aviation|space/i, Plane],
  [/mining|quarr/i, Pickaxe],
  [/epc|construct|infrastructure|civil|contractor|heavy equipment/i, HardHat],
  [/municipal|government|public|federal|military|defen[cs]e/i, Landmark],
  [/renewable|solar|wind|hydrogen|carbon/i, Wind],
  [/rail/i, TrainFront],
  [/food|beverage|hospitality|restaurant/i, Utensils],
  [/medical|health|hospital|pharma/i, Hospital],
  [/water|wastewater/i, Droplets],
  [/transport|logistic|freight|truck|distribut/i, Truck],
  [/instrument|controls?\b|automation/i, Gauge],
  [/storage|tank|terminal|warehouse/i, Container],
  [/agri|farm/i, Tractor],
  [/research|lab|scien/i, Microscope],
  [/educat|school|universit|college|campus/i, GraduationCap],
  [/financ|bank|credit union|insurance/i, Landmark],
  [/grocer|supermarket|convenience/i, ShoppingCart],
  [/relig|church|worship|faith|ministr/i, Church],
  [/commercial|retail|office|corporate/i, Building2],
  [/manufactur|industrial|fabricat|steel|metal/i, Factory],
  [/mro|maintenance|repair/i, Wrench],
];

/**
 * An industry's icon, read off its name; a client's building when nothing
 * fits, since a bare hex head reads as a missing picture.
 */
export function industryIcon(name) {
  return INDUSTRY.find(([re]) => re.test(name))?.[1] || Building2;
}

const HIGHLIGHT = [
  [/safe|shield|insur/i, ShieldCheck],
  [/certif|licens|accredit|iso|asme|api|aws/i, BadgeCheck],
  [/award|medal|honou?r/i, Award],
  [/veteran|flag/i, Flag],
  [/family|team|crew|people|owner/i, Users],
  [/time|fast|speed|hour|day|clock/i, Clock3],
  [/year|since|experience/i, Medal],
  [/ship|marine|vessel|port/i, Ship],
  [/truck|deliver|fleet/i, Truck],
  [/stock|inventory|warehouse|supply/i, Boxes],
  [/shop|plant|factory|facility/i, Factory],
];

/** A highlight's icon from the free word it carries, or from its title. */
export function highlightIcon(word = '', title = '') {
  const key = `${word} ${title}`;
  return HIGHLIGHT.find(([re]) => re.test(key))?.[1] || GROUP[word] || BadgeCheck;
}
