import { type IdRouteParams, forbiddenResponse, getIdFromRoute, isPrismaNotFoundError, notFoundResponse } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { nudgeCarOnboardingPreparation } from '@/actions/car-onboarding/nudge-preparation';
import { withAdmin } from '@/api/with-context';
import { logger } from '@/lib/logger';

export const PUT = withAdmin(async (_request, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);

  try {
    const result = await nudgeCarOnboardingPreparation(id, session.user);
    return Response.json(result);
  } catch (error) {
    if (error instanceof CarOnboardingForbiddenError) {
      return forbiddenResponse(error.message);
    }
    if (isPrismaNotFoundError(error)) {
      return notFoundResponse();
    }
    logger.exception(error, { route: 'car-onboardings-preparation-nudge' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
