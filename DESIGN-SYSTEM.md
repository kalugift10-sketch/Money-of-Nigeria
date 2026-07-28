# Design system

Source of truth: the Figma file, `Content page / Tradebybarter` (node `30:630`).
Implemented as CSS custom properties at the top of `styles.css`. Nothing below
that `:root` block should hard-code a colour or a font size — if a value is
missing, add a token rather than a literal.

---

## Colour

### Brand

These are **not one ramp**. The mark green is a warmer, darker leaf green; the
surface greens are emerald. They are kept as separate roles on purpose — don't
substitute one for another to "tidy up" the palette.

| Token | Hex | Used for |
|---|---|---|
| `--brand-mark` | `#1A6514` | The logo tile. Nothing else. |
| `--brand-on-mark` | `#F3FDF2` | The ₦ glyph sitting on that tile. |
| `--brand` | `#008D51` | Primary brand fill — footer, brand surfaces. |
| `--brand-deep` | `#00864D` | The duotone ground behind hero imagery. |
| `--brand-tint` | `#F8FDF7` | Faintest green — icon pills, hover beds. |

### Ink

| Token | Hex | Used for |
|---|---|---|
| `--ink` | `#040404` | Headings and body copy. |
| `--ink-muted` | `#6B7280` | Meta lines, back/next links, captions. |
| `--ink-on-dark` | `#FFFFFF` | Type over photography or brand fills. |

### Surface and line

| Token | Hex | Used for |
|---|---|---|
| `--bg` | `#FFFFFF` | Page ground. |
| `--surface-sunken` | `#F9FAFB` | Recessed panels, placeholder plates. |
| `--line` | `#E5E7EB` | Standard hairlines and dividers. |
| `--line-hair` | `#6D6D6D` | **Only** at `0.25px` — the header rule. |

### Status chip

Carried over from the Figma variables `semantic/neutral/50 · 200 · 700`.

| Token | Hex |
|---|---|
| `--chip-bg` | `#F9FAFB` |
| `--chip-line` | `#E5E7EB` |
| `--chip-ink` | `#374151` |

### Scrim

`--scrim` — `linear-gradient(180deg, rgba(102,102,102,0) 0%, #000 100%)`.
Sits between a full-bleed photo and the type over it. Every detail-page slide
needs it; without it, white type on a light patch of photograph fails contrast.

---

## Type

Two families, and they do not overlap:

- **`--font-display`** — `Stack Sans Headline`. Everything. Headings, body, nav,
  captions. Weights in use: 200 extralight, 300 light, 400 regular, 500 medium.
- **`--font-mark`** — `Libre Caslon Text` Bold, **only** for the ₦ in the logo
  tile. It is a logo glyph, not a text face on this site.

Both are on Google Fonts, loaded in `index.html`. All four Stack Sans weights
are real — none are synthesised by the browser.

### Scale

Every clamp interpolates between a **360px** and a **1440px** viewport.

| Token | Mobile → Desktop | Weight | Used for |
|---|---|---|---|
| `--text-display` | 32 → 56px | 500 | Page title (`h1`) |
| `--text-year` | 40 → 56px | 500 | The big year marker on a slide |
| `--text-title` | 20 → 24px | 500 | Slide titles, mobile nav links |
| `--text-lead` | 18 → 20px | 400 / 200 | Brand wordmark, next-currency name |
| `--text-body` | 16px fixed | 200 | Body copy, summaries |
| `--text-meta` | 14px fixed | 300 / 400 | Nav, footer links, back/next |
| `--text-caption` | 12px fixed | 500 | Status chip |

**Why three sizes don't scale:** 16 / 14 / 12 are the legibility floor. Shrinking
body copy below 16px on a phone costs readability and, on iOS, inputs under 16px
trigger an involuntary zoom on focus. Only display sizes scale down — that's
where the real estate problem actually is.

### Line height and tracking

| Token | Value | Used for |
|---|---|---|
| `--leading-tight` | `1` | Display, year, and title sizes |
| `--leading-body` | `1.2` | Body copy |
| `--leading-caption` | `1.5` | Chip text |
| `--track-body` | `0.01em` | Body copy (the Figma's 0.16px at 16px) |

---

## Layout

| Token | Value | Used for |
|---|---|---|
| `--pad` | `clamp(1.25rem, 4vw, 2.5rem)` | Page gutter — 40px at desktop |
| `--pad-slide` | `clamp(1.5rem, 5.5vw, 5rem)` | Slide inset — 80px at desktop |
| `--max` | `90rem` | Content max width (1440px) |
| `--header-h` | `4.5rem` | Header height; the mobile panel offsets by it |

Radii: `--r-tile` 8px (logo), `--r-chip` 20px (status chip), `--r-pill` 999px
(icon pills).

---

## Navigation

The header is sticky at the top of every page. It renders once into
`#chrome`, outside `#app`, so the playlist keeps playing across
navigation instead of restarting. `#chrome` is `display: contents` —
without that it becomes the header's containing block and the header
scrolls away with it, since a sticky element can only stick within its
parent.

Three siblings sit on the right, 16px apart, as in the design file: the
player button, then "Money playlist", then "About". The player is its
own control, not part of a link. Links take a 1px black underline at
4px offset on hover and on keyboard focus.

**Mobile is not designed yet.** There is deliberately no hamburger or
mobile nav in the code — the earlier one was invented rather than taken
from the design file, and has been removed.

### Player

A 32px pill (16px icon, 8px padding), with the progress ring drawn on
the pill's own edge — `r=15` in a 32 viewBox, so the 2px stroke lands
exactly on the border. It fills clockwise from 12 o'clock and hides
itself at zero, since a round line cap would otherwise leave a dot.
Icons are Hugeicons free (MIT): `volume-high` at rest, `pause` while
playing.

Two sources, set by `PLAYLIST.source` in `script.js`:

- `youtube` (default) — the official embed API. For a commercial track
  this is the licensed way to play it, and the API still exposes
  position, so the ring works. **Needs a served page**: from a `file://`
  URL the API cannot verify its handshake and never signals ready.
- `file` — plays `audio/…`, for a licensed copy you host yourself.
  Works anywhere, including from a plain file.

If neither can start, the button labels itself and links out to the
track rather than sitting dead.

## Migration note

The catalog was originally built on a white/black/grey scale. Those old token
names (`--grey-100` … `--grey-900`, `--serif`, `--sans`) are still defined at the
bottom of the `:root` block, now aliased onto the tokens above so existing
components keep rendering while they are moved over. They are temporary — new
work should use the named tokens, and the aliases should be deleted once the
detail pages are rebuilt to the Figma design.
