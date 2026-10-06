import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import { loadBrand, resolvePath, resolveSlug } from './site.js';
import './index.css';

async function start() {
  const slug = resolveSlug();
  const brand = slug ? await loadBrand(slug) : null;
  const app = (
    <StrictMode>
      <App brand={brand} path={resolvePath()} />
    </StrictMode>
  );
  const root = document.getElementById('root');

  // A prerendered page already holds its markup; anywhere else the app draws it.
  if (root.hasChildNodes()) hydrateRoot(root, app);
  else createRoot(root).render(app);
}

start();
