import { logger } from '@/lib/logger';
import type { CarOnboarding } from '@/domain/car-onboarding.model';
import type { PlayConnectorStatus } from '@/domain/play-connector.model';
import { playConnectorLinkInputSchema } from '@/domain/play-connector.model';
import type { UserWithRole } from '@/domain/role.model';
import {
  assertCarOnboardingNotConfirmedForOwner,
  assertCarOnboardingNotLocked,
  assertCarOnboardingPartialUpdateAllowed,
} from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';
import { linkPlayConnector } from '@/actions/play-connector/link';
import { readPlayProfile } from '@/actions/play-connector/read-profile';
import type { PlayProfileBasicInfo } from '@/play-connector/parsers/profile-page.parser';
import { dbTownFindByZipAndCity } from '@/storage/town/town.read';

const isNonEmptyString = (value: string | null | undefined): boolean => value != null && value.trim().length > 0;

export const mergeProfileIntoCarOnboardingUserInfo = (
  existing: Pick<CarOnboarding, 'street' | 'town' | 'phone'>,
  profile: PlayProfileBasicInfo,
  town: { id: string } | null,
): Partial<Pick<CarOnboarding, 'street' | 'town' | 'phone'>> => {
  const updates: Partial<Pick<CarOnboarding, 'street' | 'town' | 'phone'>> = {};

  if (!isNonEmptyString(existing.street) && isNonEmptyString(profile.street)) {
    updates.street = profile.street;
  }
  if (!isNonEmptyString(existing.phone) && isNonEmptyString(profile.mobilePhone)) {
    updates.phone = profile.mobilePhone;
  }
  if (existing.town == null && town != null) {
    updates.town = { id: town.id };
  }

  return updates;
};

export const connectCarOnboardingPlayConnector = async (id: string, body: unknown, user: UserWithRole): Promise<PlayConnectorStatus> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, user);
  assertCarOnboardingNotLocked(existing);
  assertCarOnboardingNotConfirmedForOwner(existing, user);

  const parsed = playConnectorLinkInputSchema.parse(body);
  const status = await linkPlayConnector(user.id, parsed);

  try {
    const profile = await readPlayProfile(user.id);
    if (profile) {
      const town = existing.town == null ? await dbTownFindByZipAndCity(profile.zip, profile.city) : null;
      const updates = mergeProfileIntoCarOnboardingUserInfo(existing, profile, town);
      if (Object.keys(updates).length > 0) {
        await saveCarOnboardingWithPreparationCheck({ ...existing, ...updates });
      }
    }
  } catch (error) {
    logger.exception(error, { operation: 'connectCarOnboardingPlayConnector.profileEnrichment', carOnboardingId: id, userId: user.id });
  }

  return status;
};
