# Design spec

> **Purpose:** A single reference so every new screen, tool, or build session shares the same visual language. Use it as context when generating mockups or briefing developers.

---

## Tone & atmosphere

| Do                         | Don’t                      |
| -------------------------- | -------------------------- |
| Warm, cooperative          | Cold, corporate            |
| Grounded, pragmatic        | Silicon Valley hype        |
| Transparent about criteria | Vague or mysterious        |
| Respectful (“your car”)    | Clinical (“vehicle #4829”) |
| Honest on rejection        | Confetti on approval       |

The product should feel like a helpful neighbor, not an insurance form. If the organization is volunteer- or member-driven, that should come through in the UI—not as slogans, but in warmth and clarity.

---

## Design tokens

### Color palette

**Brand (primary)**

| Token         | Hex       | Use                                                           |
| ------------- | --------- | ------------------------------------------------------------- |
| `brand`       | `#1A3D2B` | Headers, primary buttons, active states, dark hero background |
| `brandMid`    | `#285C40` | Eyebrows, tags, hover                                         |
| `brandLight`  | `#EAF3EC` | Selected backgrounds, active cards                            |
| `brandBorder` | `#B4D4BC` | Borders on `brandLight` backgrounds                           |

**Surfaces**

| Token     | Hex       | Use                                                    |
| --------- | --------- | ------------------------------------------------------ |
| `bg`      | `#F6F3EE` | Page background (warm cream, not pure white)           |
| `surface` | `#FFFFFF` | Cards, inputs, modals                                  |
| `sand`    | `#EDE7DC` | Subtle separators, inactive elements, collapsed states |
| `border`  | `#DDD6CB` | Card edges, dividers, unselected borders               |

**Text**

| Token   | Hex       | Use                                      |
| ------- | --------- | ---------------------------------------- |
| `ink`   | `#181510` | Titles, primary text                     |
| `mid`   | `#5A5248` | Body, secondary labels                   |
| `light` | `#9C9489` | Hints, captions, placeholders, footnotes |

**Semantic accents**

| Meaning               | Color     | Background | Border    | Application                                         |
| --------------------- | --------- | ---------- | --------- | --------------------------------------------------- |
| Informational         | `#1D548A` | `#EAF1FA`  | `#B5CDE5` | Policy or neutral context blocks                    |
| Warning / conditional | `#C4860A` | `#FDF3E0`  | `#DECA80` | Edge cases, quarterly variance, conditional banners |
| Success               | `#2A7A48` | `#E8F5EE`  | —         | Confirmations, sent states                          |
| Error / no-go         | `#B83232` | `#FAEAEA`  | —         | Rejection screens                                   |

**Rule:** Amber is always for conditional / contextual blocks (content not shown to everyone). Red only for definitive rejection. Green only for confirmed positive outcomes.

### Spacing — 8px grid

All spacing is a multiple of 8. No exceptions.

```
8 · 16 · 24 · 32 · 48
```

Anything outside this system (7px, 13px, 18px, 22px) is a red flag.

### Border radius — three sizes

| Token | Value | Use                                         |
| ----- | ----- | ------------------------------------------- |
| `r8`  | 8px   | Inputs, small buttons, inline badges        |
| `r12` | 12px  | Cards, panels, FAQ containers, hero blocks  |
| `r20` | 20px  | Pills, badges, toggles, tags, round buttons |

### Layout widths

| Width | Use                                                                    |
| ----- | ---------------------------------------------------------------------- |
| 700px | Single-column flows (e.g. situation, assessment, result, confirmation) |
| 880px | Two-column flows (e.g. vehicle details, costs, scenarios) + header     |

**Responsive:** Below 768px, everything stacks to a single column. Two-column layouts stack. The sidebar becomes a collapse panel below the form.

### Typography

| Name      | Size | Weight | Font     | Use                                 |
| --------- | ---- | ------ | -------- | ----------------------------------- |
| `title`   | 28px | 800    | Fraunces | Page titles                         |
| `heading` | 18px | 700    | Fraunces | Section headings, reason labels     |
| `body`    | 15px | 400    | DM Sans  | Body copy, inputs, button text      |
| `caption` | 12px | 600    | DM Sans  | Labels, sidebar text, FAQ questions |
| `micro`   | 11px | 600    | DM Sans  | Tags, badges, footnotes, eyebrows   |

**Tracking:** `letter-spacing: 0.06em` on uppercase labels (eyebrows, section headers in cards). One value, no variation.

**Pairing:** Fraunces (serif) for titles and headings → warmth and a cooperative feel. DM Sans for everything functional → readable, neutral, professional.

**Exception:** Large numbers in result contexts (coverage %, counts, trip totals, net amounts) may sit outside the type scale. These are deliberate visual anchors.

---

## Components

### Selection tile (`SelectionTile`)

Reused across flows: e.g. two tiles for situation choice, three scenario buttons, confirmation step with a membership or binary choice.

- Border: 2px, `border` by default → `brand` when selected
- Background: `surface` by default → `brandLight` when selected
- Radio indicator: top-right circle (24px), empty by default → filled brand with ✓ when selected
- Always visible in default state (clear affordance)

### Field (`Field`)

- Label: `caption`, 600, uppercase, `0.06em` tracking, `mid` color
- Hint: `caption`, `light` color, only when truly needed (not on self-explanatory fields)
- Input: `body`, `surface` background, 1.5px `border`, `r8` radius, 10px 16px padding
- Focus: border becomes `brand`

### Inline confirmation (`ComputedBadge`)

Appears after the user provides input. Two variants:

- **Pill badge:** locality or status indicator (green or amber background, 8px dot, text)
- **Inline text:** e.g. km/year (“→ ≈ 12,000 km/year — calculated automatically”)

### FAQ (`FaqCollapsed`)

- Starts collapsed — only the FAQ title visible with a count badge
- Count badge: `brand` background, white number, `r20` pill
- Each question: expandable, `brandLight` background when open
- Placement: sidebar (two-column) or bottom (single-column)

### Hero block (per outcome)

| Outcome   | Background                  | Accent                        | Icon                     |
| --------- | --------------------------- | ----------------------------- | ------------------------ |
| Go        | `brand` (dark, full-width)  | Stat tiles with glassmorphism | Car animation (optional) |
| No-go     | `redBg` (light, centered)   | `red` circle                  | ✕                        |
| Edge case | `amberBg` (light, centered) | `amber` circle                | 🔍                       |

### Primary button (`Btn`)

- `brand` background, white text, `r8`, 12px 24px padding
- Disabled: `sand` background, `light` text, `not-allowed` cursor
- Secondary: no fill, `mid` text, 1.5px `border` outline

**Rule:** One primary button per screen. “Back” is always secondary.

### Conditional banner

- Amber background (`amberBg`), amber border, `r12`
- Text `#6A5000` (dark amber)
- Only when a condition applies (e.g. purchase path, quarterly variance)

### Step list (`StepList`)

- Numbered circles (32px), first step `brand` background, rest `sand`
- Dividers as `sand` borders between steps
- CTA only on the first (active) step

---

## UX principles

### 1. Progressive disclosure

The default state shows only what the user needs right now. Details are one click away. FAQ starts collapsed. Cost breakdown starts collapsed. Extended policy info lives in an expandable row.

### 2. At most two supporting blocks per screen

Beside the main story, at most two supporting blocks (community stat, disclaimer, quarterly note, etc.). If more seems necessary: collapse, tooltip, or move to another step.

### 3. One primary action per screen

One primary button (brand). “Back” is always secondary. No competing CTAs.

### 4. Sidebar pattern

Screens with inputs: right sidebar (280px, sticky) with live summary or overview on top, collapsed FAQ below.

### 5. Visual distinction over decoration

Emojis, icons, and visuals only when they communicate a real difference (scenarios, outcomes). Not for ornament. If an icon adds no information, omit it.

### 6. Signature moments — intentional and rare

Deliberate moments of delight, exceptions to strict minimalism:

- **Car animation** (positive result): car drives off on approval (optional)
- **People bar** (scenarios): figures animate in/out on scenario change
- **Contextual loading** (assessment): stepped checklist with live feedback
- **Celebration** (confirmation): 🎉 in a central circle

Status: nice-to-have for v1, not mandatory. Weigh implementation cost per case.

---

## Content principles

| Element               | Guideline                                                   |
| --------------------- | ----------------------------------------------------------- |
| Page title            | 6–8 words, Fraunces                                         |
| Intro body            | Max 1–2 sentences. Each sentence adds something new.        |
| Field label           | 2–4 words, uppercase                                        |
| Field hint            | Only if needed. Max one sentence. Not under obvious fields. |
| Button copy           | 2–5 words + direction arrow (→ or ←)                        |
| FAQ question          | User voice (“Why…?”, “How does…?”)                          |
| FAQ answer            | Max 3 sentences                                             |
| Disclaimer / footnote | Italic, `micro`, `light`                                    |

**Tone:** Personal but not cutesy. Functional — every sentence should add information. Prefer “your car” over “the vehicle.” Avoid exclamation marks in routine UI copy.

---

## Per-screen checklist

When building or reviewing any new screen:

```
□ Titles and body on the type scale (28/18/15/12/11)?
□ Spacing on the 8px grid (8/16/24/32/48)?
□ Border radius from the system (8/12/20)?
□ At most 2 supporting blocks beside the main story?
□ FAQ present (collapsed) where it helps?
□ Visuals serve distinction, not decoration?
□ One primary button?
□ Two-column: summary on top, FAQ below in sidebar?
□ Intro body max 2 sentences?
□ No hints under self-explanatory fields?
□ Accent colors correct? (amber=conditional, red=final no, green=confirmed)
□ Responsive: layout stacks cleanly below 768px?
```

---

## What this spec does not cover

- **No Figma specs.** This is a functional–visual reference, not a pixel-perfect handoff.
- **No code architecture.** How components are implemented (React, vanilla, framework) is up to engineering.
- **No final copy.** Exact strings per screen belong in the flow spec, not here.
- **No motion specs.** Timing and easing for signature moments are decided per implementation.
