import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import { SAMPLES, SLUGS } from './site.js';
import { pathsFor } from './templates.js';

export { SAMPLES, SLUGS, pathsFor };

// The server reads every brand at once: it draws every business in one pass.
const brands = import.meta.glob('./brands/*.json', { import: 'default', eager: true });

function loadBrand(slug) {
  const brand = brands[`./brands/${slug}.json`];
  return brand ? { slug, ...brand } : null;
}

/** One page of a business's site as markup, drawn from the brand it is handed. */
export function renderBrand(brand, path = '') {
  return renderToString(<App brand={brand} path={path} />);
}

/** One page of a business's site as markup, and the brand it was drawn from. */
export function render(slug, path = '') {
  const brand = loadBrand(slug);
  return { html: renderBrand(brand, path), brand };
}

/** The paths a business's site has. */
export function pathsOf(slug) {
  return pathsFor(loadBrand(slug));
}
