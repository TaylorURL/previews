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
        // A page drawn without a hero photo has nothing to preload.
        const hero = brand.hero?.image;
        const srcset = !hero
          ? null
          : hero.startsWith('https://images.unsplash.com/')
            ? [640, 1000, 1400, 2000].map((w) => `${hero}?auto=format&fit=crop&q=65&w=${w} ${w}w`).join(', ')
            : `${hero}-800.webp 800w, ${hero}-1600.webp 1600w`;
        const sizes = {
          plumbing: '(max-width: 1024px) 100vw, 50vw',
          barber: '(max-width: 768px) 100vw, 45vw',
          realestate: '100vw',
          hvac: '(max-width: 1024px) 100vw, 50vw',
          autorepair: '(max-width: 1024px) 100vw, 50vw',
          professional: '(max-width: 1024px) 100vw, 50vw',
          salon: '(max-width: 768px) 100vw, 45vw',
        }[brand.template] ?? '100vw';
        map[file.replace(/\.json$/, '')] = { hero: srcset, sizes, fonts: brand.brand.fonts, title: brand.name };
      }
      return html.replace('__BRANDS__', JSON.stringify(map));
    },
  };
}

export default defineConfig({ plugins: [react(), brandBoot()] });
