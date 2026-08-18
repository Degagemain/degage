---
title: Simulations
roles:
  - admin
---

# Simulations

This page combines:

- How simulation runs work
- Which tables the engine uses
- What you can see in the simulations list screen

## Purpose

The simulation estimates whether a vehicle fits platform policy and pricing expectations.

It does this by combining:

- Eligibility checks (mileage and age limits)
- Financial estimates (value, tax, insurance, maintenance, inspection, fuel, depreciation)
- Quality scoring (eco score, mileage, age, and demand context)
- Final category rules (A, B, or rejection)
- Optional hub **maximum car price**: when set, a run that would have been accepted as Category A or B can become **Manual review** instead (see
  below)

Each run produces a result plus a detailed list of steps/messages so admins can understand why the decision was made.

## Main input fields

The run uses car and context data such as:

- Brand, fuel type, car type (or "other" type)
- Purchased/existing flag, new vs used car flag (purchased cars only), first registration date, mileage (odometer at purchase for purchased
  cars), seats, van flag
- Purchase price (for purchased cars)
- Town and expected owner km per year

## End-to-end flow

### 1) Initial checks

- All runs check max mileage (odometer reading, including for newly purchased cars).
- Used cars also check max age.
- Limits come from the selected hub configuration.
- If one check fails, the simulation stops with **Not OK**.

### 2) Car value estimate

- Used car: value range is estimated and converted into an estimated current car value.
- Purchased car: the purchase price is used as estimated value.

### 3) Car technical profile estimate

- The engine estimates technical values needed later: consumption, cylinder capacity (cc), CO2, eco score, and euro norm.

### 4) Yearly car tax estimate

- Electric cars: flat tax rate by fiscal region and first registration date.
- Non-electric cars:
  - Base rate by region/date/cc
  - CO2 adjustment
  - Euro norm adjustment (diesel-specific when applicable)
- For older registrations, the historical increase factor is applied.

