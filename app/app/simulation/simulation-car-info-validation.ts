import { formatDateForInput, parseDateInput } from '@/app/components/form/date-input-helpers';

export const CAR_TYPE_OTHER = '__other__';

export type SimulationCarInfoValues = {
  isCommercialVehicle: boolean;
  townId: string;
  brandId: string;
  fuelTypeId: string;
  carTypeId: string;
  carTypeOther: string;
  seats: string;
  carChoice: 'existing' | 'newCar' | null;
  isNewCar: boolean;
  mileage: string;
  firstRegisteredAt: string;
  ownerKmPerYear: string;
  purchaseAmountInclVat: string;
};

export type SimulationCarInfoFieldErrors = {
  carTypeOther?: 'required';
  seats?: 'invalid';
  purchaseAmountInclVat?: 'invalid';
  mileage?: 'invalid';
  firstRegisteredAt?: 'required' | 'invalid' | 'future';
  ownerKmPerYear?: 'invalid';
};

function parsePositiveInt(value: string): number | null {
  const n = value.trim() ? parseInt(value.trim(), 10) : NaN;
  return Number.isInteger(n) && n > 0 ? n : null;
}

function parseNonNegativeInt(value: string): number | null {
  const n = value.trim() ? parseInt(value.trim(), 10) : NaN;
  return Number.isInteger(n) && n >= 0 ? n : null;
}

function parsePositiveAmount(value: string): number | null {
  const n = value.trim() ? parseFloat(value.replace(/,/g, '.')) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

function firstRegistrationError(value: string, todayIso: string): 'required' | 'invalid' | 'future' | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'required';
  const date = parseDateInput(trimmed);
  if (!date) return 'invalid';
  if (formatDateForInput(date) > todayIso) return 'future';
  return undefined;
}

export function getSimulationCarInfoFieldErrors(values: SimulationCarInfoValues, now: Date = new Date()): SimulationCarInfoFieldErrors {
  if (values.isCommercialVehicle) return {};

  const errors: SimulationCarInfoFieldErrors = {};
  const todayIso = formatDateForInput(now);
  const needsMileageAndRegistration = values.carChoice === 'existing' || (values.carChoice === 'newCar' && !values.isNewCar);

  if (values.carTypeId === CAR_TYPE_OTHER && !values.carTypeOther.trim()) {
    errors.carTypeOther = 'required';
  }

  const seatsNum = parseInt(values.seats.trim(), 10);
  if (!Number.isInteger(seatsNum) || seatsNum < 1) {
    errors.seats = 'invalid';
  }

  if (values.carChoice === 'newCar' && parsePositiveAmount(values.purchaseAmountInclVat) === null) {
    errors.purchaseAmountInclVat = 'invalid';
  }

  if (needsMileageAndRegistration) {
    if (parseNonNegativeInt(values.mileage) === null) {
      errors.mileage = 'invalid';
    }
    const dateError = firstRegistrationError(values.firstRegisteredAt, todayIso);
    if (dateError) errors.firstRegisteredAt = dateError;
  }

  if (parsePositiveInt(values.ownerKmPerYear) === null) {
    errors.ownerKmPerYear = 'invalid';
  }

  return errors;
}

export function isSimulationCarInfoComplete(values: SimulationCarInfoValues, now: Date = new Date()): boolean {
  if (values.isCommercialVehicle) return false;
  if (!values.townId || !values.brandId || !values.fuelTypeId || !values.carTypeId) return false;
  return Object.keys(getSimulationCarInfoFieldErrors(values, now)).length === 0;
}

/** Show missing/empty errors once primary selects are filled; always show invalid/future values. */
export function visibleSimulationCarInfoFieldErrors(values: SimulationCarInfoValues, now: Date = new Date()): SimulationCarInfoFieldErrors {
  const errors = getSimulationCarInfoFieldErrors(values, now);
  const showMissing = Boolean(values.townId && values.brandId && values.fuelTypeId && values.carTypeId);

  const visible: SimulationCarInfoFieldErrors = {};
  if (errors.carTypeOther && showMissing) visible.carTypeOther = errors.carTypeOther;
  if (errors.seats) visible.seats = errors.seats;
  if (errors.purchaseAmountInclVat && (showMissing || values.purchaseAmountInclVat.trim())) {
    visible.purchaseAmountInclVat = errors.purchaseAmountInclVat;
  }
  if (errors.mileage && (showMissing || values.mileage.trim())) {
    visible.mileage = errors.mileage;
  }
  if (errors.firstRegisteredAt) {
    const isMissing = errors.firstRegisteredAt === 'required';
    if (!isMissing || showMissing || values.firstRegisteredAt.trim()) {
      visible.firstRegisteredAt = errors.firstRegisteredAt;
    }
  }
  if (errors.ownerKmPerYear && (showMissing || values.ownerKmPerYear.trim())) {
    visible.ownerKmPerYear = errors.ownerKmPerYear;
  }
  return visible;
}
