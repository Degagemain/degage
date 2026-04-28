---
title: Documentation
roles:
  - admin
---

# Documentation

Central place for help content from the repository, Notion, or manual entries you add in the admin zone or via the API. The list shows all
entries: open a title or **View** to read, and use **Edit** on the detail page or in the row menu. **New** opens a form to create manual
documentation (title and content per language, format, audience, tags, and groups). For repository- and Notion-backed pages, the edit form only
lets you change FAQ visibility, public visibility, and groups—the headline and body stay synced from the external source.

Use the **Sync** button to refresh search embeddings after major documentation updates. Sync reports totals for updated, skipped, and failed
records.

| Property    | Description                                                                                                                                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| External ID | Stable identifier; repository docs use `repo:{topic}`, Notion uses `notion:{page-id}`, manual entries can use `manual:…`.                                                                                                |
| Source      | Where the record is managed: repository (seeded from `docs/`), Notion (synced via webhook), or manual (API).                                                                                                             |
| Format      | `markdown` or plain `text`.                                                                                                                                                                                              |
| FAQ         | When enabled, the item can be listed in FAQ widgets that filter by tags.                                                                                                                                                 |
| Public      | When enabled, the item is a public article (intended for a future public FAQ page; may be combined with audience and FAQ settings).                                                                                      |
| Audience    | Who may view the page in the app: technical, admin, user, public (technical/admin pages are only visible to administrators). In the documentation list, each assigned role appears as its own label in the Roles column. |
| Tags        | Labels such as `simulation_step_1`; `simulation_step_2_approved`, `simulation_step_2_rejected`, `simulation_step_2_review` (result step); `simulation_step_3`; `simulation_step_4` for targeting FAQ lists.              |
| Groups      | Optional labels used to organise articles in the list and filters (managed under Documentation groups). Each group name is shown in your chosen admin language.                                                          |
| Title       | Per language (English, Dutch, French).                                                                                                                                                                                   |
| Content     | Per language; Markdown is supported when format is markdown.                                                                                                                                                             |
| Embeddings  | Admin action to regenerate AI-search embeddings per content language; support chat RAG retrieves vector chunks then loads **full** page text for the top matching documents for generation.                              |

## Export

Use **More → Export** to download the current filtered/sorted list as CSV or JSON.

## Import (bulk)

Optional: **More → Import** merges many records from one file in the same JSON shape as **Export**. Rows that include an id update existing
records; rows without an id are added. Each row reports its own outcome; one failure does not stop the rest.
