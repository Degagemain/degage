---
title: Simulaties
roles:
  - admin
---

# Simulaties

Deze pagina combineert:

- Hoe de simulatielogica werkt
- Welke tabellen door de engine gebruikt worden
- Wat je ziet op het overzichtsscherm met simulatieruns

## Doel

De simulatie schat in of een voertuig past binnen het platformbeleid en de tariefverwachtingen.

Dat gebeurt via:

- Toelatingscontroles (kilometer- en leeftijdsgrenzen)
- Financiele schattingen (waarde, belasting, verzekering, onderhoud, keuring, brandstof, afschrijving)
- Kwaliteitsscore (ecoscore, kilometerstand, leeftijd en vraagcontext)
- Eindregels voor categorie (A, B, hoger tarief of afwijzing)
- Optionele hub **maximale autoprijs**: als die is ingevuld, kan een run die anders als categorie A, B of hoger tarief zou eindigen **Handmatige
  beoordeling** worden (zie verder)

Elke run geeft een resultaat plus een lijst met stappen/boodschappen, zodat admins de beslissing kunnen volgen.

## Belangrijkste invoer

De simulatie gebruikt onder andere:

- Merk, brandstoftype, autotype (of "overig")
- Nieuw/tweedehands, eerste inschrijving, kilometerstand, aantal zitplaatsen, bestelwagen
- Aankoopprijs (voor nieuwe auto's)
- Gemeente en verwachte eigen km per jaar

## Volledige flow

### 1) Initiële controles

- Voor tweedehands voertuigen controleert de engine maximale kilometerstand en maximale leeftijd.
- De limieten komen uit de configuratie van de gekozen hub.
- Als een controle faalt, stopt de simulatie met **Niet OK**.

### 2) Schatting van voertuigwaarde

- Tweedehands: een waarderange wordt geschat en omgezet naar een huidige geschatte voertuigwaarde.
- Nieuw: de aankoopprijs wordt gebruikt als geschatte waarde.

### 3) Schatting van technisch profiel

- De engine schat waarden die later nodig zijn: verbruik, cilinderinhoud (cc), CO2, ecoscore en euronorm.

### 4) Schatting jaarlijkse verkeersbelasting

- Elektrisch: vlak tarief volgens fiscale regio en datum eerste inschrijving.
- Niet-elektrisch:
  - Basistarief volgens regio/datum/cc
  - CO2-correctie
  - Euronorm-correctie (diesel-specifiek waar van toepassing)
- Voor oudere inschrijvingen wordt de historische verhogingsfactor toegepast.

Achtergrond over de CO2-logica:
[Verkeersbelasting voor personenwagens](https://www.vlaanderen.be/belastingen-en-begroting/vlaamse-belastingen/verkeersbelastingen/verkeersbelastingen-voor-personenwagens).

### 5) Schatting jaarlijkse verzekering

- De verzekering wordt bepaald op basis van de meest recente benchmark die past bij simulatiejaar en voertuigwaarde.
- Formule: vast basisbedrag + variabel percentage op voertuigwaarde.

### 6) Bouwstenen voor km-kost

Daarna berekent de simulatie:

- Keuringskost per jaar
- Onderhoudskost per jaar
- Hub-scenario's voor gedeelde km (min/gem/max)
- Geschatte totale jaarkilometers
- Vaste jaarkost
- Brandstofkost per km
- Afschrijvingskost per km
- Afgeronde finale km-kost

### 7) Kwaliteitspunten

Punten worden toegekend op basis van hubdrempels:

- Ecoscore-drempel
- Kilometerdrempel
- Leeftijdsdrempel

Als de score laag is, worden extra correctieregels toegepast (ecoscore, kilometerbanden, leeftijdsbanden en bonus voor hoge vraag in de
gemeente).

Als de eindscore nog onder minimum ligt, wordt het resultaat **Niet OK**.

### 8) Toekenning van eindresultaat

Als de kwaliteitscriteria slagen, worden categorieregels toegepast:

- **Categorie A**: lager km-kostprofiel (met extra fallbackregels in bepaalde gevallen)
- **Categorie B**: regel voor voertuigen met meer zitplaatsen
- **Hoger tarief**: regel voor bestelwagens
- **Niet OK**: als prijscriteria niet gehaald worden

**Handmatige beoordeling bij hoge waarde (hubinstelling):** De hub kan een **maximale autoprijs** voor automatische acceptatie instellen. Als
die grens is ingevuld en de **geschatte voertuigwaarde** (tweedehands) of **aankoopprijs** (nieuw) is **hoger**, loopt de simulatie toch
volledig door. Alleen wanneer het resultaat **Categorie A**, **Categorie B** of **Hoger tarief** zou zijn, vervangt de engine dat door
**Handmatige beoordeling**. Een stapmelding vermeldt welke categorie of welk tarief anders zou zijn toegekend. Zou het resultaat **Niet OK**
zijn, dan wijzigt de prijslimiet **niets**. Zie [Hubs](hubs.md) voor uitleg en configuratie.

## Resultaatcodes

| Code                       | Betekenis                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Categorie A**            | Voertuig voldoet aan het standaard lagere km-tariefprofiel.                                                                                                                                                                                                                                                                        |
| **Categorie B**            | Voertuig voldoet aan alternatieve categorieregel (typisch meer zitplaatsen).                                                                                                                                                                                                                                                       |
| **Hoger tarief**           | Voertuig wordt aanvaard onder hoger-tarieflogica (bestelwagengeval).                                                                                                                                                                                                                                                               |
| **Niet OK**                | Voertuig faalt op toelating, kwaliteit of prijscriteria.                                                                                                                                                                                                                                                                           |
| **Handmatige beoordeling** | Ofwel: (1) **Hoge autowaarde** — hubgrens voor maximale prijs is overschreden en de regels zouden het voertuig geaccepteerd hebben (categorie A, B of hoger tarief); zie de stappen voor de bedoelde categorie. Ofwel: (2) **Technische fallback** — de run is niet afgewerkt (ontbrekende referentiegegevens, runtimefout, enz.). |

## Tabellen die de simulatie gebruikt

De simulatie leest operationele en referentietabellen uit de admin data.

| Gebruikte tabel/onderwerp     | Waarom gebruikt in de simulatie                                                | Gerelateerde admindocumentatie                                    |
| ----------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Gemeenten                     | Startpunt voor locatiecontext en vraagvlag.                                    | [Towns](towns.md)                                                 |
| Hubs                          | Levert de meeste drempels, vaste jaarkostparameters en gedeelde-km-scenario's. | [Hubs](hubs.md)                                                   |
| Provincies                    | Bepaalt provincie vanuit gemeente.                                             | [Provinces](provinces.md)                                         |
| Fiscale regio's               | Bepaalt belastingregels per regio.                                             | [Fiscal regions](fiscal-regions.md)                               |
| Brandstoftypes                | Levert type-logica en brandstofprijs per eenheid.                              | [Fuel types](fuel-types.md)                                       |
| Autotypes                     | Kan ecoscore leveren voor kwaliteitsscore.                                     | [Car types](car-types.md)                                         |
| Car infos                     | Bron voor geschatte technische voertuigwaarden.                                | [Car infos](car-infos.md)                                         |
| Car price estimates           | Bron voor marktwaardeschatting.                                                | [Car price estimates](car-price-estimates.md)                     |
| Euronormen                    | Nodig voor niet-elektrische belastingcorrectie.                                | [Euro norms](euro-norms.md)                                       |
| Car tax base rates            | Basistarieven verkeersbelasting per regio/datum/cc.                            | [Car tax base rates](car-tax-base-rates.md)                       |
| Car tax flat rates            | Vaste belastingtarieven (vooral elektrisch).                                   | [Car tax flat rates](car-tax-flat-rates.md)                       |
| Car tax euro norm adjustments | Belastingcorrectie per euronormgroep.                                          | [Car tax euro norm adjustments](car-tax-euro-norm-adjustments.md) |
| Insurance price benchmarks    | Benchmarks voor basis + variabele verzekeringsprijs.                           | [Insurance price benchmarks](insurance-price-benchmarks.md)       |

## Overzichtsscherm simulatieruns

De lijst toont simulatieruns met ingevoerde autodata en berekende resultaten. Open een rij voor het volledige resultaat en de stapmeldingen.

Kolommen gemarkeerd met _(standaard verborgen)_ zijn beschikbaar via de kolomkiezer maar worden niet standaard weergegeven.

| Eigenschap             | Beschrijving                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| Beschrijving           | Korte samenvatting van gemeente, merk, brandstoftype en autotype.                              |
| Resultaat              | Eindresultaat (bijv. Niet OK, Handmatige beoordeling). Link naar de detailpagina.              |
| Kilometerstand         | Ingevoerde kilometerstand in km.                                                               |
| Zitplaatsen            | Aantal zitplaatsen.                                                                            |
| Eerste inschrijving    | Datum van eerste inschrijving.                                                                 |
| Geschatte waarde       | Geschatte marktwaarde van het voertuig gebruikt in de berekening.                              |
| Afschrijving/km        | Afschrijvingsbijdrage per km zoals berekend door de engine.                                    |
| Verzekering/jaar       | Geschatte jaarlijkse verzekeringskost.                                                         |
| Aangemaakt             | Datum en tijdstip waarop de simulatie werd opgeslagen.                                         |
| Gemeente               | Voor de run geselecteerde gemeente. _(standaard verborgen)_                                    |
| Merk                   | Ingevoerd automerk. _(standaard verborgen)_                                                    |
| Brandstoftype          | Ingevoerd brandstoftype. _(standaard verborgen)_                                               |
| Autotype               | Autotype of "Overig"-beschrijving. _(standaard verborgen)_                                     |
| Eigenaar km/jaar       | Verwachte jaarlijkse km van de eigenaar. _(standaard verborgen)_                               |
| Aankoopprijs           | Aankoopprijs voor nieuwe wagens. _(standaard verborgen)_                                       |
| Nieuwe wagen           | Of de wagen als nieuw is aangemerkt. _(standaard verborgen)_                                   |
| Bestelwagen            | Of de wagen als bestelwagen is aangemerkt. _(standaard verborgen)_                             |
| Verkeersbelasting/jaar | Geschatte jaarlijkse verkeersbelasting. _(standaard verborgen)_                                |
| Keuring/jaar           | Geschatte jaarlijkse keuringskosten. _(standaard verborgen)_                                   |
| Onderhoud/jaar         | Geschatte jaarlijkse onderhoudskosten. _(standaard verborgen)_                                 |
| Km-tarief              | Uiteindelijk afgerond km-tarief gebruikt voor het resultaat. _(standaard verborgen)_           |
| Min gedeelde km        | Minimaal gedeelde km-scenario vanuit hub-instellingen. _(standaard verborgen)_                 |
| Gem. gedeelde km       | Gemiddeld gedeelde km-scenario vanuit hub-instellingen. _(standaard verborgen)_                |
| Max gedeelde km        | Maximaal gedeelde km-scenario vanuit hub-instellingen. _(standaard verborgen)_                 |
| Euro norm              | Euro-emissienorm van het voertuig. _(standaard verborgen)_                                     |
| Ecoscore               | Milieuscore van het voertuig. _(standaard verborgen)_                                          |
| Verbruik               | Geschat brandstofverbruik. _(standaard verborgen)_                                             |
| Cilinder cc            | Motorcilinderinhoud in cc. _(standaard verborgen)_                                             |
| CO2 (g/km)             | CO2-uitstoot in g/km. _(standaard verborgen)_                                                  |
| Afwijzingsreden        | Redenomschrijving bij resultaat Niet OK. _(standaard verborgen)_                               |
| Autotype (overig)      | Aangepaste typeomschrijving bij keuze "Overig". _(standaard verborgen)_                        |
| Duur (s)               | Hoe lang de engine-run duurde, in hele seconden. _(standaard verborgen)_                       |
| Resultaat e-mail       | Adres voor het e-mailen van het simulatieresultaat (indien ingesteld). _(standaard verborgen)_ |
| Bijgewerkt             | Datum en tijdstip van de laatste wijziging. _(standaard verborgen)_                            |

## Richtlijnen voor admins

- Houd referentietabellen volledig en actueel voor grote simulatiebatches.
- Als veel runs **Handmatige beoordeling** geven, controleer of de hub **maximale autoprijs** daarvoor verantwoord is (hoge waarde: er is een
  verklarende stap); zo niet, controleer ontbrekende of ongeldige referentiegegevens.
- Herbekijk hubdrempels regelmatig: ze hebben sterke invloed op acceptatie en categorieresultaten.
