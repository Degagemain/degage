import type { CarOnboarding } from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import { AnalyticsEvent } from '@/domain/analytics-event.model';
import { dbSimulationRead } from '@/storage/simulation/simulation.read';
import { dbUserReadAuthContext } from '@/storage/user/user.read-auth';
import { dbCarOnboardingUpdateOwner } from '@/storage/car-onboarding/car-onboarding.update';
import { captureEvent } from '@/integrations/posthog';

export type CarOnboardingCaller = UserWithRole & { email: string; emailVerified: boolean };

const sameEmail = (a: string | null, b: string): boolean => a != null && a.trim().toLowerCase() === b.trim().toLowerCase();

// The simulation email links a car owner to an onboarding an admin started for them.
// An admin owner is a placeholder from before the owner signed up, so the owner can take it over.
export const claimCarOnboardingFromSimulation = async (onboarding: CarOnboarding, caller: CarOnboardingCaller): Promise<boolean> => {
  if (onboarding.id == null || onboarding.simulation == null) return false;
  if (isAdmin(caller) || !caller.emailVerified || onboarding.owner?.id === caller.id) return false;

  const simulation = await dbSimulationRead(onboarding.simulation.id);
  if (!sameEmail(simulation.email, caller.email)) return false;

  if (onboarding.owner != null && !isAdmin(await dbUserReadAuthContext(onboarding.owner.id))) return false;

  await dbCarOnboardingUpdateOwner(onboarding.id, caller.id);
  captureEvent(AnalyticsEvent.CAR_ONBOARDING_CLAIMED, {
    car_onboarding_id: onboarding.id,
    replaced_admin_owner: onboarding.owner != null,
  });
  return true;
};
