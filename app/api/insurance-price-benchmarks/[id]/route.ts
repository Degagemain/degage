import type { NextRequest } from 'next/server';
import { IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteInsurancePriceBenchmark } from '@/actions/insurance-price-benchmark/delete';
import { updateInsurancePriceBenchmark } from '@/actions/insurance-price-benchmark/update';
import { readInsurancePriceBenchmark } from '@/actions/insurance-price-benchmark/read';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readInsurancePriceBenchmark, id);
});

export const PUT = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  return tryUpdateResource(request, context as IdRouteParams, updateInsurancePriceBenchmark);
});

export const DELETE = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteInsurancePriceBenchmark, id);
});
