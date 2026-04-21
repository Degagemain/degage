---
title: Car Types
roles:
  - admin
---

# Car Types

Reference list of vehicle types (e.g. sedan, SUV), linked to a brand and fuel type. Used in the simulation, car infos, and car price estimates.

| Property  | Description                                  |
| --------- | -------------------------------------------- |
| Brand     | The car brand this type belongs to.          |
| Name      | Display name of the car type.                |
| Fuel type | Fuel type associated with this type.         |
| Ecoscore  | Environmental score (e.g. A–E).              |
| Active    | Whether the type is available for selection. |

Use **New** next to the search box to add a car type, or open one from its name or the row **Edit** action to change it.

## Export

Use **More → Export** to download the current filtered/sorted list as CSV or JSON.

## Import

Use **More → Import** to upload a JSON file previously obtained via Export. Records with an id are updated; records without an id are inserted.
Each row shows its own status, and one failure does not stop the others.
