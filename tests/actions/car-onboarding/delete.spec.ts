import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingRead: vi.fn(),
}));

vi.mock('@/storage/car-onboarding/car-onboarding.delete', () => ({
  dbCarOnboardingDelete: vi.fn(),
}));

vi.mock('@/storage/document/document.delete', () => ({
  dbDocumentDelete: vi.fn(),
}));

import { deleteCarOnboarding } from '@/actions/car-onboarding/delete';
import { dbCarOnboardingDelete } from '@/storage/car-onboarding/car-onboarding.delete';
import { dbCarOnboardingRead } from '@/storage/car-onboarding/car-onboarding.read';
import { dbDocumentDelete } from '@/storage/document/document.delete';
import { carOnboarding } from '../../builders/car-onboarding.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';

describe('deleteCarOnboarding', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deletes linked documents before deleting onboarding', async () => {
    const existing = carOnboarding({
      id: onboardingId,
      registrationCertificateFront: { id: 'front-doc' },
      registrationCertificateBack: { id: 'back-doc' },
    });
    vi.mocked(dbCarOnboardingRead).mockResolvedValueOnce(existing);

    await deleteCarOnboarding(onboardingId);

    expect(dbDocumentDelete).toHaveBeenCalledWith('front-doc');
    expect(dbDocumentDelete).toHaveBeenCalledWith('back-doc');
    expect(dbCarOnboardingDelete).toHaveBeenCalledWith(onboardingId);
    expect(dbDocumentDelete.mock.invocationCallOrder[0]).toBeLessThan(dbCarOnboardingDelete.mock.invocationCallOrder[0]);
  });

  it('does not delete onboarding when document delete fails', async () => {
    vi.mocked(dbCarOnboardingRead).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        registrationCertificateFront: { id: 'front-doc' },
      }),
    );
    vi.mocked(dbDocumentDelete).mockRejectedValueOnce(new Error('gcs failed'));

    await expect(deleteCarOnboarding(onboardingId)).rejects.toThrow('gcs failed');
    expect(dbCarOnboardingDelete).not.toHaveBeenCalled();
  });

  it('deletes onboarding directly when no documents are linked', async () => {
    vi.mocked(dbCarOnboardingRead).mockResolvedValueOnce(carOnboarding({ id: onboardingId }));

    await deleteCarOnboarding(onboardingId);

    expect(dbDocumentDelete).not.toHaveBeenCalled();
    expect(dbCarOnboardingDelete).toHaveBeenCalledWith(onboardingId);
  });
});
