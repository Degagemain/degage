import type { NextRequest } from 'next/server';
import { IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteCarTaxEuroNormAdjustment } from '@/actions/car-tax-euro-norm-adjustment/delete';
import { updateCarTaxEuroNormAdjustment } from '@/actions/car-tax-euro-norm-adjustment/update';
import { readCarTaxEuroNormAdjustment } from '@/actions/car-tax-euro-norm-adjustment/read';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readCarTaxEuroNormAdjustment, id);
});

export const PUT = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  return tryUpdateResource(request, context as IdRouteParams, updateCarTaxEuroNormAdjustment);
});

export const DELETE = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteCarTaxEuroNormAdjustment, id);
});
