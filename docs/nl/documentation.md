---
title: Documentatie
roles:
  - admin
---

# Documentatie

Centrale plek voor hulpteksten uit de codebase, Notion of handmatige items die u in de beheerzone of via de API toevoegt. De lijst toont alle
items: open een titel of **Bekijken** om te lezen, en **Bewerken** op de detailpagina of in het rijmenu. **Nieuw** opent een formulier om
handmatige documentatie te maken (titel en inhoud per taal, formaat, doelpubliek, tags, groepen). Voor repository- of Notion-bronnen kunt u in
het bewerkingsscherm alleen FAQ, zichtbaarheid en groepen wijzigen — titel en inhoud blijven met de bron gesynchroniseerd.

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
| Groepen     | Optionele labels om artikelen te ordenen in lijsten en filters (beheerd onder Documentatiegroepen). De getoonde naam volgt je gekozen admin-taal.                                                |
| Titel       | Per taal (EN, NL, FR).                                                                                                                                                                           |
| Inhoud      | Per taal; bij markdown-formaat wordt Markdown ondersteund.                                                                                                                                       |
| Embeddings  | Beheeractie om AI-zoekembeddings opnieuw te genereren op basis van de huidige content en de aantallen bijgewerkt/overgeslagen/mislukt te controleren.                                            |

## Export

Gebruik **Meer → Exporteren** om de huidige gefilterde/gesorteerde lijst te downloaden als CSV of JSON.

## Import (bulk)

Optioneel: **Meer → Importeren** voegt veel records in één keer samen uit een bestand in dezelfde JSON-structuur als **Exporteren**. Rijen met
een id werken bestaande records bij; rijen zonder id worden toegevoegd. Elke rij toont het resultaat; één mislukking stopt de rest niet.
