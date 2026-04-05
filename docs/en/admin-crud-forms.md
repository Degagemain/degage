---
title: Admin create and edit forms
roles:
  - technical
---

# Admin create and edit forms

This document describes the pattern for **list + create + edit** admin screens, using **fuel types** as the reference implementation
(`app/app/admin/fuel-types/`).

## Routes and navigation

| Route                                  | Purpose                                |
| -------------------------------------- | -------------------------------------- |
| `app/app/admin/{entity}/page.tsx`      | List (table, filters, delete, export). |
| `app/app/admin/{entity}/new/page.tsx`  | Create.                                |
| `app/app/admin/{entity}/[id]/page.tsx` | Edit.                                  |

List page conventions:

- **New** — `DataTableToolbar` `leadingSlot`: outline button with icon, same placement as simulations (`admin.common.actions.new`).
- **Edit** — primary identifier column (e.g. name) links to `/app/admin/{entity}/{id}`; the row **actions** menu includes **Edit** to the same
  URL.

## Top action row (create and edit)

Both `new` and `[id]` pages use a **sticky-style** top bar (`border-b`, `h-14`) with actions on the **left**:

- **Save** first — `type="submit"` with `form={FUEL_TYPE_FORM_ID}` (shared form id constant), `variant="outline"`, `size="sm"`, small save icon.
- **Delete** — only on edit; opens `DeleteConfirmationDialog`, then `DELETE /api/{entity}/{id}`, same toasts and redirect to list as the table
  delete flow.

## Shared form

- One form component (e.g. `components/{entity}-form.tsx`) used by **new** and **edit**.
- **No** card or bordered panel on the form itself; padding on the `<form>` and a constrained width (`max-w-2xl` on the field group) keep the
  layout compact.
- **React Hook Form** + **Zod** (`zodResolver`) validate client-side. Error messages come from **`admin.common.validation.*`** so they can be
  reused across entities.
- Entity-specific copy stays under **`admin.{entity}`** (column labels, placeholders, field help text).

## Field controls

Reusable wrappers live in `components/fields/` next to the form (e.g. text, number, switch). They compose shadcn-style primitives (`Field`,
`Input`, `Switch`) and accept `error` / `data-invalid` for accessibility.

## Translated fields (locale tabs)

Content locales are defined in `app/i18n/locales.ts` (`contentLocales`: `en`, `nl`, `fr`).

**Important:** Register **one** RHF field for the whole translations map (`name="translations"`), not a separate controller per locale that
swaps with the active tab. The visible input binds to `field.value[activeLocale]` and `onChange` **merges** into the existing object so
switching tabs does not clear other languages.

The locale picker (`LocaleTabsControl`) sits on the same row as the field label. Pass locales that have validation errors so tabs can show an
error state (e.g. ring + dot).

On submit, the API payload must include:

- `translations`: array of `{ locale, name }` for every content locale.
- Top-level `name`: mirror the **currently active** locale tab value (or your product rule), because the domain model still carries a display
  `name` alongside translations.

## API and domain

- **Create** — `POST /api/{entity}` with JSON body; expect **201** and returned entity.
- **Update** — `PUT /api/{entity}/{id}`; body `id` must match the path; response is **204 No Content** (reload the entity with `GET` after save
  if the UI needs fresh data).
- **Load (edit)** — `GET /api/{entity}/{id}`.

If the client sends ISO date strings for `createdAt` / `updatedAt`, the domain schema should use **`z.coerce.date()`** for those fields so
`fuelTypeSchema.parse` accepts JSON from the browser.

## Internationalization (shared vs entity)

| Namespace                   | Use for                                                                |
| --------------------------- | ---------------------------------------------------------------------- |
| `admin.common.actions.*`    | New, Save                                                              |
| `admin.common.status.*`     | Saving…                                                                |
| `admin.common.feedback.*`   | Save/load success and generic errors                                   |
| `admin.common.validation.*` | Required, numeric constraints                                          |
| `admin.{entity}.*`          | Table columns, delete copy, entity-specific form help and placeholders |

## Reference files (fuel types)

- `app/app/admin/fuel-types/page.tsx` — list + New + links.
- `app/app/admin/fuel-types/columns.tsx` — linked name, Edit action.
- `app/app/admin/fuel-types/new/page.tsx` — create + save row.
- `app/app/admin/fuel-types/[id]/page.tsx` — load, save, delete row.
- `app/app/admin/fuel-types/components/fuel-type-form.tsx` — form + locale field.
- `app/app/admin/fuel-types/components/fields/` — field controls + locale tabs.
