// Writes each business's page into its own document after the build, so a
// reader on a slow phone is served the page itself rather than an empty shell
// waiting on the bundle. vercel.json sends <slug>.taylorurl.com to /b/<slug>.
//
//     node scripts/prerender.js      (npm run build runs it)

import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = 'dist';
const SSR = 'node_modules/.previews-ssr';
const shell = readFileSync(join(DIST, 'index.html'), 'utf8');
const { render, SLUGS, SAMPLES } = await import(pathToFileURL(join(process.cwd(), SSR, 'entry-server.js')).href);

const escape = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** The hero photograph, preloaded with the same candidates its img offers. */
function heroPreload(body) {
  const tag = body.match(/<img\s[^>]*fetchPriority="high"[^>]*>/i)?.[0];
  if (!tag) return '';
  const attr = (name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))?.[1];
  const srcset = attr('srcSet') || attr('srcset');
  const sizes = attr('sizes');
  if (!srcset) return `<link rel="preload" as="image" href="${attr('src')}" fetchpriority="high" />`;
  return `<link rel="preload" as="image" imagesrcset="${srcset}"${sizes ? ` imagesizes="${sizes}"` : ''} fetchpriority="high" />`;
}

// React writes a preload beside an image it is told to fetch early. Rendered to
// a string there is no head to put it in, so it comes out of the body.
const BODY_PRELOAD = /<link\s[^>]*rel="preload"[^>]*as="image"[^>]*\/?>/gi;

// The stylesheet is small enough to ship inside each document, which saves the
// request a phone would otherwise wait on before drawing anything.
const cssHref = shell.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/);
const inlined = cssHref
  ? shell.replace(cssHref[0], `<style>${readFileSync(join(DIST, cssHref[1]), 'utf8')}</style>`)
  : shell;

const label = Object.fromEntries(Object.entries(SAMPLES).map(([name, slug]) => [slug, name]));
mkdirSync(join(DIST, 'b'), { recursive: true });

for (const slug of SLUGS) {
  const { html, brand } = render(slug);
  const body = html.replace(BODY_PRELOAD, '');
  const head = [
    `<title>${escape(`${brand.name} | ${brand.town}, ${brand.state}`)}</title>`,
    // Fonts never hold up the first frame: the page paints in the fallback
    // and swaps when the brand's faces arrive.
    `<link rel="preload" as="style" href="${brand.brand.fonts}" onload="this.onload=null;this.rel='stylesheet'" />`,
    `<noscript><link rel="stylesheet" href="${brand.brand.fonts}" /></noscript>`,
    heroPreload(body),
    `<script>window.__SLUG__ = ${JSON.stringify(slug)};</script>`,
  ].join('\n    ');
  const page = inlined
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/<script id="boot">[\s\S]*?<\/script>/, head)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  const name = label[slug] || slug;
  writeFileSync(join(DIST, 'b', `${name}.html`), page);
  console.log(`prerendered ${name}`);
}

// The shell moves out of the root. Vercel serves a file that exists before it
// reads a rewrite, so with index.html in place the host rule never ran.
renameSync(join(DIST, 'index.html'), join(DIST, 'b', 'shell.html'));
rmSync(SSR, { recursive: true, force: true });
