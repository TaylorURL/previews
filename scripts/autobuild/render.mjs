// Draws every page of each named brand file with the server build, and says
// what is wrong with any of them: a page that throws, or one that prints a
// value that was never filled in.
//
//   node scripts/autobuild/render.mjs <ssr-dir> <slug>...
//
// Prints one JSON object: { "<slug>": ["problem", ...] }.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [ssr, ...slugs] = process.argv.slice(2);
const { renderBrand, pathsFor } = await import(pathToFileURL(join(ssr, 'entry-server.js')).href);
const LEFTOVER = /\bundefined\b|\bNaN\b|\[object Object\]|\bnull\b(?![-\w])/;
const out = {};
for (const slug of slugs) {
  const problems = [];
  try {
    const brand = { slug, ...JSON.parse(readFileSync(join('src', 'brands', `${slug}.json`), 'utf8')) };
    for (const path of pathsFor(brand)) {
      let html;
      try {
        html = renderBrand(brand, path);
      } catch (error) {
        problems.push(`/${path} throws: ${String(error.message).slice(0, 160)}`);
        continue;
      }
      const text = html
        .replace(/<script[\s\S]*?<\/script>/g, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&#x27;|&#39;/g, "'")
        .replace(/&quot;/g, '"');
      const hit = text.match(LEFTOVER);
      if (hit) problems.push(`/${path} prints "${hit[0]}"`);
      if (!text.includes(brand.shortName)) problems.push(`/${path} never names the business`);
    }
  } catch (error) {
    problems.push(`unreadable: ${error.message}`);
  }
  out[slug] = problems;
}
console.log(JSON.stringify(out));
