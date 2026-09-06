# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Technical

- Changed: `posthog-js` upgraded from 1.364.7 to 1.427.2 so browser events report a supported web SDK version.

## [0.0.5] - 2026-09-02

### Public features

- Added: if your car onboarding is still incomplete, you may receive a reminder email to continue.
- Fixed: when the support assistant looks up more than one topic in a single reply, all documentation sources stay listed.

### Admin features

- Added: admins can send a preparation reminder email from an onboarding, and incomplete onboardings are reminded automatically every few days.
- Fixed: when editing documentation, you can change the format (plain text or Markdown).
- Removed: documentation is no longer synced from Notion. Existing Notion-sourced articles disappear after this update.

### Technical

- Added: Vercel daily cron for car onboarding preparation reminder emails (`CRON_SECRET`).
- Added: MCP tool to create documentation articles.
- Removed: Notion documentation webhook (`/api/webhooks/notion`), `@notionhq/client`, and all `NOTION_*` environment variables.
- Removed: `DocumentationSource.notion`. The migration deletes Notion-sourced documentation rows, then drops the enum value.

## [0.0.4] - 2026-08-18

### Public features

- Added: during car onboarding, new purchased cars require a proof of purchase
  with the purchase price including VAT visible.
- Changed: fuel types on the simulation page follow the order set by admins.
- Fixed: during car onboarding, the insurer you save is shown again when you
  return to the step.
- Fixed: during car onboarding, info session times now show the correct Belgium
  time.
- Removed: during car onboarding, after connecting Degapp you no longer see a
  disconnect button; disconnect from profile settings instead.
- Changed: when you type a custom car type as Other, the simulation loading
  title uses only the brand (not "Other").
- Changed: during car onboarding, insurers that support instant onboarding let
  you start sharing from the first of this or next month, without the usual
  insurance waiting period.
- Changed: during car onboarding, Save & Next on the last available step takes
  you back to the overview.
- Changed: during car onboarding, the info session list only shows owner
  sessions and no longer includes a type column.
- Changed: during car onboarding, you no longer choose a road assistance plan
  from a list; you only say whether you already have coverage (and until when).
- Added: during car onboarding road assistance, if you already have a plan you
  enter its name.

### Admin features

- Added: email templates are now managed in app.
- Added: car onboarding records include a proof of purchase and the price read
  from it for new purchased cars.
- Added: admins can set a display order for fuel types; the simulation uses that order.
- Added: insurers can be marked as supporting instant onboarding.
- Added: the documentation list row menu includes Delete for manual entries.
- Added: the onboardings list shows preparation as a colored step bar; hover a
  block for the step name, click to open that tab. Individual status columns are
  hidden by default.
- Added: car onboarding detail has an Onboarding menu with an Admin wrap-up tab
  where admins can sync the autofiche to legacy play app.
- Added: car onboarding records include the name of an existing road assistance
  plan.
- Changed: car onboarding no longer requires a desired road assistance plan; the
  plan picker is hidden.
- Added: translation overrides can include clickable website and email links,
  written as [label](https://www.example.com) or [label](mailto:hello@example.com).

### Technical

- Added: `InlineCopy` renders `[label](https://…)`, `[label](http://…)`, and
  `[label](mailto:…)` in public and owner prose translations.

## [0.0.3] - 2026-08-12

### Public features

- Changed: during car onboarding, a green check next to the step title appears
  only when that step is done.
- Added: during car onboarding user info, you enter a house number next to the
  street.
- Changed: during car onboarding, steps with a save action now offer Save & Next
  instead of Next alone.
- Fixed: during car onboarding, you cannot upload another document or continue
  while a file upload is still in progress.
- Added: at the end of car onboarding preparation, you confirm your info and
  commit to car sharing; after that, preparation details are read-only.
- Added: during car onboarding preparation, the last step lets you pick a unique
  name for your car and choose when sharing starts; names are 3–13 characters
  (letters and digits only, no special characters or dashes), and sharing always
  begins on the first of a month (earliest option depends on your insurance).
- Changed: during car onboarding, extra stickers are optional; you can continue
  with only the always-included stickers.
- Changed: car onboarding overview now shows the full journey in three chapters
  (preparation, the switch, ready to share), so you can see what comes after
  preparation.

### Admin features

- Changed: the Columns control on admin tables can be searched, with matches
  highlighted in the list.
- Added: car onboarding records include a house number on user info.
- Changed: car onboarding preparation is Ready only after the owner confirms;
  Finalize shows when they confirmed.
- Changed: Finalize uses Lock / Unlock preparation instead of Start onboarding.
- Added: admins can clear the owner's preparation confirmation from Finalize.
- Added: car onboarding records include a tab for car name and share start date.

### Technical

- Added: play connector can now perform admin-only actions.
- Added: server captures PostHog `user signed up` and `user logged in` events from Better Auth hooks.
- Changed: server-side PostHog uses default batching.
- Fixed: `simulation` event are now captured after create and include the persisted simulation `id`.

## [0.0.2] - 2026-07-16

### Public features

- Changed: after you run a simulation, you are taken to a personal result page
  you can bookmark or reopen later; starting again begins a new simulation.
- Changed: result e-mails now include a link to view your simulation online
  instead of showing the simulation ID.
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

- Added: on a simulation detail page, admins can open the public result page
  for that simulation.
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

- Added: MCP tool to list and search towns.
- Added: MCP tool to search car types (requires car brand and fuel type).
- Added: MCP tools to list and read car brands.
- Added: MCP tool to list and search fuel types.
- Added: MCP tools to list, create, and update documentation groups.
- Changed: MCP documentation tool descriptions no longer reference REST endpoints.
- Integration of simple release notes.
- Added: GitHub Action to cut a release from the changelog (patch bump, tag, and GitHub Release).

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
