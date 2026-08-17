---
title: Translation overrides
roles:
  - admin
---

# Translation overrides

Use translation overrides to tune interface text directly from the admin area. Overrides are temporary changes stored in the database.

| Property | Description                                      |
| -------- | ------------------------------------------------ |
| Path     | Location of the text in the translation catalog. |
| Original | Current text from the message files.             |
| Override | Replacement text shown in the application.       |
| Language | Language where the override applies.             |

Search looks through text values, not paths. Use **Download patch** when the override set is ready for developers to apply to the message files.
The list shows the value for your current language. Open a key to review the original text and edit overrides with the language tabs.

On public pages (landing, simulation, onboarding, dashboard, help, account), you can add a website or email link in a sentence. Put the visible
words in square brackets, then the address in parentheses immediately after. Website addresses must start with http or https; email addresses
must start with mailto. The override editor shows an example. This does not apply to short labels such as button names.
