---
title: Euronormen
roles:
  - admin
---

# Euronormen

Referentielijst van emissienormen (bv. Euro 6), met groep en geldigheidsperiode. Gebruikt in car infos en fiscale euronormaanpassingen.

| Eigenschap | Beschrijving                                         |
| ---------- | ---------------------------------------------------- |
| Code       | Unieke korte identificatie van de norm.              |
| Naam       | Weergavenaam van de euronorm.                        |
| Groep      | Groepslabel voor belastingaanpassingen.              |
| Actief     | Of de norm beschikbaar is voor selectie.             |
| Start      | Startdatum van de geldigheid.                        |
| Einde      | Einddatum van de geldigheid (indien van toepassing). |

## Export

Gebruik **Meer → Exporteren** om de huidige gefilterde/gesorteerde lijst te downloaden als CSV of JSON.

## Import

Gebruik **Meer → Importeren** om een JSON-bestand te uploaden dat eerder via Exporteren is gedownload. Records met een id worden bijgewerkt;
records zonder id worden toegevoegd. Elke rij toont zijn eigen status, en één fout stopt de andere rijen niet.
