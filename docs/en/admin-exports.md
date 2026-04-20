---
title: Admin Exports
roles:
  - technical
---

# Admin exports

This project uses one reusable export flow for admin table pages:

1. Add an action file `app/actions/{entity}/export.ts`.
2. Add an API route `app/api/{entity}/export/route.ts`.
3. Enable the UI entrypoint by setting `exportEndpoint` on `DataTableToolbar` in `app/app/admin/{entity}/page.tsx`.
4. Update `docs/{locale}/{entity}.md` with a short export section.

## Action pattern

- Reuse paging with `pageAll(...)` from `app/actions/utils.ts`.
- Reuse CSV primitives from `app/domain/utils.ts`.
- Build translated headers with `getTranslations('admin.{entityKey}')`.
- Return:
  - `export{EntityPlural}(filter)` => full array
  - `export{EntityPlural}Csv(filter)` => UTF-8 BOM CSV string

## API route pattern

- Guard access by wrapping the handler in `withAdmin` from `@/api/with-context`.
- Accept export format from `exportFormat` (and fallback `format` for compatibility).
- Parse filter input with the same filter schema used by the normal list endpoint.
- Return downloadable response with:
  - `attachmentDownloadJsonResponse(...)` for JSON
  - `attachmentDownloadCsvResponse(...)` for CSV

## UI pattern

- `DataTableToolbar` renders the **More -> Export** flow when `exportEndpoint` is provided.
- The export URL is built from current URL params:
  - keep active filters/sort
  - remove `skip` and `take`
  - add `exportFormat=csv|json`

## Notes

- CSV should include table columns (including columns hidden in the UI column picker).
- Prefer existing translation keys under `admin.{entity}.columns.*` for CSV headers.
