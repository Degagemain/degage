import { parse } from 'date-fns';
import { enGB } from 'date-fns/locale';

import { PLAY_TIME_ZONE } from '@/domain/play-connector.model';

const DUTCH_MONTH_TO_ENGLISH: Record<string, string> = {
  jan: 'Jan',
  feb: 'Feb',
  mrt: 'Mar',
  mar: 'Mar',
  apr: 'Apr',
  mei: 'May',
  jun: 'Jun',
  jul: 'Jul',
  aug: 'Aug',
  sep: 'Sep',
  okt: 'Oct',
  nov: 'Nov',
  dec: 'Dec',
};

const ENGLISH_MONTH_INDEX: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

const SCHEDULED_AT_PATTERN = /^[a-z]{2}\s+(\d{1,2})\s+([a-z]{3})\s+(\d{4})\s+(\d{1,2}):(\d{2})$/i;
const REGISTRATIONS_PATTERN = /^(\d+)(?:\s*\/\s*(\d+))?$/;
const FULL_REGISTRATIONS_LABELS = new Set(['volzet', 'complet']);

export type PlayInfosessionRegistrations = {
  enrolled: number;
  maxRegistrations: number | null;
  isFull: boolean;
};

const pad2 = (value: number): string => String(value).padStart(2, '0');

const playTimeZoneOffset = (date: Date): string => {
  const timeZoneName = new Intl.DateTimeFormat('en-US', {
    timeZone: PLAY_TIME_ZONE,
    timeZoneName: 'longOffset',
  })
    .formatToParts(date)
    .find((part) => part.type === 'timeZoneName')?.value;
  const offset = timeZoneName?.replace(/^GMT/i, '') ?? '+00:00';
  return offset === '' ? '+00:00' : offset;
};

const fromPlayTimeZone = (year: number, monthIndex: number, day: number, hour: number, minute: number): Date => {
  const civil = `${year}-${pad2(monthIndex + 1)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:00`;
  const utcGuess = new Date(`${civil}Z`);
  const zoned = new Date(`${civil}${playTimeZoneOffset(utcGuess)}`);
  return new Date(`${civil}${playTimeZoneOffset(zoned)}`);
};

export const parsePlayInfosessionScheduledAt = (value: string): Date => {
  const normalized = value.replace(/\s+/g, ' ').trim();
  const match = normalized.match(SCHEDULED_AT_PATTERN);
  if (!match) {
    throw new Error(`Invalid infosession scheduledAt: ${value}`);
  }

  const [, day, monthToken, year, hour, minute] = match;
  const monthEnglish = DUTCH_MONTH_TO_ENGLISH[monthToken.toLowerCase()];
  if (!monthEnglish) {
    throw new Error(`Invalid infosession month: ${monthToken}`);
  }

  const parseInput = `${day} ${monthEnglish} ${year} ${hour}:${minute}`;
  const parsed = parse(parseInput, 'd MMM yyyy HH:mm', new Date(), { locale: enGB });
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid infosession scheduledAt: ${value}`);
  }

  return fromPlayTimeZone(Number(year), ENGLISH_MONTH_INDEX[monthEnglish], Number(day), Number(hour), Number(minute));
};

export const parsePlayInfosessionRegistrations = (value: string): PlayInfosessionRegistrations => {
  const normalized = value.trim();
  if (FULL_REGISTRATIONS_LABELS.has(normalized.toLowerCase())) {
    return { enrolled: 0, maxRegistrations: null, isFull: true };
  }

  const match = normalized.match(REGISTRATIONS_PATTERN);
  if (!match) {
    throw new Error(`Invalid infosession registrations: ${value}`);
  }

  return {
    enrolled: Number(match[1]),
    maxRegistrations: match[2] !== undefined ? Number(match[2]) : null,
    isFull: false,
  };
};
