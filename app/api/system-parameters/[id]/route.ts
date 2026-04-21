import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import {
  IdRouteParams,
  NotFoundError,
  getIdFromRoute,
  isPrismaNotFoundError,
  notFoundResponse,
  safeParseRequestJson,
  tryReadResource,
} from '@/api/utils';
import { readSystemParameter } from '@/actions/system-parameter/read';
import { updateSystemParameterValues } from '@/actions/system-parameter/update-values';
import { withAdmin } from '@/api/with-context';
import { statusCodes } from '@/api/status-codes';

export const GET = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readSystemParameter, id);
});

export const PATCH = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const id = await getIdFromRoute(context as IdRouteParams);

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  try {
    const updated = await updateSystemParameterValues(id, data);
    return Response.json(updated, { status: statusCodes.OK });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ code: 'validation_error', errors: error.issues }, { status: statusCodes.BAD_REQUEST });
    }
    if (isPrismaNotFoundError(error) || error instanceof NotFoundError) {
      return notFoundResponse();
    }
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
