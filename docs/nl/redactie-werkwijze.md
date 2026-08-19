# Redactie-werkwijze kenniscentrum

Voor wie artikels beheert in het Dégage-kenniscentrum (app.deeljeauto.be), samen met
Claude. Claude voert de controles en het schrijfwerk uit; jij beslist en keurt goed.

## Waar hoort iets thuis? (de routeringsregel)

Beslis vóór je schrijft waar de inhoud thuishoort. Claude past deze regel automatisch
toe en zegt erbij welke bestemming hij koos:

| De inhoud gaat over... | Bestemming | Wie voert uit |
|---|---|---|
| Hoe Dégage werkt voor leden (reserveren, tanken, afrekening, lidmaatschap...) | Kenniscentrum-artikel (Postgres) | medewerker + Claude, via MCP of admin-UI |
| Hoe het platform technisch werkt, voor beheerders, en het mag publiek | `docs/` in de degage-repo | voorstel klaarleggen → een developer zet het erin |
| Interne werkafspraken, of álles waarover twijfel bestaat | de interne werkrepo | voorstel klaarleggen → een developer commit |

Twijfel = privé. Van privé naar publiek verhuizen kan altijd nog; andersom niet — de
degage-repo is publiek, inclusief alle branches.

**Rechtenverdeling (bewust zo):** De medewerker en Claude hebben géén schrijfrechten op
GitHub en krijgen die ook niet. Alles wat een repo raakt, leveren ze aan als
kant-en-klaar voorstel; een developer plaatst het. Het enige wat ze zelf
rechtstreeks kunnen wijzigen zijn kenniscentrum-artikels, via de MCP.

## De drie controles vóór een nieuw artikel

Altijd in deze volgorde. Claude draait ze; sla ze nooit over.

**1. Bestaat het al?**
Zoek niet met één zoekopdracht, maar laat Claude het volledige corpus ophalen
(`search_documentation`, alle artikels) en vergelijken op betekenis, niet op letterlijke
woorden. Een vraag kan onder een heel andere titel al beantwoord zijn.

**2. Overlapt het?**
De toets is niet "lijken ze op elkaar" maar **"is het antwoord hetzelfde?"**

- **Zelfde antwoord, andere vraagformulering** → mergen, niet toevoegen: werk het
  bestaande artikel bij en neem de nieuwe vraagformulering erin op. Twee versies van
  hetzelfde antwoord groeien uit elkaar en verwarren de chatbot.
- **Verwant onderwerp, maar een eigen antwoord** → een apart artikel is prima, en past
  zelfs beter bij "één onderwerp per artikel". Twee verwante artikels mogen gerust
  allebei gevonden worden — zolang ze elkaar niet tegenspreken.

Mergen is altijd een vóórstel in het voorlegsjabloon; de medewerker beslist.

**3. Pas dan: nieuw artikel.**
Claude maakt het concept volgens het sjabloon hieronder; jij leest na en publiceert.

## Het artikelsjabloon

- **Format: altijd `markdown`.** Nooit `text` — sinds 19-08-2026 staat het hele corpus
  op markdown, hou dat zo.
- **Titel = de vraag zoals een lid ze zou stellen.** Niet "Tankbeleid" maar "Moet ik
  steeds tanken tijdens mijn ritten?". De titel wordt apart doorzocht door de chatbot,
  dus een goede vraagtitel is de helft van de vindbaarheid.
- **Je-vorm, altijd.** Warm en direct, zoals een behulpzame vrijwilliger. Geen "u",
  geen ambtelijke taal.
- **Kort.** FAQ-formaat: richtlijn onder de 150 woorden. Eén onderwerp per artikel;
  wordt het langer, dan zijn het waarschijnlijk twee artikels.
- **Opmaak:** lege regel tussen alinea's (anders plakt markdown ze aan elkaar);
  opsommingen met `- `; links als `[label](url)`; links binnen de app relatief
  schrijven (`/app/simulation` in plaats van het volledige adres); e-mail als
  `[tekst](mailto:adres)`.
- **Taal: Nederlands is de brontaal.** Engels en Frans laten we bewust rusten
  (afspraak 19-08-2026); vul ze niet halfslachtig in — een verkeerde vertaling is
  erger dan geen.
