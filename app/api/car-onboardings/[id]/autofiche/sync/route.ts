import { type IdRouteParams, forbiddenResponse, getIdFromRoute, isPrismaNotFoundError, notFoundResponse } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { CarOnboardingAdminModeUnavailableError } from '@/actions/car-onboarding/car-onboarding-admin-mode-unavailable.error';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingPlayConnectorMissingError } from '@/actions/car-onboarding/car-onboarding-play-connector-missing.error';
import { syncCarOnboardingAutofiche } from '@/actions/car-onboarding/sync-autofiche';
import { withAdmin } from '@/api/with-context';
import { logger } from '@/lib/logger';

export const PUT = withAdmin(async (_request, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);

  try {
    const onboarding = await syncCarOnboardingAutofiche(id, session.user);
    return Response.json(onboarding);
  } catch (error) {
    if (error instanceof CarOnboardingForbiddenError) {
      return forbiddenResponse(error.message);
    }
    if (error instanceof CarOnboardingPlayConnectorMissingError) {
      return Response.json({ code: 'play_connector_missing', errors: [{ message: error.message }] }, { status: statusCodes.BAD_REQUEST });
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
    logger.exception(error, { route: 'car-onboardings-autofiche-sync' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
