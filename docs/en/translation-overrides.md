---
title: Translation overrides
roles:
  - admin
---

# Translation overrides

Use translation overrides to tune interface text directly from the admin area. Overrides are temporary changes stored in the database and shown
next to the original text.

| Property | Description                                      |
| -------- | ------------------------------------------------ |
| Path     | Location of the text in the translation catalog. |
| Original | Current text from the message files.             |
| Override | Replacement text shown in the application.       |
| Language | Language where the override applies.             |

Search looks through text values, not paths. Use **Download patch** when the override set is ready for developers to apply to the message files.
