import { readFileSync, readdirSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Writes each brand's hero image and font sheet into the page's boot script,
 * so both start downloading before the bundle has even arrived.
 */
function brandBoot() {
  return {
    name: 'brand-boot',
    transformIndexHtml(html) {
      const map = {};
      for (const file of readdirSync('src/brands')) {
        const brand = JSON.parse(readFileSync(`src/brands/${file}`, 'utf8'));
        const hero = brand.hero.image;
        const srcset = hero.startsWith('https://images.unsplash.com/')
          ? [640, 1000, 1400, 2000].map((w) => `${hero}?auto=format&fit=crop&q=65&w=${w} ${w}w`).join(', ')
          : `${hero}-800.webp 800w, ${hero}-1600.webp 1600w`;
        const sizes = {
          plumbing: '(max-width: 1024px) 100vw, 50vw',
          barber: '(max-width: 768px) 100vw, 45vw',
          realestate: '100vw',
        }[brand.template];
        map[file.replace(/\.json$/, '')] = { hero: srcset, sizes, fonts: brand.brand.fonts, title: brand.name };
      }
      return html.replace('__BRANDS__', JSON.stringify(map));
    },
  };
}

export default defineConfig({ plugins: [react(), brandBoot()] });
