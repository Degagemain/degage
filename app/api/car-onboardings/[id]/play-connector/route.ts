import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';

import { logger } from '@/lib/logger';
import { connectCarOnboardingPlayConnector } from '@/actions/car-onboarding/connect-play-connector';
import { PlayConnectorActionError } from '@/domain/play-connector.errors';
import { playConnectorLinkInputSchema } from '@/domain/play-connector.model';
import {
  type IdRouteParams,
  forbiddenResponse,
  getIdFromRoute,
  isPrismaNotFoundError,
  notFoundResponse,
  safeParseRequestJson,
} from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { withAuth } from '@/api/with-context';
import { CarOnboardingConfirmedError } from '@/actions/car-onboarding/car-onboarding-confirmed.error';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';

export const PUT = withAuth(async (request: NextRequest, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  const parsed = playConnectorLinkInputSchema.safeParse(data);
  if (!parsed.success) {
    return Response.json({ code: 'validation_error', errors: parsed.error.issues }, { status: statusCodes.BAD_REQUEST });
  }

  try {
    const status = await connectCarOnboardingPlayConnector(id, parsed.data, session.user);
    return Response.json(status);
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ code: 'validation_error', errors: error.issues }, { status: statusCodes.BAD_REQUEST });
    }
    if (
      error instanceof CarOnboardingLockedError ||
      error instanceof CarOnboardingConfirmedError ||
      error instanceof CarOnboardingForbiddenError
    ) {
      return forbiddenResponse(error.message);
    }
    if (error instanceof PlayConnectorActionError) {
      logger.error('[car-onboardings] play-connector link request failed', { code: error.code, message: error.message });
      return Response.json({ code: error.code, errors: [{ message: error.message }] }, { status: statusCodes.BAD_REQUEST });
    }
    if (isPrismaNotFoundError(error)) {
      return notFoundResponse();
    }
    logger.exception(error, { route: 'PUT /api/car-onboardings/[id]/play-connector' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
