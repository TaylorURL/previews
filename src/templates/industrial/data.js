/**
 * What the industrial template reads off a brand file beyond the fields it
 * draws as they are: the colors it derives for its dark grounds, the facts it
 * lifts into sections of their own, and the short specifications the hero
 * carries. Nothing here writes a word the business did not: a fact lifted out
 * of `facts` is drawn in its section instead of the facts block, never twice
 * and never reworded.
 */
import { luminance } from '../../site.js';
import { hexOr, mixHex } from '../shared.jsx';

export const list = (v) => (Array.isArray(v) ? v : []);
const text = (v) => String(v ?? '').trim();

/* ------------------------------------------------------------------ colors */

/** WCAG contrast between two #rrggbb colors. */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** How far a color is from gray, 0 to 255. */
export function chroma(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hexOr(hex, '#808080').slice(i, i + 2), 16));
  return Math.max(...c) - Math.min(...c);
}

/** Ink or white, whichever reads on `hex`. */
export function inkOn(hex, ink = '#11161c') {
  return contrast(hex, '#ffffff') >= contrast(hex, ink) ? '#ffffff' : ink;
}

/**
 * The template's palette from the brand's own colors. `steel` is the dark
 * ground of the hero, the bands and the footer: the brand's deep color taken
 * most of the way to a blue-black, so a pale or bright brand still gets a
 * ground white type reads on. `hi` is the mark drawn on it (rules, numbers,
 * the quote button): the accent when it stands out from the steel, else the
 * primary, else whichever of them is lifted toward white until it does. A
 * brand with no color in it, a charcoal and nothing else, marks in white.
 */
export function palette(brand = {}) {
  const ink = hexOr(brand.ink, '#11161c');
  const primary = hexOr(brand.primary, '#1f3a52');
  const deep = hexOr(brand.primaryDeep, mixHex(primary, '#000000', 0.55));
  const accent = hexOr(brand.accent, '');
  let steel = mixHex(deep, '#0b0e13', 0.66);
  // A light deep color (a gold, a lime) still has to carry white type.
  for (let i = 0; luminance(steel) > 0.035 && i < 8; i += 1) steel = mixHex(steel, '#05070a', 0.25);
  const night = mixHex(steel, '#000000', 0.35);
  // A gray brand (a charcoal with no accent) has no color to lift: its mark
  // on the dark ground is white, which reads as intended rather than as a
  // disabled gray.
  const candidates = [accent, primary].filter((c) => c && chroma(c) >= 40);
  let hi = candidates.find((c) => contrast(c, steel) >= 3.2 && luminance(c) < 0.85);
  if (!hi && candidates.length) {
    hi = candidates[0];
    for (let i = 0; contrast(hi, steel) < 3.2 && i < 12; i += 1) hi = mixHex(hi, '#ffffff', 0.18);
  }
  if (!hi) hi = '#ffffff';
  // On white the primary carries the buttons; one too pale for white type
  // keeps its fill and takes ink, and as text it is drawn in its deep shade.
  const onPrimary = inkOn(primary, ink);
  const pt = contrast(primary, '#ffffff') >= 3 ? primary : contrast(deep, '#ffffff') >= 3 ? deep : ink;
  // The accent as a mark on white: only when it reads there.
  const mark = accent && contrast(accent, '#ffffff') >= 2.4 ? accent : pt;
  // White on a button reads at 3:1 for type this heavy and large, and looks
  // more deliberate on a strong color than ink does.
  const onHi = contrast(hi, '#ffffff') >= 3 ? '#ffffff' : ink;
  return { ink, primary, deep, steel, night, hi, onHi, onPrimary, pt, mark };
}

/* ------------------------------------------------------------------- facts */

const URLISH = /(?:https?:\/\/|www\.|\b[\w-]+\.(?:com|net|org|us|io)\/)/i;

/** The name before a colon or a dash, and the words after it: "Marine: pumps and cylinders". */
export function split(item) {
  const s = text(item);
  const m = s.match(/^(.{2,56}?)(?::\s+|\s+[—–]\s+|\s+-\s+)(.+)$/);
  return m ? { name: m[1].trim(), detail: m[2].trim() } : { name: s, detail: '' };
}

