import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteEuroNorm } from '@/actions/euro-norm/delete';
import { updateEuroNorm } from '@/actions/euro-norm/update';
import { readEuroNorm } from '@/actions/euro-norm/read';
import { withAdmin, withAuth } from '@/api/with-context';

export const GET = withAuth(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readEuroNorm, id);
});

export const PUT = withAdmin(async (request: NextRequest, context) => {
  return tryUpdateResource(request, context as IdRouteParams, updateEuroNorm);
});

export const DELETE = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteEuroNorm, id);
});
