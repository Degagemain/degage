---
title: Documentatie
roles:
  - admin
---

# Documentatie

Centrale plek voor hulpteksten uit de codebase, Notion of handmatige records (via de API). In de beheerzone ziet u een overzicht; aanmaken en
bewerken in het scherm zijn voorlopig uitgeschakeld.

Gebruik de knop **Sync** om zoek-embeddings opnieuw op te bouwen na grotere documentatie-updates. De sync toont totalen voor bijgewerkt,
overgeslagen en mislukt.

| Eigenschap  | Beschrijving                                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Externe ID  | Vaste sleutel; repo-docs gebruiken `repo:{onderwerp}`, Notion `notion:{pagina-id}`, handmatig vaak `manual:…`.                                                                                   |
| Bron        | Beheer: repository (uit `docs/`), Notion (via webhook) of handmatig (API).                                                                                                                       |
| Formaat     | `markdown` of platte `text`.                                                                                                                                                                     |
| FAQ         | Indien aan, kan het item in FAQ-lijsten met tagfilters verschijnen.                                                                                                                              |
| Publiek     | Indien aan, is het item een publiek artikel (bedoeld voor een toekomstige publieke FAQ-pagina; combineerbaar met doelpubliek en FAQ).                                                            |
| Doelpubliek | Wie de pagina ziet: technical, admin, user, public (technical/admin alleen voor beheerders). In de documentatielijst verschijnt elke toegewezen rol als een apart label in de kolom Rollen.      |
| Tags        | O.a. `simulation_step_1`; `simulation_step_2_approved`, `simulation_step_2_rejected`, `simulation_step_2_review` (resultaatstap); `simulation_step_3`; `simulation_step_4` om FAQ’s te filteren. |
| Titel       | Per taal (EN, NL, FR).                                                                                                                                                                           |
| Inhoud      | Per taal; bij markdown-formaat wordt Markdown ondersteund.                                                                                                                                       |
| Embeddings  | Beheeractie om AI-zoekembeddings opnieuw te genereren op basis van de huidige content en de aantallen bijgewerkt/overgeslagen/mislukt te controleren.                                            |

## Export

Gebruik **Meer → Exporteren** om de huidige gefilterde/gesorteerde lijst te downloaden als CSV of JSON.

## Import

Gebruik **Meer → Importeren** om een JSON-bestand te uploaden dat eerder via Exporteren is gedownload. Records met een id worden bijgewerkt;
records zonder id worden toegevoegd. Elke rij toont zijn eigen status, en één fout stopt de andere rijen niet.
