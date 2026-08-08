import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute } from '@/api/utils';
import { tryPartialCarOnboardingUpdate } from '@/api/car-onboardings/partial-update';
import { updateCarOnboardingShareStart } from '@/actions/car-onboarding/update-share-start';
import { withAuth } from '@/api/with-context';

export const PUT = withAuth(async (request: NextRequest, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryPartialCarOnboardingUpdate(
    request,
    id,
    (resourceId, body) => updateCarOnboardingShareStart(resourceId, body, session.user),
    'car-onboardings-share-start',
  );
});
