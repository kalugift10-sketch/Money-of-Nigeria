# The Money Of Nigeria — site

## Run it on your computer
1. Install Node.js (LTS) from nodejs.org if `node -v` doesn't work in PowerShell.
2. Open PowerShell in this `site` folder and run:
   npm install
   npm run dev
3. Open http://localhost:3000

## Where things live
- Every coin, note and story: `src/data/items.json` (later this moves to Sanity).
- Songs: `src/data/playlist.ts` — paste each song's YouTube id and cover.
- Images: put files in `public/images/` and set `images.front` / `images.back` in items.json.
  Already referenced: barter.png, cowries.png, manilla.png, half-penny-wacb.png, g-money-note.png
- Portfolio link: `src/app/about/page.tsx` (PORTFOLIO).
