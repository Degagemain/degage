import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/car-onboarding/car-onboarding.read', () => ({
  dbCarOnboardingReadWithRelations: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/save-with-preparation', () => ({
  saveCarOnboardingWithPreparationCheck: vi.fn(),
}));

vi.mock('@/actions/play-connector/link', () => ({
  linkPlayConnector: vi.fn(),
}));

vi.mock('@/actions/play-connector/read-profile', () => ({
  readPlayProfile: vi.fn(),
}));

vi.mock('@/storage/town/town.read', () => ({
  dbTownFindByZipAndCity: vi.fn(),
}));

import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { connectCarOnboardingPlayConnector, mergeProfileIntoCarOnboardingUserInfo } from '@/actions/car-onboarding/connect-play-connector';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { linkPlayConnector } from '@/actions/play-connector/link';
import { readPlayProfile } from '@/actions/play-connector/read-profile';
import { dbTownFindByZipAndCity } from '@/storage/town/town.read';
import { dbCarOnboardingReadWithRelations } from '@/storage/car-onboarding/car-onboarding.read';
import { carOnboarding } from '../../builders/car-onboarding.builder';

const onboardingId = '550e8400-e29b-41d4-a716-446655440000';
const mockOwner = { id: 'owner-1', role: 'user', banned: false };
const mockStatus = {
  status: 'success' as const,
  email: 'user@example.com',
  loginBlockedUntil: null,
  sessionExpiresAt: null,
};
const mockProfile = {
  firstName: 'Jane',
  lastName: 'Doe',
  degageId: '123456',
  residenceAddress: 'Teststraat 1, 9000 Gent (België)',
  street: 'Teststraat 1',
  zip: '9000',
  city: 'Gent',
  mobilePhone: '0470000001',
};

describe('mergeProfileIntoCarOnboardingUserInfo', () => {
  it('fills only empty street, town, and phone fields', () => {
    const result = mergeProfileIntoCarOnboardingUserInfo({ street: null, town: null, phone: null }, mockProfile, { id: 'town-1' });

    expect(result).toEqual({
      street: 'Teststraat 1',
      town: { id: 'town-1' },
      phone: '0470000001',
    });
  });

  it('does not overwrite existing values', () => {
    const result = mergeProfileIntoCarOnboardingUserInfo(
      {
        street: 'Existing Street 5',
        town: { id: 'existing-town' },
        phone: '0471111111',
      },
      mockProfile,
      { id: 'town-1' },
    );

    expect(result).toEqual({});
  });
});

describe('connectCarOnboardingPlayConnector', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('links connector and saves merged user info when fields are empty', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: 'owner-1' },
        street: null,
        town: null,
        phone: null,
      }),
    );
    vi.mocked(linkPlayConnector).mockResolvedValueOnce(mockStatus);
    vi.mocked(readPlayProfile).mockResolvedValueOnce(mockProfile);
    vi.mocked(dbTownFindByZipAndCity).mockResolvedValueOnce({ id: 'town-1' });
    vi.mocked(saveCarOnboardingWithPreparationCheck).mockResolvedValueOnce(carOnboarding({ id: onboardingId }));

    const result = await connectCarOnboardingPlayConnector(onboardingId, { email: 'user@example.com', password: 'secret' }, mockOwner);

    expect(linkPlayConnector).toHaveBeenCalledWith('owner-1', { email: 'user@example.com', password: 'secret' });
    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        street: 'Teststraat 1',
        town: { id: 'town-1' },
        phone: '0470000001',
      }),
    );
    expect(result).toEqual(mockStatus);
  });

  it('does not look up town when onboarding already has one', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: 'owner-1' },
        street: null,
        town: { id: 'simulation-town' },
        phone: null,
      }),
    );
    vi.mocked(linkPlayConnector).mockResolvedValueOnce(mockStatus);
    vi.mocked(readPlayProfile).mockResolvedValueOnce(mockProfile);

    await connectCarOnboardingPlayConnector(onboardingId, { email: 'user@example.com', password: 'secret' }, mockOwner);

    expect(dbTownFindByZipAndCity).not.toHaveBeenCalled();
    expect(saveCarOnboardingWithPreparationCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        street: 'Teststraat 1',
        town: { id: 'simulation-town' },
        phone: '0470000001',
      }),
    );
  });

  it('returns connector status when profile enrichment fails', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: 'owner-1' },
      }),
    );
    vi.mocked(linkPlayConnector).mockResolvedValueOnce(mockStatus);
    vi.mocked(readPlayProfile).mockRejectedValueOnce(new Error('profile failed'));

    const result = await connectCarOnboardingPlayConnector(onboardingId, { email: 'user@example.com', password: 'secret' }, mockOwner);

    expect(result).toEqual(mockStatus);
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('returns connector status when profile cannot be parsed', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: 'owner-1' },
      }),
    );
    vi.mocked(linkPlayConnector).mockResolvedValueOnce(mockStatus);
    vi.mocked(readPlayProfile).mockResolvedValueOnce(null);

    const result = await connectCarOnboardingPlayConnector(onboardingId, { email: 'user@example.com', password: 'secret' }, mockOwner);

    expect(result).toEqual(mockStatus);
    expect(saveCarOnboardingWithPreparationCheck).not.toHaveBeenCalled();
  });

  it('throws when onboarding is locked', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: 'owner-1' },
        statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
      }),
    );

    await expect(
      connectCarOnboardingPlayConnector(onboardingId, { email: 'user@example.com', password: 'secret' }, mockOwner),
    ).rejects.toBeInstanceOf(CarOnboardingLockedError);

    expect(linkPlayConnector).not.toHaveBeenCalled();
  });

  it('throws when user is not allowed to update onboarding', async () => {
    vi.mocked(dbCarOnboardingReadWithRelations).mockResolvedValueOnce(
      carOnboarding({
        id: onboardingId,
        owner: { id: 'other-owner' },
      }),
    );

    await expect(
      connectCarOnboardingPlayConnector(onboardingId, { email: 'user@example.com', password: 'secret' }, mockOwner),
    ).rejects.toBeInstanceOf(CarOnboardingForbiddenError);

    expect(linkPlayConnector).not.toHaveBeenCalled();
  });
});
