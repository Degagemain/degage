import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { readSimulation } from '@/actions/simulation/read';
import { deleteSimulation } from '@/actions/simulation/delete';
import { updateSimulation } from '@/actions/simulation/update';
import { withAuth } from '@/api/with-context';

export const GET = withAuth(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readSimulation, id);
});

export const DELETE = withAuth(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteSimulation, id);
});

export const PUT = withAuth(async (request: NextRequest, context) => {
  return tryUpdateResource(request, context as IdRouteParams, updateSimulation);
});
