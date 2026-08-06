---
title: Onboardings
roles:
  - admin
---

# Onboardings

Auto-onboarding is een meerstappenproces waarbij voertuig- en gebruikersgegevens worden verzameld voordat een auto volledig op het platform kan
aansluiten.

## Voorbereiding

Tijdens de voorbereiding verzamelt het systeem contactgegevens en voertuigkenmerken in aparte stappen. Een voorbereidingsstatus houdt bij of de
vereiste invoer compleet is en of verdere wijzigingen nog zijn toegestaan.

Admins beheren de voorbereiding in de adminzone onder **Onboardings** (lijst en detail met tabbladen: eigenaar, gebruikersinfo, wageninfo,
verzekering, pechverhelping, waarde, afronden).

### Eigenaar

Wijst de eigenaar van de auto-onboarding toe en toont of die het legacy Dégage-account (Play connector) heeft gekoppeld.

Deze stap is compleet wanneer de eigenaar een Play connector-record heeft geconfigureerd.

### Infosessie

De eigenaar schrijft zich in voor een komende Degapp-infosessie in de publieke onboardingflow.

| Status       | Betekenis                                                                     |
| ------------ | ----------------------------------------------------------------------------- |
| Todo         | De eigenaar is nog niet ingeschreven voor een infosessie.                     |
| Ingeschreven | De eigenaar is ingeschreven; wacht op bevestiging van aanwezigheid.           |
| Compleet     | Een beheerder heeft bevestigd dat de eigenaar de infosessie heeft bijgewoond. |

De eigenaar kan slechts in één sessie tegelijk ingeschreven zijn. Om een andere sessie te kiezen, moet hij zich eerst uitschrijven.

Inschrijven ontgrendelt de volgende voorbereidingsstappen in de publieke onboardingflow. Bevestiging van aanwezigheid door een beheerder is nog
steeds vereist voordat de infosessiestap als voltooid wordt gemarkeerd en de voorbereiding kan worden afgerond.

Deze stap is compleet wanneer de infosessiestatus **Compleet** is.

### Eigenaarsinfo

Verzamelt de contactgegevens van de eigenaar: straat, gemeente en telefoon.

Deze stap is compleet wanneer straat, gemeente en telefoon zijn ingevuld.

### Wageninfo

Verzamelt voertuigkenmerken: merk, brandstoftype, voertuigtype (of vrije tekst), kilometerstand, zitplaatsen, datum eerste inschrijving,
bestelwagen, aangekochte wagen, nieuwe wagen, aankoopprijs, afschrijving per km, scans van het inschrijvingsbewijs (voor- en achterzijde),
keuringsbewijs en roze formulier.

Geüploade documentfoto's worden automatisch gecontroleerd voordat ze worden opgeslagen. Als een foto onduidelijk is of niet overeenkomt met het
verwachte documenttype, wordt de upload geweigerd en wordt de gebruiker gevraagd een duidelijke foto te uploaden. De voorzijde van het
inschrijvingsbewijs kan ook VIN, nummerplaat en datum eerste inschrijving invullen wanneer die velden nog leeg zijn.

Deze stap is compleet wanneer merk, brandstoftype en voertuigtype zijn ingesteld, en alle vereiste documenten voor de voertuigsituatie zijn
geüpload: voor- en achterkant van het inschrijvingsbewijs wanneer de wagen niet gekocht is; keuringsattest bovendien wanneer de wagen ouder is
dan vier jaar; roze formulier wanneer de wagen gekocht is en niet nieuw; geen documenten wanneer de wagen gekocht is en nieuw.

### Verzekering

Legt vast of de wagen al een verzekeringscontract heeft en, indien van toepassing, de huidige verzekeringsmaatschappij en startdatum van het
contract.

| Eigenschap                 | Beschrijving                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| Heeft verzekeringscontract | Of de eigenaar al een verzekeringscontract heeft voor deze wagen.                                        |
| Verzekeraar                | Huidige verzekeringsmaatschappij (zichtbaar wanneer heeft verzekeringscontract aan staat).               |
| Start verzekeringscontract | Datum waarop het huidige verzekeringscontract is gestart (wanneer heeft verzekeringscontract aan staat). |

| Status              | Betekenis                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| Niet van toepassing | De wagen heeft geen bestaand verzekeringscontract om vast te leggen; verzekeringsvelden zijn niet verplicht. |
| Todo                | Heeft verzekeringscontract staat aan; verzekeringsgegevens kunnen later worden ingevuld.                     |
| Klaar               | Heeft verzekeringscontract staat aan en verzekeringsgegevens zijn ingevuld.                                  |

