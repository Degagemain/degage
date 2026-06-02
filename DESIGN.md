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

## Public pages (shared chrome)

All unauthenticated marketing and self-service surfaces share one shell:

| Piece            | Location                                            | Notes                                                     |
| ---------------- | --------------------------------------------------- | --------------------------------------------------------- |
| Theme tokens     | `app/app/components/public/public-theme.module.css` | CSS variables on `.publicTheme`                           |
| Layout utilities | `app/app/components/public/public-layout.ts`        | Container widths, section spacing                         |
| Header           | `app/app/components/public/public-header.tsx`       | Fixed, logo image, language switcher, sign-in / user menu |
| Shell            | `app/app/components/public/public-shell.tsx`        | Wraps header + main; use on FAQ, simulation, etc.         |
| Login dialog     | `app/app/components/public/public-login-dialog.tsx` | Guest sign-in entry points                                |

**Used on:** landing (`/app`), FAQ (`/app/faq/*`), public simulation (`/app/simulation`).

### Page canvas

| Property             | Value                                       |
| -------------------- | ------------------------------------------- |
| Background           | `#fafaf9` (Tailwind `stone-50`)             |
| Body text            | `#1c1917` (`stone-900`)                     |
| Secondary text       | `stone-600` / `stone-500`                   |
| Max content width    | `max-w-6xl` (header + default page content) |
| Narrow wizard column | `max-w-[880px]` via `publicContainerNarrow` |

### Header

- **Fixed** to the top; content scrolls underneath.
- **At rest:** transparent background, no border.
- **Scrolled (>8px):** `stone-50` at 90% opacity, backdrop blur, bottom border `stone-200/80`.
- **Logo:** `/landing/logo.png`, links to `/app`, height `h-7` / `sm:h-8`.
- **Actions (right):** language switcher; guests get a **rounded-full** primary “Sign in” button; signed-in users get `UserMenu`.
- **Main offset:** `pt-14 sm:pt-16` on `<main>` (`publicMainPadTop`) so content clears the header.

### Brand palette (logo-aligned greens)

Primary brand colors follow the Dégage logo (mint / grass / forest):

| Token                    | Hex       | Use                                 |
| ------------------------ | --------- | ----------------------------------- |
| `--public-brand`         | `#388e3c` | Primary buttons, links, key accents |
| `--public-brand-hover`   | `#2e7d32` | Button hover                        |
| `--public-accent`        | `#43a047` | Eyebrows, icons, highlights         |
| `--public-accent-strong` | `#2e7d32` | Strong accents                      |
| `--public-accent-deep`   | `#1b5e20` | Stats, deep headings on light bg    |
| `--public-surface`       | `#f0f7f0` | Tinted panels, selected tiles       |
| `--public-surface-muted` | `#e3f1e4` | Softer green backgrounds            |
| `--public-border`        | `#c5e3c6` | Borders on green-tinted surfaces    |
| `--public-icon-bg`       | `#e8f5e9` | Icon wells                          |

**Glow (optional, marketing hero):** radial gradients using `--public-glow` / `--public-glow-mint` (RGB tuples for `rgb(var(--public-glow) / α)`).

**Primary CTA pattern:** `rounded-full`, `bg-[var(--public-brand)]`, white text, subtle hover lift (`-translate-y-0.5`) on marketing buttons.

### Header vs page titles

The **header** shows only the logo and actions—no page title, tagline, or “D!” wordmark block. Page titles belong in the **content** area (`h1` per step on simulation, FAQ hub title, article/group names on sub-pages).

### Spacing on public pages

Reuse `public-layout.ts`:

```
publicContainer · publicSectionPad · publicHeroPad · publicPagePad
8px grid: 8 · 16 · 24 · 32 · 48 (section padding often 80–96px vertical)
```

---

## Design tokens (flows & forms)

