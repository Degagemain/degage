import { type NextRequest } from 'next/server';
import { searchInsurancePriceBenchmarks } from '@/actions/insurance-price-benchmark/search';
import { createInsurancePriceBenchmark } from '@/actions/insurance-price-benchmark/create';
import { insurancePriceBenchmarkFilterSchema } from '@/domain/insurance-price-benchmark.filter';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const filter = insurancePriceBenchmarkFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchInsurancePriceBenchmarks(filter.data);
  return Response.json(result);
});

export const POST = withContext(async (request: NextRequest) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createInsurancePriceBenchmark, data);
});