const KINDS = [
  // Who they work for. A list of short names only; a paragraph stays a fact.
  {
    key: 'industries',
    heading: /^(?:industries|markets|sectors)(?:\s+(?:served|we serve))?$|^who we serve$/i,
    take: (f) => list(f.items).length >= 2 && list(f.items).every((i) => split(i).name.length <= 72),
  },
  // Certifications, accreditations, memberships, codes, the safety record.
  {
    key: 'credentials',
    heading:
      /certif|accredit|licens|membership|associations?$|^codes\b|safety (?:record|awards?|and compliance|culture|statement)|^insurance$|authori[sz]ed|factory authori/i,
    take: () => true,
  },
  // What the shop runs and how big it is.
  {
    key: 'equipment',
    heading: /^(?!.*\bwe\b)(?:.*\bequipment|.*\bcapacity|the fleet|(?:the|our) (?:shop|facility)|.*\bfacility)$/i,
    take: (f) => !/equipment list/i.test(f.heading),
  },
  // How a job goes, in the business's own steps.
  {
    key: 'steps',
    heading: /^how (?:a|an|our) /i,
    take: (f) => list(f.items).length >= 3 && list(f.items).length <= 8,
  },
  // Where they are, beyond the one address.
  {
    key: 'locations',
    heading: /^(?:our |other |marine |corporate )?(?:locations|offices)$|^office$/i,
    take: (f) => list(f.items).length >= 1,
  },
  // Work done, named by the business.
  {
    key: 'record',
    heading: /projects|track record|project success/i,
    take: (f) => list(f.items).length >= 2,
  },
];

/**
 * The brand's facts sorted into the sections this template has a place for.
 * A fact whose items carry a web address stays with the facts block, which
 * knows how to set one out as a link.
 */
export function sortFacts(b) {
  const out = { industries: [], credentials: [], equipment: [], steps: [], locations: [], record: [], rest: [] };
  for (const fact of list(b.facts)) {
    if (!fact?.heading || !(fact.text || list(fact.items).length)) continue;
    const linked = list(fact.items).some((i) => URLISH.test(i)) || URLISH.test(fact.text || '');
    const kind = linked ? null : KINDS.find((k) => k.heading.test(text(fact.heading)) && k.take(fact));
    // A field of the brand's own wins over a fact of the same kind.
    if (kind?.key === 'industries' && list(b.industries).length) out.rest.push(fact);
    else if (kind?.key === 'steps' && list(b.steps).length) out.rest.push(fact);
    else if (kind) out[kind.key].push(fact);
    else out.rest.push(fact);
  }
  return out;
}

/** Everything the template draws, gathered once per page. */
export function gather(b) {
  const facts = sortFacts(b);
  const industries = list(b.industries).length
    ? list(b.industries).map((i) => (typeof i === 'string' ? { name: i, detail: '' } : { name: text(i?.name || i?.title), detail: text(i?.text) }))
    : facts.industries.flatMap((f) => list(f.items).map(split));
  const steps = list(b.steps).length
    ? list(b.steps).filter((s) => s?.title)
    : facts.steps.flatMap((f) => list(f.items).map((i) => {
        const { name, detail } = split(i);
        return detail ? { title: name, text: detail } : { title: name, text: '' };
      }));
  // Credentials: the brand's own list, its state licenses, then the facts.
  const credentials = [
    ...list(b.credentials).filter((c) => c?.label).map((c) => ({ label: text(c.label), detail: text(c.detail) })),
    ...list(b.licenses).filter((l) => l?.label).map((l) => ({ label: text(l.label), detail: text(l.number) })),
  ];
  const credentialFacts = facts.credentials;
  const projects = list(b.projects).filter((p) => p?.title);
  return {
    industries: industries.filter((i) => i.name),
    steps: steps.filter((s) => s.title),
    stepsHeading: list(b.steps).length ? '' : text(facts.steps[0]?.heading),
    credentials,
    credentialFacts,
    equipment: facts.equipment,
    locations: facts.locations,
    record: facts.record,
    rest: facts.rest,
    projects,
    states: list(b.statesServed).map(text).filter(Boolean),
    areas: list(b.serviceArea).map(text).filter(Boolean),
    phones: list(b.phones).filter((p) => p?.number),
    highlights: list(b.highlights).filter((h) => h?.title).slice(0, 4),
    reviews: list(b.reviews).filter((r) => r?.text).slice(0, 3),
  };
}

