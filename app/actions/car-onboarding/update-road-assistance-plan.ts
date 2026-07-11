import { carOnboardingRoadAssistancePlanInputSchema } from '@/domain/car-onboarding.model';
import type { UserWithRole } from '@/domain/role.model';
import {
  assertCarOnboardingNotLocked,
  assertCarOnboardingPartialUpdateAllowed,
  assertRoadAssistancePlanStatusIsTodo,
} from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { saveCarOnboardingWithPreparationCheck } from '@/actions/car-onboarding/save-with-preparation';

export const updateCarOnboardingRoadAssistancePlan = async (id: string, body: unknown, user: UserWithRole): Promise<void> => {
  const existing = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(existing, user);
  assertCarOnboardingNotLocked(existing);
  assertRoadAssistancePlanStatusIsTodo(existing);
  const parsed = carOnboardingRoadAssistancePlanInputSchema.parse(body);
  const merged = { ...existing, ...parsed };
  await saveCarOnboardingWithPreparationCheck(merged);
};
