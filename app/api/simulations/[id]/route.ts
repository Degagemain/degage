import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource, unauthorizedResponse } from '@/api/utils';
import { readSimulation } from '@/actions/simulation/read';
import { deleteSimulation } from '@/actions/simulation/delete';
import { updateSimulation } from '@/actions/simulation/update';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readSimulation, id);
});

export const DELETE = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteSimulation, id);
});

export const PUT = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  return tryUpdateResource(request, context as IdRouteParams, updateSimulation);
});
