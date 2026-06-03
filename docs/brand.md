# Rootly — Brand Guide

## Voice & Tone

Rootly speaks like a calm, knowledgeable friend — not a productivity app. The language is warm, direct, and slightly poetic. It never lectures, never panics, never uses exclamation marks gratuitously.

**Words we use**: grow, tend, root, care, thrive, nourish, today, calm, quiet, gentle
**Words we avoid**: optimize, sync, dashboard, alert (prefer "reminder"), manage, task

Example copy:
- ✓ "Your monstera is looking thirsty."
- ✓ "Logged. Fiddle leaf fig watered today."
- ✓ "Grow from the root up."
- ✗ "Alert: Plant watering task completed!"
- ✗ "Optimize your plant care schedule."

---

## Colour Palette

All colours are defined in `frontend/src/tokens.ts` as the `T` object. **Always import from there.**

```ts
import { T } from '../tokens'; // or ../../tokens
```

| Token | Hex | Usage |
|---|---|---|
| `T.paper` | `#FBFAF6` | App background — warm off-white |
| `T.card` | `#FFFFFF` | Card surfaces |
| `T.linen` | `#F4F1E9` | Secondary surface, subtle fills |
| `T.sprout` | `#E9F1E4` | Plant art backgrounds, success accents |
| `T.sproutDeep` | `#D5E5CE` | Deeper green tint |
| `T.canopy` | `#20503B` | Primary brand green — buttons, nav active |
| `T.moss` | `#173D2C` | Darker canopy — hover states, toasts |
| `T.fern` | `#3A7D55` | Links, icons, positive highlights |
| `T.sage` | `#7E9B79` | Muted green — secondary text on dark |
| `T.sageSoft` | `#A9C2A1` | Very muted — placeholders |
| `T.ink` | `#1E2A22` | Primary body text |
| `T.ink2` | `#4C564E` | Secondary body text |
| `T.ink3` | `#7C857B` | Tertiary / captions |
| `T.onDark` | `#F3F6EF` | Text on dark green backgrounds |
| `T.sun` | `#E0A050` | Accent / "due soon" state |
| `T.sunDeep` | `#C9852F` | Darker sun accent |
| `T.sunSoft` | `#FBEAD0` | Sun background tint |
| `T.stone100` | `#ECE8DE` | Dividers, subtle borders |
| `T.stone200` | `#E0DBCE` | Stronger borders |
| `T.stone300` | `#CFC9B8` | Button borders |
| `T.water` | `#5E8FB8` | "Watered today" state |
| `T.waterSoft` | `#E2ECF3` | Water state background |

### Status Colours (in `STATUS_META`)

Status colours live in `frontend/src/types/plant.ts` as `STATUS_META`. Hard-code these hex values only when directly rendering a status indicator — never use them as general UI colours.

| Status | Colour | Label |
|---|---|---|
| `dry` | `#BC5B49` | Needs water |
| `soon` | `#C9852F` | Due soon |
| `thriving` | `#3E8E5A` | Thriving |
| `watered` | `#5E8FB8` | Watered today |
| `resting` | `#7C857B` | Resting |

---

## Typography

| Token | Value | Usage |
|---|---|---|
| `T.sans` | `'Hanken Grotesk', ui-sans-serif, system-ui, sans-serif` | All body copy, UI labels, buttons |
| `T.display` | `'Bricolage Grotesque', 'Hanken Grotesk', sans-serif` | Headings, plant names, section titles |
| `T.mono` | `'DM Mono', ui-monospace, monospace` | Numbers (moisture %, dates), code |

### Type Scale

| Use | Size | Weight | Font |
|---|---|---|---|
| Page heading | 24–28px | 700 | `T.display` |
| Section heading | 19px | 700 | `T.display` |
| Card title / plant name | 17px | 700 | `T.display` |
| Body / list item | 15.5px | 400–600 | `T.sans` |
| Caption / secondary | 12–13px | 400–600 | `T.sans` |
| Number / stat | 13–30px | 500 | `T.mono` |

---

## Layout

### Breakpoint

```
700px — single breakpoint
< 700px → mobile tab layout
≥ 700px → sidebar + panel layout
```

### Spacing

Use multiples of 4. Common values: `4, 8, 12, 16, 20, 24, 32`. Padding inside cards: `18–20px`. Gap between list items: `12–16px`.

### Border Radius

| Context | Value |
|---|---|
| Pills, buttons, badges | `999` |
| Cards | `18–20` |
| Avatars, circular icons | `50%` or `999` |
| Input fields | `12` |
| Small chips | `8` |

### Shadows

```css
/* Card default */
box-shadow: 0 2px 6px rgba(30,42,34,.06), 0 1px 2px rgba(30,42,34,.04);

/* Card hover */
box-shadow: 0 8px 22px rgba(30,42,34,.1);

/* Toast / elevated */
box-shadow: 0 8px 24px rgba(23,61,44,.35);
```

### Transitions

All interactive elements use the same easing curve:
```css
transition: all .18s cubic-bezier(.22,.61,.36,1);
```

---

## Components

Shared primitives live in `frontend/src/components/index.tsx`. Use these before reaching for raw HTML elements.

| Component | Props | Notes |
|---|---|---|
| `Button` | `variant`, `size`, `icon`, `onClick`, `full` | variants: primary, secondary, ghost, accent |
| `StatusPill` | `status`, `size` | Renders coloured status badge |
| `MoistureBar` | `value`, `width` | Horizontal bar, 0–100 |
| `MoistureRing` | `value`, `size`, `stroke` | SVG ring with centre readout |
| `Sparkline` | `data`, `width`, `height`, `color` | Growth trend chart |
| `PlantCard` | `plant`, `onClick` | Grid card for plant collection |
| `PlantRow` | `plant`, `onClick`, `onWater`, `last` | List row with water button |
| `SectionHeader` | `children`, `action` | Section title with optional action label |
| `Card` | `children`, `pad` | White card with shadow |
| `Toast` | `message` | Fixed-position confirmation toast |
| `Icon` | `name`, `size`, `color`, `stroke` | Feather icon wrapper |
| `PlantArt` | `kind`, `size` | SVG plant illustration |

---

## Icons

Use the `Icon` component. Icon names match Feather icons: `droplet`, `check`, `chevronRight`, `plus`, `leaf`, `sun`, `moon`, `settings`, `user`, etc.

---

## Rules Summary

1. Import `T` from `./tokens` or `../../tokens` — **never** from components.
2. `components/index.tsx` exports **only React components** — no constants, no types.
3. No hard-coded hex colours except status colours from `STATUS_META`.
4. All transitions use `cubic-bezier(.22,.61,.36,1)`.
5. Border radius: `999` for interactive pills, `18–20` for cards.
6. Use `T.display` for headings, `T.sans` for body, `T.mono` for numbers.
7. Mobile-first: design at `<700px`, then adapt for sidebar layout.
