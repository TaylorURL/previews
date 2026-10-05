# Previews

Industry template sites that TaylorURL dresses as a prospect's own business and sends in outreach.

| Template | Sample | Subdomain |
| :--- | :--- | :--- |
| Plumbing | Bayside Plumbing Co. | https://plumbing.taylorurl.com |
| Barber | Sharp Line Barber Co. | https://barber.taylorurl.com |
| Real estate | Harbor & Main Realty | https://realestate.taylorurl.com |

The subdomain picks the template (`?t=` does it anywhere else). The first path segment is the slug of a
row in `preview_sites` on Supabase project `gujgtjqqurildqurpffh`, so
`plumbing.taylorurl.com/acme-plumbing` is that row's business laid over the plumbing template. The page reads
the row through the `preview_site(industry, slug)` function, which also counts the view; the table itself
grants the browser nothing.

A real business never borrows a fact from the sample: reviews, hours, staff and service area come from its row
or are left out. Every page is `noindex`.

```bash
npm install
npm run dev      # http://localhost:5173/?t=barber
npm run build
```

New previews are made by `scripts/make-preview.py`, which picks prospects from `outreach_prospects`,
pulls their Google listing, and writes the row.
