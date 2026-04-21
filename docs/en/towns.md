---
title: Towns
roles:
  - admin
---

# Towns

Reference list of locations (postal code, name, municipality), with optional province and hub. Used when running simulations and for geographic
filtering.

| Property           | Description                                |
| ------------------ | ------------------------------------------ |
| Zip                | Postal code.                               |
| Name               | Name of the town.                          |
| Municipality       | Municipality the town belongs to.          |
| Province           | Province the town belongs to.              |
| Hub                | Hub the town is assigned to.               |
| High demand        | Whether the town is marked as high demand. |
| Has active members | Whether the town has active members.       |

## Export

Use **More → Export** to download the current filtered/sorted list as CSV or JSON.

## Import

Use **More → Import** to upload a JSON file previously obtained via Export. Records with an id are updated; records without an id are inserted.
Each row shows its own status, and one failure does not stop the others.
