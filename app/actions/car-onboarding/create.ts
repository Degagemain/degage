import {
  CarOnboarding,
  type CarOnboardingCreateInput,
  applyInsurerStatus,
  applyRoadAssistancePlanStatus,
  carOnboardingCreateInputSchema,
  carOnboardingFromSimulation,
  carOnboardingSchema,
  hasInsuranceContractFromIsPurchased,
} from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import type { Simulation } from '@/domain/simulation.model';
import { readSimulation } from '@/actions/simulation/read';
import { dbUserReadVerifiedIdByEmail } from '@/storage/user/user.read';
import { dbCarOnboardingCreate } from '@/storage/car-onboarding/car-onboarding.create';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { readCarOnboarding } from '@/actions/car-onboarding/read';

const resolveSimulationOwnerId = async (simulation: Simulation, caller: UserWithRole): Promise<string | null> => {
  if (!isAdmin(caller)) return caller.id;
  return simulation.email != null ? dbUserReadVerifiedIdByEmail(simulation.email) : null;
};

const draftFromSimulation = async (simulationId: string, caller: UserWithRole) => {
  const simulation = await readSimulation(simulationId);
  return carOnboardingFromSimulation(simulation, { ownerId: await resolveSimulationOwnerId(simulation, caller) });
};

export const createCarOnboarding = async (input: CarOnboardingCreateInput, caller: UserWithRole): Promise<CarOnboarding> => {
  const validatedInput = carOnboardingCreateInputSchema.parse(input);

  const draft =
    validatedInput.simulation != null
      ? await draftFromSimulation(validatedInput.simulation.id, caller)
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
    hasInsuranceContract: hasInsuranceContractFromIsPurchased(withCarTypeFlags.isPurchased),
    id: null,
    createdAt: null,
    updatedAt: null,
  });

  const withInsurer = applyInsurerStatus(toCreate);
  const withRoadAssistancePlan = applyRoadAssistancePlanStatus(withInsurer);
  const created = await dbCarOnboardingCreate(withRoadAssistancePlan);
  return readCarOnboarding(created.id!);
};
