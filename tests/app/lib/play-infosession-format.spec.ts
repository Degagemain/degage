import { describe, expect, it } from 'vitest';

import { formatInfosessionRegistrations, formatInfosessionScheduledAt } from '@/app/lib/play-infosession-format';
import { PLAY_INFOSESSION_TIME_ZONE } from '@/domain/play-infosession.parse';

describe('formatInfosessionScheduledAt', () => {
  it('formats the instant in Europe/Brussels rather than UTC', () => {
    const instant = new Date('2026-06-20T07:25:00.000Z');
    const formatted = formatInfosessionScheduledAt(instant);
    const utcFormatted = instant.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });
    const brusselsFormatted = instant.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: PLAY_INFOSESSION_TIME_ZONE,
    });

    expect(formatted).toBe(brusselsFormatted);
    expect(formatted).not.toBe(utcFormatted);
  });

  it('accepts ISO strings from the API', () => {
    const formatted = formatInfosessionScheduledAt('2026-01-15T18:30:00.000Z');
    const brusselsFormatted = new Date('2026-01-15T18:30:00.000Z').toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: PLAY_INFOSESSION_TIME_ZONE,
    });

    expect(formatted).toBe(brusselsFormatted);
  });
});

describe('formatInfosessionRegistrations', () => {
  it('returns the full label when the session is full', () => {
    expect(formatInfosessionRegistrations({ enrolled: 0, maxRegistrations: null, isFull: true }, 'Full')).toBe('Full');
  });

  it('formats enrolled and max registrations', () => {
    expect(formatInfosessionRegistrations({ enrolled: 14, maxRegistrations: 20, isFull: false }, 'Full')).toBe('14 / 20');
  });
});
