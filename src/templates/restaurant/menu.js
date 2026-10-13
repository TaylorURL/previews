/**
 * The menu of a brand file read into one shape: every section with a slug and
 * its items as objects, whether the file wrote an item as a dish or as a bare
 * name.
 */

export const list = (value) => (Array.isArray(value) ? value : []);
export const paragraphs = (text) => (Array.isArray(text) ? text.filter(Boolean) : text ? [text] : []);

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const bare = (item) => !item.description && item.price == null && !list(item.tags).length && !item.image;

/** The menu's sections, in order, each with a unique slug and at least one item. */
export function sectionsOf(b) {
  const used = new Set();
  return list(b.menu)
    .filter((s) => s?.title)
    .map((s) => {
      const items = list(s.items)
        .map((item) => (typeof item === 'string' ? { name: item } : item))
        .filter((item) => item?.name);
      let slug = /^[a-z0-9-]+$/.test(s.slug || '') ? s.slug : slugify(s.title) || 'section';
      for (let n = 2; used.has(slug); n += 1) slug = `${slug.replace(/-\d+$/, '')}-${n}`;
      used.add(slug);
      // A section of names alone (sides, drinks, sauces) is drawn as a short list.
      return { ...s, slug, items, simple: items.every(bare) };
    })
    .filter((s) => s.items.length);
}

/** An item's price as the restaurant writes it; a bare number is set in dollars. */
export function priceOf(item) {
  const p = item.price;
  if (p == null || p === '') return null;
  if (typeof p === 'number') return `$${Number.isInteger(p) ? p : p.toFixed(2)}`;
  return String(p);
}

/**
 * The dishes the home page shows: the ones marked featured, or else the first
 * dish of each section, then the second, until there are enough.
 */
export function featuredOf(sections, max = 6) {
  const dishes = sections.filter((s) => !s.simple);
  const marked = dishes.flatMap((s) => s.items.filter((item) => item.featured));
  if (marked.length) return marked.slice(0, max);
  const out = [];
  for (let round = 0; out.length < max; round += 1) {
    const next = dishes.map((s) => s.items[round]).filter(Boolean);
    if (!next.length) break;
    out.push(...next.slice(0, max - out.length));
  }
  return out;
}
