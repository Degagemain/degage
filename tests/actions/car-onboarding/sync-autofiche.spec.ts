import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/storage/car-onboarding/car-onboarding.update', () => ({
  dbCarOnboardingUpdate: vi.fn(),
}));

vi.mock('@/storage/user/user.read-oldest-admin', () => ({
  dbUserReadOldestAdmin: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/map-to-play-car', () => ({
  mapCarOnboardingToPlayCar: vi.fn(),
}));

vi.mock('@/actions/play-connector/create-car', () => ({
  createPlayCar: vi.fn(),
}));

vi.mock('@/actions/play-connector/update-car', () => ({
  updatePlayCar: vi.fn(),
}));

import { CarOnboardingAdminModeUnavailableError } from '@/actions/car-onboarding/car-onboarding-admin-mode-unavailable.error';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingPlayConnectorMissingError } from '@/actions/car-onboarding/car-onboarding-play-connector-missing.error';
import { mapCarOnboardingToPlayCar } from '@/actions/car-onboarding/map-to-play-car';
import { syncCarOnboardingAutofiche } from '@/actions/car-onboarding/sync-autofiche';
import { createPlayCar } from '@/actions/play-connector/create-car';
import { updatePlayCar } from '@/actions/play-connector/update-car';
import { PlayConnectorError } from '@/play-connector/errors';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { dbCarOnboardingUpdate } from '@/storage/car-onboarding/car-onboarding.update';
import { dbUserReadOldestAdmin } from '@/storage/user/user.read-oldest-admin';
import { completeCarOnboarding } from '../../builders/car-onboarding.builder';

const id = '550e8400-e29b-41d4-a716-446655440000';
const ownerId = '550e8400-e29b-41d4-a716-446655440098';
const admin = { id: 'admin-1', role: 'admin', banned: false };
const user = { id: 'user-1', role: 'user', banned: false };
const mapped = { brand: 'Opel', fuel: 'PETROL' as const, email: 'owner@example.com' };

describe('syncCarOnboardingAutofiche', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('throws when caller is not admin', async () => {
    await expect(syncCarOnboardingAutofiche(id, user)).rejects.toThrow(CarOnboardingForbiddenError);
    expect(dbCarOnboardingReadWithRelations).not.toHaveBeenCalled();
  });

  it('throws when the owner has no play connector', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      completeCarOnboarding({
        id,
        owner: { id: ownerId, hasPlayConnector: false },
      }),
    );

    await expect(syncCarOnboardingAutofiche(id, admin)).rejects.toThrow(CarOnboardingPlayConnectorMissingError);
    expect(createPlayCar).not.toHaveBeenCalled();
    expect(updatePlayCar).not.toHaveBeenCalled();
  });

  it('creates as the owner then updates as admin when carPcId is missing', async () => {
    const existing = completeCarOnboarding({ id, carPcId: null });
    const withId = { ...existing, carPcId: 3961 };
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(existing).mockResolvedValueOnce(withId);
    vi.mocked(mapCarOnboardingToPlayCar).mockResolvedValueOnce(mapped);
    vi.mocked(createPlayCar).mockResolvedValueOnce({ id: 3961 });
    vi.mocked(dbCarOnboardingUpdate).mockResolvedValueOnce(withId);
    vi.mocked(dbUserReadOldestAdmin).mockResolvedValueOnce({ id: 'admin-play' });
    vi.mocked(updatePlayCar).mockResolvedValueOnce(undefined);

    await expect(syncCarOnboardingAutofiche(id, admin)).resolves.toEqual(withId);

    expect(createPlayCar).toHaveBeenCalledWith(ownerId, { brand: 'Opel', fuel: 'PETROL' });
    expect(dbCarOnboardingUpdate).toHaveBeenCalledWith({ ...existing, carPcId: 3961 });
    expect(updatePlayCar).toHaveBeenCalledWith('admin-play', 3961, mapped);
  });

  it('skips create and only updates when carPcId already exists', async () => {
    const existing = completeCarOnboarding({ id, carPcId: 3961 });
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(existing).mockResolvedValueOnce(existing);
    vi.mocked(mapCarOnboardingToPlayCar).mockResolvedValueOnce(mapped);
    vi.mocked(dbUserReadOldestAdmin).mockResolvedValueOnce({ id: 'admin-play' });
    vi.mocked(updatePlayCar).mockResolvedValueOnce(undefined);

    await expect(syncCarOnboardingAutofiche(id, admin)).resolves.toEqual(existing);

    expect(createPlayCar).not.toHaveBeenCalled();
    expect(dbCarOnboardingUpdate).not.toHaveBeenCalled();
    expect(updatePlayCar).toHaveBeenCalledWith('admin-play', 3961, mapped);
  });

  it('throws when no admin user exists for the play update', async () => {
    const existing = completeCarOnboarding({ id, carPcId: 3961 });
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(existing);
    vi.mocked(mapCarOnboardingToPlayCar).mockResolvedValueOnce(mapped);
    vi.mocked(dbUserReadOldestAdmin).mockResolvedValueOnce(null);

    await expect(syncCarOnboardingAutofiche(id, admin)).rejects.toThrow(CarOnboardingAdminModeUnavailableError);
    expect(updatePlayCar).not.toHaveBeenCalled();
  });

  it('maps play update failures to admin mode unavailable', async () => {
    const existing = completeCarOnboarding({ id, carPcId: 3961 });
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(existing);
    vi.mocked(mapCarOnboardingToPlayCar).mockResolvedValueOnce(mapped);
    vi.mocked(dbUserReadOldestAdmin).mockResolvedValueOnce({ id: 'admin-play' });
    vi.mocked(updatePlayCar).mockRejectedValueOnce(new PlayConnectorError('fetch_failed', 'Play post failed with status 400'));

    await expect(syncCarOnboardingAutofiche(id, admin)).rejects.toThrow(CarOnboardingAdminModeUnavailableError);
  });
});
