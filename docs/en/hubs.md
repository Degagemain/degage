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
2. **Value and depreciation** — **Sim depreciation km** (or **Sim depreciation km electric**) controls how fast value declines per km.
3. **Fixed costs in km rate** — **Sim inspection cost per year** and **Sim maintenance cost per year** are included in fixed yearly cost and
   therefore in the final km rate.
4. **Quality points** — The vehicle must reach at least 2 bonus points via **Sim min ecoscore for bonus**, **Sim max km for bonus**, and **Sim
   max age for bonus**.
5. **Category outcome** — Based on quality score, km rate, seats, and hub context, result becomes **Category A**, **Category B**, **Higher
   rate**, or **Not OK**.

## Properties

| Property                       | Description                                                                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Name                           | Display name of the hub.                                                                                                                        |
| Default                        | Indicates whether this is the default hub. The default hub has extra fallback logic in category assignment.                                     |
| Sim max age                    | **Admission.** Maximum car age in years (from first registration). Cars older than this are rejected (Not OK).                                  |
| Sim max km                     | **Admission.** Maximum mileage in km. Cars with higher mileage are rejected (Not OK).                                                           |
| Sim min euro norm group diesel | Diesel threshold stored on hub level. Available in admin data, but currently not directly used in the simulation’s final decision flow.         |
| Sim min ecoscore for bonus     | **Quality.** If the car’s ecoscore is ≥ this value, it receives 1 bonus point. Need 2+ points to pass quality.                                  |
| Sim max km for bonus           | **Quality.** If the car’s mileage is ≤ this value, it receives 1 bonus point.                                                                   |
| Sim max age for bonus          | **Quality.** If the car’s age (current year − build year) is ≤ this value, it receives 1 bonus point.                                           |
| Sim depreciation km            | **Depreciation.** Total km over which a non-electric car is assumed to depreciate to zero. Used to estimate value and depreciation cost per km. |
| Sim depreciation km electric   | **Depreciation.** Same as above for electric vehicles (often a higher value).                                                                   |
| Sim inspection cost per year   | **Fixed cost.** Annual inspection cost (€) used in the simulation’s fixed yearly cost and km rate.                                              |
| Sim maintenance cost per year  | **Fixed cost.** Annual maintenance cost (€) used in the simulation’s fixed yearly cost and km rate.                                             |

## Admin guidance

- Keep hub thresholds realistic per region; small changes can noticeably shift acceptance and category outcomes.
- Review **Sim max km**, **Sim max age**, **Sim min ecoscore for bonus**, and depreciation fields regularly, because they directly drive
  rejection and bonus scoring.
- Fill yearly cost fields explicitly to keep km-rate outcomes stable and comparable across hubs.
