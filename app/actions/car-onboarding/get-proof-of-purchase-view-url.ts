import { dbDocumentGetSignedViewUrl } from '@/storage/document/document.signed-view-url';
import type { UserWithRole } from '@/domain/role.model';
import { assertCarOnboardingPartialUpdateAllowed } from '@/actions/car-onboarding/preparation';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { ProofOfPurchaseNotFoundError } from '@/actions/car-onboarding/proof-of-purchase-not-found.error';

export const getCarOnboardingProofOfPurchaseViewUrl = async (id: string, user: UserWithRole): Promise<string> => {
  const onboarding = await readCarOnboarding(id);
  assertCarOnboardingPartialUpdateAllowed(onboarding, user);
  const documentId = onboarding.proofOfPurchase?.id ?? null;
  if (documentId == null) {
    throw new ProofOfPurchaseNotFoundError();
  }
  return dbDocumentGetSignedViewUrl(documentId);
};