/* -------------------------------------------------------------------- hero */

export function heroStyleOf(b) {
  const style = b.heroStyle;
  if (style === 'type') return 'type';
  if (!b.hero?.image) return 'type';
  return style === 'photo' ? 'photo' : 'split';
}

const STATE_CODES = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA', colorado: 'CO', connecticut: 'CT',
  delaware: 'DE', florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD', massachusetts: 'MA', michigan: 'MI',
  minnesota: 'MN', mississippi: 'MS', missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC',
  'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI',
  'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT', vermont: 'VT',
  virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI', wyoming: 'WY',
};

/** A state's postal code, or the name as written when it is not a state. */
export function stateCode(name) {
  const s = text(name);
  if (/^[A-Z]{2}$/.test(s)) return s;
  return STATE_CODES[s.toLowerCase()] || null;
}

/** The states as their codes when there are several, as written when there are few. */
export function statesLine(states) {
  if (states.length <= 2) return states.join(' and ');
  const codes = states.map(stateCode);
  return codes.every(Boolean) ? codes.join(' · ') : states.join(', ');
}

/**
 * The few facts the hero sets along its foot, each only when the brand has
 * it: the year, the base, the states or towns covered, who they work for,
 * the 24-hour line, the hours, a credential, then the rating last.
 */
export function specsOf(b, g) {
  const specs = [];
  if (b.since) specs.push({ label: 'Established', value: String(b.since) });
  if (b.town) specs.push({ label: 'Based in', value: `${b.town}${b.state ? `, ${b.state}` : ''}` });
  if (g.states.length) specs.push({ label: g.states.length === 1 ? 'State served' : 'States served', value: statesLine(g.states) });
  else if (g.areas.filter((a) => a !== b.town).length >= 1) {
    const shown = [];
    for (const a of g.areas) {
      if (shown.length && [...shown, a].join(', ').length > 30) break;
      shown.push(a);
    }
    const more = g.areas.length - shown.length;
    specs.push({ label: 'Serving', value: `${shown.join(', ')}${more ? ` and ${more} more` : ''}` });
  }
  if (g.industries.length) {
    // As many names as fit one short line, the rest counted after them.
    const names = [];
    for (const { name } of g.industries) {
      if (names.length && [...names, name].join(' · ').length > 40) break;
      names.push(name);
    }
    const more = g.industries.length - names.length;
    specs.push({ label: 'Industries', value: `${names.join(' · ')}${more ? ` and ${more} more` : ''}` });
  }
  if (b.emergency?.title) specs.push({ label: 'After hours', value: b.emergency.title });
  else if (list(b.hours)[0]) specs.push({ label: b.hours[0][0], value: b.hours[0][1] });
  const cred = g.credentials[0]?.label || split(list(g.credentialFacts[0]?.items)[0] || '').name;
  if (cred && cred.length <= 34) specs.push({ label: 'Credentials', value: cred });
  if (b.rating && b.reviewCount) specs.push({ label: 'Google rating', value: `${Number(b.rating).toFixed(1)} from ${b.reviewCount} reviews`, rating: true });
  return specs.slice(0, 4);
}

/* ------------------------------------------------------------------- type */

/** Faces drawn narrow, which carry uppercase display type well. */
export function condensed(stack = '') {
  return /condensed|narrow|oswald|bebas|anton|teko|league gothic|fjalla|antonio|big shoulders|saira extra/i.test(stack.split(',')[0]);
}

/** The headline's size by its length, so a long one is not seven lines tall. */
export function headlineSize(title) {
  const n = text(title).length;
  if (n > 72) return 'text-[clamp(2rem,1.2rem+2.4vw,3.05rem)]';
  if (n > 52) return 'text-[clamp(2.15rem,1.25rem+2.7vw,3.45rem)]';
  if (n > 34) return 'text-[clamp(2.3rem,1.3rem+3.2vw,4rem)]';
  return 'text-[clamp(2.5rem,1.4rem+3.8vw,4.6rem)]';
}

/** Two digits: 01, 02. */
export const nn = (i) => String(i).padStart(2, '0');
