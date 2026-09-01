import { describe, expect, it } from 'vitest';

import { CarOnboardingInPreparationStatus, PREPARATION_NUDGE_COOLDOWN_MS } from '@/domain/car-onboarding.model';
import { dueForPreparationNudgeWhere } from '@/storage/car-onboarding/car-onboarding.search';

describe('dueForPreparationNudgeWhere', () => {
  it('selects open unconfirmed onboardings whose last nudge is empty or older than 72 hours', () => {
    const now = new Date('2026-08-19T12:00:00Z');
    const cutoff = new Date(now.getTime() - PREPARATION_NUDGE_COOLDOWN_MS);

    expect(dueForPreparationNudgeWhere(now)).toEqual({
      preparationConfirmedAt: null,
      statusInPreparation: CarOnboardingInPreparationStatus.OPEN,
      ownerId: { not: null },
      owner: {
        email: { not: '' },
      },
      OR: [{ lastPreparationNudgeEmail: null }, { lastPreparationNudgeEmail: { lt: cutoff } }],
    });
  });
});
