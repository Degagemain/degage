import { CarOnboarding, isCarOlderThanFourYears } from '@/domain/car-onboarding.model';
import { type PlayCarFuel, type PlayCarUpdateInput, playCarUpdateInputSchema } from '@/play-connector/cars.model';
import { dbFuelTypeRead } from '@/storage/fuel-type/fuel-type.read';
import { dbPlayConnectorReadByUserId } from '@/storage/play-connector/play-connector.read';
import { dbTownRead } from '@/storage/town/town.read';
import { readSimulation } from '@/actions/simulation/read';

const FUEL_CODE_TO_PLAY: Record<string, PlayCarFuel> = {
  electric: 'ELECTRIC',
  diesel: 'DIESEL',
  petrol: 'PETROL',
  hybrid: 'HYBRID',
  'plugin-hybrid': 'PLUGINHYBRID',
  lpg: 'LPG',
  cng: 'CNG',
};

const isNonEmptyString = (value: string | null | undefined): value is string => {
  return value != null && value.trim().length > 0;
};

const doorsFromSeats = (seats: number): number => {
  if (seats <= 2) return 2;
  if (seats <= 4) return 4;
  return 5;
};

const formatPlayDate = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const mapCarOnboardingToPlayCar = async (onboarding: CarOnboarding): Promise<PlayCarUpdateInput> => {
  const input: PlayCarUpdateInput = {};

  if (isNonEmptyString(onboarding.carName)) input.name = onboarding.carName;
  if (isNonEmptyString(onboarding.brand?.name)) input.brand = onboarding.brand.name;

  const type = isNonEmptyString(onboarding.carTypeOther) ? onboarding.carTypeOther : onboarding.carType?.name;
  if (isNonEmptyString(type)) input.type = type;

  if (onboarding.fuelType?.id) {
    const fuelType = await dbFuelTypeRead(onboarding.fuelType.id);
    const fuel = FUEL_CODE_TO_PLAY[fuelType.code];
    if (fuel) input.fuel = fuel;
  }

  input.purchaseDate = onboarding.isPurchased
    ? isCarOlderThanFourYears(onboarding.firstRegisteredAt)
      ? 'OVERTHAN'
      : 'LESSTHAN'
    : 'STILLTOBEPURCHASED';

  if (onboarding.seats > 0) {
    input.seats = onboarding.seats;
    input.doors = doorsFromSeats(onboarding.seats);
  }
  if (onboarding.firstRegisteredAt != null) {
    const parsed = onboarding.firstRegisteredAt instanceof Date ? onboarding.firstRegisteredAt : new Date(onboarding.firstRegisteredAt);
    if (!Number.isNaN(parsed.getTime())) input.year = parsed.getFullYear();
  }
  if (onboarding.carValue > 0) {
    input.estimatedValue = onboarding.carValue;
    input.carAgreedValue = onboarding.carValue;
  }
  if (onboarding.depreciationCostKm > 0) {
    input.deprec = Math.round(onboarding.depreciationCostKm * 10000) / 10000;
  }
  if (onboarding.mileage > 0) input.carInitialMileage = onboarding.mileage;

  const location: NonNullable<PlayCarUpdateInput['location']> = {};
  if (isNonEmptyString(onboarding.street)) location.street = onboarding.street;
  if (isNonEmptyString(onboarding.houseNumber)) location.num = onboarding.houseNumber;
  if (onboarding.town?.id) {
    const town = await dbTownRead(onboarding.town.id);
    location.zip = town.zip;
    location.city = town.name;
    input.country = 'België';
  }
  if (Object.keys(location).length > 0) input.location = location;

  if (isNonEmptyString(onboarding.insurer?.name)) {
    input.insurance = { name: onboarding.insurer.name };
  }

  if (isNonEmptyString(onboarding.plate)) {
    input.technicalCarDetails = { licensePlate: onboarding.plate };
  }
  if (isNonEmptyString(onboarding.vin)) input.chassisNumber = onboarding.vin;
  if (onboarding.shareStartDate != null) {
    const startSharing = formatPlayDate(onboarding.shareStartDate);
    if (startSharing) input.startSharing = startSharing;
  }

  input.carType = onboarding.isVan ? 'LIGHT_FREIGHT' : 'PASSENGER_CAR';

  const assistanceName = isNonEmptyString(onboarding.roadAssistancePlanDescription)
    ? onboarding.roadAssistancePlanDescription
    : onboarding.roadAssistancePlan?.name;
  if (isNonEmptyString(assistanceName)) input.assistanceName = assistanceName;
  if (onboarding.existingRoadAssistancePlanEndDate != null) {
    const assistanceExpiration = formatPlayDate(onboarding.existingRoadAssistancePlanEndDate);
    if (assistanceExpiration) input.assistanceExpiration = assistanceExpiration;
  }

  if (onboarding.simulation?.id) {
    const simulation = await readSimulation(onboarding.simulation.id);
    if (simulation.ownerKmPerYear > 0) input.ownerAnnualKm = simulation.ownerKmPerYear;
    if (simulation.resultConsumption != null && simulation.resultConsumption > 0) {
      input.fuelEconomy = simulation.resultConsumption;
    }
  }

  if (onboarding.owner?.id) {
    const connector = await dbPlayConnectorReadByUserId(onboarding.owner.id);
    if (connector?.email) input.email = connector.email;
  }

  return playCarUpdateInputSchema.parse(input);
};