Wizard and form-heavy screens (simulation steps) reuse the public shell but keep **semantic** tokens for outcomes and fields. Simulation maps `--sim-brand*` to `--public-*` where possible.

### Color palette — wizard surfaces

**Brand (inherits public greens on simulation)**

| Token                   | Use                                          |
| ----------------------- | -------------------------------------------- |
| `brand` / `--sim-brand` | Primary buttons, active states, success hero |
| `brandMid`              | Eyebrows, tags, hover                        |
| `brandLight`            | Selected backgrounds, active cards           |
| `brandBorder`           | Borders on `brandLight` backgrounds          |

**Surfaces**

| Token     | Hex       | Use                                              |
| --------- | --------- | ------------------------------------------------ |
| `bg`      | `#fafaf9` | Page background (aligned with public `stone-50`) |
| `surface` | `#FFFFFF` | Cards, inputs, modals                            |
| `sand`    | `#EDE7DC` | Subtle separators, inactive elements             |
| `border`  | `#DDD6CB` | Card edges, dividers                             |

**Text**

| Token   | Hex       | Use                            |
| ------- | --------- | ------------------------------ |
| `ink`   | `#181510` | Section headings, primary text |
| `mid`   | `#5A5248` | Body, secondary labels         |
| `light` | `#9C9489` | Hints, captions, placeholders  |

**Semantic accents**

| Meaning               | Color     | Background | Border    | Application                     |
| --------------------- | --------- | ---------- | --------- | ------------------------------- |
| Informational         | `#1D548A` | `#EAF1FA`  | `#B5CDE5` | Policy / neutral blocks         |
| Warning / conditional | `#C4860A` | `#FDF3E0`  | `#DECA80` | Edge cases, conditional banners |
| Success               | `#2A7A48` | `#E8F5EE`  | —         | Confirmations, sent states      |
| Error / no-go         | `#B83232` | `#FAEAEA`  | —         | Rejection screens               |

**Rule:** Amber = conditional / contextual. Red = definitive rejection. Green = confirmed positive outcomes.

### Spacing — 8px grid

All spacing is a multiple of 8. No exceptions.

```
8 · 16 · 24 · 32 · 48
```

### Border radius — three sizes

| Token | Value | Use                                         |
| ----- | ----- | ------------------------------------------- |
| `r8`  | 8px   | Inputs, small buttons, inline badges        |
| `r12` | 12px  | Cards, panels, FAQ containers, hero blocks  |
| `r20` | 20px  | Pills, badges, toggles, tags, round buttons |

### Layout widths

| Width       | Use                                                          |
| ----------- | ------------------------------------------------------------ |
| `max-w-6xl` | Public marketing, FAQ hub, header alignment                  |
| 700px       | Single-column wizard steps (situation, result, confirmation) |
| 880px       | Two-column wizard (vehicle details + sidebar)                |

**Responsive:** Below 768px, stack columns; sidebar FAQ moves below the form.

### Typography

| Name      | Size | Weight | Font     | Use                                           |
| --------- | ---- | ------ | -------- | --------------------------------------------- |
| `title`   | 28px | 800    | Fraunces | Section titles inside flows (not page chrome) |
| `heading` | 18px | 700    | Fraunces | Section headings, reason labels               |
| `body`    | 15px | 400    | DM Sans  | Body copy, inputs, button text                |
| `caption` | 12px | 600    | DM Sans  | Labels, sidebar text, FAQ questions           |
| `micro`   | 11px | 600    | DM Sans  | Tags, badges, footnotes, eyebrows             |

**Tracking:** `letter-spacing: 0.06em` on uppercase labels (eyebrows, card section headers).

**Pairing:** Fraunces for headings (warmth). DM Sans for functional UI. Marketing landing may use system `font-semibold` at larger sizes for hero display type.

**Exception:** Large numbers in result contexts (coverage %, trip totals) may sit outside the scale as visual anchors.

---

## Components

### Selection tile (`SelectionTile`)

