import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteCarType } from '@/actions/car-type/delete';
import { updateCarType } from '@/actions/car-type/update';
import { readCarType } from '@/actions/car-type/read';
import { withAdmin, withAuth } from '@/api/with-context';

export const GET = withAuth(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readCarType, id);
});

export const PUT = withAdmin(async (request: NextRequest, context) => {
  return tryUpdateResource(request, context as IdRouteParams, updateCarType);
});

export const DELETE = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteCarType, id);
});
