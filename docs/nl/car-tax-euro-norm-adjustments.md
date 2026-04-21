---
title: Belastingen Euronorm correcties
roles:
  - admin
---

# Fiscale Tax Euro Norms

Belastingaanpassingen per emissieklasse (euronormgroep) en brandstoftype per fiscale regio. Gebruikt met basistarief en vast tarief in de
berekening van de verkeersbelasting.

| Eigenschap          | Beschrijving                                       |
| ------------------- | -------------------------------------------------- |
| Fiscale regio       | De regio waarop deze aanpassing van toepassing is. |
| Euronormgroep       | Emissiegroep (bv. Euro 6).                         |
| Standaardaanpassing | Aanpassingsfactor voor standaardbrandstof.         |
| Dieselaanpassing    | Aanpassingsfactor voor diesel.                     |

## Export

Gebruik **Meer → Exporteren** om de huidige gefilterde/gesorteerde lijst te downloaden als CSV of JSON.

## Import

Gebruik **Meer → Importeren** om een JSON-bestand te uploaden dat eerder via Exporteren is gedownload. Records met een id worden bijgewerkt;
records zonder id worden toegevoegd. Elke rij toont zijn eigen status, en één fout stopt de andere rijen niet.
