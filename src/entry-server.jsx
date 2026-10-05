import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import { SAMPLES, SLUGS, loadBrand } from './site.js';

export { SAMPLES, SLUGS };

/** One business's page as markup, and the brand it was drawn from. */
export function render(slug) {
  const brand = loadBrand(slug);
  return { html: renderToString(<App brand={brand} />), brand };
}
