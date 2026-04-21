---
title: Hub Benchmarks
roles:
  - admin
---

# Hub Benchmarks

Benchmark data per hub: owner km, shared average/min/max km. Used for reporting and comparison across hubs.

| Property      | Description                        |
| ------------- | ---------------------------------- |
| Hub           | The hub this benchmark applies to. |
| Owner km      | Owner mileage (km).                |
| Shared avg km | Average shared mileage (km).       |
| Shared min km | Minimum shared mileage (km).       |
| Shared max km | Maximum shared mileage (km).       |

## Export

Use **More → Export** to download the current filtered/sorted list as CSV or JSON.

## Import

Use **More → Import** to upload a JSON file previously obtained via Export. Records with an id are updated; records without an id are inserted.
Each row shows its own status, and one failure does not stop the others.
