import {
  CarOnboarding,
  type CarOnboardingCreateInput,
  applyInsurerStatus,
  carOnboardingCreateInputSchema,
  carOnboardingFromSimulation,
  carOnboardingSchema,
  hasInsuranceFromIsPurchased,
} from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import { readSimulation } from '@/actions/simulation/read';
import { dbCarOnboardingCreate } from '@/storage/car-onboarding/car-onboarding.create';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { readCarOnboarding } from '@/actions/car-onboarding/read';

export const createCarOnboarding = async (input: CarOnboardingCreateInput, caller: UserWithRole): Promise<CarOnboarding> => {
  const validatedInput = carOnboardingCreateInputSchema.parse(input);

  const draft =
    validatedInput.simulation != null
      ? carOnboardingFromSimulation(await readSimulation(validatedInput.simulation.id), { ownerId: caller.id })
      : (() => {
          if (!isAdmin(caller)) {
            throw new CarOnboardingForbiddenError();
          }
          return carOnboardingSchema.parse({ id: null, createdAt: null, updatedAt: null });
        })();

  const withCarTypeFlags =
    validatedInput.simulation == null && (validatedInput.isPurchased !== undefined || validatedInput.isNewCar !== undefined)
      ? {
          ...draft,
          isPurchased: validatedInput.isPurchased ?? false,
          isNewCar: validatedInput.isPurchased === true ? (validatedInput.isNewCar ?? false) : false,
        }
      : draft;

  const toCreate = carOnboardingSchema.parse({
    ...withCarTypeFlags,
    hasInsurance: hasInsuranceFromIsPurchased(withCarTypeFlags.isPurchased),
    id: null,
    createdAt: null,
    updatedAt: null,
  });

  const withInsurer = applyInsurerStatus(toCreate);
  const created = await dbCarOnboardingCreate(withInsurer);
  return readCarOnboarding(created.id!);
};
