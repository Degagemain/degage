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
- Final category rules (A, B, higher rate, or rejection)
- Optional hub **maximum car price**: when set, a run that would have been accepted as Category A, B, or higher rate can become **Manual
  review** instead (see below)

Each run produces a result plus a detailed list of steps/messages so admins can understand why the decision was made.

## Main input fields

The run uses car and context data such as:

- Brand, fuel type, car type (or "other" type)
- New/used flag, first registration date, mileage, seats, van flag
- Purchase price (for new cars)
- Town and expected owner km per year

## End-to-end flow

### 1) Initial checks

- For used cars, the engine checks max mileage and max age.
- Limits come from the selected hub configuration.
- If one check fails, the simulation stops with **Not OK**.

### 2) Car value estimate

- Used car: value range is estimated and converted into an estimated current car value.
- New car: the purchase price is used as estimated value.

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
- Shared mobility benchmark km (min/avg/max) based on owner km
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
- **Category B**: larger-seating threshold rule
- **Higher rate**: van rule
- **Not OK**: if pricing criteria are not met

**High-value manual review (hub setting):** The hub can define a **maximum car price** for automatic acceptance. If that limit is set and the
**estimated car value** (used cars) or **purchase price** (new cars) is **above** it, the simulation still runs the full calculation. Only when
the outcome **would** have been **Category A**, **Category B**, or **Higher rate** does the engine replace that with **Manual review**. A step
message explains which category or rate would have applied. If the outcome would have been **Not OK**, the price cap does **not** change the
result. Details and configuration are in [Hubs](hubs.md).

## Result codes

| Code              | Meaning                                                                                                                                                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Category A**    | Vehicle qualifies for standard lower km-rate profile.                                                                                                                                                                                                                             |
| **Category B**    | Vehicle qualifies for alternative category rule (typically larger seating profile).                                                                                                                                                                                               |
| **Higher rate**   | Vehicle is accepted with higher rate logic (van case).                                                                                                                                                                                                                            |
| **Not OK**        | Vehicle fails eligibility, quality, or pricing criteria.                                                                                                                                                                                                                          |
| **Manual review** | Either: (1) **High car value** — hub max price is exceeded and rules would have accepted the car (Category A, B, or higher rate); check the steps for the intended category. (2) **Technical fallback** — the run could not finish (missing reference data, runtime error, etc.). |

## Tables used by simulation

The simulation reads operational/reference tables from the admin data set.

| Table/topic used              | Why it is used in simulation                                | Related admin documentation                                       |
| ----------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- |
| Towns                         | Starting point for location context and demand flag.        | [Towns](towns.md)                                                 |
| Hubs                          | Provides most thresholds and yearly fixed-cost parameters.  | [Hubs](hubs.md)                                                   |
| Hub benchmarks                | Finds closest benchmark to estimate shared/total yearly km. | [Hub benchmarks](hub-benchmarks.md)                               |
| Provinces                     | Resolves province from town.                                | [Provinces](provinces.md)                                         |
| Fiscal regions                | Determines tax region rules.                                | [Fiscal regions](fiscal-regions.md)                               |
| Fuel types                    | Provides fuel type logic and fuel price per unit.           | [Fuel types](fuel-types.md)                                       |
| Car types                     | May provide eco score used in quality scoring.              | [Car types](car-types.md)                                         |
| Car infos                     | Source for estimated technical car profile values.          | [Car infos](car-infos.md)                                         |
| Car price estimates           | Source for market value range estimation.                   | [Car price estimates](car-price-estimates.md)                     |
| Euro norms                    | Needed for non-electric tax adjustment grouping.            | [Euro norms](euro-norms.md)                                       |
| Car tax base rates            | Base annual tax rates by region/date/cc.                    | [Car tax base rates](car-tax-base-rates.md)                       |
| Car tax flat rates            | Flat tax rates (notably for electric vehicles).             | [Car tax flat rates](car-tax-flat-rates.md)                       |
| Car tax euro norm adjustments | Tax multiplier adjustments by euro norm group.              | [Car tax euro norm adjustments](car-tax-euro-norm-adjustments.md) |
| Insurance price benchmarks    | Base + variable insurance pricing benchmarks.               | [Insurance price benchmarks](insurance-price-benchmarks.md)       |

## Simulations list screen

The list shows simulation runs: town, result, and entered car data. Open a row to view full result details and step messages.

| Property            | Description                                      |
| ------------------- | ------------------------------------------------ |
| Town                | Town selected for the run (if any).              |
| Result code         | Overall result (e.g. Not OK, Manual review).     |
| Brand               | Car brand entered.                               |
| Fuel type           | Fuel type entered.                               |
| Car type            | Car type or “Other” description.                 |
| Mileage             | Mileage in km.                                   |
| Seats               | Number of seats.                                 |
| First registered at | First registration date.                         |
| Car type other      | Custom type description when “Other” was chosen. |

## Admin guidance

- Keep reference tables complete and up to date before running large simulation batches.
- If many runs return **Manual review**, check whether the hub **maximum car price** explains them (high-value cases show an explanatory step);
  otherwise verify missing/invalid benchmark data and other reference data first.
- Revisit hub thresholds regularly because they strongly influence acceptance and category outcomes.
