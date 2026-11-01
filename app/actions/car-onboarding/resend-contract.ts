import { CarOnboardingContractMissingError } from '@/actions/car-onboarding/car-onboarding-contract.error';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { resendContract } from '@/actions/contract/resend';
import type { Contract } from '@/domain/contract.model';
import type { UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';

export const resendCarOnboardingContract = async (id: string, caller: UserWithRole): Promise<Contract> => {
  if (!isAdmin(caller)) {
    throw new CarOnboardingForbiddenError();
  }

  const onboarding = await readCarOnboarding(id);
  if (onboarding.contract?.id == null) {
    throw new CarOnboardingContractMissingError();
  }

  return resendContract(onboarding.contract.id);
};
