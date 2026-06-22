import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { CarOnboardingInvalidCarValueStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-car-value-status.error';
import { CarOnboardingInvalidInfoSessionStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-info-session-status.error';
import { CarOnboardingInvalidInsurerStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-insurer-status.error';
import { CarOnboardingLockedError } from '@/actions/car-onboarding/car-onboarding-locked.error';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { forbiddenResponse, isPrismaNotFoundError, noContentResponse, notFoundResponse, safeParseRequestJson } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { logger } from '@/lib/logger';

export const tryPartialCarOnboardingUpdate = async (
  request: NextRequest,
  id: string,
  update: (id: string, body: unknown) => Promise<void>,
  routeName: string,
): Promise<Response> => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  try {
    await update(id, data);
    return noContentResponse();
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ code: 'validation_error', errors: error.issues }, { status: statusCodes.BAD_REQUEST });
    }
    if (error instanceof CarOnboardingLockedError) {
      return forbiddenResponse(error.message);
    }
    if (error instanceof CarOnboardingForbiddenError) {
      return forbiddenResponse(error.message);
    }
    if (error instanceof CarOnboardingInvalidCarValueStatusError) {
      return Response.json({ code: 'invalid_car_value_status', errors: [{ message: error.message }] }, { status: statusCodes.BAD_REQUEST });
    }
    if (error instanceof CarOnboardingInvalidInsurerStatusError) {
      return Response.json({ code: 'invalid_insurer_status', errors: [{ message: error.message }] }, { status: statusCodes.BAD_REQUEST });
    }
    if (error instanceof CarOnboardingInvalidInfoSessionStatusError) {
      return Response.json({ code: 'invalid_info_session_status', errors: [{ message: error.message }] }, { status: statusCodes.BAD_REQUEST });
    }
    if (isPrismaNotFoundError(error)) {
      return notFoundResponse();
    }
    logger.exception(error, { route: routeName });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
};
