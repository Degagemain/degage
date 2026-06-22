import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute } from '@/api/utils';
import { tryPartialCarOnboardingUpdate } from '@/api/car-onboardings/partial-update';
import { updateCarOnboardingCarValue } from '@/actions/car-onboarding/update-car-value';
import { withAuth } from '@/api/with-context';

export const PUT = withAuth(async (request: NextRequest, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryPartialCarOnboardingUpdate(
    request,
    id,
    (resourceId, body) => updateCarOnboardingCarValue(resourceId, body, session.user),
    'car-onboardings-car-value',
  );
});
