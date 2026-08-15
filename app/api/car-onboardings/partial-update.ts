import type { NextRequest } from 'next/server';
import { noContentResponse, responseFromCaughtError, safeParseRequestJson } from '@/api/utils';
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
    const mapped = responseFromCaughtError(error);
    if (mapped) return mapped;
    logger.exception(error, { route: routeName });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
};
