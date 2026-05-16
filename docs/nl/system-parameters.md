---
title: Systeemparameters
roles:
  - technical
  - admin
---

# Systeemparameters

Configureerbare waarden die bedrijfsregels en assistentprompts sturen. Alleen de waarde kan in het beheer worden gewijzigd; code, categorie,
type en naam zijn vast.

| Eigenschap | Beschrijving                                                           |
| ---------- | ---------------------------------------------------------------------- |
| Code       | Unieke identificatie (bv. maxAgeYears, maxKm).                         |
| Categorie  | Groepering (bv. simulatie of assistent) voor filteren.                 |
| Naam       | Weergavenaam (vertaalbaar, alleen-lezen).                              |
| Type       | Hoe de waarde wordt opgeslagen: getal, getalbereik, euronorm of tekst. |
| Waarde     | De bewerkbare waarde(n) afhankelijk van het type.                      |

Assistentparameters:

| Code                       | Beschrijving                                                          |
| -------------------------- | --------------------------------------------------------------------- |
| `assistantBasePromptChat`  | Basisprompt voor de documentatieassistent in de chatwidget.           |
| `assistantBasePromptEmail` | Basisprompt voor de documentatieassistent bij inkomende supportmails. |

## Export

Gebruik **Meer → Exporteren** om de huidige gefilterde/gesorteerde lijst te downloaden als CSV of JSON.
