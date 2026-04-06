import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { isPrismaNotFoundError, noContentResponse, notFoundResponse, safeParseRequestJson } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { withContext } from '@/api/with-context';
import { publicConfirmResultEmail } from '@/actions/simulation/public-confirm-result-email';

export const POST = withContext(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  try {
    await publicConfirmResultEmail(data);
    return noContentResponse();
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ code: 'validation_error', errors: error.issues }, { status: statusCodes.BAD_REQUEST });
    }
    if (isPrismaNotFoundError(error)) {
      return notFoundResponse();
    }
    console.error('[confirm-result-email]', error);
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
