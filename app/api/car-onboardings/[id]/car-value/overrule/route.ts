import { type IdRouteParams, forbiddenResponse, getIdFromRoute, isPrismaNotFoundError, noContentResponse, notFoundResponse } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { overruleCarOnboardingCarValueAgreement } from '@/actions/car-onboarding/overrule-car-value-agreement';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { withAdmin } from '@/api/with-context';
import { logger } from '@/lib/logger';

export const PUT = withAdmin(async (_request, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);

  try {
    await overruleCarOnboardingCarValueAgreement(id, session.user);
    return noContentResponse();
  } catch (error) {
    if (error instanceof CarOnboardingLockedError) {
      return forbiddenResponse(error.message);
    }
    if (error instanceof CarOnboardingForbiddenError) {
      return forbiddenResponse(error.message);
    }
    if (isPrismaNotFoundError(error)) {
      return notFoundResponse();
    }
    logger.exception(error, { route: 'car-onboardings-car-value-overrule' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
