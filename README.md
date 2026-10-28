# Previews

Preview websites built in a local business's own brand, linked from TaylorURL's outreach emails.

Each preview is made from the business's name, logo, colors, photos and details. It lives at `<business>.taylorurl.com`, has a bar across the top saying it's a preview, and is hidden from search engines.

## How it's built

- **One brand file per business.** `src/brands/<slug>.json` holds the details, colors, fonts, logo and copy. Photos go in `public/brands/<slug>/` as webp at 800 and 1600 wide.
- **The subdomain picks the business.** `vercel.json` rewrites `<slug>.taylorurl.com` to `/b/<slug>`. A template name (plumbing, salon) is that template's sample business. Anywhere else, like localhost or a Vercel preview URL, `?b=` picks it.
- **Each brand is its own chunk.** A page loads one business, not the whole list.
- **Prerendered.** `scripts/prerender.js` writes every page of every business to its own document after the build.
- **Hidden from search.** `X-Robots-Tag: noindex, nofollow` on every path.
- **Facts come from the business.** Its own website and Google listing. Nothing borrowed from another business. Anything unknown is left out.

<details>
<summary>Templates</summary>

Every template has a sample business:

| Template | Sample |
| :--- | :--- |
| Auto repair | [autorepair.taylorurl.com](https://autorepair.taylorurl.com) |
| Barber | [barber.taylorurl.com](https://barber.taylorurl.com) |
| Fitness | [fitness.taylorurl.com](https://fitness.taylorurl.com) |
| Flooring | [flooring.taylorurl.com](https://flooring.taylorurl.com) |
| HVAC | [hvac.taylorurl.com](https://hvac.taylorurl.com) |
| Plumbing | [plumbing.taylorurl.com](https://plumbing.taylorurl.com) |
| Printing | [printing.taylorurl.com](https://printing.taylorurl.com) |
| Professional services | [professional.taylorurl.com](https://professional.taylorurl.com) |
| Real estate | [realestate.taylorurl.com](https://realestate.taylorurl.com) |
| Recreation | [recreation.taylorurl.com](https://recreation.taylorurl.com) |
| Restaurant | [restaurant.taylorurl.com](https://restaurant.taylorurl.com) |
| Roofing | [roofing.taylorurl.com](https://roofing.taylorurl.com) |
| Salon | [salon.taylorurl.com](https://salon.taylorurl.com) |

</details>

<details>
<summary>Building a brand file</summary>

Most brand files come from `scripts/autobuild/`, which reads the business's website, builds the preview and checks it before it lands. The same checks run on a hand-written brand file. Needs Python with `numpy` and `Pillow`:

```bash
npm run build
python3 -m scripts.autobuild.gate check <slug>
```

- `gate check` checks the facts' shape, the pictures and logo, every server-rendered page, and the home page measured at desktop and phone size. Exits 1 on any problem.
- `gate logo <url> <slug>` cuts the logo's background away, refuses one that can't sit cleanly, and writes `logo.webp` and a one-color `logo-mono.webp`.
- `gate photo <file>` says whether a photo can be shown, and in which slot.

</details>

<details>
<summary>Tracking</summary>

`src/track.js` reports pages opened, scroll depth, clicks and where people get stuck to taylorurl.com.

- Loads after the page is idle, so it's never in front of the first frame.
- Sends nothing until the page has actually been looked at, so a link scanner that loads and leaves isn't recorded.
- Skips the studio's own browser and automated ones.
- Form fields are named, never read. No values or keystrokes.

</details>

<details>
<summary>Running it locally</summary>


```bash
npm install
npm run dev
```

Then open `http://localhost:5173/?b=<slug>`, for example `?b=plumbing` for the plumbing sample. `npm run build` prerenders every page of every business.

</details>

## Built with

React 19, Vite and Tailwind CSS, hosted on Vercel. The build and check scripts are Python and Node.

Built and maintained by [TaylorURL](https://www.taylorurl.com).
