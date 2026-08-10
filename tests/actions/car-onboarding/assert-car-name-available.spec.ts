import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/car-onboarding/search', () => ({
  searchCarOnboardings: vi.fn(),
}));

vi.mock('@/storage/user/user.read-oldest-admin', () => ({
  dbUserReadOldestAdmin: vi.fn(),
}));

vi.mock('@/play-connector/cars', () => ({
  playConnectorIsCarNameAvailable: vi.fn(),
}));

import { assertCarOnboardingCarNameAvailable } from '@/actions/car-onboarding/assert-car-name-available';
import { CarOnboardingAdminModeUnavailableError } from '@/actions/car-onboarding/car-onboarding-admin-mode-unavailable.error';
import { CarOnboardingCarNameTakenError } from '@/actions/car-onboarding/car-onboarding-car-name-taken.error';
import { searchCarOnboardings } from '@/actions/car-onboarding/search';
import { PlayConnectorActionError } from '@/domain/play-connector.errors';
import { playConnectorIsCarNameAvailable } from '@/play-connector/cars';
import { dbUserReadOldestAdmin } from '@/storage/user/user.read-oldest-admin';

const excludeOnboardingId = '550e8400-e29b-41d4-a716-446655440000';

describe('assertCarOnboardingCarNameAvailable', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('passes when onboarding and play both free', async () => {
    vi.mocked(searchCarOnboardings).mockResolvedValueOnce({ records: [], total: 0 });
    vi.mocked(dbUserReadOldestAdmin).mockResolvedValueOnce({ id: 'admin-1' });
    vi.mocked(playConnectorIsCarNameAvailable).mockResolvedValueOnce(true);

    await expect(assertCarOnboardingCarNameAvailable('FreeCar', { excludeOnboardingId })).resolves.toBeUndefined();
    expect(searchCarOnboardings).toHaveBeenCalledWith(
      expect.objectContaining({
        carName: 'FreeCar',
        excludeId: excludeOnboardingId,
        take: 1,
      }),
    );
    expect(playConnectorIsCarNameAvailable).toHaveBeenCalledWith('admin-1', 'FreeCar');
  });

  it('throws when another onboarding reserved the name', async () => {
    vi.mocked(searchCarOnboardings).mockResolvedValueOnce({
      records: [{ id: 'other' } as never],
      total: 1,
    });

    await expect(assertCarOnboardingCarNameAvailable('Taken', { excludeOnboardingId })).rejects.toThrow(CarOnboardingCarNameTakenError);
    expect(playConnectorIsCarNameAvailable).not.toHaveBeenCalled();
  });

  it('throws when play reports the name as taken', async () => {
    vi.mocked(searchCarOnboardings).mockResolvedValueOnce({ records: [], total: 0 });
    vi.mocked(dbUserReadOldestAdmin).mockResolvedValueOnce({ id: 'admin-1' });
    vi.mocked(playConnectorIsCarNameAvailable).mockResolvedValueOnce(false);

    await expect(assertCarOnboardingCarNameAvailable('Taken', { excludeOnboardingId })).rejects.toThrow(CarOnboardingCarNameTakenError);
  });

  it('throws when no admin user exists', async () => {
    vi.mocked(searchCarOnboardings).mockResolvedValueOnce({ records: [], total: 0 });
    vi.mocked(dbUserReadOldestAdmin).mockResolvedValueOnce(null);

    await expect(assertCarOnboardingCarNameAvailable('FreeCar', { excludeOnboardingId })).rejects.toThrow(
      CarOnboardingAdminModeUnavailableError,
    );
  });

  it('maps play connector failures to admin mode unavailable', async () => {
    vi.mocked(searchCarOnboardings).mockResolvedValueOnce({ records: [], total: 0 });
    vi.mocked(dbUserReadOldestAdmin).mockResolvedValueOnce({ id: 'admin-1' });
    vi.mocked(playConnectorIsCarNameAvailable).mockRejectedValueOnce(new PlayConnectorActionError('unauthorized', 'cannot enter admin mode'));

    await expect(assertCarOnboardingCarNameAvailable('FreeCar', { excludeOnboardingId })).rejects.toThrow(
      CarOnboardingAdminModeUnavailableError,
    );
  });
});
