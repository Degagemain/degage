import { type NextRequest } from 'next/server';
import { searchHubBenchmarks } from '@/actions/hub-benchmark/search';
import { createHubBenchmark } from '@/actions/hub-benchmark/create';
import { hubBenchmarkFilterSchema } from '@/domain/hub-benchmark.filter';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest) => {
  const filter = hubBenchmarkFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchHubBenchmarks(filter.data);
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createHubBenchmark, data);
});
