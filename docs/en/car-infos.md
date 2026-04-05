---
title: Car Info (estimates)
roles:
  - admin
---

# Car Info (estimates)

Reference data for vehicle profiles (brand, fuel type, car type, year, engine, CO2, ecoscore, euro norm, consumption). Used for lookups in the
simulation and car price estimates.

These records are generated with AI and then cached. Caching avoids repeated AI generation for the same vehicle profile and keeps simulation
results faster and more consistent.

| Property     | Description                     |
| ------------ | ------------------------------- |
| Brand        | Car brand (via car type).       |
| Fuel type    | Fuel type (via car type).       |
| Car type     | Car type (brand + fuel + name). |
| Year         | Model year.                     |
| Cylinder cc  | Engine capacity in cc.          |
| CO2 emission | CO2 emission value.             |
| Ecoscore     | Environmental score.            |
| Euro norm    | Emission standard.              |
| Consumption  | Consumption value.              |

## Export

Use **More → Export** to download the current filtered/sorted list as CSV or JSON.
