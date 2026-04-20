import { type NextRequest } from 'next/server';
import { searchCarPriceEstimates } from '@/actions/car-price-estimate/search';
import { createCarPriceEstimate } from '@/actions/car-price-estimate/create';
import { carPriceEstimateFilterSchema } from '@/domain/car-price-estimate.filter';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest) => {
  const filter = carPriceEstimateFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchCarPriceEstimates(filter.data);
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createCarPriceEstimate, data);
});
