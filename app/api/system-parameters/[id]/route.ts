import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { ZodError } from 'zod';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import {
  IdRouteParams,
  NotFoundError,
  forbiddenResponse,
  getIdFromRoute,
  isPrismaNotFoundError,
  notFoundResponse,
  safeParseRequestJson,
  tryReadResource,
  unauthorizedResponse,
} from '@/api/utils';
import { readSystemParameter } from '@/actions/system-parameter/read';
import { updateSystemParameterValues } from '@/actions/system-parameter/update-values';
import { withContext } from '@/api/with-context';
import { statusCodes } from '@/api/status-codes';

const requireAdmin = async (): Promise<Response | null> => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  if (!isAdmin(session.user)) {
    return forbiddenResponse('Admin access required');
  }

  return null;
};

export const GET = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readSystemParameter, id);
});

export const PATCH = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await requireAdmin();
  if (denied) return denied;

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
