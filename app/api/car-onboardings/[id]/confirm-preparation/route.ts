import { type IdRouteParams, forbiddenResponse, getIdFromRoute, isPrismaNotFoundError, noContentResponse, notFoundResponse } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { confirmCarOnboardingPreparation } from '@/actions/car-onboarding/confirm-preparation';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { CarOnboardingNotConfirmableError } from '@/actions/car-onboarding/car-onboarding-not-confirmable.error';
import { withAuth } from '@/api/with-context';
import { logger } from '@/lib/logger';

export const PUT = withAuth(async (_request, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);

  try {
    await confirmCarOnboardingPreparation(id, session.user);
    return noContentResponse();
  } catch (error) {
    if (error instanceof CarOnboardingLockedError) {
      return forbiddenResponse(error.message);
    }
    if (error instanceof CarOnboardingForbiddenError) {
      return forbiddenResponse(error.message);
    }
    if (error instanceof CarOnboardingNotConfirmableError) {
      return Response.json({ code: 'not_confirmable', errors: [{ message: error.message }] }, { status: statusCodes.BAD_REQUEST });
    }
    if (isPrismaNotFoundError(error)) {
      return notFoundResponse();
    }
    logger.exception(error, { route: 'car-onboardings-confirm-preparation' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
