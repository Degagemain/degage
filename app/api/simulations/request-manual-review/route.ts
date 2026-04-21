import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { isPrismaNotFoundError, noContentResponse, notFoundResponse, safeParseRequestJson } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { withPublic } from '@/api/with-context';
import { publicRequestManualReview } from '@/actions/simulation/public-request-manual-review';
import { logger } from '@/lib/logger';

export const POST = withPublic(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  try {
    await publicRequestManualReview(data);
    return noContentResponse();
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ code: 'validation_error', errors: error.issues }, { status: statusCodes.BAD_REQUEST });
    }
    if (isPrismaNotFoundError(error)) {
      return notFoundResponse();
    }
    logger.exception(error, { route: 'public-request-manual-review' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
