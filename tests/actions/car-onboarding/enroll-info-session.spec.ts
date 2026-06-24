import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

vi.mock('@/play-connector/infosession', () => ({
  playConnectorEnrollInfosession: vi.fn(),
}));

import { CarOnboardingInPreparationStatus, CarOnboardingInfoSessionStatus } from '@/domain/car-onboarding.model';
import { CarOnboardingInvalidInfoSessionStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-info-session-status.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { enrollCarOnboardingInfoSession } from '@/actions/car-onboarding/enroll-info-session';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { playConnectorEnrollInfosession } from '@/play-connector/infosession';
import { carOnboarding } from '../../builders/car-onboarding.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const mockOwner = { id: 'owner-1', role: 'user', banned: false };

describe('enrollCarOnboardingInfoSession', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls play stub before saving enrolled state', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: 'owner-1', hasPlayConnector: true },
      }),
    );
    vi.mocked(playConnectorEnrollInfosession).mockResolvedValueOnce(undefined);
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(carOnboarding({ id: onboardingId }));

    await enrollCarOnboardingInfoSession(onboardingId, { infoSessionDate: '2026-06-20T09:25:00.000Z', infoSessionPcId: '1359' }, mockOwner);

    expect(playConnectorEnrollInfosession).toHaveBeenCalledWith('owner-1', '1359');
    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        infoSessionDate: expect.any(Date),
        infoSessionPcId: '1359',
        infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
      }),
    );
  });

  it('does not save when play stub throws', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: 'owner-1', hasPlayConnector: true },
      }),
    );
    vi.mocked(playConnectorEnrollInfosession).mockRejectedValueOnce(new Error('play failed'));

    await expect(
      enrollCarOnboardingInfoSession(onboardingId, { infoSessionDate: '2026-06-20T09:25:00.000Z', infoSessionPcId: '1359' }, mockOwner),
    ).rejects.toThrow('play failed');

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('throws when already enrolled', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: 'owner-1', hasPlayConnector: true },
        infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
      }),
    );

    await expect(
      enrollCarOnboardingInfoSession(onboardingId, { infoSessionDate: '2026-06-20T09:25:00.000Z', infoSessionPcId: '1359' }, mockOwner),
    ).rejects.toThrow(CarOnboardingInvalidInfoSessionStatusError);

    expect(playConnectorEnrollInfosession).not.toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('throws when onboarding is locked', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
        owner: { id: 'owner-1', hasPlayConnector: true },
      }),
    );

    await expect(
      enrollCarOnboardingInfoSession(onboardingId, { infoSessionDate: '2026-06-20T09:25:00.000Z', infoSessionPcId: '1359' }, mockOwner),
    ).rejects.toThrow(CarOnboardingLockedError);

    expect(playConnectorEnrollInfosession).not.toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });
});
