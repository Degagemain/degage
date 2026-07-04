# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Public features

- Added: during car onboarding, upload the front and back of your registration certificate; VIN and licence plate are filled in automatically from the front when readable.
- Added: a clear message when the front photo cannot be read, asking you to upload a sharper picture of the front side.
- Changed: car info in onboarding is read-only and comes from your simulation; registration certificate upload replaces manual car detail editing.
- Changed: the FAQ on the first simulation step now appears at the bottom, consistent with the other steps.
- Added: the public simulation now asks whether the car is a commercial vehicle or partly claimed as business expenses; answering yes shows a warning and blocks continuing.
- Added: when buying a car in the simulation, you can mark it as new or used; for new cars, mileage and first registration are filled in automatically.
- Changed: on the cost scenario screen, the income line is no longer repeated in the cost breakdown.
- Changed: purchased cars show **Value** on the result screen instead of **Estimated value**.
- Changed: the simulation depreciation cost per km is never below the hub minimum.
- Changed: the simulation now enforces a cap on a car's depreciation cost per km.
  When the cost is too high, the estimated car value is automatically adjusted
  within its valuation range to meet the limit; if that isn't possible, the car
  is not accepted and the price criteria are reported as not met.

### Admin features

- Added: car onboarding records include VIN and licence plate; admins can view and edit them on the detail form.
- Added: hubs have a new **Min deprec. €/km** setting (bulk-update supported).
- Added: fiscal tax base rates for July 2026 through June 2027.
- Changed: simulation records now show whether a car was **purchased** instead of
  labelled as a "new car", matching how car onboarding describes the same choice.
- Added: admins can bulk-update simulation parameters on selected hubs from the
  hubs list.
- Changed: clarified hub labels for depreciation cost per km limits — the
  standard limit applies on every hub, and electric vehicles share one limit
  with category B.

### Technical

- Added: registration certificate front OCR via Gemini vision
- Changed: consolidated duplicate "Yes" / "No" message keys into shared `common.yes` and `common.no` translations.
