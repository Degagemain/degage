import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute } from '@/api/utils';
import { tryCarOnboardingProofOfPurchaseUpload } from '@/api/car-onboardings/proof-of-purchase-upload';
import { uploadCarOnboardingProofOfPurchase } from '@/actions/car-onboarding/upload-proof-of-purchase';
import { withAuth } from '@/api/with-context';

export const PUT = withAuth(async (request: NextRequest, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryCarOnboardingProofOfPurchaseUpload(
    request,
    id,
    uploadCarOnboardingProofOfPurchase,
    'car-onboardings-proof-of-purchase',
    session.user,
  );
});
