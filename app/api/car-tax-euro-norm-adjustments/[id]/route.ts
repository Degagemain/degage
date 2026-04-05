import type { NextRequest } from 'next/server';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteCarTaxEuroNormAdjustment } from '@/actions/car-tax-euro-norm-adjustment/delete';
import { updateCarTaxEuroNormAdjustment } from '@/actions/car-tax-euro-norm-adjustment/update';
import { readCarTaxEuroNormAdjustment } from '@/actions/car-tax-euro-norm-adjustment/read';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readCarTaxEuroNormAdjustment, id);
});

export const PUT = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  return tryUpdateResource(request, context as IdRouteParams, updateCarTaxEuroNormAdjustment);
});

export const DELETE = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteCarTaxEuroNormAdjustment, id);
});
