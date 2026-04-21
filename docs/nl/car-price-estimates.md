---
title: Prijsschattingen
roles:
  - admin
---

# Car Price Estimates

Geschatte waardebereiken voor voertuigen per merk, brandstoftype, voertuigtype en jaar. Gebruikt in de simulatiestap prijs en voor interne
referentie.

| Eigenschap     | Beschrijving                                |
| -------------- | ------------------------------------------- |
| Merk           | Automerk (via voertuigtype).                |
| Brandstoftype  | Brandstoftype (via voertuigtype).           |
| Voertuigtype   | Voertuigtype.                               |
| Jaar           | Modeljaar.                                  |
| Schattingsjaar | Jaar waarop de schatting van toepassing is. |
| Prijs          | Geschatte prijs.                            |
| Bereik min     | Minimum van het waardebereik.               |
| Bereik max     | Maximum van het waardebereik.               |
| Opmerkingen    | Optionele notities.                         |

## Export

Gebruik **Meer → Exporteren** om de huidige gefilterde/gesorteerde lijst te downloaden als CSV of JSON.

## Import

Gebruik **Meer → Importeren** om een JSON-bestand te uploaden dat eerder via Exporteren is gedownload. Records met een id worden bijgewerkt;
records zonder id worden toegevoegd. Elke rij toont zijn eigen status, en één fout stopt de andere rijen niet.
