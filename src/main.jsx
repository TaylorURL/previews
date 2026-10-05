import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import { loadBrand, resolveSlug } from './site.js';
import './index.css';

const slug = resolveSlug();
const app = (
  <StrictMode>
    <App brand={slug ? loadBrand(slug) : null} />
  </StrictMode>
);
const root = document.getElementById('root');

// A prerendered page already holds its markup; anywhere else the app draws it.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
