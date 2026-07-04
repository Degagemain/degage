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
verzekering, waarde, afronden).

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

### Gebruikersinfo

Verzamelt de contactgegevens van de eigenaar: straat, gemeente en telefoon.

Deze stap is compleet wanneer straat, gemeente en telefoon zijn ingevuld.

### Wageninfo

Verzamelt voertuigkenmerken: merk, brandstoftype, voertuigtype (of vrije tekst), kilometerstand, zitplaatsen, datum eerste inschrijving,
bestelwagen, aangekochte wagen, nieuwe wagen, aankoopprijs, afschrijving per km, scans van het inschrijvingsbewijs (voor- en achterzijde) en
keuringsbewijs.

Deze stap is compleet wanneer merk, brandstoftype en voertuigtype zijn ingesteld.

### Verzekering

Legt de huidige verzekeringsmaatschappij en startdatum van het contract vast wanneer de wagen niet is aangekocht.

| Status              | Betekenis                                                                   |
| ------------------- | --------------------------------------------------------------------------- |
| Niet van toepassing | De wagen is aangekocht; er is geen bestaande verzekering om vast te leggen. |
| Todo                | De eigenaar moet verzekeraar en startdatum van het contract invullen.       |
| Klaar               | Verzekeraar en startdatum zijn beide ingevuld.                              |

Het systeem zet de verzekeringsstatus automatisch bij opslaan. Wanneer **Aangekochte wagen** aan staat, wordt de status **Niet van toepassing**
en worden verzekeringsvelden gewist.

De eigenaar kan verzekeringsgegevens (verzekeraar en startdatum) indienen via een gedeeltelijke update zolang de status **Todo** is.

Deze stap is compleet wanneer de verzekeringsstatus niet **Todo** is.

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

### Afronden

Wanneer Play connector, infosessie, gebruikersinfo, wageninfo, verzekering en waarde allemaal compleet zijn, zet het systeem de
voorbereidingsstatus automatisch op **Klaar** bij opslaan. Een admin kan daarna de auto-onboarding starten op het tabblad **Afronden**.

| Status      | Betekenis                                                                                                                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open        | Onboarding is bezig; voorbereidingsstappen zijn nog niet allemaal compleet.                                                                                                                  |
| Klaar       | Play connector, infosessie (Compleet), gebruikersinfo, wageninfo, verzekering (niet Todo) en waarde (Opgelost) zijn compleet. Het systeem zet dit automatisch.                               |
| Vergrendeld | Geen verdere gebruikerswijzigingen toegestaan. Admins kunnen het volledige record nog wel aanpassen. Gezet door een admin op het tabblad **Afronden** wanneer de voorbereiding **Klaar** is. |

Wanneer de voorbereiding **Vergrendeld** is, kunnen gebruikers gebruikersinfo, wageninfo, verzekering en waarde niet meer bijwerken tot een
admin dit vrijgeeft.

## Record aanmaken

| Scenario         | Wie mag aanmaken         | Body                                                                                                  |
| ---------------- | ------------------------ | ----------------------------------------------------------------------------------------------------- |
| Vanuit simulatie | Elke ingelogde gebruiker | `{ "simulation": { "id": "<uuid>" } }` — wagengegevens worden gekopieerd; de aanroeper wordt eigenaar |
| Lege shell       | Alleen admin             | `{}` — record met standaardwaarden, zonder gekoppelde simulatie                                       |

## Eigenschappen

| Eigenschap                      | Beschrijving                                                              |
| ------------------------------- | ------------------------------------------------------------------------- |
| Straat                          | Straatadres van de gebruiker.                                             |
| Gemeente                        | Gemeente van de gebruiker (postcode en plaats).                           |
| Telefoon                        | Telefoonnummer van de gebruiker.                                          |
| Merk                            | Voertuigmerk.                                                             |
| Brandstoftype                   | Brandstoftype van het voertuig.                                           |
| Voertuigtype                    | Voertuigmodel/type uit de catalogus.                                      |
| Voertuigtype (overig)           | Vrije tekst wanneer geen catalogusitem van toepassing is.                 |
| Aangekochte wagen               | Of het voertuig is aangekocht.                                            |
| Aankoopprijs                    | Aankoopprijs van het voertuig.                                            |
| Inschrijvingsbewijs voorzijde   | Scan of foto van de voorzijde van het inschrijvingsbewijs.                |
| Inschrijvingsbewijs achterzijde | Scan of foto van de achterzijde van het inschrijvingsbewijs.              |
| Keuringsbewijs                  | Geldig keuringsrapport (verplicht voor wagens ouder dan 4 jaar).          |
| Roze formulier                  | Overdrachtsformulier (roze formulier) voor aangekochte tweedehandswagens. |
| Waarde van de wagen             | Geschatte huidige waarde van het voertuig (voorgesteld door admin).       |
| Tegenvoorstel                   | Alternatieve waarde voorgesteld door de eigenaar.                         |
| Tegenvoorstel bericht           | Optionele toelichting bij het tegenvoorstel.                              |
| Waarde-status                   | Voortgang van het waarde-onderhandelingsproces.                           |
| Verzekeraar                     | Huidige verzekeringsmaatschappij van het voertuig.                        |
| Verzekeringscontract gestart    | Datum waarop het verzekeringscontract startte.                            |
| Verzekeringsstatus              | Voortgang van het verzekeringsproces.                                     |
| Afschrijving per km             | Geschatte afschrijvingskost per gereden kilometer.                        |
| Nieuwe wagen                    | Of het voertuig nieuw is.                                                 |
| Kilometerstand                  | Huidige kilometerstand.                                                   |
| Eerste inschrijving             | Datum van eerste inschrijving.                                            |
| Zitplaatsen                     | Aantal zitplaatsen.                                                       |
| Bestelwagen                     | Of het voertuig als bestelwagen wordt geclassificeerd.                    |
| Eigenaar                        | Platformgebruiker die dit onboardingrecord bezit (optioneel voorlopig).   |
| Eigenaar Play connector         | Of de eigenaar een Play connector-account heeft gekoppeld (Ja/Nee).       |
| Infosessie datum                | Geplande datum van de ingeschreven infosessie.                            |
| Infosessie PC-id                | Play connector-identificatie van de ingeschreven infosessie.              |
| Infosessiestatus                | Voortgang van het infosessie-proces.                                      |
| Simulatie                       | Gekoppelde simulatie-run, indien aanwezig.                                |
| Voorbereidingsstatus            | Volgt de voortgang: Open, Klaar of Vergrendeld.                           |
