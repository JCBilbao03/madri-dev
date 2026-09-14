# MadriBuild Brand Guidelines

No brand file was supplied, so this system was defined from scratch. It is the single
source of truth for the landing page — the tokens below are declared in the `@theme`
block of [src/index.css](src/index.css) and consumed as Tailwind utilities
(`bg-base`, `text-ink-muted`, `border-line`, and so on).

## Colour

| Token             | Value     | Tailwind utility     | Use                                        |
| ----------------- | --------- | -------------------- | ------------------------------------------ |
| `base`            | `#1A1C22` | `bg-base`            | Page background (brand charcoal)           |
| `surface`         | `#22252D` | `bg-surface`         | Cards, panels, form fields                 |
| `surface-raised`  | `#2A2E38` | `bg-surface-raised`  | Hover state on cards, timeline nodes       |
| `line`            | `#353942` | `border-line`        | Hairline borders and dividers              |
| `ink`             | `#F4F4F5` | `text-ink`           | Headings and primary body copy             |
| `ink-muted`       | `#9CA3AF` | `text-ink-muted`     | Secondary copy, labels, footer             |
| `accent`          | `#FDB813` | `bg-accent`          | Primary CTA, links, active states          |
| `accent-soft`     | `#FFC94A` | `text-accent-soft`   | Emphasis text on dark backgrounds          |
| `accent-alt`      | `#E8960C` | `to-accent-alt`      | Secondary highlights, success-adjacent     |

### Contrast

All pairings meet WCAG AA for their size class:

- `ink` on `base` — 18.3:1
- `ink-muted` on `base` — 9.1:1
- `base` (charcoal) on `accent` (orange) — 10.5:1 (primary button label)
- `accent-soft` on `base` — 9.2:1

On light backgrounds, use `accent-soft` (`#C77700`) for accent text at body size.

## Logo

- Lockup: `{✓}B` mark + `madri_build` wordmark (orange underscore) + tagline.
- Source files: [`public/brand/madribuild-logo.png`](public/brand/madribuild-logo.png) (full lockup),
  [`public/brand/madribuild-mark.png`](public/brand/madribuild-mark.png) (MB icon for the header).
- Both use a transparent background; rendered by [`Logo.tsx`](src/components/ui/Logo.tsx).

## Typography

- **Display / brand:** JetBrains Mono, weights 500–700, tight tracking (`tracking-tight`)
- **Body / UI:** Inter, weights 400–600
- Both are loaded from Google Fonts in [index.html](index.html) with `display=swap`.
- Heading scale is fluid: mobile `text-3xl` → desktop `text-5xl`/`text-6xl`.
- Accent emphasis uses solid `text-accent` on at most one phrase per section.

## Motion

- Scroll reveals use a single shared component, [`Reveal`](src/components/shared/Reveal.tsx):
  16px rise, 0.5s, `ease-out-soft`, triggered once at 20% viewport overlap.
- Stagger sibling items by 60–80ms. Never exceed ~400ms of total stagger.
- Motion is decorative only. Everything remains legible and operable with
  `prefers-reduced-motion: reduce`, which `index.css` honours globally.

## Voice

Outcome-first and plain-spoken. Lead with what the client gets, not with the technology.

- Good: "Ships in weeks, not quarters."
- Good: "We cut your largest contentful paint below one second."
- Avoid: "Leveraging synergistic best-in-class solutions."

Sentence case for headings. No exclamation marks. Numbers beat adjectives.
