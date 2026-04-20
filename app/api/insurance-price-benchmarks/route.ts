import { type NextRequest } from 'next/server';
import { searchInsurancePriceBenchmarks } from '@/actions/insurance-price-benchmark/search';
import { createInsurancePriceBenchmark } from '@/actions/insurance-price-benchmark/create';
import { insurancePriceBenchmarkFilterSchema } from '@/domain/insurance-price-benchmark.filter';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest) => {
  const filter = insurancePriceBenchmarkFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchInsurancePriceBenchmarks(filter.data);
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createInsurancePriceBenchmark, data);
});
