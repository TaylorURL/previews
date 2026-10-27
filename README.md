# Previews

Preview websites built in a local business's own brand, so TaylorURL can show them what a new site could look like.

When TaylorURL reaches out to a business, the email links to a preview made from that business's name, logo, colors, photos and details. Each one lives at `<business>.taylorurl.com`, has a bar across the top saying it's a preview, and is hidden from search engines.

## Templates

Every template has a sample business you can look at:

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

## How a preview is made

- Each business is one file, `src/brands/<slug>.json`, with its details, colors, fonts, logo and copy
- Its photos go in `public/brands/<slug>/` as webp, at 800 and 1600 pixels wide
- The slug is the subdomain, so a new brand file becomes `<slug>.taylorurl.com` once it's deployed
- Facts come from the business's own website and Google listing. Nothing is borrowed from another business, and anything unknown is left out
- Views and basic activity (pages, scrolling, clicks) are reported to taylorurl.com. What people type into forms is never recorded

Most brand files are built by the scripts in `scripts/autobuild/`, which read the business's website and check the result before it's added. You can run the same checks on a brand file written by hand (needs Python with `numpy` and `Pillow`):

```bash
npm run build
python3 -m scripts.autobuild.gate check <slug>
```

`gate logo <url> <slug>` prepares a logo, and `gate photo <file>` tells you whether a photo is good enough to use.

## Running it locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173/?b=<slug>`, for example `?b=plumbing` for the plumbing sample. `npm run build` prerenders every page of every business.

## Built with

React 19, Vite and Tailwind CSS, hosted on Vercel. The build and check scripts are Python and Node.

Built and maintained by [TaylorURL](https://www.taylorurl.com).
