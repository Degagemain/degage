export const CAR_ONBOARDING_GSHEET_COLUMNS = [
  'Rijnr',
  'Nummer van de inschrijving',
  'Naam van de ontlener',
  'Voornaam',
  'Postcode en Woonplaats',
  'Adres',
  'GSM Nummer',
  'Email Address',
  'KM stand begin',
  'Aantal km eigenaar per jaar',
  'Waarde volgens Degage',
  'Auto + Type',
  'Afschrijving per km',
  'Brandstof',
  'Bouwjaar',
  'Nieuwe stad ?',
  'Laatste PDF',
  'Gemiddeld aantal km gedeeld',
  'Terugverdien bedrag gemiddeld',
  'Minimaal terugverdiend',
  'Maximaal terugverdiend',
  'Verzekeringspremie per jaar',
  'Afgeschreven op km',
  'Waarde exclusief',
  'Dropdownlist zoek auto',
  'Beoordeling',
] as const;

export type CarOnboardingGsheetColumn = (typeof CAR_ONBOARDING_GSHEET_COLUMNS)[number];

export type CarOnboardingGsheetRow = Record<CarOnboardingGsheetColumn, string | number>;
