# The Money of Nigeria: launch and QA brief

Give this file to Claude Code together with CORRECTIONS.md (the owner's standing rules). Read both before changing anything.

## What it is
A directory of every kind of money used in Nigeria: barter, manillas, cowries, colonial (WACB), the Nigerian pound, Biafra, the naira and the eNaira. There is one page per note or coin (61 pages), plus About, Money playlist and Sources pages.

## Stack
- Next.js 15 (App Router), TypeScript, CSS Modules. Every page is generated statically.
- Content lives in `src/data/items.json`. Images are in `public/images/<slug>/` and song covers in `public/covers/`.
- Run locally: `npm.cmd install` (first time only), then `npm.cmd run dev`, then open http://localhost:3000.
- Real speed test: `npm.cmd run build`, then `npm.cmd start`. Dev mode compiles each page the first time it is opened, which is why pages feel slow in dev.

## Launch (suggested: Vercel)
1. Push the `site` folder to a GitHub repo.
2. Import it on vercel.com. The framework is detected automatically, and no environment variables are needed.
3. Add the custom domain if there is one.

## Still to fill in (owner)
- `src/app/about/page.tsx`: `PORTFOLIO` link, Instagram link and X (Twitter) link. LinkedIn is already set.
- G-Money note: done (2:1, ₦1000 shape).
- The "How it changed" heading is now "Details" (done).
- The owner will rewrite some copy herself. Do not rewrite her copy.

## QA checklist (run before every release)
- Every page opens without errors (61 money pages, plus /, /about, /playlist, /sources).
- No broken images, and every coin and note image is cut out. Coins with holes show the hole.
- The versions row: a label is the year only, and the last version reads "YEAR – till date" only when the money is still in use.
- Search (header on inner pages, filter on home): finds by name, era and year. Arrow keys and Enter work.
- The green loading line under the header runs while a new page loads.
- Sources page: the side rail jumps to each item, and "Sources for this page →" on each item opens its section.
- Music, desktop: the mini player drags, the minus minimises it to a spinning disc, the disc drags, and clicking the disc reopens the player. Phone: the player is fixed at the bottom.
- Loading screen: at least 1.5 s, at most 3 s, and the coin does not move.
- Zoom: + and − step the zoom, and it resets when the mouse leaves the image or the image changes.
- Phone width (390 px): nothing overflows sideways.
- Content: every fact matches its sources. If sources disagree, both are stated. No invented facts.
