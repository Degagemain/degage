import { startCarOnboardingContract } from '@/actions/car-onboarding/start-contract';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { type IdRouteParams, forbiddenResponse, getIdFromRoute, responseFromCaughtError } from '@/api/utils';
import { withAdmin } from '@/api/with-context';
import { logger } from '@/lib/logger';
import { statusCodes } from '@/api/status-codes';

export const POST = withAdmin(async (_request, context, session) => {
  try {
    const id = await getIdFromRoute(context as IdRouteParams);
    const contract = await startCarOnboardingContract(id, session.user);
    return Response.json(contract);
  } catch (error) {
    if (error instanceof CarOnboardingForbiddenError) {
      return forbiddenResponse(error.message);
    }
    const mapped = responseFromCaughtError(error);
    if (mapped) return mapped;
    logger.exception(error, { helper: 'car-onboardings/[id]/contract/start' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
