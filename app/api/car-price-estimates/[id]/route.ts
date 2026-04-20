import type { NextRequest } from 'next/server';
import { IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteCarPriceEstimate } from '@/actions/car-price-estimate/delete';
import { updateCarPriceEstimate } from '@/actions/car-price-estimate/update';
import { readCarPriceEstimate } from '@/actions/car-price-estimate/read';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readCarPriceEstimate, id);
});

export const PUT = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  return tryUpdateResource(request, context as IdRouteParams, updateCarPriceEstimate);
});

export const DELETE = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteCarPriceEstimate, id);
});
