import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { CarOnboardingConfirmedError } from '@/actions/car-onboarding/car-onboarding-confirmed.error';
import { CarOnboardingAdminModeUnavailableError } from '@/actions/car-onboarding/car-onboarding-admin-mode-unavailable.error';
import { CarOnboardingCarNameTakenError } from '@/actions/car-onboarding/car-onboarding-car-name-taken.error';
import { CarOnboardingInvalidCarValueStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-car-value-status.error';
import { CarOnboardingInvalidInfoSessionStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-info-session-status.error';
import { CarOnboardingInvalidInsurerStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-insurer-status.error';
import { CarOnboardingInvalidRoadAssistancePlanStatusError } from '@/actions/car-onboarding/car-onboarding-invalid-road-assistance-plan-status.error';
import { CarOnboardingInvalidShareStartDateError } from '@/actions/car-onboarding/car-onboarding-invalid-share-start-date.error';
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
    if (error instanceof CarOnboardingConfirmedError) {
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
    if (error instanceof CarOnboardingInvalidShareStartDateError) {
      return Response.json({ code: 'invalid_share_start_date', errors: [{ message: error.message }] }, { status: statusCodes.BAD_REQUEST });
    }
    if (error instanceof CarOnboardingCarNameTakenError) {
      return Response.json({ code: 'car_name_taken', errors: [{ message: error.message }] }, { status: statusCodes.CONFLICT });
    }
    if (error instanceof CarOnboardingAdminModeUnavailableError) {
      return Response.json(
        { code: 'admin_mode_unavailable', errors: [{ message: error.message }] },
        { status: statusCodes.SERVICE_UNAVAILABLE },
      );
    }
    if (error instanceof CarOnboardingInvalidRoadAssistancePlanStatusError) {
      return Response.json(
        { code: 'invalid_road_assistance_plan_status', errors: [{ message: error.message }] },
        { status: statusCodes.BAD_REQUEST },
      );
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
