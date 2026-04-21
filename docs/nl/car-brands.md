---
title: Automerken
roles:
  - admin
---

# Automerken

Referentielijst van voertuigmerken (bv. Tesla, Volkswagen), gebruikt in de simulatie, voertuigtypes, car infos en prijsschatingen.

| Eigenschap | Beschrijving                              |
| ---------- | ----------------------------------------- |
| Code       | Unieke korte identificatie van het merk.  |
| Naam       | Weergavenaam van het merk.                |
| Actief     | Of het merk beschikbaar is voor selectie. |

Gebruik **Nieuw** naast het zoekveld om een merk toe te voegen, of open een merk via de naam of de actie **Bewerken** om het aan te passen
(inclusief namen per taal).

## Export

Gebruik **Meer → Exporteren** om de huidige gefilterde/gesorteerde lijst te downloaden als CSV of JSON.

## Import

Gebruik **Meer → Importeren** om een JSON-bestand te uploaden dat eerder via Exporteren is gedownload. Records met een id worden bijgewerkt;
records zonder id worden toegevoegd. Elke rij toont zijn eigen status, en één fout stopt de andere rijen niet.
