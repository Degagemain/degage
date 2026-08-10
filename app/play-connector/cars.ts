import { getPlayAdminModeSessionCookie } from '@/actions/play-connector/get-admin-mode-session-cookie';
import { getPlaySessionCookie } from '@/actions/play-connector/get-session-cookie';
import { fetchPlay, postPlayJson } from '@/play-connector/client';
import { PlayConnectorError } from '@/play-connector/errors';
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

const emptyPlayCarCreatePayload = () => ({
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

export type PlayCarCreateResult = {
  id: number;
};

export const playConnectorCreateCar = async (userId: string): Promise<PlayCarCreateResult> => {
  const { cookieHeader } = await getPlaySessionCookie(userId);
  const { text } = await postPlayJson('/api/cars/new', cookieHeader, emptyPlayCarCreatePayload());

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
