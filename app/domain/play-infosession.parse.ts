import { parse } from 'date-fns';
import { enGB } from 'date-fns/locale';

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

const SCHEDULED_AT_PATTERN = /^[a-z]{2}\s+(\d{1,2})\s+([a-z]{3})\s+(\d{4})\s+(\d{1,2}):(\d{2})$/i;
const REGISTRATIONS_PATTERN = /^(\d+)(?:\s*\/\s*(\d+))?$/;
const FULL_REGISTRATIONS_LABELS = new Set(['volzet', 'complet']);

export type PlayInfosessionRegistrations = {
  enrolled: number;
  maxRegistrations: number | null;
  isFull: boolean;
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

  return parsed;
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
