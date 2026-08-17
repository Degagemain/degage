---
title: Verzekeraars
roles:
  - admin
---

# Verzekeraars

Referentielijst van verzekeringsmaatschappijen die in de applicatie worden gebruikt.

| Eigenschap                     | Beschrijving                                                                                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Naam                           | Weergavenaam van de verzekeraar.                                                                                                                                  |
| Ondersteunt directe onboarding | Indien ingeschakeld kunnen eigenaars die deze verzekeraar kiezen autodelen starten vanaf de eerstvolgende eerste van de maand, zonder de gebruikelijke wachttijd. |

## Exporteren

Gebruik **Meer → Exporteren** om de huidige gefilterde/gesorteerde lijst als CSV of JSON te downloaden.

## Importeren

Gebruik **Meer → Importeren** om een JSON-bestand te uploaden dat eerder via Exporteren is verkregen. Records met een id worden bijgewerkt;
records zonder id worden toegevoegd. Elke rij toont de eigen status; één mislukking stopt de andere niet.
