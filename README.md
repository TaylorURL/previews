# Previews

Sites TaylorURL builds in a prospect's own brand and sends in outreach, so the pitch is their new site rather
than a description of one.

| Template | Prospect preview | Sample |
| :--- | :--- | :--- |
| Plumbing | https://wedgeworthplumbing.taylorurl.com | https://plumbing.taylorurl.com |
| Barber | https://houranisbarbershop.taylorurl.com | https://barber.taylorurl.com |
| Real estate | https://styledrealestate.taylorurl.com | https://realestate.taylorurl.com |

Each business is one file in `src/brands/<slug>.json`: its facts, colors, fonts, logo and copy, with its
photos under `public/brands/<slug>/` as `-800` and `-1600` webp. The subdomain is the slug, so a new preview
is a brand file, its images, and the subdomain added to the Vercel project. `plumbing`, `barber` and
`realestate` are the templates' sample businesses. Anywhere else, `?b=<slug>` picks one.

A preview never borrows a fact from another business. Reviews are the business's own, quoted from its site
or Google listing, and anything unknown is left out rather than filled in. Every page is `noindex` and
carries a strip saying it is a preview.

Views are counted in `preview_sites` on Supabase project `gujgtjqqurildqurpffh`, through the
`preview_site(industry, slug)` function. The table grants the browser nothing.

What a visit does on the site is recorded by `src/track.js`, a few KB loaded once the page is idle: pages, scroll
depth, time per section, clicks and taps, lingering hovers, rage and dead clicks, form fields by name (never what
is typed), and idle and hidden time. It runs only for a visit the view count would count and only once the page
has been looked at, and posts batches to taylorurl.com's `/api/preview-events`, which writes `preview_sessions` and
`preview_events` and drops anything from the studio's own connections through the same `preview_view_ours()` the
view count asks.

Styling is Tailwind. The brand's colors and fonts are custom properties set on each template's root, and
`tailwind.config.js` names them, so one set of utilities dresses every business.

```bash
npm install
npm run dev      # http://localhost:5173/?b=wedgeworthplumbing
npm run build
```

Previews are built by the preview routine on the Pi, ten each weekday: it picks prospects with
`preview_candidates()`, writes their brand files here, lands them, and sends each letter through
taylorurl.com's `/api/outreach/previews`. `*.taylorurl.com` points at this project, so a pushed brand file is
a live subdomain. `scripts/routine.py` is the database and mail half of that run.
