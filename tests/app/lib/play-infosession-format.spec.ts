import { describe, expect, it } from 'vitest';

import { formatInfosessionScheduledAt } from '@/app/lib/play-infosession-format';

describe('formatInfosessionScheduledAt', () => {
  const date = new Date('2026-10-15T12:00:00.000Z');

  it('uses the Dutch month name for nl', () => {
    expect(formatInfosessionScheduledAt(date, 'nl').toLowerCase()).toContain('okt');
  });

  it('uses the English month name for en', () => {
    expect(formatInfosessionScheduledAt(date, 'en').toLowerCase()).toContain('oct');
  });
});
