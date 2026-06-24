import { type IdRouteParams, forbiddenResponse, getIdFromRoute, isPrismaNotFoundError, noContentResponse, notFoundResponse } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { confirmCarOnboardingInfoSession } from '@/actions/car-onboarding/confirm-info-session';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingInvalidInfoSessionStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-info-session-status.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { withAdmin } from '@/api/with-context';
import { logger } from '@/lib/logger';

export const PUT = withAdmin(async (_request, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);

  try {
    await confirmCarOnboardingInfoSession(id, session.user);
    return noContentResponse();
  } catch (error) {
    if (error instanceof CarOnboardingLockedError) {
      return forbiddenResponse(error.message);
    }
    if (error instanceof CarOnboardingForbiddenError) {
      return forbiddenResponse(error.message);
    }
    if (error instanceof CarOnboardingInvalidInfoSessionStatusError) {
      return Response.json({ code: 'invalid_info_session_status', errors: [{ message: error.message }] }, { status: statusCodes.BAD_REQUEST });
    }
    if (isPrismaNotFoundError(error)) {
      return notFoundResponse();
    }
    logger.exception(error, { route: 'car-onboardings-info-session-confirm' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
