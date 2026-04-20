import { type NextRequest } from 'next/server';
import { searchProvinces } from '@/actions/province/search';
import { createProvince } from '@/actions/province/create';
import { provinceFilterSchema } from '@/domain/province.filter';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin, withAuth } from '@/api/with-context';

export const GET = withAuth(async (request: NextRequest) => {
  const provinceFilter = provinceFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!provinceFilter.success) {
    return badRequestResponseFromZod(provinceFilter);
  }

  const result = await searchProvinces(provinceFilter.data);
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createProvince, data);
});
