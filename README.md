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

Previews are built by the preview routine on the Pi each weekday morning, one for every prospect whose
third letter is due: two letters sent, the second at least five days ago. It reads that list from
`preview_candidates()`, oldest due first, writes the brand files here a batch at a time, lands them, and sends
each letter through taylorurl.com's `/api/outreach/previews` once the site is live, so the third letter never goes
without its site. Whatever one run cannot reach in its time is at the head of the next run's list. A business no
site can be built for is recorded with `routine.py skip` and stops being offered.

Most previews are built by a script rather than a session. `python3 -m scripts.autobuild.pipeline` reads the
due list, builds each business's brand file and pictures from its own website and the phone, address, rating and review
count stored from its Google listing when it was found (`scripts/autobuild/`), asking no Google API, and runs the
checks before anything lands: required fields, the phone, address and rating against those stored values, no quoted
review (nothing stored holds review text, so a page shows the rating and count alone), about text word for word
from their site, no placeholder or other business's name, every page drawn by the server build, and the built home
page opened at desktop and phone size with nothing wider than the screen and no empty section. A business that
fails any check is parked on its prospect row with the reason, and only parked businesses are left to the session.
`--dry` builds and checks without landing, registering or sending; `--send` sends the letters of the sites it proved
live, no more in a day than the outreach machine's daily cap. `*.taylorurl.com` points at this project, so a pushed
brand file is a live subdomain. `scripts/routine.py` is the database and mail half of that run.

Logos and photos pass a gate of their own. A logo (`logo.py`) is taken from the business's own site, an inline SVG
included, and its solid ground is cut to transparency from the edges in, keeping the soft edge. The header behind it
is painted the ground it reads on (`logoGround`), white or its own color, so it never sits in a box; where a
footer's ground differs the name is set in type instead, and a mark whose name cannot be read at header size
(`logoName`) carries the name beside it. A logo on a picture or pattern, too small for the header, blurry or too
faint to read is refused, and with no logo that sits cleanly the name is set in type where the logo goes.
A missing logo never parks or skips a business. A photo (`quality.py`) must be
large enough for its slot, sharp, free of heavy compression, not a graphic, banner or screenshot, not the logo, and
not a near copy of another photo, and it must crop to its slot without losing most of itself; the best photo takes
the hero, and a page with too few good ones is drawn without them. When the `claude` command is present, a model
that sees (`vision.py`) also screens the photos, judges the logo on its ground, and looks at the built page at
desktop and phone size (`visual.py`); a failed look parks the business, and `PREVIEW_VISION=off` leaves the
arithmetic alone. The checks need `numpy` and `Pillow`. A session building by hand runs the same gate: `python3 -m
scripts.autobuild.gate logo <url> <slug>` prepares a logo and prints its brand fields, `gate photo <file>...` judges
photos, and `gate check <slug>...` runs every check on a built brand after `npm run build`.
