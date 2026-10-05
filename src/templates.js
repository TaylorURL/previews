/**
 * Every template, found by file name: src/templates/RealEstate.jsx answers to
 * the brand template "realestate". A template file exports its page as the
 * default, and may export `pages(b)`, the paths beyond the home page it draws
 * for that business ("services", "services/roof-repair", "about"). A template
 * that exports no `pages` is one page. Each path is prerendered on its own and
 * served at <slug>.taylorurl.com/<path>, and the page is handed it as `path`,
 * with the home page as ''.
 */

const modules = import.meta.glob('./templates/*.jsx', { eager: true });

export const TEMPLATES = Object.fromEntries(
  Object.entries(modules).map(([file, module]) => [file.slice(12, -4).toLowerCase(), module]),
);

/** Every path a business's site has, the home page first. */
export function pathsFor(brand) {
  const extra = TEMPLATES[brand?.template]?.pages?.(brand) ?? [];
  return ['', ...extra.filter((path) => path && /^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(path))];
}
