---
title: Admin create and edit forms
roles:
  - technical
---

# Admin create and edit forms

This document describes the pattern for **list + create + edit** admin screens. **Fuel types** and **car brands** are the reference
implementations.

## Admin entities with `POST` + `PUT` (JSON CRUD)

These are the API resources that support **create** (`POST` on the collection) and **replace** (`PUT` on `/{id}`), aligned with the admin table
entities that will get matching **new** and **`[id]`** pages.

| Admin area (folder under `app/app/admin/`) | Collection `POST`                    | Item `PUT`                 | Translations in domain      | Create/edit UI status        |
| ------------------------------------------ | ------------------------------------ | -------------------------- | --------------------------- | ---------------------------- |
| `fuel-types`                               | `/api/fuel-types`                    | `/api/fuel-types/{id}`     | Yes (`translations[]`)      | Done                         |
| `car-brands`                               | `/api/car-brands`                    | `/api/car-brands/{id}`     | Yes                         | Done                         |
| `car-types`                                | `/api/car-types`                     | `/api/car-types/{id}`      | No (single `name`)          | Done                         |
| `euro-norms`                               | `/api/euro-norms`                    | `/api/euro-norms/{id}`     | No                          | Done                         |
| `provinces`                                | `/api/provinces`                     | `/api/provinces/{id}`      | No                          | Done                         |
| `towns`                                    | `/api/towns`                         | `/api/towns/{id}`          | No                          | Done                         |
| `fiscal-regions`                           | `/api/fiscal-regions`                | `/api/fiscal-regions/{id}` | No                          | Done                         |
| `hubs`                                     | `/api/hubs`                          | `/api/hubs/{id}`           | No                          | Done                         |
| `car-tax-euro-norm-adjustments`            | `/api/car-tax-euro-norm-adjustments` | `…/{id}`                   | No                          | Done                         |
| `car-price-estimates`                      | `/api/car-price-estimates`           | `…/{id}`                   | No                          | Done                         |
| `car-infos`                                | `/api/car-infos`                     | `/api/car-infos/{id}`      | No                          | Done                         |
| `hub-benchmarks`                           | `/api/hub-benchmarks`                | `…/{id}`                   | No                          | Done                         |
| `insurance-price-benchmarks`               | `/api/insurance-price-benchmarks`    | `…/{id}`                   | No                          | Done                         |
| `documentation`                            | `/api/documentation`                 | `/api/documentation/{id}`  | Per-locale content (custom) | Separate flow                |
| `simulations`                              | `/api/simulations`                   | — (no `PUT` on item)       | N/A                         | Has `new` + read-only `[id]` |

**Not in this table:** `car-tax-base-rates` and `car-tax-flat-rates` admin lists have **GET-only** collection routes (no `POST`). **System
parameters** use **`PATCH`** on `/api/system-parameters/{id}` (values only), not full `PUT` body replace. **Users** has no admin `POST`/`PUT` in
the same sense.

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

Both `new` and `[id]` pages use a **top bar** (`border-b`, `h-14`) with actions on the **left**:

- **Save** first — `type="submit"` with `form={…_FORM_ID}`, `variant="outline"`, `size="sm"`, small save icon.
- **Delete** — only on edit; opens `DeleteConfirmationDialog`, then `DELETE /api/{entity}/{id}`, same toasts and redirect to list as the table
  delete flow.

## Shared form layout

- One form component (e.g. `components/{entity}-form.tsx`) used by **new** and **edit**.
- **No** card or bordered panel on the form itself; padding on the `<form>` and `max-w-2xl` on the field group.
- **React Hook Form** + **Zod** (`zodResolver`). Validation copy from **`admin.common.validation.*`**.
- Entity copy under **`admin.{entity}`** (columns, delete, form help, placeholders).

## Reusable admin form building blocks

Shared UI lives under **`app/app/components/form/`** (not per-entity `fields/`):

| Module                                   | Role                                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `form/admin-text-field-control.tsx`      | Label + input + description + error                                                     |
| `form/admin-number-field-control.tsx`    | Same for `type="number"`                                                                |
| `form/admin-switch-field-control.tsx`    | Horizontal switch + label                                                               |
| `form/admin-locale-tabs-control.tsx`     | Compact locale tabs + error styling per tab                                             |
| `form/admin-translated-string-field.tsx` | Name row: label + tabs + **single** `translations` RHF field with merge-on-change       |
| `form/admin-searchable-select-field.tsx` | Label + `SearchableSelect` + description + error (relations: brand, fuel type, town, …) |
| `form/admin-date-field-control.tsx`      | Date input with validation helpers in `form/date-input-helpers.ts`                      |
| `form/admin-textarea-field-control.tsx`  | Label + textarea + description + error (multi-line text, lists split by line)           |
| `form/empty-content-locale-record.ts`    | `Record<ContentLocale, string>` initialiser                                             |

Use **`parseApiErrorMessage`** from `app/app/lib/parse-api-error-message.ts` for failed `POST`/`PUT` responses.

## Translated fields (locale tabs)

Content locales: `app/i18n/locales.ts` (`contentLocales`: `en`, `nl`, `fr`).

**Important:** Use **`AdminTranslatedStringField`** (or the same pattern): one RHF field `translations` as `Record<ContentLocale, string>`, bind
input to `value[activeLocale]`, and merge on `onChange`. Do not swap `Controller` `name` per tab.

On submit:

- `translations`: `{ locale, name }[]` for every content locale.
- Top-level `name`: from the **active** tab (or your agreed rule).

## API and domain

- **Create** — `POST /api/{entity}`; typically **201** + body.
- **Update** — `PUT /api/{entity}/{id}`; `id` in body must match path; often **204** — reload with `GET` if needed.
- **Load** — `GET /api/{entity}/{id}`.

Domain models that round-trip JSON through `parse` should use **`z.coerce.date()`** for `createdAt` / `updatedAt` (and any similar timestamp
fields) so ISO strings from the client validate.

## Internationalization (shared vs entity)

| Namespace                   | Use for                                       |
| --------------------------- | --------------------------------------------- |
| `admin.common.actions.*`    | New, Save                                     |
| `admin.common.status.*`     | Saving…                                       |
| `admin.common.feedback.*`   | Save/load success and generic errors          |
| `admin.common.validation.*` | Required, numeric constraints                 |
| `admin.{entity}.*`          | Table, delete, entity form help, placeholders |

## Reference implementations

**Fuel types:** `app/app/admin/fuel-types/` — `page.tsx`, `columns.tsx`, `new/page.tsx`, `[id]/page.tsx`, `components/fuel-type-form.tsx`.

**Car brands:** `app/app/admin/car-brands/` — same structure, `components/car-brand-form.tsx`.

**Car types:** `app/app/admin/car-types/` — `components/car-type-form.tsx` (brand + fuel type via searchable API selects, single `name`,
ecoscore). `GET /api/car-types/{id}` resolves brand/fuel display names using the request content locale.
