import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import { SAMPLES, SLUGS, loadBrand } from './site.js';
import { pathsFor } from './templates.js';

export { SAMPLES, SLUGS, pathsFor };

/** One page of a business's site as markup, and the brand it was drawn from. */
export function render(slug, path = '') {
  const brand = loadBrand(slug);
  return { html: renderToString(<App brand={brand} path={path} />), brand };
}

/** The paths a business's site has. */
export function pathsOf(slug) {
  return pathsFor(loadBrand(slug));
}
