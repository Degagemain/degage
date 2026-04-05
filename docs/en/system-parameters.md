---
title: System Parameters
roles:
  - technical
  - admin
---

# System Parameters

Configurable values that control business rules (e.g. simulation limits). Only the value can be changed in the admin; code, category, type, and
name are fixed.

| Property | Description                                                 |
| -------- | ----------------------------------------------------------- |
| Code     | Unique identifier (e.g. maxAgeYears, maxKm).                |
| Category | Grouping (e.g. simulation) for filtering.                   |
| Name     | Display name (translatable, read-only).                     |
| Type     | How the value is stored: number, number range, or euronorm. |
| Value    | The editable value(s) depending on type.                    |

## Structure

Each parameter has:

- **code** — Unique identifier (e.g. `maxAgeYears`, `maxKm`). Used by the app to look up values.
- **category** — Grouping (e.g. `simulation`). Used for filtering in the admin UI.
- **type** — How the value is stored and edited:
  - `number` — Single float (`valueNumber`).
  - `number_range` — Min/max floats (`valueNumberMin`, `valueNumberMax`).
  - `euronorm` — Reference to a Euro norm (`valueEuronormId`).
- **name** and **description** — Translatable (per locale). Shown in the admin UI; not editable at runtime.
- **Value columns** — Nullable fields depending on type (see above). Only these are updated when an admin saves.

## Seeding

The seed script (`seeding/seed-system-parameters.ts`) runs as part of `pnpm db:seed`. It **only creates** parameters that do not yet exist (by
`code`). It does not overwrite existing rows, so any value changes made by admins are preserved.

First batch (category **simulation**):

| Code          | Name (EN)       | Type   | Default | Description                                                                 |
| ------------- | --------------- | ------ | ------- | --------------------------------------------------------------------------- |
| `maxAgeYears` | Max age (years) | number | 15      | Used in the simulation to reject cars that exceed this age. Value in years. |
| `maxKm`       | Maximum km      | number | 250 000 | Used in the simulation to reject cars that exceed this mileage.             |

## API

- **GET /api/system-parameters** — Paginated list (admin only). Query: `category`, `query`, `skip`, `take`, `sortBy`, `sortOrder`.
- **GET /api/system-parameters/[id]** — Single parameter (admin only).
- **PATCH /api/system-parameters/[id]** — Update only value fields (admin only). Body: `valueNumber`, `valueNumberMin`, `valueNumberMax`,
  `valueEuronormId` (all optional, depending on type).

## Export

Use **More → Export** to download the current filtered/sorted list as CSV or JSON.

## Usage in app

Simulation uses parameters by code:

- `getSimulationParams()` loads `maxAgeYears` and `maxKm` and returns `{ maxAgeYears, maxKm }`.
- If a parameter is missing, defaults (15 years, 250 000 km) are used so the simulation still runs.
