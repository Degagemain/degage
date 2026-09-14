import type { PlayInfosession } from '@/domain/play-infosession.model';

export const formatInfosessionScheduledAt = (value: Date | string, locale: string): string =>
  new Date(value).toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });

export const formatInfosessionRegistrations = (
  row: Pick<PlayInfosession, 'enrolled' | 'maxRegistrations' | 'isFull'>,
  fullLabel: string,
): string => {
  if (row.isFull) return fullLabel;
  return row.maxRegistrations != null ? `${row.enrolled} / ${row.maxRegistrations}` : String(row.enrolled);
};
