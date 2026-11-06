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
