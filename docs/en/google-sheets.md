---
title: Google Sheets
roles:
  - technical
---

# Google Sheets

Reusable Google Sheets client for server-side sync via a dedicated service account. Domain-specific row mapping (for example car onboarding)
lives outside this module.

## Configuration

| Variable                                      | Purpose                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------ |
| `GOOGLE_SHEETS_CREDENTIALS`                   | Base64-encoded service account JSON (local / CI). Omit on GCP for ADC.   |
| `GOOGLE_SHEETS_CAR_ONBOARDING_SPREADSHEET_ID` | Spreadsheet id used by car-onboarding sync (use-case specific).          |
| `GOOGLE_SHEETS_CAR_ONBOARDING_SHEET_NAME`     | Optional tab name. When unset, the first tab in the spreadsheet is used. |

Share the target spreadsheet with the service account email as **Editor** (Google Drive sharing, not GCP IAM).

### One-time service account setup

```bash
pnpm gcp:setup-sheets-sa <PROJECT_ID> <PREFIX> <ENVIRONMENT>
```

The script enables the Sheets API, creates `<PREFIX>-sheets-<ENVIRONMENT>`, writes a key file, and prints the `client_email` to share on the
spreadsheet.

Encode the key for `.env`:

```bash
pnpm gcp:encode-credentials ./path/to/service-account.json
```

## Module layout

- [`app/integrations/google-sheets/`](../../app/integrations/google-sheets/) — client, health check, generic header-gated upsert
- Credentials parsing is shared with GCS via [`app/integrations/gcp-credentials.ts`](../../app/integrations/gcp-credentials.ts)

## Health check

`assertGoogleSheetsHealthy(spreadsheetId)` verifies credentials are configured and the spreadsheet is reachable. Call it before any sync.

## Upsert

`upsertRowByHeaders` reads the first header row, aborts if any provided column name is missing, then updates the given row or appends a new one
and returns the row number.
