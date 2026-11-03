import { createContract } from '@/actions/contract/create';
import { sendContract } from '@/actions/contract/send';
import {
  CarOnboardingContractAlreadyStartedError,
  CarOnboardingContractTypeMissingError,
  CarOnboardingOwnerMissingError,
} from '@/actions/car-onboarding/car-onboarding-contract.error';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { readContractTypeByCode } from '@/actions/contract-type/read';
import { type Contract, ContractStatus } from '@/domain/contract.model';
import { ContractTypeCode } from '@/domain/contract-type.model';
import type { UserWithRole } from '@/domain/role.model';
import { isAdmin } from '@/domain/role.utils';
import { dbCarOnboardingSetContract } from '@/storage/car-onboarding/car-onboarding.update';
import { dbUserRead } from '@/storage/user/user.read';

export const startCarOnboardingContract = async (id: string, caller: UserWithRole): Promise<Contract> => {
  if (!isAdmin(caller)) {
    throw new CarOnboardingForbiddenError();
  }

  const onboarding = await readCarOnboarding(id);
  if (onboarding.owner?.id == null) {
    throw new CarOnboardingOwnerMissingError();
  }

  if (onboarding.contract != null) {
    if (onboarding.contract.status === ContractStatus.Draft) {
      return sendContract(onboarding.contract.id);
    }
    throw new CarOnboardingContractAlreadyStartedError();
  }

  const contractType = await readContractTypeByCode(ContractTypeCode.CarOnboarding);
  if (contractType?.id == null) {
    throw new CarOnboardingContractTypeMissingError();
  }

  const owner = await dbUserRead(onboarding.owner.id);
  const startDate = onboarding.shareStartDate ?? new Date();

  const draft = await createContract({
    id: null,
    user: { id: owner.id, name: owner.name },
    type: { id: contractType.id, name: contractType.name, code: contractType.code },
    startDate,
    endDate: null,
    status: ContractStatus.Draft,
    document: null,
    documensoDocumentEnvelopeId: null,
    createdAt: null,
    updatedAt: null,
  });

  await dbCarOnboardingSetContract(id, draft.id!);
  return sendContract(draft.id!);
};
