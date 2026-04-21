---
title: Insurance
roles:
  - admin
---

# Insurance

Reference insurance cost data by year: maximum car price, base rate, and rate. Used for estimates or reporting.

| Property      | Description                                       |
| ------------- | ------------------------------------------------- |
| Year          | Year this benchmark applies to.                   |
| Max car price | Maximum car price for this bracket (or no limit). |
| Base rate     | Base rate value.                                  |
| Rate          | Rate value.                                       |

## Export

Use **More → Export** to download the current filtered/sorted list as CSV or JSON.

## Import

Use **More → Import** to upload a JSON file previously obtained via Export. Records with an id are updated; records without an id are inserted.
Each row shows its own status, and one failure does not stop the others.
