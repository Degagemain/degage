import type { NextRequest } from 'next/server';
import {
  type IdRouteParams,
  forbiddenResponse,
  getIdFromRoute,
  isPrismaNotFoundError,
  notFoundResponse,
  tryDeleteResource,
  tryUpdateResource,
} from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { deleteCarOnboarding } from '@/actions/car-onboarding/delete';
import { readCarOnboardingForCaller } from '@/actions/car-onboarding/read-for-caller';
import { updateCarOnboarding } from '@/actions/car-onboarding/update';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { withAdmin, withAuth } from '@/api/with-context';
import { logger } from '@/lib/logger';
import { captureEvent } from '@/integrations/posthog';
import { AnalyticsEvent } from '@/domain/analytics-event.model';

const captureLoadFailed = (id: string, reason: 'forbidden' | 'not_found' | 'error') => {
  captureEvent(AnalyticsEvent.CAR_ONBOARDING_LOAD_FAILED, { car_onboarding_id: id, reason });
};

export const GET = withAuth(async (_request, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  try {
    const onboarding = await readCarOnboardingForCaller(id, session.user);
    return Response.json(onboarding);
  } catch (error) {
    if (error instanceof CarOnboardingForbiddenError) {
      captureLoadFailed(id, 'forbidden');
      return forbiddenResponse(error.message);
    }
    if (isPrismaNotFoundError(error)) {
      captureLoadFailed(id, 'not_found');
      return notFoundResponse();
    }
    captureLoadFailed(id, 'error');
    logger.exception(error, { route: 'car-onboardings-get' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});

export const PUT = withAdmin(async (request: NextRequest, context) => {
  return tryUpdateResource(request, context as IdRouteParams, updateCarOnboarding);
});

export const DELETE = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteCarOnboarding, id);
});
