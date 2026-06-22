import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

vi.mock('@/play-connector/infosession', () => ({
  playConnectorUnenrollInfosession: vi.fn(),
}));

import { CarOnboardingInPreparationStatus, CarOnboardingInfoSessionStatus } from '@/domain/car-onboarding.model';
import { CarOnboardingInvalidInfoSessionStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-info-session-status.error';
import { unenrollCarOnboardingInfoSession } from '@/actions/car-onboarding/unenroll-info-session';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { playConnectorUnenrollInfosession } from '@/play-connector/infosession';
import { carOnboarding } from '../../builders/car-onboarding.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const mockOwner = { id: 'owner-1', role: 'user', banned: false };

describe('unenrollCarOnboardingInfoSession', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls play stub before clearing enrolled state', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: 'owner-1' },
        infoSessionDate: new Date('2026-06-20T09:25:00'),
        infoSessionPcId: '1359',
        infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
      }),
    );
    vi.mocked(playConnectorUnenrollInfosession).mockResolvedValueOnce(undefined);
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(carOnboarding({ id: onboardingId }));

    await unenrollCarOnboardingInfoSession(onboardingId, mockOwner);

    expect(playConnectorUnenrollInfosession).toHaveBeenCalledWith('owner-1', '1359');
    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        infoSessionDate: null,
        infoSessionPcId: null,
        infoSessionStatus: CarOnboardingInfoSessionStatus.TODO,
      }),
    );
  });

  it('does not save when play stub throws', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: 'owner-1' },
        infoSessionPcId: '1359',
        infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
      }),
    );
    vi.mocked(playConnectorUnenrollInfosession).mockRejectedValueOnce(new Error('play failed'));

    await expect(unenrollCarOnboardingInfoSession(onboardingId, mockOwner)).rejects.toThrow('play failed');

    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('throws when status is not enrolled', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: 'owner-1' },
        infoSessionStatus: CarOnboardingInfoSessionStatus.TODO,
      }),
    );

    await expect(unenrollCarOnboardingInfoSession(onboardingId, mockOwner)).rejects.toThrow(CarOnboardingInvalidInfoSessionStatusError);

    expect(playConnectorUnenrollInfosession).not.toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('throws when onboarding is locked', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
        owner: { id: 'owner-1' },
        infoSessionPcId: '1359',
        infoSessionStatus: CarOnboardingInfoSessionStatus.ENROLLED,
      }),
    );

    await expect(unenrollCarOnboardingInfoSession(onboardingId, mockOwner)).rejects.toThrow();

    expect(playConnectorUnenrollInfosession).not.toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });
});
