import { type IdRouteParams, forbiddenResponse, getIdFromRoute, isPrismaNotFoundError, noContentResponse, notFoundResponse } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { startCarOnboarding } from '@/actions/car-onboarding/start';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingPreparationNotReadyError } from '@/actions/car-onboarding/car-onboarding-preparation-not-ready.error';
import { withAdmin } from '@/api/with-context';
import { logger } from '@/lib/logger';

export const PUT = withAdmin(async (_request, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);

  try {
    await startCarOnboarding(id, session.user);
    return noContentResponse();
  } catch (error) {
    if (error instanceof CarOnboardingPreparationNotReadyError) {
      return Response.json({ code: 'preparation_not_ready', errors: [{ message: error.message }] }, { status: statusCodes.BAD_REQUEST });
    }
    if (error instanceof CarOnboardingForbiddenError) {
      return forbiddenResponse(error.message);
    }
    if (isPrismaNotFoundError(error)) {
      return notFoundResponse();
    }
    logger.exception(error, { route: 'car-onboardings-start' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
