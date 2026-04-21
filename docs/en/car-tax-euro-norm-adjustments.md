---
title: Fiscal Tax Euro Norms
roles:
  - admin
---

# Fiscal Tax Euro Norms

Tax adjustments by emission class (euro norm group) and fuel type per fiscal region. Used with base and flat rates in car tax calculations.

| Property           | Description                            |
| ------------------ | -------------------------------------- |
| Fiscal region      | The region this adjustment applies to. |
| Euro norm group    | Emission group (e.g. Euro 6).          |
| Default adjustment | Adjustment factor for default fuel.    |
| Diesel adjustment  | Adjustment factor for diesel.          |

## Export

Use **More → Export** to download the current filtered/sorted list as CSV or JSON.

## Import

Use **More → Import** to upload a JSON file previously obtained via Export. Records with an id are updated; records without an id are inserted.
Each row shows its own status, and one failure does not stop the others.
