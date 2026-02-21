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
import { deleteHubBenchmark } from '@/actions/hub-benchmark/delete';
import { updateHubBenchmark } from '@/actions/hub-benchmark/update';
import { readHubBenchmark } from '@/actions/hub-benchmark/read';
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
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readHubBenchmark, id);
});

export const PUT = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  return tryUpdateResource(request, context as IdRouteParams, updateHubBenchmark);
});

export const DELETE = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await requireAdmin();
  if (denied) return denied;

  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteHubBenchmark, id);
});
