import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute } from '@/api/utils';
import { tryPartialCarOnboardingUpdate } from '@/api/car-onboardings/partial-update';
import { updateCarOnboardingRoadAssistancePlan } from '@/actions/car-onboarding/update-road-assistance-plan';
import { withAuth } from '@/api/with-context';

export const PUT = withAuth(async (request: NextRequest, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryPartialCarOnboardingUpdate(
    request,
    id,
    (resourceId, body) => updateCarOnboardingRoadAssistancePlan(resourceId, body, session.user),
    'car-onboardings-road-assistance-plan',
  );
});
