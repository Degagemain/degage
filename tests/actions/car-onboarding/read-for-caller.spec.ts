import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/car-onboarding/read', () => ({
  readCarOnboarding: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/claim-from-simulation', () => ({
  claimCarOnboardingFromSimulation: vi.fn(),
}));

import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { readCarOnboardingForCaller } from '@/actions/car-onboarding/read-for-caller';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { claimCarOnboardingFromSimulation } from '@/actions/car-onboarding/claim-from-simulation';
import { carOnboarding } from '../../builders/car-onboarding.builder';

describe('readCarOnboardingForCaller', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const owner = { id: 'owner-1', role: 'user', banned: false, email: 'owner@example.com', emailVerified: true };
  const admin = { id: 'admin-1', role: 'admin', banned: false, email: 'admin@example.com', emailVerified: true };
  const other = { id: 'other-1', role: 'user', banned: false, email: 'other@example.com', emailVerified: true };
  const id = '550e8400-e29b-41d4-a716-446655440000';

  it('returns onboarding for owner', async () => {
    const row = carOnboarding({ id, owner: { id: owner.id } });
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(row);
    vi.mocked(claimCarOnboardingFromSimulation).mockResolvedValueOnce(false);
    await expect(readCarOnboardingForCaller(id, owner)).resolves.toEqual(row);
  });

  it('returns onboarding for admin', async () => {
    const row = carOnboarding({ id, owner: { id: owner.id } });
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(row);
    vi.mocked(claimCarOnboardingFromSimulation).mockResolvedValueOnce(false);
    await expect(readCarOnboardingForCaller(id, admin)).resolves.toEqual(row);
  });

  it('throws for non-owner non-admin', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id, owner: { id: owner.id } }));
    vi.mocked(claimCarOnboardingFromSimulation).mockResolvedValueOnce(false);
    await expect(readCarOnboardingForCaller(id, other)).rejects.toThrow(CarOnboardingForbiddenError);
  });

  it('returns the reloaded onboarding after the caller claims it', async () => {
    const claimed = carOnboarding({ id, owner: { id: other.id } });
    vi.mocked(readCarOnboarding)
      .mockResolvedValueOnce(carOnboarding({ id, owner: null }))
      .mockResolvedValueOnce(claimed);
    vi.mocked(claimCarOnboardingFromSimulation).mockResolvedValueOnce(true);

    await expect(readCarOnboardingForCaller(id, other)).resolves.toEqual(claimed);
    expect(readCarOnboarding).toHaveBeenCalledTimes(2);
  });
});
