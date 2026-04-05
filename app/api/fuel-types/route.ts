import { type NextRequest } from 'next/server';
import { searchFuelTypes } from '@/actions/fuel-type/search';
import { createFuelType } from '@/actions/fuel-type/create';
import { fuelTypeFilterSchema } from '@/domain/fuel-type.filter';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const fuelTypeFilter = fuelTypeFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!fuelTypeFilter.success) {
    return badRequestResponseFromZod(fuelTypeFilter);
  }

  const result = await searchFuelTypes(fuelTypeFilter.data);
  return Response.json(result);
});

export const POST = withContext(async (request: NextRequest) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createFuelType, data);
});
