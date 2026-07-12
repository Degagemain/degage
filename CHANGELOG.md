# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Public features

- Added: during car onboarding, the insurance step always appears; you first
  indicate whether you have an insurance contract, and insurer details are only
  asked when you do.
- Added: during car onboarding, a new road assistance plan step lets you say
  whether you already have a plan (with end date) and choose a desired plan from
  the available options.
- Added: during car onboarding preparation, a new car stickers step lets you
  pick extra sticker designs from a grid; always-included stickers stay selected
  and cannot be removed, and you must pick at least one extra sticker to
  complete the step.

### Admin features

- Added: car onboarding records show whether the owner has an insurance
  contract on the insurance tab; insurer details are optional when they do not.
- Added: car onboarding records include a road assistance plan tab with
  existing plan status, end date, and desired plan.
- Added: admins can manage road assistance plans (name, description, and active
  status per language) from the Car section of the admin menu.
- Added: admins can manage car stickers (name, image, and whether they are
  active or always included).
- Changed: car stickers linked to a car onboarding can no longer be deleted.

### Technical

- Added: MCP tools to list, create, and update documentation groups.
- Changed: MCP documentation tool descriptions no longer reference REST endpoints.
- Integration of simple release notes.

## [0.0.1] - 2026-07-07

### Public features

- Added: during car onboarding, owners who purchased a used car can upload the pink form (vehicle transfer form).
- Added: during car onboarding, owners of non-purchased cars can upload an inspection certificate when the car is more than four years old; the section stays visible but disabled with an explanation otherwise.
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

- Added: car onboarding records include a pink form upload on the car info tab.
- Added: car onboarding records include an inspection certificate upload on the car info tab.
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

- Changed: car onboarding document uploads run Gemini vision validation before storage
- Added: registration certificate front OCR via Gemini vision
- Changed: consolidated duplicate "Yes" / "No" message keys into shared `common.yes` and `common.no` translations.
