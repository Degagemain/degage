import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteCarBrand } from '@/actions/car-brand/delete';
import { updateCarBrand } from '@/actions/car-brand/update';
import { readCarBrand } from '@/actions/car-brand/read';
import { withAdmin, withAuth } from '@/api/with-context';

export const GET = withAuth(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readCarBrand, id);
});

export const PUT = withAdmin(async (request: NextRequest, context) => {
  return tryUpdateResource(request, context as IdRouteParams, updateCarBrand);
});

export const DELETE = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteCarBrand, id);
});
