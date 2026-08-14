import { getPlayAdminModeSessionCookie } from '@/actions/play-connector/get-admin-mode-session-cookie';
import { getPlaySessionCookie } from '@/actions/play-connector/get-session-cookie';
import { type PlayCarCreateInput, type PlayCarUpdateInput } from '@/play-connector/cars.model';
import { fetchPlay, postPlayForm, postPlayJson } from '@/play-connector/client';
import { PlayConnectorError } from '@/play-connector/errors';
import { parsePlayCarEditFormFields } from '@/play-connector/parsers/car-edit-form.parser';
import { parseCarsPageNames } from '@/play-connector/parsers/cars-page.parser';

const CARS_PAGE_SIZE = 50;

const buildCarsNameFilter = (name: string): string => `name=${name},brand=,license_plate=,owner=,zipCode=,city=,district=`;

export const playConnectorIsCarNameAvailable = async (adminModeUserId: string, name: string): Promise<boolean> => {
  if (name.includes(',') || name.includes('=')) {
    throw new PlayConnectorError('fetch_failed', 'Car name must not contain comma or equals');
  }

  const { cookieHeader } = await getPlayAdminModeSessionCookie(adminModeUserId);
  const filter = encodeURIComponent(buildCarsNameFilter(name));
  const needle = name.toLowerCase();

  let page = 1;
  while (true) {
    const path = `/cars/page?page=${page}&pageSize=${CARS_PAGE_SIZE}&asc=1&orderBy=&filter=${filter}`;
    const { html } = await fetchPlay(path, cookieHeader);
    const names = parseCarsPageNames(html);

    if (names.some((candidate) => candidate.toLowerCase() === needle)) {
      return false;
    }

    if (names.length < CARS_PAGE_SIZE) {
      return true;
    }

    page += 1;
  }
};

type PlayCarCreatePayload = {
  id: number;
  status: string;
  name: string;
  brand: string;
  type: string;
  fuel: string;
  seats: number;
  manual: boolean;
  year: number | string;
  doors: number;
  fuelEconomy: number;
  estimatedValue: number;
  ownerAnnualKm: number;
  comments: string;
  imagesId: string;
  locationId: string;
  location: {
    city: string;
    street: string;
    num: string;
    zip: string;
  };
  insurance: {
    name: string;
    expiration: string;
    bonusMalus: string;
    annualDueDate: string;
  };
  carInitialMileage: number;
  technicalCarDetails: {
    kiloWatt: number;
    licensePlate: string;
    imageFrontId: string;
    imageBackId: string;
  };
  petsOK: boolean;
  studentOK: boolean;
  trailerAvailable: boolean;
  kidseatAvailable: boolean;
  bicycleRackAvailable: boolean;
  hasBed: boolean;
  trunkVolume: number;
  trunkWidth: number;
  trunkHeight: number;
  trunkDepth: number;
  maxReservationDuration: string;
  maxTimeBeforeReservation: string;
  minTimeBeforeReservation: string;
  purchaseDate: string;
};

const defaultPlayCarCreatePayload = (): PlayCarCreatePayload => ({
  id: -1,
  status: 'REGISTERED',
  name: 'temporary',
  brand: '',
  type: '',
  fuel: 'ELECTRIC',
  seats: 0,
  manual: false,
  year: '',
  doors: 0,
  fuelEconomy: 0,
  estimatedValue: 0,
  ownerAnnualKm: 0,
  comments: '',
  imagesId: '',
  locationId: '',
  location: {
    city: '',
    street: '',
    num: '',
    zip: '',
  },
  insurance: {
    name: '',
    expiration: '',
    bonusMalus: '',
    annualDueDate: '',
  },
  carInitialMileage: 0,
  technicalCarDetails: {
    kiloWatt: 0,
    licensePlate: '',
    imageFrontId: '',
    imageBackId: '',
  },
  petsOK: false,
  studentOK: false,
  trailerAvailable: false,
  kidseatAvailable: false,
  bicycleRackAvailable: false,
  hasBed: false,
  trunkVolume: 0,
  trunkWidth: 0,
  trunkHeight: 0,
  trunkDepth: 0,
  maxReservationDuration: 'INFINITE',
  maxTimeBeforeReservation: 'THREEMONTHS',
  minTimeBeforeReservation: 'NONE',
  purchaseDate: 'STILLTOBEPURCHASED',
});

