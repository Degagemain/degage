import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteProvince } from '@/actions/province/delete';
import { updateProvince } from '@/actions/province/update';
import { readProvince } from '@/actions/province/read';
import { withAdmin, withAuth } from '@/api/with-context';

export const GET = withAuth(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readProvince, id);
});

export const PUT = withAdmin(async (request: NextRequest, context) => {
  return tryUpdateResource(request, context as IdRouteParams, updateProvince);
});

export const DELETE = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteProvince, id);
});
