# Previews

Preview websites built in a local business's own brand, linked from TaylorURL's outreach emails.

Each preview is made from the business's name, logo, colors, photos and details. It lives at `<business>.taylorurl.com`, has a bar across the top saying it's a preview, and is hidden from search engines. A brand file marked `draft` is a rough draft someone asked for, not an outreach preview. Its bar says so.

Those live in one brand file per business, `src/brands/<slug>.json`, with the details, colors, fonts, logo and copy. Photos go in `public/brands/<slug>/` as webp at 800 and 1600 wide. Every fact comes from the business's own website and Google listing. Nothing is borrowed from another business, and anything unknown is left out rather than guessed.

`vercel.json` rewrites `<slug>.taylorurl.com` to `/b/<slug>`, and every path gets `X-Robots-Tag: noindex, nofollow`. A template name like plumbing or salon resolves to that template's sample business. Each brand is its own chunk, so a page only loads one business, and `scripts/prerender.js` writes every page of every business after the build.

<details>
<summary>Templates</summary>

Every template has a sample business:

| Template              | Sample                                                           |
| :-------------------- | :--------------------------------------------------------------- |
| Auto repair           | [autorepair.taylorurl.com](https://autorepair.taylorurl.com)     |
| Barber                | [barber.taylorurl.com](https://barber.taylorurl.com)             |
| Fitness               | [fitness.taylorurl.com](https://fitness.taylorurl.com)           |
| Flooring              | [flooring.taylorurl.com](https://flooring.taylorurl.com)         |
| HVAC                  | [hvac.taylorurl.com](https://hvac.taylorurl.com)                 |
| Industrial            | [industrial.taylorurl.com](https://industrial.taylorurl.com)     |
| Plumbing              | [plumbing.taylorurl.com](https://plumbing.taylorurl.com)         |
| Printing              | [printing.taylorurl.com](https://printing.taylorurl.com)         |
| Professional services | [professional.taylorurl.com](https://professional.taylorurl.com) |
| Real estate           | [realestate.taylorurl.com](https://realestate.taylorurl.com)     |
| Recreation            | [recreation.taylorurl.com](https://recreation.taylorurl.com)     |
| Restaurant            | [restaurant.taylorurl.com](https://restaurant.taylorurl.com)     |
| Roofing               | [roofing.taylorurl.com](https://roofing.taylorurl.com)           |
| Salon                 | [salon.taylorurl.com](https://salon.taylorurl.com)               |

</details>

## Checking a brand file

Most brand files come out of `scripts/autobuild/`, which reads the business's website, builds the preview and checks it before it lands. A hand-written one goes through the same gate:

```bash
npm run build
python3 -m scripts.autobuild.gate check <slug>
```

That checks the facts' shape, the pictures and logo, every server-rendered page, and the home page at desktop and phone size, and exits 1 on any problem. `gate logo <url> <slug>` cuts a logo's background away and writes `logo.webp` plus a one-color `logo-mono.webp`, or refuses a logo that can't sit cleanly. `gate photo <file>` says whether a photo can be used and in which slot. `gate facts <slug> <site.json>` lists what the business's own website tells a customer that the brand file doesn't. It needs Python with `numpy` and `Pillow`.

## Better than what they have

A preview that passes the review is then set beside the business's own website: `scripts/autobuild/versus.py` photographs both home pages the same way (the top on a desktop and a phone, which is all the letter shows, and the whole desktop page) and asks one model which is better for the business, without saying which is the preview. Each site gets a score out of 10, and only a preview that scores at least 6, leads by 1.5 and is called clearly better gets its letter. One that isn't is parked with why ("not clearly better than their current site: ..."), and each run's report carries every site's scores and its three lowest. To compare one by hand:

```bash
npm run build
python3 -m scripts.autobuild.versus <slug> <their-website> [trade]
```

## How a preview is filled

`scripts/autobuild/build.py` reads the business's home page and the pages it links to, then fills the brand file in three steps, each through the `claude` command on the subscription (never an API key), at about three calls a business:

1. **The fact sheet** (`facts.py`). One call reads every page and the listing row and returns what they say: services with their own descriptions, highlights (family owned, bilingual, 24/7, founded year, warranties, free estimates, financing), every phone line with its label, languages, testimonials, credentials, the owner, industries and states served, their process, their story, what the home page leads with and a tone hint. Each item carries the words on the page that state it and the page's address. Arithmetic then keeps only the items whose words really are on that page (whitespace, case, quotes and dashes made alike) and whose claim is in those words, and the run's notes say what it dropped.
2. **The copy** (`write.py`, in the voice `voice.md` gives each family). One call writes the headline, lead, summary, the about section, two to four highlights, steps where their site describes a process, and blurbs for the services their site leaves undescribed, each sentence citing the facts it rests on. A headline says a benefit or their story; the town and services go in the lead.
3. **The proof**. A sentence is kept only when every number, year, phone, name, town, licence, price and claim word in it (best, free, 24/7, licensed, family owned...) is in the fact sheet or the listing, and a second call, shown only the facts and the copy, finds every claim supported. A sentence that fails is rewritten once with its problems named and checked again, then dropped. A part left without a sentence keeps the business's own words.

Reviews are quoted word for word only: up to three recent four- and five-star Google reviews (Places API, Place Details) when `PLACES_API_KEY` is set and the row has a `place_id`, with the author as first name and last initial, else the testimonials on their own site. The check (`check.py`) proves every written sentence against the fact sheet again, every review against the Places answer or their pages, and every phone line, language, credential and name against their pages. What a build read and wrote is kept in `.autobuild/facts/<slug>.json`.

Photos come from their own pages. When the page source gives fewer than four, or none big enough for the hero, `photos.mjs` opens the pages in a headless browser, scrolls them so lazy-loaded pictures appear, follows a gallery link, and takes every picture shown, CSS backgrounds included, at the largest size the site builder (GoDaddy, Wix, Squarespace, Duda, WordPress) will serve. Every photo then has to pass the quality checks and the vision check, and is measured again once saved. Rebuilding a preview whose site no longer has a hero-size photo keeps that preview's own photos.

The brand also gets `heroStyle` (photo for a wide, strong photo; split for a decent one; type with none) and `tone` (classic when their headings are set in a serif or the fact sheet reads them as traditional, else bold). A business with no usable logo is never parked for it; its name is set in type.

The outdoor and industrial templates read the hvac brand shape and health the professional one, so the same builder fills them; the template comes from the prospect's `industry`.

`python3 -m scripts.autobuild.selftest_facts` proves the fact sheet's quote checks, the copy's support checks, the Places review picker (against an answer recorded in Google's documented shape) and the check's review and phone proofs, with no model asked.

| Variable | What it does |
| :-- | :-- |
| `PREVIEW_WRITE=off` | No fact sheet and no written copy: the brand is made from their own words, as before. |
| `PLACES_API_KEY` | Turns on Google review quotes. `PREVIEW_REVIEWS=off` turns them off with the key set. |
| `PREVIEW_FACTS_MODEL`, `PREVIEW_WRITE_MODEL`, `PREVIEW_CHECK_MODEL` | The model for each call (default `PREVIEW_VISION_MODEL`, else `claude-sonnet-5-5`). |
| `PREVIEW_WRITE_TIMEOUT` | Seconds one call may take (420). |

## Businesses the script can't finish

When the script parks a business, it keeps what it made so far (the brand file as far as it got, the logo and photos) as a draft outside the checkout. The weekday morning run, `python3 -m scripts.autobuild.parked`, picks those up. It restores each draft, saves a copy of the business's website next to it, and starts one short Claude turn per business to fix the reason it was parked and write its letter. The script then does the rest the same way it does for its own builds: the checks, the review, landing, waiting for the deploy, registering and sending.

Neither run builds a letter's site while enough letters already wait for the mailbox: two of its best recent days' worth (`scripts/routine.py backlog`).

## Tracking

`src/track.js` reports pages opened, scroll depth, clicks and where people get stuck back to taylorurl.com. It loads once the page is idle and sends nothing until the page has actually been looked at, which keeps link scanners that load and leave out of the numbers. It skips the studio's own browser and automated ones. Form fields are reported by name only, never their values.

## Running it

```bash
npm install
npm run dev
```

Open `http://localhost:5173/?b=<slug>`, for example `?b=plumbing`. Off the real subdomains, `?b=` is how a business gets picked.

React 19, Vite and Tailwind CSS on Vercel, with Python and Node for the build and check scripts.

Built and maintained by [TaylorURL](https://www.taylorurl.com).