- **Metadata:** juiste groep toekennen (Reservaties, Tanken, Afrekening...), en de
  vinkjes FAQ en Publiek bewust zetten. Een artikel zonder groep is moeilijker terug
  te vinden voor redactie én lezer.

## Het voorlegsjabloon

Claude presenteert élk voorstel (nieuw artikel of wijziging) in dit vaste format, zodat
de review altijd hetzelfde leest en niets stilzwijgend passeert:

```
## Voorstel: [titel van het artikel]

Routering: [kenniscentrum-artikel / degage-docs / privé] — omdat [één zin]
Actie: [nieuw artikel / wijziging van bestaand artikel X]

Controle 1 — bestaat al?  [nee / ja, zie artikel X]
  Dichtste bestaande artikels: [titel] · [titel] · [titel]
Controle 2 — overlap?  [geen noemenswaardige / X% gelijkenis met "titel" → voorstel: mergen]

Twijfels voor jou: [expliciete lijst, of "geen"]

| Veld     | Waarde                    |
|----------|---------------------------|
| Titel    | ...                       |
| Groep    | [een van de 13 groepen]   |
| FAQ      | ja/nee                    |
| Publiek  | ja/nee                    |
| Doelgroep| public / user / admin     |
| Tags     | [alleen bij simulatie-FAQ]|
| Format   | markdown                  |

--- inhoud (NL) ---
[de volledige artikeltekst]
```

**Vinkjesregel bij twijfel:** twijfelt Claude over een vinkje of de groep, dan kiest hij
de veiligste stand (Publiek: néé) en zet hij de twijfel expliciet in de lijst "Twijfels
voor jou". Er gaat nooit iets publiek dat niet bewust door een mens is aangevinkt.

## Publiceren

- Bestaand artikel bijwerken: via Claude (MCP `update_documentation`) of de admin-UI.
- Nieuw artikel: voorlopig via de admin-UI (knop **New**) — Claude levert het concept
  kant-en-klaar aan. Zodra de MCP een create-functie heeft (ticket staat bij de developers),
  kan Claude het rechtstreeks plaatsen na jouw akkoord.
- Bij opslaan via MCP verversen de zoek-embeddings vanzelf. Na opslaan via de
  admin-UI: controleer of het artikel vindbaar is, of druk op **Sync**.

## Twee harde veiligheidsregels bij MCP-updates

1. **Een update is een volledige vervanging.** Stuur áltijd alle bestaande vertalingen
   ongewijzigd mee — ook de talen die je niet aanraakt. Wat je niet meestuurt, wordt
   gewist. Wijzig dus alleen de taal die je bewust wijzigt, en kopieer de rest letterlijk
   uit het huidige record.
2. **Alleen artikels met bron `manual` zijn van de redactie.** Raak via MCP nooit
   artikels aan met bron `repository` of `notion`: die worden vanuit de repo of Notion
   beheerd, en jouw wijziging wordt bij de volgende deploy overschreven — of loopt
   tot dan stilletjes uit de pas met de bron.

## Sessie-afsluiting (wrap-up)

Sluit élke redactiesessie af met een korte wrap-up in het **Redactielogboek**: een
niet-publiek artikel (bron manual, doelgroep admin, geen FAQ) dat Claude via MCP
bijwerkt door bovenaan een gedateerde entry toe te voegen:

```
[datum] — gepubliceerd/bijgewerkt: [artikels]
· doorgeschoven twijfels: [wat, aan wie]
· fricties of verbetertips voor deze werkwijze: [of "geen"]
```

Zo kunnen de developers meelezen hoe de redactie loopt zonder in de chatsessies te
hoeven kijken, en verzamelen verbeterpunten voor de werkwijze zich vanzelf op één plek.
Het logboek-artikel wordt eenmalig aangemaakt via de admin-UI.

## Inhoudsregels

- **Verzin niets.** Cijfers, tarieven, deadlines en verzekeringsregels komen uit een
  bestaand artikel, uit Degapp of van de developers — nooit uit het geheugen van Claude.
- **Beleidsvragen** (mag dit? wat is de regel?) beslis je niet in een artikel: eerst
  aftoetsen bij de developers.
- Geen persoonsgegevens, geen interne mailadressen (alleen deeljeauto@degage.be), geen
  bedragen die in onderhandeling zijn.
