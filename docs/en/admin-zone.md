---
title: Admin zone
roles:
  - technical
---

# Admin zone

The admin zone (`app/app/admin/`) provides CRUD management for all entities. Each entity follows the same UI patterns: a data table with
server-side pagination, sorting, filtering, and row actions.

## Entity page structure

Each entity folder typically contains:

- `page.tsx` — Page component with data fetching, state, filters, and table wiring.
- `columns.tsx` — TanStack Table column definitions, including the actions column.

Pages use the shared data table components from `app/app/components/ui/data-table/`.

## Deleting records

There are two deletion flows: single-row delete and bulk delete. Both call the entity's `DELETE /api/{entity}/{id}` endpoint and handle the same
response codes:

- **204** — Success.
- **409** — The record is linked to other records (foreign key constraint) and cannot be deleted.
- **Other errors** — Generic failure.

### Single-row delete

Each row has an **actions** column (three-dot menu) with a "Delete" option. Clicking it opens a `DeleteConfirmationDialog` — a simple
confirmation modal.

**Component:** `app/app/components/delete-confirmation-dialog.tsx`

```tsx
<DeleteConfirmationDialog
  open={itemToDelete !== null}
  onOpenChange={(open) => !open && setItemToDelete(null)}
  onConfirm={handleDeleteConfirm}
  title="…"
  description="…"
  confirmLabel="…"
  cancelLabel="…"
/>
```

Props are all strings so translations are passed from the page. On confirm, the page calls the DELETE endpoint, shows a toast
(success/conflict/error), and refreshes the table.

### Bulk delete

When rows are selected via checkboxes, a **"Selection (N)"** dropdown button appears in the toolbar (between the search box and the facet
filters). It contains a "Delete selected" option that opens a `BulkDeleteDialog`.

**Components:**

- `app/app/components/bulk-actions-button.tsx` — Dropdown trigger that auto-hides when nothing is selected.
- `app/app/components/bulk-delete-dialog.tsx` — Modal with a mini data table showing each selected record and its deletion status.

```tsx
<BulkActionsButton count={selectedItems.length} label={t('bulkActions.label')}>
  <DropdownMenuItem variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
    <Trash2 />
    {t('bulkActions.delete')}
  </DropdownMenuItem>
</BulkActionsButton>
```

```tsx
<BulkDeleteDialog
  open={bulkDeleteOpen}
  onOpenChange={setBulkDeleteOpen}
  items={selectedItems}           // { id, label }[]
  deleteItem={(id) => fetch(…)}   // returns Promise<Response>
  onComplete={handleComplete}     // refresh table + clear selection
  labels={{ … }}                  // all UI strings
/>
```

The bulk delete dialog:

1. Lists all selected records in a small table with **Name** and **Status** columns.
2. On confirm, deletes records **one by one** sequentially, updating each row's status in real time:
   - Pending → Deleting… → Deleted / Failed.
3. If one record fails (e.g. 409 conflict), the process **continues** with the remaining records.
4. The dialog stays open so the user can review all results, then close it.
5. On close, the table is refreshed and row selection is cleared.

### Adding delete to a new entity

1. Add an `onDelete` callback to the column options and an `actions` column in `columns.tsx` (see `towns/columns.tsx` for reference).
2. In `page.tsx`, add state for single delete (`itemToDelete`) and bulk delete (`bulkDeleteOpen`).
3. Compute `selectedItems` from `rowSelection` + `state.data`.
4. Render `DeleteConfirmationDialog`, `BulkActionsButton`, and `BulkDeleteDialog`.
5. Add translations under the entity's i18n key for `actions`, `delete`, `bulkActions`, and `bulkDelete`.
