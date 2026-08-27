---
title: Documentatie
roles:
  - admin
---

# Documentatie

Centrale plek voor hulpteksten uit de codebase of handmatige items die u in de beheerzone of via de API toevoegt. De lijst toont alle items:
open een titel of **Bekijken** om te lezen, en **Bewerken** op de detailpagina of in het rijmenu. Voor **handmatige** items bevat het rijmenu
ook **Verwijderen**. **Nieuw** opent een formulier om handmatige documentatie te maken (titel en inhoud in één of meer talen, formaat,
doelpubliek, tags, groepen). Bij bewerken kunt u het formaat wisselen tussen platte tekst en Markdown. Voor repository-bronnen kunt u in het
bewerkingsscherm FAQ, zichtbaarheid, groepen en formaat wijzigen — titel en inhoud blijven met de repository gesynchroniseerd. Die items kunt u
niet uit de lijst verwijderen; ze volgen de repository.

Gebruik de knop **Sync** om zoek-embeddings opnieuw op te bouwen na grotere documentatie-updates. De sync toont totalen voor bijgewerkt,
overgeslagen en mislukt.

| Eigenschap  | Beschrijving                                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Externe ID  | Vaste sleutel; repo-docs gebruiken `repo:{onderwerp}`, handmatig vaak `manual:…`.                                                                                                                |
| Bron        | Beheer: repository (uit `docs/`) of handmatig (API).                                                                                                                                             |
| Formaat     | `markdown` of platte `text`. U kunt dit wijzigen bij bewerken.                                                                                                                                   |
| FAQ         | Indien aan, kan het item in FAQ-lijsten met tagfilters verschijnen.                                                                                                                              |
| Publiek     | Indien aan, is het item een publiek artikel (bedoeld voor een toekomstige publieke FAQ-pagina; combineerbaar met doelpubliek en FAQ).                                                            |
| Doelpubliek | Wie de pagina ziet: technical, admin, user, public (technical/admin alleen voor beheerders). In de documentatielijst verschijnt elke toegewezen rol als een apart label in de kolom Rollen.      |
| Tags        | O.a. `simulation_step_1`; `simulation_step_2_approved`, `simulation_step_2_rejected`, `simulation_step_2_review` (resultaatstap); `simulation_step_3`; `simulation_step_4` om FAQ’s te filteren. |
| Groepen     | Optionele labels om artikelen te ordenen in lijsten en filters (beheerd onder Documentatiegroepen). De getoonde naam volgt je gekozen admin-taal.                                                |
| Titel       | Per taal (EN, NL, FR). Minstens één taal is verplicht; de andere mogen leeg blijven.                                                                                                             |
| Inhoud      | Per taal; bij markdown-formaat wordt Markdown ondersteund. Talen zonder titel worden niet opgeslagen.                                                                                            |
| Embeddings  | Beheeractie om AI-zoekembeddings opnieuw te genereren op basis van de huidige content en de aantallen bijgewerkt/overgeslagen/mislukt te controleren.                                            |

## Export

Gebruik **Meer → Exporteren** om de huidige gefilterde/gesorteerde lijst te downloaden als CSV of JSON.

## Import (bulk)

Optioneel: **Meer → Importeren** voegt veel records in één keer samen uit een bestand in dezelfde JSON-structuur als **Exporteren**. Rijen met
een id werken bestaande records bij; rijen zonder id worden toegevoegd. Elke rij toont het resultaat; één mislukking stopt de rest niet.
