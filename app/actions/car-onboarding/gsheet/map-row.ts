import type { CarOnboarding } from '@/domain/car-onboarding.model';
import type { Hub } from '@/domain/hub.model';
import { type Simulation, SimulationResultCode } from '@/domain/simulation.model';
import type { Town } from '@/domain/town.model';
import type { CarOnboardingGsheetRow } from '@/actions/car-onboarding/gsheet/columns';
import { mapFuelCodeToSheetLabel } from '@/actions/car-onboarding/gsheet/fuel-map';
import { CarOnboardingGsheetMappingError } from '@/actions/car-onboarding/gsheet/mapping.error';

export type MapCarOnboardingGsheetRowInput = {
  onboarding: CarOnboarding;
  simulation: Simulation;
  town: Town;
  hub: Hub;
  fuelCode: string;
  ownerName: string;
  ownerEmail: string;
  rowNumber: number | null;
};

const formatCommaDecimal = (value: number): string => {
  return String(value).replace('.', ',');
};

const firstNameFromFullName = (fullName: string): string => {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.split(/\s+/)[0] ?? '';
};

const mapBeoordeling = (resultCode: SimulationResultCode | string | null | undefined): string => {
  switch (resultCode) {
    case SimulationResultCode.NOT_OK:
    case 'notOk':
      return 'NOK';
    case SimulationResultCode.CATEGORY_A:
    case 'categoryA':
      return 'Cat A';
    case SimulationResultCode.CATEGORY_B:
    case 'categoryB':
      return 'Cat B';
    case SimulationResultCode.MANUAL_REVIEW:
    case 'manualReview':
      return 'Handmatig';
    default:
      return '';
  }
};

const payback = (sharedKm: number | null | undefined, depreciationCostKm: number): number => {
  if (sharedKm == null) {
    return 0;
  }
  return Math.round(sharedKm * depreciationCostKm);
};

export const mapCarOnboardingToGsheetRow = (input: MapCarOnboardingGsheetRowInput): CarOnboardingGsheetRow => {
  const { onboarding, simulation, town, hub, fuelCode, ownerName, ownerEmail, rowNumber } = input;

  const fuelLabel = mapFuelCodeToSheetLabel(fuelCode);
  if (fuelLabel == null) {
    throw new CarOnboardingGsheetMappingError(`Unknown fuel type code: ${fuelCode}`);
  }

  const brandName = onboarding.brand?.name?.trim() ?? '';
  const carTypeName = (onboarding.carTypeOther?.trim() || onboarding.carType?.name?.trim() || '').trim();
  const autoType = [brandName, carTypeName].filter(Boolean).join(' ');
  const brandTypeHyphen = [brandName, carTypeName].filter(Boolean).join('-');
  const address = [onboarding.street?.trim(), onboarding.houseNumber?.trim()].filter(Boolean).join(' ');
  const postcodePlace = [town.zip.trim(), town.name.trim()].filter(Boolean).join(' ');
  const bouwjaar =
    onboarding.firstRegisteredAt != null && !Number.isNaN(new Date(onboarding.firstRegisteredAt).getTime())
      ? new Date(onboarding.firstRegisteredAt).getFullYear()
      : '';
  const beoordeling = mapBeoordeling(simulation.resultCode);
  const waardeExclusief = Math.round(onboarding.carValue / 1.21);
  const afgeschrevenOpKm = fuelCode === 'electric' ? hub.simDepreciationKmElectric : hub.simDepreciationKm;

  const carPcId = onboarding.carPcId ?? '';
  const dropdown = [carPcId, ownerName, brandTypeHyphen, fuelLabel, beoordeling].filter((part) => part !== '').join(' ');

  return {
    Rijnr: rowNumber != null ? rowNumber + 1 : '',
    'Nummer van de inschrijving': carPcId,
    'Naam van de ontlener': ownerName,
    Voornaam: firstNameFromFullName(ownerName),
    'Postcode en Woonplaats': postcodePlace,
    Adres: address,
    'GSM Nummer': onboarding.phone?.trim() ?? '',
    'Email Address': ownerEmail,
    'KM stand begin': onboarding.mileage,
    'Aantal km eigenaar per jaar': simulation.ownerKmPerYear,
    'Waarde volgens Degage': onboarding.carValue,
    'Auto + Type': autoType,
    'Afschrijving per km': formatCommaDecimal(onboarding.depreciationCostKm),
    Brandstof: fuelLabel,
    Bouwjaar: bouwjaar,
    'Nieuwe stad ?': town.hasActiveMembers ? 'neen' : 'ja',
    'Laatste PDF': '',
    'Gemiddeld aantal km gedeeld': simulation.resultAvgSharedKm ?? '',
    'Terugverdien bedrag gemiddeld': payback(simulation.resultAvgSharedKm, onboarding.depreciationCostKm),
    'Minimaal terugverdiend': payback(simulation.resultMinSharedKm, onboarding.depreciationCostKm),
    'Maximaal terugverdiend': payback(simulation.resultMaxSharedKm, onboarding.depreciationCostKm),
    'Verzekeringspremie per jaar': simulation.resultInsuranceCostPerYear ?? '',
    'Afgeschreven op km': afgeschrevenOpKm,
    'Waarde exclusief': waardeExclusief,
    'Dropdownlist zoek auto': dropdown,
    Beoordeling: beoordeling,
  };
};
