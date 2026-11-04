### Admin features

- Added: admins can sync a car onboarding row to the configured Google Spreadsheet from Admin wrap-up.

### Technical

- Added Google Sheets service-account integration (`@googleapis/sheets`) with setup script and health check.
- Car-onboarding spreadsheet mapping lives under `app/actions/car-onboarding/gsheet/` so the Sheets client stays reusable.
