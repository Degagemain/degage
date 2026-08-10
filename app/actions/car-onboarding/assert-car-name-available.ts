import { CarOnboardingAdminModeUnavailableError } from '@/actions/car-onboarding/car-onboarding-admin-mode-unavailable.error';
import { CarOnboardingCarNameTakenError } from '@/actions/car-onboarding/car-onboarding-car-name-taken.error';
import { searchCarOnboardings } from '@/actions/car-onboarding/search';
import { carOnboardingFilterSchema } from '@/domain/car-onboarding.filter';
import { carOnboardingCarNameSchema } from '@/domain/car-onboarding.model';
import { PlayConnectorActionError } from '@/domain/play-connector.errors';
import { logger } from '@/lib/logger';
import { playConnectorIsCarNameAvailable } from '@/play-connector/cars';
import { PlayConnectorError } from '@/play-connector/errors';
import { dbUserReadOldestAdmin } from '@/storage/user/user.read-oldest-admin';

export type AssertCarOnboardingCarNameAvailableOptions = {
  excludeOnboardingId: string;
};

export const assertCarOnboardingCarNameAvailable = async (
  carName: string,
  options: AssertCarOnboardingCarNameAvailableOptions,
): Promise<void> => {
  const validated = carOnboardingCarNameSchema.parse(carName);

  const existing = await searchCarOnboardings(
    carOnboardingFilterSchema.parse({
      carName: validated,
      excludeId: options.excludeOnboardingId,
      take: 1,
    }),
  );
  if (existing.total > 0) {
    throw new CarOnboardingCarNameTakenError();
  }

  // TODO: replace oldest-admin lookup with a dedicated admin-mode play connector account.
  const admin = await dbUserReadOldestAdmin();
  if (!admin) {
    logger.error('[car-onboarding] no admin user for car name check');
    throw new CarOnboardingAdminModeUnavailableError('No admin user available for car name check');
  }

  try {
    const availableInPlay = await playConnectorIsCarNameAvailable(admin.id, validated);
    if (!availableInPlay) {
      throw new CarOnboardingCarNameTakenError();
    }
  } catch (error) {
    if (error instanceof CarOnboardingCarNameTakenError) {
      throw error;
    }
    if (error instanceof PlayConnectorActionError || error instanceof PlayConnectorError) {
      logger.error('[car-onboarding] play car name check failed', {
        code: error.code,
        adminUserId: admin.id,
      });
      throw new CarOnboardingAdminModeUnavailableError();
    }
    throw error;
  }
};
