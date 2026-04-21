---
title: Auto Info (schattingen)
roles:
  - admin
---

# Auto Info (estimates)

Referentiegegevens voor voertuigprofielen (merk, brandstoftype, voertuigtype, jaar, motor, CO₂, ecoscore, euronorm, verbruik). Gebruikt voor
opzoekingen in de simulatie en prijsschatingen.

Deze records worden met AI gegenereerd en daarna gecachet. De cache voorkomt herhaalde AI-generatie voor hetzelfde voertuigprofiel en houdt
simulatieresultaten sneller en consistenter.

| Eigenschap    | Beschrijving                            |
| ------------- | --------------------------------------- |
| Merk          | Automerk (via voertuigtype).            |
| Brandstoftype | Brandstoftype (via voertuigtype).       |
| Voertuigtype  | Voertuigtype (merk + brandstof + naam). |
| Jaar          | Modeljaar.                              |
| Cilinder cc   | Cilinderinhoud in cc.                   |
| CO₂-uitstoot  | CO₂-uitstootwaarde.                     |
| Ecoscore      | Milieuscore.                            |
| Euronorm      | Emissienorm.                            |
| Verbruik      | Verbruikswaarde.                        |

## Export

Gebruik **Meer → Exporteren** om de huidige gefilterde/gesorteerde lijst te downloaden als CSV of JSON.

## Import

Gebruik **Meer → Importeren** om een JSON-bestand te uploaden dat eerder via Exporteren is gedownload. Records met een id worden bijgewerkt;
records zonder id worden toegevoegd. Elke rij toont zijn eigen status, en één fout stopt de andere rijen niet.
