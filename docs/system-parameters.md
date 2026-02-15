# System parameters

System parameters are configuration values that control business rules (e.g. simulation limits). They are stored in the database, seeded by code, and **only their values** can be changed at runtime by admins. Definitions (code, category, type, name, description) are fixed by the seed.

## Purpose

- Centralise configurable limits and options (e.g. max car age, max km for simulation).
- Let admins adjust values without code changes or redeploys.
- Keep definitions (code, category, type, translations) under version control via the seed script.

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

The seed script (`seeding/seed-system-parameters.ts`) runs as part of `pnpm db:seed`. It **only creates** parameters that do not yet exist (by `code`). It does not overwrite existing rows, so any value changes made by admins are preserved.

First batch (category **simulation**):

| Code          | Name (EN)       | Type   | Default | Description                                                                 |
| ------------- | --------------- | ------ | ------- | --------------------------------------------------------------------------- |
| `maxAgeYears` | Max age (years) | number | 15      | Used in the simulation to reject cars that exceed this age. Value in years. |
| `maxKm`       | Maximum km      | number | 250 000 | Used in the simulation to reject cars that exceed this mileage.             |

## Admin UI

Under **Admin → System parameters**:

- List is filtered by category and search (code/name).
- **Edit** opens a dialog where only the value(s) for that parameter’s type can be changed (number, min/max, or euro norm select).
- Saving sends a PATCH with only the value payload; code, category, type, and translations are never sent.

## API

- **GET /api/system-parameters** — Paginated list (admin only). Query: `category`, `query`, `skip`, `take`, `sortBy`, `sortOrder`.
- **GET /api/system-parameters/[id]** — Single parameter (admin only).
- **PATCH /api/system-parameters/[id]** — Update only value fields (admin only). Body: `valueNumber`, `valueNumberMin`, `valueNumberMax`, `valueEuronormId` (all optional, depending on type).

## Usage in app

Simulation uses parameters by code:

- `getSimulationParams()` loads `maxAgeYears` and `maxKm` and returns `{ maxAgeYears, maxKm }`.
- If a parameter is missing, defaults (15 years, 250 000 km) are used so the simulation still runs.

See [simulation.md](./simulation.md) for how these limits are applied in the simulation engine.
