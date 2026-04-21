---
title: Car Price Estimates
roles:
  - admin
---

# Car Price Estimates

Estimated value ranges for vehicles by brand, fuel type, car type, and year. Used in the simulation price step and for internal reference.

| Property      | Description                   |
| ------------- | ----------------------------- |
| Brand         | Car brand (via car type).     |
| Fuel type     | Fuel type (via car type).     |
| Car type      | Car type.                     |
| Year          | Model year.                   |
| Estimate year | Year the estimate applies to. |
| Price         | Estimated price.              |
| Range min     | Minimum of the value range.   |
| Range max     | Maximum of the value range.   |
| Remarks       | Optional notes.               |

## Export

Use **More → Export** to download the current filtered/sorted list as CSV or JSON.

## Import

Use **More → Import** to upload a JSON file previously obtained via Export. Records with an id are updated; records without an id are inserted.
Each row shows its own status, and one failure does not stop the others.
