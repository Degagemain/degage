import { type NextRequest } from 'next/server';
import { searchCarInfos } from '@/actions/car-info/search';
import { createCarInfo } from '@/actions/car-info/create';
import { carInfoFilterSchema } from '@/domain/car-info.filter';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest) => {
  const filter = carInfoFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filter.success) {
    return badRequestResponseFromZod(filter);
  }

  const result = await searchCarInfos(filter.data);
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createCarInfo, data);
});
