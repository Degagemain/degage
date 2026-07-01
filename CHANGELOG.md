# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Public features

- Added: the public simulation now asks whether the car is a commercial vehicle or partly claimed as business expenses; answering yes shows a warning and blocks continuing.
- Changed: the simulation depreciation cost per km is never below the hub minimum.
- Changed: the simulation now enforces a cap on a car's depreciation cost per km.
  When the cost is too high, the estimated car value is automatically adjusted
  within its valuation range to meet the limit; if that isn't possible, the car
  is not accepted and the price criteria are reported as not met.

### Admin features

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

- Changed: consolidated duplicate "Yes" / "No" message keys into shared `common.yes` and `common.no` translations.
