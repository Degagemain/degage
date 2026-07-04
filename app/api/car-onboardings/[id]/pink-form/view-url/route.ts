import type { NextRequest } from 'next/server';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { getCarOnboardingPinkFormViewUrl } from '@/actions/car-onboarding/get-pink-form-view-url';
import { PinkFormNotFoundError } from '@/actions/car-onboarding/pink-form-not-found.error';
import { type IdRouteParams, forbiddenResponse, getIdFromRoute, isPrismaNotFoundError, notFoundResponse } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { withAuth } from '@/api/with-context';
import { logger } from '@/lib/logger';

export const GET = withAuth(async (_request: NextRequest, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  try {
    const url = await getCarOnboardingPinkFormViewUrl(id, session.user);
    return Response.json({ url });
  } catch (error) {
    if (error instanceof CarOnboardingForbiddenError) {
      return forbiddenResponse(error.message);
    }
    if (error instanceof PinkFormNotFoundError || isPrismaNotFoundError(error)) {
      return notFoundResponse();
    }
    logger.exception(error, { route: 'car-onboardings-pink-form-view-url' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