- Border: 2px, `border` → `brand` when selected
- Background: `surface` → `brandLight` when selected
- Radio indicator: top-right circle (24px), empty → filled brand with ✓ when selected

### Field (`Field`)

- Label: `caption`, uppercase, `0.06em` tracking, `mid`
- Hint: `caption`, `light`, only when needed
- Input: `body`, `surface`, 1.5px `border`, `r8`, padding 10px 16px
- Focus: border `brand`

### Inline confirmation (`ComputedBadge`)

- Pill badge or inline calculated text (e.g. km/year)

### FAQ (`FaqCollapsed`)

- Collapsed by default; count badge on header
- Count badge: `brand` background, white number, `r20` pill
- Open question: `brandLight` background
- Placement: sidebar (two-column) or bottom (single-column)

### Hero block (per outcome)

| Outcome   | Background               | Accent           | Icon                     |
| --------- | ------------------------ | ---------------- | ------------------------ |
| Go        | `brand` dark full-width  | Glass stat tiles | Car animation (optional) |
| No-go     | `redBg` light centered   | `red` circle     | ✕                        |
| Edge case | `amberBg` light centered | `amber` circle   | 🔍                       |

### Primary button (`Btn`)

- `brand` background, white text, `r8`, padding 12px 24px
- Disabled: `sand` / `light` text
- Secondary: outline `border`, `mid` text
- **Public header sign-in:** `rounded-full` (exception to `r8` for chrome CTAs)

**Rule:** One primary button per screen. “Back” is always secondary.

### Conditional banner

- Amber background/border, `r12`, dark amber text
- Only when a condition applies

### Step list (`StepList`)

- Numbered circles (32px); active step `brand`, others `sand`

---

## UX principles

### 1. Progressive disclosure

Default state shows only what’s needed now. FAQ and cost breakdown start collapsed.

### 2. At most two supporting blocks per screen

Beside the main story, at most two supporting blocks—or collapse / move to another step.

### 3. One primary action per screen

One primary button. “Back” is secondary.

### 4. Sidebar pattern

Input screens: right sidebar (280px, sticky)—summary on top, collapsed FAQ below.

### 5. Visual distinction over decoration

Icons and emoji only when they communicate a real difference.

### 6. Signature moments — intentional and rare

Car animation, people bar, contextual loading, confirmation celebration—nice-to-have, weigh cost per case.

---

## Content principles

| Element      | Guideline                                       |
| ------------ | ----------------------------------------------- |
| Page title   | In page content (`h1`), not in the fixed header |
| Intro body   | Max 1–2 sentences on hub / step openers         |
| Field label  | 2–4 words, uppercase                            |
| Field hint   | Only if needed; max one sentence                |
| Button copy  | 2–5 words + arrow (→ / ←) where useful          |
| FAQ question | User voice (“Why…?”, “How does…?”)              |
| FAQ answer   | Max 3 sentences                                 |
| Disclaimer   | Italic, `micro`, `light`                        |

**Tone:** Personal but not cutesy. Prefer “your car” over “the vehicle.” Avoid exclamation marks in routine UI.

---

## Per-screen checklist

```
□ Uses PublicShell on new public routes (FAQ, simulation, marketing)?
□ Header + main offset; no second top bar unless dev-only?
□ Page titles in content, not in the fixed header?
□ Titles and body on the type scale where Fraunces/DM Sans apply?
□ Spacing on the 8px grid?
□ Radius from 8 / 12 / 20?
□ At most 2 supporting blocks beside the main story?
□ FAQ collapsed where it helps?
□ One primary button?
□ Accent colors correct (amber / red / green)?
□ Stacks cleanly below 768px?
```

---

## What this spec does not cover

- **No Figma specs.** Functional–visual reference only.
- **No code architecture** beyond pointing at `app/app/components/public/`.
- **No final copy.** Strings live in `messages/*.json`.
- **No motion specs.** Timing per implementation.
