import { isPlayConnectorSectionComplete } from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import { CarOnboardingAdminModeUnavailableError } from '@/actions/car-onboarding/car-onboarding-admin-mode-unavailable.error';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingPlayConnectorMissingError } from '@/actions/car-onboarding/car-onboarding-play-connector-missing.error';
import { mapCarOnboardingToPlayCar } from '@/actions/car-onboarding/map-to-play-car';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { createPlayCar } from '@/actions/play-connector/create-car';
import { updatePlayCar } from '@/actions/play-connector/update-car';
import { PlayConnectorActionError } from '@/domain/play-connector.errors';
import { logger } from '@/lib/logger';
import { toPlayCarCreateInput } from '@/play-connector/cars.model';
import { PlayConnectorError } from '@/play-connector/errors';
import { dbCarOnboardingUpdate } from '@/storage/car-onboarding/car-onboarding.update';
import { dbUserReadOldestAdmin } from '@/storage/user/user.read-oldest-admin';

export const syncCarOnboardingAutofiche = async (id: string, caller: UserWithRole) => {
  if (!isAdmin(caller)) {
    throw new CarOnboardingForbiddenError();
  }

  const existing = await readCarOnboarding(id);
  if (existing.owner?.id == null || !isPlayConnectorSectionComplete(existing)) {
    throw new CarOnboardingPlayConnectorMissingError();
  }

  const mapped = await mapCarOnboardingToPlayCar(existing);
  let carPcId = existing.carPcId;

  if (carPcId == null) {
    const created = await createPlayCar(existing.owner.id, toPlayCarCreateInput(mapped));
    carPcId = created.id;
    await dbCarOnboardingUpdate({ ...existing, carPcId });
  }

  // TODO: replace oldest-admin lookup with a dedicated admin-mode play connector account.
  const admin = await dbUserReadOldestAdmin();
  if (!admin) {
    logger.error('[car-onboarding] no admin user for autofiche sync');
    throw new CarOnboardingAdminModeUnavailableError('No admin user available for autofiche sync');
  }

  try {
    await updatePlayCar(admin.id, carPcId, mapped);
  } catch (error) {
    if (error instanceof PlayConnectorActionError || error instanceof PlayConnectorError) {
      logger.error('[car-onboarding] play autofiche update failed', {
        code: error.code,
        adminUserId: admin.id,
        carPcId,
      });
      throw new CarOnboardingAdminModeUnavailableError();
    }
    throw error;
  }

  return readCarOnboarding(id);
};
