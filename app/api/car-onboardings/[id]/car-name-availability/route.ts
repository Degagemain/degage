import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';

import { checkCarOnboardingCarNameAvailability } from '@/actions/car-onboarding/check-car-name-availability';
import { CarOnboardingAdminModeUnavailableError } from '@/actions/car-onboarding/car-onboarding-admin-mode-unavailable.error';
import { CarOnboardingConfirmedError } from '@/actions/car-onboarding/car-onboarding-confirmed.error';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { type IdRouteParams, forbiddenResponse, getIdFromRoute, isPrismaNotFoundError, notFoundResponse } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { withAuth } from '@/api/with-context';
import { logger } from '@/lib/logger';

export const GET = withAuth(async (request: NextRequest, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  const carName = request.nextUrl.searchParams.get('carName');

  try {
    const result = await checkCarOnboardingCarNameAvailability(id, carName, session.user);
    return Response.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ code: 'validation_error', errors: error.issues }, { status: statusCodes.BAD_REQUEST });
    }
    if (error instanceof CarOnboardingForbiddenError) {
      return forbiddenResponse(error.message);
    }
    if (error instanceof CarOnboardingConfirmedError) {
      return forbiddenResponse(error.message);
    }
    if (error instanceof CarOnboardingAdminModeUnavailableError) {
      return Response.json(
        { code: 'admin_mode_unavailable', errors: [{ message: error.message }] },
        { status: statusCodes.SERVICE_UNAVAILABLE },
      );
    }
    if (isPrismaNotFoundError(error)) {
      return notFoundResponse();
    }
    logger.exception(error, { route: 'car-onboardings-car-name-availability' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
