---
title: Translation overrides technical workflow
roles:
  - technical
---

# Translation overrides technical workflow

Translation overrides are stored in the `TranslationOverride` table with a message key, locale, and replacement value. Runtime message loading
keeps the JSON message files as the source of truth and applies database overrides on top.

## Applying overrides to message files

1. In the admin area, open **Translation overrides** and click **Download patch**.
2. Apply the patch from the repository root: `git apply translation-overrides.patch`
3. Review and commit the changed `messages/*.json` files.
4. Clear applied overrides from the admin page so the database no longer shadows the committed files.

Overrides are validated against the original message value for that locale. Replacement text may reuse existing `{template_variable}`
placeholders, but it cannot introduce new placeholders that were absent from the original value.
