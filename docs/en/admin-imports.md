---
title: Admin Imports
roles:
  - technical
---

# Admin imports

This project uses one reusable bulk-import flow for admin table pages. An admin selects a JSON file previously produced by the matching export,
and each record is upserted through the existing REST API.

Adding import to a page requires only a small amount of glue code:

1. Pass `onImportClick` to the existing `DataTableToolbar` (the same toolbar that already renders **More → Export**).
2. Render `BulkImportDialog<Entity>` from `@/app/components/bulk-import-dialog` with an `upsertRecord` callback.
3. Add a short `admin.{entity}.bulkImport` block to each `messages/{locale}.json` (title, description, row name).
4. Update `docs/{locale}/{entity}.md` with a short import section.

## UI pattern

- The shared **More** menu in `DataTableToolbar` shows **Import** as a second item when `onImportClick` is provided. Export already gates this
  menu via `exportEndpoint`; import is purely additive.
- `BulkImportDialog` has two phases:
  1. **Select** — a file input (`accept="application/json"`) and an optional parse-error message.
  2. **Preview / run** — a table with columns **Name | Action | Status**. The action is derived from the record's `id` (present → **Update**,
     absent → **Insert**). A single **Import all** button processes every row.
- Per-row feedback mirrors the bulk-delete dialog: `pending → running → success` or `error`. One failure does not stop the others. Closing the
  dialog mid-run sets an abort flag; in-flight requests complete, no new ones are started. `onComplete` fires after close if at least one row
  was processed.

## Component API

```ts
interface BulkImportDialogProps<T extends { id?: string | null }> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getRecordLabel: (record: T) => string; // only page-specific piece
  upsertRecord: (record: T) => Promise<Response>;
  onComplete: () => void;
  concurrency?: number; // default 5
  parseFile?: (text: string) => T[]; // default: JSON.parse + Array.isArray
  labels: {
    title: string;
    description: string;
    columnName: string;
  };
}
```

Every other string (file picker, status cells, action badges, confirm/cancel/close) is read by the dialog itself from `admin.common.import.*`,
so callers never need a `useTranslations('admin.common.import')` hook.

Concurrency is implemented with `runWithConcurrency` in `app/app/lib/run-with-concurrency.ts` — a dependency-free worker pool that keeps at most
`limit` promises in flight and surfaces each settlement individually.

## Upsert contract

`upsertRecord` is page-specific because endpoints differ. The standard CRUD pattern is:

- **Insert** (no `id` in the exported record) → `POST /api/{entity}` with body `{ ...record, id: null }`. The server action parses through the
  domain schema (`z.uuid().nullable()`).
- **Update** (record has a UUID `id`) → `PUT /api/{entity}/{id}` with the full record as body. `tryUpdateResource` in `app/api/utils.ts`
  requires the body's `id` to equal the path `id` and returns `204 No Content` on success.

The dialog inspects only `response.ok` and `response.status`; it never reads the body. A `409` maps to the translated `statusConflict` label;
any other non-2xx maps to `statusError`.

## i18n keys

Shared (one-time in `messages/{locale}.json`):

```
admin.common.import.openImport
admin.common.import.title
admin.common.import.description
admin.common.import.selectFile
admin.common.import.parseError
admin.common.import.columnAction
admin.common.import.actionInsert
admin.common.import.actionUpdate
admin.common.import.columnStatus
admin.common.import.statusPending
admin.common.import.statusRunning
admin.common.import.statusSuccess
admin.common.import.statusError
admin.common.import.statusConflict
admin.common.import.confirm
admin.common.import.cancel
admin.common.import.close
```

Per-page overrides (only the model-specific strings):

```
admin.{entity}.bulkImport.title         # e.g. "Import towns"
admin.{entity}.bulkImport.description   # optional per-entity copy
admin.{entity}.bulkImport.columnName    # e.g. "Town"
```

## Notes

- Works best on pages whose export already round-trips through the standard `POST /api/{entity}` + `PUT /api/{entity}/[id]` endpoints.
- Pages without symmetrical write APIs (e.g. `simulations`, `system-parameters`, `car-tax-base-rates`, `car-tax-flat-rates`) are out of scope
  until their APIs are extended.
- No server-side changes are needed for pages that already have regular CRUD endpoints.
