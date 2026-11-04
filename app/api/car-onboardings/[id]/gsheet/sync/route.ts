import { type IdRouteParams, getIdFromRoute, responseFromCaughtError } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { syncCarOnboardingGsheet } from '@/actions/car-onboarding/sync-gsheet';
import { withAdmin } from '@/api/with-context';
import { logger } from '@/lib/logger';

export const PUT = withAdmin(async (_request, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);

  try {
    const onboarding = await syncCarOnboardingGsheet(id, session.user);
    return Response.json(onboarding);
  } catch (error) {
    const mapped = responseFromCaughtError(error);
    if (mapped) {
      return mapped;
    }
    logger.exception(error, { route: 'car-onboardings-gsheet-sync' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
