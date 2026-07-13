# The Money of Nigeria

A catalog website for the complete history of Nigerian money — pre-colonial barter and cowries through the naira redesigns and the eNaira. Looks and feels like an e-commerce store: hero, sort, search, product grid, and rich detail pages with scroll-snapped changelog slides.

## How it works

Static site, no framework, no backend:

- `index.html` — page shell and font loading (Fraunces via Google Fonts, Satoshi via Fontshare)
- `styles.css` — design system (white / black / grey only, per the `ui` block in the JSON)
- `script.js` — renders everything from the data file; hash-based routing (`#/c/<slug>` for detail pages)
- `nigerian-currency-directory.json` — the single source of truth for all content
- `/images/` — photography, organized per `meta.image_convention` in the JSON

All content lives in the JSON. Nothing is hard-coded into the HTML.

## Views

- **Currency** (default) — card grid ordered by first use
- **Year** — every changelog entry across all currencies, flattened and sorted by date
- **Era** — currencies grouped by era, in the order defined in `meta.eras`
- **Search** — live filter across names, summaries, changelog entries and people

## Adding images

1. Save the photo to `/images/<currency-slug>/<year>-<short-label>.jpg`
2. Add an object to that currency's `images` array in the JSON (`alt` and `credit` required)
3. Set `change_ref` to a `change_no` to attach it to a specific changelog slide, or `null` for the cover image

Missing images never break the layout — a grey plate with the currency's symbol renders instead.

## Running locally

Serve the folder with any static server, e.g.:

```sh
python3 -m http.server 8000
```

Deploys as-is to Vercel.
