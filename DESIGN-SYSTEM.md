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

**Desktop (≥768px)** — logo left; playlist icon pill, "Money playlist" and
"About" inline on the right.

**Mobile (<768px)** — the inline nav is replaced by a hamburger button that
opens a full-width panel below the header. Behaviour:

- Three bars morph into an X — the outer two rotate to meet, the middle fades.
- Panel fades and slides in; links stagger in at 60ms intervals.
- `aria-expanded` and `aria-controls` on the button; the label flips between
  "Open menu" and "Close menu".
- Escape closes the panel and returns focus to the button.
- Tapping any link closes the panel.
- Background scroll is locked while open (`html.nav-locked`).
- Under `prefers-reduced-motion`, transitions collapse to 1ms and the stagger
  animation is dropped — the panel still opens, it just doesn't animate.

State lives in one place: `data-nav-open` on `.site-header`. The CSS keys off
that attribute; `bindHeader()` in `script.js` is the only thing that sets it.

---

## Migration note

The catalog was originally built on a white/black/grey scale. Those old token
names (`--grey-100` … `--grey-900`, `--serif`, `--sans`) are still defined at the
bottom of the `:root` block, now aliased onto the tokens above so existing
components keep rendering while they are moved over. They are temporary — new
work should use the named tokens, and the aliases should be deleted once the
detail pages are rebuilt to the Figma design.
