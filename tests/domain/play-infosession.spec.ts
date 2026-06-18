import { describe, expect, it } from 'vitest';

import { parsePlayInfosessionRegistrations, parsePlayInfosessionScheduledAt } from '@/domain/play-infosession.parse';
import { playInfosessionSchema } from '@/domain/play-infosession.model';

describe('parsePlayInfosessionScheduledAt', () => {
  it('parses Dutch Play backend datetime strings', () => {
    const parsed = parsePlayInfosessionScheduledAt('za 20 jun 2026 09:25');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(5);
    expect(parsed.getDate()).toBe(20);
    expect(parsed.getHours()).toBe(9);
    expect(parsed.getMinutes()).toBe(25);
  });

  it('parses July dates', () => {
    const parsed = parsePlayInfosessionScheduledAt('wo 01 jul 2026 19:30');
    expect(parsed.getMonth()).toBe(6);
    expect(parsed.getDate()).toBe(1);
    expect(parsed.getHours()).toBe(19);
    expect(parsed.getMinutes()).toBe(30);
  });
});

describe('parsePlayInfosessionRegistrations', () => {
  it('parses enrolled and max registrations', () => {
    expect(parsePlayInfosessionRegistrations('14 / 20')).toEqual({
      enrolled: 14,
      maxRegistrations: 20,
    });
  });

  it('parses enrolled only when max is absent', () => {
    expect(parsePlayInfosessionRegistrations('6')).toEqual({
      enrolled: 6,
      maxRegistrations: null,
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
    expect(result.scheduledAt).toBeInstanceOf(Date);
    expect(result.scheduledAt.getFullYear()).toBe(2026);
  });
});
