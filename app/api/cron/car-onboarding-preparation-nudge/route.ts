import { unauthorizedCronResponse } from '@/api/cron/authorize';
import { withPublic } from '@/api/with-context';
import { statusCodes } from '@/api/status-codes';
import { nudgeDueCarOnboardingPreparations } from '@/actions/car-onboarding/nudge-preparation';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const maxDuration = 60;

export const GET = withPublic(async (request) => {
  const unauthorized = unauthorizedCronResponse(request);
  if (unauthorized) return unauthorized;

  try {
    const result = await nudgeDueCarOnboardingPreparations();
    return Response.json(result);
  } catch (error) {
    logger.exception(error, { route: 'cron-car-onboarding-preparation-nudge' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
