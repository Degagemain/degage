import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import {
  IdRouteParams,
  forbiddenResponse,
  getIdFromRoute,
  tryDeleteResource,
  tryReadResource,
  tryUpdateResource,
  unauthorizedResponse,
} from '@/api/utils';
import { deleteTown } from '@/actions/town/delete';
import { updateTown } from '@/actions/town/update';
import { readTown } from '@/actions/town/read';
import { withContext } from '@/api/with-context';

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
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readTown, id);
});

export const PUT = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  return tryUpdateResource(request, context as IdRouteParams, updateTown);
});

export const DELETE = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteTown, id);
});