For policy background on the CO2 logic, see
[Vehicle tax for passenger cars](https://www.vlaanderen.be/belastingen-en-begroting/vlaamse-belastingen/verkeersbelastingen/verkeersbelastingen-voor-personenwagens).

### 5) Yearly insurance estimate

- Insurance is estimated from the most recent benchmark matching the simulation year and car value.
- Formula: base amount + variable percentage on car value.

### 6) KM-rate building blocks

The simulation then calculates:

- Inspection cost per year
- Maintenance cost per year
- Hub shared km scenarios (min/avg/max)
- Estimated total yearly mileage
- Fixed yearly cost
- Fuel cost per km
- Depreciation cost per km
- Rounded final km cost

### 7) Quality points

Points are awarded using hub thresholds:

- Eco score threshold
- Mileage threshold
- Vehicle age threshold

If points are low, extra correction rules are applied (eco score, mileage bands, age bands, and high-demand town bonus).

If final points are still below minimum, result is **Not OK**.

### 8) Final result assignment

If quality criteria pass, the engine applies category rules:

- **Category A**: lower km-cost profile (with extra fallback rules in some cases)
- **Category B**: larger-seating threshold rule, and the fallback for vans
- **Not OK**: if pricing criteria are not met

**High-value manual review (hub setting):** The hub can define a **maximum car price** for automatic acceptance. If that limit is set and the
**estimated car value** (existing cars) or **purchase price** (purchased cars) is **above** it, the simulation still runs the full calculation.
Only when the outcome **would** have been **Category A** or **Category B** does the engine replace that with **Manual review**. A step message
explains which category would have applied. If the outcome would have been **Not OK**, the price cap does **not** change the result. Details and
configuration are in [Hubs](hubs.md).

## Result codes

| Code              | Meaning                                                                                                                                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category A**    | Vehicle qualifies for standard lower km-rate profile.                                                                                                                                                                                                               |
| **Category B**    | Vehicle qualifies for the alternative category rule (larger-seating profile, or van).                                                                                                                                                                               |
| **Not OK**        | Vehicle fails eligibility, quality, or pricing criteria.                                                                                                                                                                                                            |
| **Manual review** | Either: (1) **High car value** — hub max price is exceeded and rules would have accepted the car (Category A or B); check the steps for the intended category. (2) **Technical fallback** — the run could not finish (missing reference data, runtime error, etc.). |

## Tables used by simulation

The simulation reads operational/reference tables from the admin data set.

| Table/topic used              | Why it is used in simulation                                                     | Related admin documentation                                       |
| ----------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Towns                         | Starting point for location context and demand flag.                             | [Towns](towns.md)                                                 |
| Hubs                          | Provides most thresholds, yearly fixed-cost parameters, and shared-km scenarios. | [Hubs](hubs.md)                                                   |
| Provinces                     | Resolves province from town.                                                     | [Provinces](provinces.md)                                         |
| Fiscal regions                | Determines tax region rules.                                                     | [Fiscal regions](fiscal-regions.md)                               |
| Fuel types                    | Provides fuel type logic and fuel price per unit.                                | [Fuel types](fuel-types.md)                                       |
| Car types                     | May provide eco score used in quality scoring.                                   | [Car types](car-types.md)                                         |
| Car infos                     | Source for estimated technical car profile values.                               | [Car infos](car-infos.md)                                         |
| Car price estimates           | Source for market value range estimation.                                        | [Car price estimates](car-price-estimates.md)                     |
| Euro norms                    | Needed for non-electric tax adjustment grouping.                                 | [Euro norms](euro-norms.md)                                       |
| Car tax base rates            | Base annual tax rates by region/date/cc.                                         | [Car tax base rates](car-tax-base-rates.md)                       |
| Car tax flat rates            | Flat tax rates (notably for electric vehicles).                                  | [Car tax flat rates](car-tax-flat-rates.md)                       |
| Car tax euro norm adjustments | Tax multiplier adjustments by euro norm group.                                   | [Car tax euro norm adjustments](car-tax-euro-norm-adjustments.md) |
| Insurance price benchmarks    | Base + variable insurance pricing benchmarks.                                    | [Insurance price benchmarks](insurance-price-benchmarks.md)       |

## Simulations list screen

The list shows simulation runs with entered car data and calculated results. Open a row to view full result details and step messages.

Columns marked _(hidden by default)_ are available via the column picker but not shown on first load.

| Property              | Description                                                                      |
| --------------------- | -------------------------------------------------------------------------------- |
| Description           | One-line summary combining town, brand, fuel type, and car type.                 |
| Result code           | Overall result (e.g. Not OK, Manual review). Links to the detail page.           |
| Mileage               | Mileage entered in km.                                                           |
| Seats                 | Number of seats.                                                                 |
| First registered at   | First registration date.                                                         |
| Est. car value        | Estimated market value of the vehicle used in the calculation.                   |
| Depreciation cost/km  | Depreciation contribution per km as calculated by the engine.                    |
| Insurance cost/year   | Estimated yearly insurance cost.                                                 |
| Created               | Date and time the simulation was saved.                                          |
| Town                  | Town selected for the run. _(hidden by default)_                                 |
| Brand                 | Car brand entered. _(hidden by default)_                                         |
| Fuel type             | Fuel type entered. _(hidden by default)_                                         |
| Car type              | Car type or "Other" description. _(hidden by default)_                           |
| Owner km/year         | Expected yearly km driven by the owner. _(hidden by default)_                    |
| Purchase price        | Purchase price entered for purchased cars. _(hidden by default)_                 |
| Purchased car         | Whether the car was marked as purchased. _(hidden by default)_                   |
| New car               | Whether a purchased car was marked as brand new (vs used). _(hidden by default)_ |
| Van                   | Whether the car was marked as a van. _(hidden by default)_                       |
| Tax cost/year         | Estimated yearly road tax. _(hidden by default)_                                 |
| Inspection cost/year  | Estimated yearly inspection cost. _(hidden by default)_                          |
| Maintenance cost/year | Estimated yearly maintenance cost. _(hidden by default)_                         |
| Km rate               | Final rounded km-cost used for the result. _(hidden by default)_                 |
| Min shared km         | Minimum shared km scenario from hub settings. _(hidden by default)_              |
| Avg shared km         | Average shared km scenario from hub settings. _(hidden by default)_              |
| Max shared km         | Maximum shared km scenario from hub settings. _(hidden by default)_              |
| Euro norm             | Euro emission norm of the vehicle. _(hidden by default)_                         |
| Ecoscore              | Environmental score of the vehicle. _(hidden by default)_                        |
| Consumption           | Estimated fuel consumption. _(hidden by default)_                                |
| Cylinder cc           | Engine cylinder capacity in cc. _(hidden by default)_                            |
| CO2 (g/km)            | CO2 emission in g/km. _(hidden by default)_                                      |
| Rejection reason      | Reason text when the result is Not OK. _(hidden by default)_                     |
| Car type (other)      | Custom type description when "Other" was chosen. _(hidden by default)_           |
| Duration              | How long the engine run took, in whole seconds. _(hidden by default)_            |
| Result email          | Address used to e-mail the simulation outcome (if set). _(hidden by default)_    |
| Updated               | Date and time the simulation was last updated. _(hidden by default)_             |

On the simulation **detail** screen you can enter or change this address. The e-mail to the recipient uses your **current interface language**.
For simulations that finished successfully (not **Not OK**, and without an engine error), saving a **new or changed** address sends the result
to that address and notifies support with an admin link. User-facing result emails include a **public result link** (`SIMULATION_URL` →
`/app/simulation/{id}`).

You can download the rows that match the current filters and sort order using **More**, then **Export**. Choose a spreadsheet-friendly download
or a structured data download. Column labels match what you see in the list (including columns you may have hidden). Only administrators can
export.

## Public simulation flow

Public runs start at `/app/simulation` (situation → car details → assessment). After creation, the user is redirected to `/app/simulation/{id}`.
That page is addressable by id: anyone with the link can view the result; the submitter's **email is not returned** on anonymous
`GET /api/simulations/{id}`. Logged-in users (including admins) receive the full record including email.

- **Create:** `POST /api/simulations` (public)
- **Read by id:** `GET /api/simulations/{id}` (public when unauthenticated; email omitted)
- **Result URL in emails:** `{BETTER_AUTH_URL}/app/simulation/{id}` via template variable `SIMULATION_URL`

Users cannot return to the wizard from a saved result; starting again opens a new run at `/app/simulation`.

## Admin guidance

- Keep reference tables complete and up to date before running large simulation batches.
- If many runs return **Manual review**, check whether the hub **maximum car price** explains them (high-value cases show an explanatory step);
  otherwise verify missing or invalid reference data first.
- Revisit hub thresholds regularly because they strongly influence acceptance and category outcomes.
