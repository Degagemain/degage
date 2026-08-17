import type { PlayInfosession } from '@/domain/play-infosession.model';
import { PLAY_INFOSESSION_TIME_ZONE } from '@/domain/play-infosession.parse';

export const formatInfosessionScheduledAt = (value: Date | string): string =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: PLAY_INFOSESSION_TIME_ZONE,
  });

export const formatInfosessionRegistrations = (
  row: Pick<PlayInfosession, 'enrolled' | 'maxRegistrations' | 'isFull'>,
  fullLabel: string,
): string => {
  if (row.isFull) return fullLabel;
  return row.maxRegistrations != null ? `${row.enrolled} / ${row.maxRegistrations}` : String(row.enrolled);
};
