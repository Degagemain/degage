import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/car-onboarding/read', () => ({
  readCarOnboarding: vi.fn(),
}));

import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { readCarOnboardingForCaller } from '@/actions/car-onboarding/read-for-caller';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { carOnboarding } from '../../builders/car-onboarding.builder';

describe('readCarOnboardingForCaller', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const owner = { id: 'owner-1', role: 'user', banned: false };
  const admin = { id: 'admin-1', role: 'admin', banned: false };
  const other = { id: 'other-1', role: 'user', banned: false };
  const id = '550e8400-e29b-41d4-a716-446655440000';

  it('returns onboarding for owner', async () => {
    const row = carOnboarding({ id, owner: { id: owner.id } });
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(row);
    await expect(readCarOnboardingForCaller(id, owner)).resolves.toEqual(row);
  });

  it('returns onboarding for admin', async () => {
    const row = carOnboarding({ id, owner: { id: owner.id } });
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(row);
    await expect(readCarOnboardingForCaller(id, admin)).resolves.toEqual(row);
  });

  it('throws for non-owner non-admin', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id, owner: { id: owner.id } }));
    await expect(readCarOnboardingForCaller(id, other)).rejects.toThrow(CarOnboardingForbiddenError);
  });
});
