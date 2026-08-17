import { describe, expect, it } from 'vitest';

import { parsePlayInfosessionRegistrations, parsePlayInfosessionScheduledAt } from '@/domain/play-infosession.parse';
import { playInfosessionSchema } from '@/domain/play-infosession.model';

describe('parsePlayInfosessionScheduledAt', () => {
  it('parses Dutch Play backend datetime strings as Europe/Brussels in summer (CEST)', () => {
    const parsed = parsePlayInfosessionScheduledAt('za 20 jun 2026 09:25');
    expect(parsed.toISOString()).toBe('2026-06-20T07:25:00.000Z');
  });

  it('parses Play backend datetime strings as Europe/Brussels in winter (CET)', () => {
    const parsed = parsePlayInfosessionScheduledAt('do 15 jan 2026 19:30');
    expect(parsed.toISOString()).toBe('2026-01-15T18:30:00.000Z');
  });

  it('parses July dates as Europe/Brussels', () => {
    const parsed = parsePlayInfosessionScheduledAt('wo 01 jul 2026 19:30');
    expect(parsed.toISOString()).toBe('2026-07-01T17:30:00.000Z');
  });
});

describe('parsePlayInfosessionRegistrations', () => {
  it('parses enrolled and max registrations', () => {
    expect(parsePlayInfosessionRegistrations('14 / 20')).toEqual({
      enrolled: 14,
      maxRegistrations: 20,
      isFull: false,
    });
  });

  it('parses enrolled only when max is absent', () => {
    expect(parsePlayInfosessionRegistrations('6')).toEqual({
      enrolled: 6,
      maxRegistrations: null,
      isFull: false,
    });
  });

  it('parses full-session labels from the Play backend', () => {
    expect(parsePlayInfosessionRegistrations('Volzet')).toEqual({
      enrolled: 0,
      maxRegistrations: null,
      isFull: true,
    });
    expect(parsePlayInfosessionRegistrations('complet')).toEqual({
      enrolled: 0,
      maxRegistrations: null,
      isFull: true,
    });
  });
});

describe('playInfosessionSchema', () => {
  it('maps raw parser rows to typed infosessions', () => {
    const result = playInfosessionSchema.parse({
      scheduledAt: 'za 20 jun 2026 09:25',
      district: 'Gent - Wondelgem',
      type: 'Voor Leners van auto of fiets',
      registrations: '14 / 20',
      host: 'Host Alpha',
      enrollId: '1359',
      enrollUrl: 'https://degapp.be/infosession/enroll?id=1359',
    });

    expect(result.enrolled).toBe(14);
    expect(result.maxRegistrations).toBe(20);
    expect(result.isFull).toBe(false);
    expect(result.scheduledAt).toBeInstanceOf(Date);
    expect(result.scheduledAt.toISOString()).toBe('2026-06-20T07:25:00.000Z');
  });
});
