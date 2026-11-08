---
title: Contract types
roles:
  - admin
---

# Contract types

Define reusable contract kinds used when creating contracts. Each type can point at a Documenso template where signature fields are placed.

| Property           | Description                                                                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Code               | Unique code and display name. Entered when the type is created (for example `car-onboarding`) and cannot be changed afterwards. `car-onboarding` is seeded. |
| Default signee     | Optional Degage admin who must also sign. Leave empty when only the owner signs.                                                                            |
| Default viewers    | Admins who receive a copy of the signed contract.                                                                                                           |
| Documenso template | Upload a PDF to create the template, then open Documenso to place signature fields.                                                                         |

Use **New** to add a type, or open one from the list to edit it and manage its Documenso template.
