---
title: Hubs
roles:
  - admin
---

# Hubs

Hubs are operational areas with their own simulation parameters.

For each simulation run, the hub of the selected town is applied. This means admission, estimated costs, and final category can differ by area.

## How the simulation uses the hub

1. **Admission** — The vehicle must pass **Sim max age** and **Sim max km** checks. If one fails, result is immediately **Not OK**.
2. **Car price cap** — If **Sim max price (manual review)** is set and the estimated car value (or new-car purchase price) is **above** that
   amount in euros, a run that would otherwise end as **Category A**, **Category B**, or **Higher rate** is turned into **Manual review**
   instead (with a step explaining the intended outcome). **Not OK** outcomes are unchanged. Leave empty for no limit.
3. **Value and depreciation** — **Sim depreciation km** (or **Sim depreciation km electric**) controls how fast value declines per km.
4. **Fixed costs in km rate** — **Sim inspection cost per year** and **Sim maintenance cost per year** are included in fixed yearly cost and
   therefore in the final km rate.
5. **Quality points** — The vehicle must reach at least 2 bonus points via **Sim min ecoscore for bonus**, **Sim max km for bonus**, and **Sim
   max age for bonus**.
6. **Category outcome** — Based on quality score, rounded km cost (€/km), seats, and hub context, result becomes **Category A**, **Category B**,
   **Higher rate**, or **Not OK**. For **Category A** with fewer than 7 seats, the rounded km cost must be at or below **Cat. A max €/km (under
   7 seats)**. For **Category B** with 7 or more seats, it must be at or below **Cat. B max €/km (7+ seats)**. On the **default** hub only,
   **Category A** can still be assigned if depreciation cost per km is at or below **Cat. A deprec. €/km (default hub)**. For **electric**
   vehicles, **Category A** can apply if depreciation cost per km is at or below **Cat. A deprec. €/km (electric)**.

## Properties

| Property                          | Description                                                                                                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                              | Display name of the hub.                                                                                                                                                     |
| Default                           | Indicates whether this is the default hub. The default hub has extra fallback logic in category assignment.                                                                  |
| Sim max age                       | **Admission.** Maximum car age in years (from first registration). Cars older than this are rejected (Not OK).                                                               |
| Sim max km                        | **Admission.** Maximum mileage in km. Cars with higher mileage are rejected (Not OK).                                                                                        |
| Sim max price (manual review)     | **Price cap.** If set (euros), when rules would accept (**Category A**, **B**, or **Higher rate**) but value is above this, result is **Manual review**; empty means no cap. |
| Cat. A max €/km (under 7 seats)   | **Category A.** Maximum allowed rounded cost per km (€/km) for the first acceptance tier when the car has fewer than 7 seats.                                                |
| Cat. B max €/km (7+ seats)        | **Category B.** Maximum allowed rounded cost per km (€/km) when the car has 7 or more seats.                                                                                 |
| Cat. A deprec. €/km (default hub) | **Default hub only.** Maximum depreciation cost per km (€/km) for an extra **Category A** fallback when earlier tier rules did not apply.                                    |
| Cat. A deprec. €/km (electric)    | **Electric only.** Maximum depreciation cost per km (€/km) for **Category A** when the fuel type is electric (after other tiers).                                            |
| Sim min euro norm group diesel    | Diesel threshold stored on hub level. Available in admin data, but currently not directly used in the simulation’s final decision flow.                                      |
| Sim min ecoscore for bonus        | **Quality.** If the car’s ecoscore is ≥ this value, it receives 1 bonus point. Need 2+ points to pass quality.                                                               |
| Sim max km for bonus              | **Quality.** If the car’s mileage is ≤ this value, it receives 1 bonus point.                                                                                                |
| Sim max age for bonus             | **Quality.** If the car’s age (current year − build year) is ≤ this value, it receives 1 bonus point.                                                                        |
| Sim depreciation km               | **Depreciation.** Total km over which a non-electric car is assumed to depreciate to zero. Used to estimate value and depreciation cost per km.                              |
| Sim depreciation km electric      | **Depreciation.** Same as above for electric vehicles (often a higher value).                                                                                                |
| Sim inspection cost per year      | **Fixed cost.** Annual inspection cost (€) used in the simulation’s fixed yearly cost and km rate.                                                                           |
| Sim maintenance cost per year     | **Fixed cost.** Annual maintenance cost (€) used in the simulation’s fixed yearly cost and km rate.                                                                          |

## Admin guidance

- Keep hub thresholds realistic per region; small changes can noticeably shift acceptance and category outcomes.
- Review **Sim max km**, **Sim max age**, **Sim min ecoscore for bonus**, and depreciation fields regularly, because they directly drive
  rejection and bonus scoring.
- Fill yearly cost fields explicitly to keep km-rate outcomes stable and comparable across hubs.