Het systeem zet de verzekeringsstatus automatisch bij opslaan. Wanneer **Heeft verzekeringscontract** uit staat, wordt de status **Niet van
toepassing** en worden verzekeringsvelden gewist.

De eigenaar kan verzekeringsgegevens bijwerken via een gedeeltelijke update zolang de status **Todo** is. Verzekeringsgegevens hoeven niet in
dezelfde indiening als het vlagveld.

Deze stap is compleet wanneer de verzekeringsstatus niet **Todo** is.

### Pechverhelpingsplan

Legt vast of de wagen al pechverhelping heeft en welk plan de eigenaar met Dégage wil.

| Eigenschap                             | Beschrijving                                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Heeft bestaand pechverhelpingsplan     | Of de wagen al pechverhelping heeft (bij een nieuwe aangekochte wagen kan dit inbegrepen zijn).       |
| Einddatum bestaand pechverhelpingsplan | Einddatum van het huidige pechverhelpingsplan (wanneer heeft bestaand pechverhelpingsplan aan staat). |
| Pechverhelpingsplan                    | Gewenst pechverhelpingsplan uit de catalogus.                                                         |

| Status | Betekenis                                                                               |
| ------ | --------------------------------------------------------------------------------------- |
| Todo   | Verplichte velden ontbreken (gewenst plan en/of einddatum bestaand plan).               |
| Klaar  | Gewenst plan is gekozen en bestaande plangegevens zijn compleet wanneer van toepassing. |

Het systeem zet de status automatisch bij opslaan. Wanneer **Heeft bestaand pechverhelpingsplan** uit staat, wordt de einddatum gewist.

De eigenaar kan pechverhelpingsgegevens bijwerken via een gedeeltelijke update zolang de status **Todo** is.

Deze stap is compleet wanneer de pechverhelpingsstatus niet **Todo** is.

### Waarde

Onderhandelt over de geschatte huidige waarde van het voertuig tussen admin en eigenaar.

| Status   | Betekenis                                                                      |
| -------- | ------------------------------------------------------------------------------ |
| Todo     | Startstatus; wachten op een waarde-voorstel van de admin.                      |
| Proposal | Admin stelde een waarde voor; eigenaar kan tegenvoorstel doen of akkoord gaan. |
| Counter  | Eigenaar diende een tegenvoorstel in; wachten op admin-reactie.                |
| Resolved | Eigenaar ging akkoord; het waarde-proces is afgerond.                          |

Wijzigt een admin de waarde terwijl de status **Todo** of **Counter** is, dan gaat de status automatisch naar **Proposal**.

De eigenaar kan een tegenvoorstel (waarde en optioneel bericht) indienen wanneer de status **Proposal** is; de status wordt dan **Counter**. De
eigenaar kan akkoord gaan wanneer de status **Proposal** is; de status wordt dan **Resolved**.

Admins kunnen het akkoord overschrijven op het tabblad waarde wanneer de eigenaar expliciet buiten de normale app-flow akkoord is gegaan.

Deze stap is compleet wanneer de waarde-status **Resolved** is.

### Autostickers

De eigenaar kan extra stickerontwerpen uit de catalogus kiezen tijdens de publieke onboarding-flow. Extra stickers zijn optioneel.
Altijd-inbegrepen stickers worden vooraf geselecteerd getoond en kunnen niet worden verwijderd; ze worden niet opgeslagen op het
onboarding-record.

| Eigenschap   | Beschrijving                                                        |
| ------------ | ------------------------------------------------------------------- |
| Autostickers | Extra stickerontwerpen geselecteerd en opgeslagen door de eigenaar. |

Deze stap is altijd compleet; extra stickers zijn optioneel.

### Afronden

Wanneer Play connector, infosessie, gebruikersinfo, wageninfo, verzekering, pechverhelping, waarde en autostickers allemaal compleet zijn, zet
het systeem de voorbereidingsstatus automatisch op **Klaar** bij opslaan. Een admin kan daarna de auto-onboarding starten op het tabblad
**Afronden**.

| Status      | Betekenis                                                                                                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open        | Onboarding is bezig; voorbereidingsstappen zijn nog niet allemaal compleet.                                                                                                                  |
| Klaar       | Play connector, infosessie (Compleet), gebruikersinfo, wageninfo, verzekering (niet Todo), waarde (Opgelost) en autostickers zijn compleet. Het systeem zet dit automatisch.                 |
| Vergrendeld | Geen verdere gebruikerswijzigingen toegestaan. Admins kunnen het volledige record nog wel aanpassen. Gezet door een admin op het tabblad **Afronden** wanneer de voorbereiding **Klaar** is. |

