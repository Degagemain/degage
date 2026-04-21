---
title: Car Brands
roles:
  - admin
---

# Car Brands

Reference list of vehicle makes (e.g. Tesla, Volkswagen), used in the simulation, car types, car infos, and car price estimates.

| Property | Description                                   |
| -------- | --------------------------------------------- |
| Code     | Unique short identifier for the brand.        |
| Name     | Display name of the brand.                    |
| Active   | Whether the brand is available for selection. |

Use **New** next to the search box to add a brand, or open a brand from its name or the row **Edit** action to change it (including names per
language).

## Export

Use **More → Export** to download the current filtered/sorted list as CSV or JSON.

## Import

Use **More → Import** to upload a JSON file previously obtained via Export. Records with an id are updated; records without an id are inserted.
Each row shows its own status, and one failure does not stop the others.
