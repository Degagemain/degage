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
2. **Autoprijslimiet** — Als **Max autoprijs (handmatige review)** is ingevuld en de geschatte waarde (of aankoopprijs) **hoger** is dan dat
   bedrag in euro, wordt een run die anders **Categorie A** of **Categorie B** zou geven omgezet naar **Handmatige review** (met een stap die
   het bedoelde resultaat vermeldt). **Niet OK** blijft ongewijzigd. Leeg = geen limiet.
3. **Waardeschatting en afschrijving** — **Afschrijving km** (of **Afschrijving km (elektrisch)**) bepaalt hoe snel de wagenwaarde per km daalt.
4. **Vaste kosten in km-prijs** — **Keuringkosten/jaar** en **Onderhoudskosten/jaar** zitten mee in de vaste jaarkost en dus in het berekende
   km-tarief.
5. **Scenario's gedeelde km** — **Min gedeelde km/jaar**, **Gem. gedeelde km/jaar** en **Max gedeelde km/jaar** worden op simulaties bewaard en
   sturen de scenario's weinig, regelmatig en vaak delen.
6. **Kwaliteitspunten** — Het voertuig moet minstens 2 bonuspunten halen via **Min ecoscore (bonus)**, **Max km (bonus)** en **Max leeftijd
   (bonus)**.
7. **Categorie-uitkomst** — Op basis van kwaliteitspunten, afgerond km-tarief (€/km), zitplaatsen en hubcontext volgt **Categorie A**,
   **Categorie B** of **Niet OK**. Voor **Categorie A** met minder dan 7 zitplaatsen moet het afgeronde km-tarief ten hoogste **Cat. A max €/km
   (minder dan 7 zitpl.)** zijn. Voor **Categorie B** met 7 of meer zitplaatsen ten hoogste **Cat. B max €/km (7+ zitpl.)**. **Bestelwagens**
   vallen terug op **Categorie B**. Vóór de categorietoekenning wordt de afschrijvingskost per km per hub begrensd. Standaardvoertuigen
   gebruiken **Max afschr. €/km (cat. A)**; **elektrische** voertuigen en **categorie B**-kandidaten (7+ zitpl. of bestelwagens) gebruiken **Max
   afschr. €/km (elektrisch & cat. B)**. Is de kost te hoog, dan wordt de geschatte wagenwaarde binnen het bereik bijgestuurd indien mogelijk;
   anders wordt de wagen geweigerd.

## Eigenschappen

| Eigenschap                             | Beschrijving                                                                                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Naam                                   | Weergavenaam van de hub.                                                                                                                                                        |
| Standaard                              | Geeft aan of dit de standaardhub is. Voor de standaardhub gelden bijkomende beslisregels in de categorietoekenning.                                                             |
| Max leeftijd                           | **Toelating.** Maximale autoleeftijd in jaren (vanaf eerste inschrijving). Oudere auto's worden geweigerd (Niet OK).                                                            |
| Max km                                 | **Toelating.** Maximale kilometerstand in km. Hogere kilometerstand wordt geweigerd (Niet OK).                                                                                  |
| Min gedeelde km/jaar                   | **Deelscenario.** Gedeelde kilometers voor het scenario weinig delen.                                                                                                           |
| Gem. gedeelde km/jaar                  | **Deelscenario.** Gedeelde kilometers voor het scenario regelmatig delen en de gemiddelde backend-kostinschatting.                                                              |
| Max gedeelde km/jaar                   | **Deelscenario.** Gedeelde kilometers voor het scenario vaak delen.                                                                                                             |
| Max autoprijs (handmatige review)      | **Prijslimiet.** Ingevuld (euro): zou de regels **Categorie A** of **B** geven maar de waarde is te hoog → **Handmatige review**; leeg = geen limiet.                           |
| Cat. A max €/km (minder dan 7 zitpl.)  | **Categorie A.** Maximaal toegelaten afgerond kost per km (€/km) voor de eerste acceptatietier bij minder dan 7 zitplaatsen.                                                    |
| Cat. B max €/km (7+ zitpl.)            | **Categorie B.** Maximaal toegelaten afgerond kost per km (€/km) bij 7 of meer zitplaatsen.                                                                                     |
| Max afschr. €/km (cat. A)              | **Alle hubs.** Maximaal toegelaten afschrijvingskost per km (€/km) voor standaardvoertuigen (niet elektrisch, geen categorie B).                                                |
| Max afschr. €/km (elektrisch & cat. B) | **Elektrisch en categorie B.** Maximaal toegelaten afschrijvingskost per km (€/km) voor elektrische voertuigen en categorie B-kandidaten (7+ zitpl. of bestelwagens).           |
| Min euronorm (diesel)                  | Ondergrens voor dieselwagens op hubniveau. Deze waarde is beschikbaar in beheerdata, maar wordt momenteel niet rechtstreeks gebruikt in de eindbeslissing van de simulatieflow. |
| Min ecoscore (bonus)                   | **Kwaliteit.** Als de ecoscore van de auto ≥ deze waarde is, krijgt de auto 1 bonuspunt. Minstens 2 bonuspunten nodig om te slagen.                                             |
| Max km (bonus)                         | **Kwaliteit.** Als de kilometerstand ≤ deze waarde is, krijgt de auto 1 bonuspunt.                                                                                              |
| Max leeftijd (bonus)                   | **Kwaliteit.** Als de leeftijd (huidig jaar − bouwjaar) ≤ deze waarde is, krijgt de auto 1 bonuspunt.                                                                           |
| Afschrijving km                        | **Afschrijving.** Totaal km waarna een niet-elektrische auto op nul wordt afgeschreven. Gebruikt voor waarde en afschrijvingskosten per km.                                     |
| Afschrijving km (elektrisch)           | **Afschrijving.** Idem voor elektrische voertuigen (vaak hogere waarde).                                                                                                        |
| Keuringkosten/jaar                     | **Vaste kosten.** Jaarlijkse keuringskosten (€) in de vaste jaarkosten en km-tarief van de simulatie.                                                                           |
| Onderhoudskosten/jaar                  | **Vaste kosten.** Jaarlijkse onderhoudskosten (€) in de vaste jaarkosten en km-tarief van de simulatie.                                                                         |

## Richtlijnen voor admins

- Houd de hubwaarden per regio realistisch en onderling consistent; kleine wijzigingen kunnen de categorieresultaten sterk veranderen.
- Herbekijk vooral regelmatig **Max km**, **Max leeftijd**, **Min ecoscore (bonus)** en afschrijvingswaarden: die sturen afwijzingen en
  bonusscore direct.
- Vul jaarlijkse kosten expliciet in zodat het km-tarief stabiel en vergelijkbaar blijft tussen hubs.

## Export

Gebruik **Meer → Exporteren** om de huidige gefilterde/gesorteerde lijst te downloaden als CSV of JSON.

## Import

Gebruik **Meer → Importeren** om een JSON-bestand te uploaden dat eerder via Exporteren is gedownload. Records met een id worden bijgewerkt;
records zonder id worden toegevoegd. Elke rij toont zijn eigen status, en één fout stopt de andere rijen niet.