Wanneer de voorbereiding **Vergrendeld** is, kunnen gebruikers gebruikersinfo, wageninfo, verzekering en waarde niet meer bijwerken tot een
admin dit vrijgeeft.

## Record aanmaken

| Scenario         | Wie mag aanmaken         | Body                                                                                                  |
| ---------------- | ------------------------ | ----------------------------------------------------------------------------------------------------- |
| Vanuit simulatie | Elke ingelogde gebruiker | `{ "simulation": { "id": "<uuid>" } }` — wagengegevens worden gekopieerd; de aanroeper wordt eigenaar |
| Lege shell       | Alleen admin             | `{}` — record met standaardwaarden, zonder gekoppelde simulatie                                       |

## Eigenschappen

| Eigenschap                      | Beschrijving                                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Straat                          | Straatadres van de gebruiker.                                                                                                |
| Gemeente                        | Gemeente van de gebruiker (postcode en plaats).                                                                              |
| Telefoon                        | Telefoonnummer van de gebruiker.                                                                                             |
| Merk                            | Voertuigmerk.                                                                                                                |
| Brandstoftype                   | Brandstoftype van het voertuig.                                                                                              |
| Voertuigtype                    | Voertuigmodel/type uit de catalogus.                                                                                         |
| Voertuigtype (overig)           | Vrije tekst wanneer geen catalogusitem van toepassing is.                                                                    |
| Aangekochte wagen               | Of het voertuig is aangekocht.                                                                                               |
| Aankoopprijs                    | Aankoopprijs van het voertuig.                                                                                               |
| Inschrijvingsbewijs voorzijde   | Scan of foto van de voorzijde van het inschrijvingsbewijs.                                                                   |
| Inschrijvingsbewijs achterzijde | Scan of foto van de achterzijde van het inschrijvingsbewijs.                                                                 |
| Keuringsbewijs                  | Geldig keuringsrapport (verplicht voor wagens ouder dan 4 jaar).                                                             |
| Roze formulier                  | Overdrachtsformulier (roze formulier) voor aangekochte tweedehandswagens.                                                    |
| Waarde van de wagen             | Geschatte huidige waarde van het voertuig (voorgesteld door admin).                                                          |
| Tegenvoorstel                   | Alternatieve waarde voorgesteld door de eigenaar.                                                                            |
| Tegenvoorstel bericht           | Optionele toelichting bij het tegenvoorstel.                                                                                 |
| Waarde-status                   | Voortgang van het waarde-onderhandelingsproces.                                                                              |
| Verzekeraar                     | Huidige verzekeringsmaatschappij van het voertuig.                                                                           |
| Verzekeringscontract gestart    | Datum waarop het verzekeringscontract startte.                                                                               |
| Tariefverhoging aangekondigd    | Of de verzekeraar een premieverhoging heeft aangekondigd (getoond wanneer het contract minder dan een jaar geleden startte). |
| Verzekeringsstatus              | Voortgang van het verzekeringsproces.                                                                                        |
| Afschrijving per km             | Geschatte afschrijvingskost per gereden kilometer.                                                                           |
| Nieuwe wagen                    | Of het voertuig nieuw is.                                                                                                    |
| Kilometerstand                  | Huidige kilometerstand.                                                                                                      |
| Eerste inschrijving             | Datum van eerste inschrijving.                                                                                               |
| Zitplaatsen                     | Aantal zitplaatsen.                                                                                                          |
| Bestelwagen                     | Of het voertuig als bestelwagen wordt geclassificeerd.                                                                       |
| Eigenaar                        | Platformgebruiker die dit onboardingrecord bezit (optioneel voorlopig).                                                      |
| Eigenaar Play connector         | Of de eigenaar een Play connector-account heeft gekoppeld (Ja/Nee).                                                          |
| Infosessie datum                | Geplande datum van de ingeschreven infosessie.                                                                               |
| Infosessie PC-id                | Play connector-identificatie van de ingeschreven infosessie.                                                                 |
| Infosessiestatus                | Voortgang van het infosessie-proces.                                                                                         |
| Simulatie                       | Gekoppelde simulatie-run, indien aanwezig.                                                                                   |
| Voorbereidingsstatus            | Volgt de voortgang: Open, Klaar of Vergrendeld.                                                                              |
