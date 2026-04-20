import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteCarInfo } from '@/actions/car-info/delete';
import { updateCarInfo } from '@/actions/car-info/update';
import { readCarInfo } from '@/actions/car-info/read';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readCarInfo, id);
});

export const PUT = withAdmin(async (request: NextRequest, context) => {
  return tryUpdateResource(request, context as IdRouteParams, updateCarInfo);
});

export const DELETE = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteCarInfo, id);
});