export const buildPlayCarCreatePayload = (input: PlayCarCreateInput): PlayCarCreatePayload => {
  const payload = defaultPlayCarCreatePayload();

  if (input.name !== undefined) payload.name = input.name;
  if (input.brand !== undefined) payload.brand = input.brand;
  if (input.type !== undefined) payload.type = input.type;
  if (input.fuel !== undefined) payload.fuel = input.fuel;
  if (input.purchaseDate !== undefined) payload.purchaseDate = input.purchaseDate;
  if (input.manual !== undefined) payload.manual = input.manual;
  if (input.seats !== undefined) payload.seats = input.seats;
  if (input.doors !== undefined) payload.doors = input.doors;
  if (input.year !== undefined) payload.year = input.year;
  if (input.fuelEconomy !== undefined) payload.fuelEconomy = input.fuelEconomy;
  if (input.estimatedValue !== undefined) payload.estimatedValue = input.estimatedValue;
  if (input.ownerAnnualKm !== undefined) payload.ownerAnnualKm = input.ownerAnnualKm;
  if (input.carInitialMileage !== undefined) payload.carInitialMileage = input.carInitialMileage;
  if (input.comments !== undefined) payload.comments = input.comments;

  if (input.location) {
    if (input.location.city !== undefined) payload.location.city = input.location.city;
    if (input.location.street !== undefined) payload.location.street = input.location.street;
    if (input.location.num !== undefined) payload.location.num = input.location.num;
    if (input.location.zip !== undefined) payload.location.zip = input.location.zip;
  }

  if (input.insurance) {
    if (input.insurance.name !== undefined) payload.insurance.name = input.insurance.name;
    if (input.insurance.expiration !== undefined) payload.insurance.expiration = input.insurance.expiration;
    if (input.insurance.bonusMalus !== undefined) payload.insurance.bonusMalus = input.insurance.bonusMalus;
    if (input.insurance.annualDueDate !== undefined) payload.insurance.annualDueDate = input.insurance.annualDueDate;
  }

  if (input.technicalCarDetails) {
    if (input.technicalCarDetails.licensePlate !== undefined) {
      payload.technicalCarDetails.licensePlate = input.technicalCarDetails.licensePlate;
    }
    if (input.technicalCarDetails.kiloWatt !== undefined) {
      payload.technicalCarDetails.kiloWatt = input.technicalCarDetails.kiloWatt;
    }
  }

  return payload;
};

export type PlayCarCreateResult = {
  id: number;
};

export const playConnectorCreateCar = async (userId: string, input: PlayCarCreateInput = {}): Promise<PlayCarCreateResult> => {
  const { cookieHeader } = await getPlaySessionCookie(userId);
  const payload = buildPlayCarCreatePayload(input);
  const { text } = await postPlayJson('/api/cars/new', cookieHeader, payload);

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new PlayConnectorError('fetch_failed', 'Play create car response is not valid JSON');
  }

  const id = typeof parsed === 'object' && parsed !== null && 'id' in parsed ? (parsed as { id: unknown }).id : undefined;
  if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    throw new PlayConnectorError('fetch_failed', 'Play create car response missing car id');
  }

  return { id };
};

const formatPlayFormNumber = (value: number): string => {
  if (!Number.isFinite(value)) return '';
  if (Number.isInteger(value)) return String(value);
  const [whole, fraction = ''] = (Math.round(value * 10000) / 10000).toFixed(4).split('.');
  const decimals = fraction.replace(/0+$/, '');
  return decimals ? `${whole}.${decimals}` : whole;
};

const setFormField = (fields: Record<string, string>, name: string, value: string | number | undefined): void => {
  if (value === undefined) return;
  const serialized = typeof value === 'number' ? formatPlayFormNumber(value) : value;
  if (serialized === '') return;
  fields[name] = serialized;
};

export const playCarUpdateInputToFormFields = (input: PlayCarUpdateInput): Record<string, string> => {
  const fields: Record<string, string> = {};

  setFormField(fields, 'name', input.name);
  setFormField(fields, 'brand', input.brand);
  setFormField(fields, 'type', input.type);
  setFormField(fields, 'fuel', input.fuel);
  setFormField(fields, 'PurchaseDate', input.purchaseDate);
  setFormField(fields, 'seats', input.seats);
  setFormField(fields, 'doors', input.doors);
  setFormField(fields, 'year', input.year);
  setFormField(fields, 'fuelEconomy', input.fuelEconomy);
  setFormField(fields, 'estimatedValue', input.estimatedValue);
  setFormField(fields, 'ownerAnnualKm', input.ownerAnnualKm);
  setFormField(fields, 'carInitialMileage', input.carInitialMileage);
  setFormField(fields, 'comments', input.comments);
  setFormField(fields, 'email', input.email);
  setFormField(fields, 'startSharing', input.startSharing);
  setFormField(fields, 'carAgreedValue', input.carAgreedValue);
  setFormField(fields, 'deprec', input.deprec);
  setFormField(fields, 'chassisNumber', input.chassisNumber);
  setFormField(fields, 'carType', input.carType);
  setFormField(fields, 'assistanceName', input.assistanceName);
  setFormField(fields, 'assistanceExpiration', input.assistanceExpiration);
  setFormField(fields, 'address.country', input.country);

  if (input.location) {
    setFormField(fields, 'address.city', input.location.city);
    setFormField(fields, 'address.street', input.location.street);
    setFormField(fields, 'address.num', input.location.num);
    setFormField(fields, 'address.zipCode', input.location.zip);
  }

  if (input.insurance) {
    setFormField(fields, 'insuranceName', input.insurance.name);
    setFormField(fields, 'expiration', input.insurance.expiration);
    setFormField(fields, 'bonusMalus', input.insurance.bonusMalus);
  }

  if (input.technicalCarDetails) {
    setFormField(fields, 'licensePlate', input.technicalCarDetails.licensePlate);
    setFormField(fields, 'kiloWatt', input.technicalCarDetails.kiloWatt);
  }

  return fields;
};

export const playConnectorUpdateCar = async (adminModeUserId: string, carId: number, input: PlayCarUpdateInput = {}): Promise<void> => {
  if (!Number.isInteger(carId) || carId <= 0) {
    throw new PlayConnectorError('fetch_failed', 'Play car id must be a positive integer');
  }

  const { cookieHeader } = await getPlayAdminModeSessionCookie(adminModeUserId);
  const path = `/cars/edit?id=${carId}`;
  const { html } = await fetchPlay(path, cookieHeader);
  const fields = {
    ...parsePlayCarEditFormFields(html),
    ...playCarUpdateInputToFormFields(input),
  };

  await postPlayForm(path, cookieHeader, fields);
};
