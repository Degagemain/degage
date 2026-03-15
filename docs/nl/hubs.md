---
title: Hubs
roles:
  - admin
---

# Hubs

Hubs zijn operationele gebieden met eigen simulatieparameters.

Bij een simulatie wordt altijd de hub gebruikt van de gekozen gemeente. Daardoor kunnen toelating, kosten en eindcategorie verschillen per
regio.

## Hoe de simulatie de hub gebruikt

1. **Toelating** — Het voertuig moet slagen voor **Max leeftijd** en **Max km**. Bij falen is het resultaat meteen **Niet OK**.
2. **Waardeschatting en afschrijving** — **Afschrijving km** (of **Afschrijving km (elektrisch)**) bepaalt hoe snel de wagenwaarde per km daalt.
3. **Vaste kosten in km-prijs** — **Keuringkosten/jaar** en **Onderhoudskosten/jaar** zitten mee in de vaste jaarkost en dus in het berekende
   km-tarief.
4. **Kwaliteitspunten** — Het voertuig moet minstens 2 bonuspunten halen via **Min ecoscore (bonus)**, **Max km (bonus)** en **Max leeftijd
   (bonus)**.
5. **Categorie-uitkomst** — Op basis van kwaliteitspunten, km-tarief, zitplaatsen en hubcontext volgt **Categorie A**, **Categorie B**, **Hoger
   tarief** of **Niet OK**.

## Eigenschappen

| Eigenschap                   | Beschrijving                                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Naam                         | Weergavenaam van de hub.                                                                                                                                                        |
| Standaard                    | Geeft aan of dit de standaardhub is. Voor de standaardhub gelden bijkomende beslisregels in de categorietoekenning.                                                             |
| Max leeftijd                 | **Toelating.** Maximale autoleeftijd in jaren (vanaf eerste inschrijving). Oudere auto's worden geweigerd (Niet OK).                                                            |
| Max km                       | **Toelating.** Maximale kilometerstand in km. Hogere kilometerstand wordt geweigerd (Niet OK).                                                                                  |
| Min euronorm (diesel)        | Ondergrens voor dieselwagens op hubniveau. Deze waarde is beschikbaar in beheerdata, maar wordt momenteel niet rechtstreeks gebruikt in de eindbeslissing van de simulatieflow. |
| Min ecoscore (bonus)         | **Kwaliteit.** Als de ecoscore van de auto ≥ deze waarde is, krijgt de auto 1 bonuspunt. Minstens 2 bonuspunten nodig om te slagen.                                             |
| Max km (bonus)               | **Kwaliteit.** Als de kilometerstand ≤ deze waarde is, krijgt de auto 1 bonuspunt.                                                                                              |
| Max leeftijd (bonus)         | **Kwaliteit.** Als de leeftijd (huidig jaar − bouwjaar) ≤ deze waarde is, krijgt de auto 1 bonuspunt.                                                                           |
| Afschrijving km              | **Afschrijving.** Totaal km waarna een niet-elektrische auto op nul wordt afgeschreven. Gebruikt voor waarde en afschrijvingskosten per km.                                     |
| Afschrijving km (elektrisch) | **Afschrijving.** Idem voor elektrische voertuigen (vaak hogere waarde).                                                                                                        |
| Keuringkosten/jaar           | **Vaste kosten.** Jaarlijkse keuringskosten (€) in de vaste jaarkosten en km-tarief van de simulatie.                                                                           |
| Onderhoudskosten/jaar        | **Vaste kosten.** Jaarlijkse onderhoudskosten (€) in de vaste jaarkosten en km-tarief van de simulatie.                                                                         |

## Richtlijnen voor admins

- Houd de hubwaarden per regio realistisch en onderling consistent; kleine wijzigingen kunnen de categorieresultaten sterk veranderen.
- Herbekijk vooral regelmatig **Max km**, **Max leeftijd**, **Min ecoscore (bonus)** en afschrijvingswaarden: die sturen afwijzingen en
  bonusscore direct.
- Vul jaarlijkse kosten expliciet in zodat het km-tarief stabiel en vergelijkbaar blijft tussen hubs.
