# MadriDev Brand Guidelines

No brand file was supplied, so this system was defined from scratch. It is the single
source of truth for the landing page — the tokens below are declared in the `@theme`
block of [src/index.css](src/index.css) and consumed as Tailwind utilities
(`bg-base`, `text-ink-muted`, `border-line`, and so on).

## Colour

| Token             | Value     | Tailwind utility     | Use                                        |
| ----------------- | --------- | -------------------- | ------------------------------------------ |
| `base`            | `#0A0A0B` | `bg-base`            | Page background                            |
| `surface`         | `#141418` | `bg-surface`         | Cards, panels, form fields                 |
| `surface-raised`  | `#1C1C22` | `bg-surface-raised`  | Hover state on cards, timeline nodes       |
| `line`            | `#26262C` | `border-line`        | Hairline borders and dividers              |
| `ink`             | `#F4F4F5` | `text-ink`           | Headings and primary body copy             |
| `ink-muted`       | `#A1A1AA` | `text-ink-muted`     | Secondary copy, labels, footer             |
| `accent`          | `#5B8CFF` | `bg-accent`          | Primary CTA, links, active states          |
| `accent-soft`     | `#8AABFF` | `text-accent-soft`   | Focus rings, gradient start                |
| `accent-alt`      | `#22D3EE` | `to-accent-alt`      | Gradient end, small highlights             |

### Contrast

All pairings meet WCAG AA for their size class:

- `ink` on `base` — 18.3:1
- `ink-muted` on `base` — 9.1:1
- `base` on `accent` — 8.0:1 (used for the primary button, dark text on blue)
- `accent-soft` on `base` — 8.6:1

Never place `accent` text directly on `base` at body size; use `accent-soft` instead.

## Typography

- **Display / headings:** Sora, weights 500–700, tight tracking (`tracking-tight`)
- **Body / UI:** Inter, weights 400–600
- Both are loaded from Google Fonts in [index.html](index.html) with `display=swap`.
- Heading scale is fluid: mobile `text-3xl` → desktop `text-5xl`/`text-6xl`.
- The `.text-gradient` utility applies the accent gradient to a heading fragment. Use it
  on at most one phrase per section so it stays an emphasis device.

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
