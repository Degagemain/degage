import { type NextRequest } from 'next/server';
import { searchCarBrands } from '@/actions/car-brand/search';
import { createCarBrand } from '@/actions/car-brand/create';
import { carBrandFilterSchema } from '@/domain/car-brand.filter';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const carBrandFilter = carBrandFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!carBrandFilter.success) {
    return badRequestResponseFromZod(carBrandFilter);
  }

  const result = await searchCarBrands(carBrandFilter.data);
  return Response.json(result);
});

export const POST = withContext(async (request: NextRequest) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createCarBrand, data);
});
