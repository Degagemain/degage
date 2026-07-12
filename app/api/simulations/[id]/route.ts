import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { readPublicSimulation, readSimulation } from '@/actions/simulation/read';
import { deleteSimulation } from '@/actions/simulation/delete';
import { updateSimulation } from '@/actions/simulation/update';
import { withAuth, withPublic } from '@/api/with-context';

/** Public endpoint: fetch a persisted simulation by id (email omitted for anonymous callers). */
export const GET = withPublic(async (_request, context, session) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  if (session?.user) {
    return tryReadResource(readSimulation, id);
  }
  return tryReadResource(readPublicSimulation, id);
});

export const DELETE = withAuth(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteSimulation, id);
});

export const PUT = withAuth(async (request: NextRequest, context) => {
  return tryUpdateResource(request, context as IdRouteParams, updateSimulation);
});
