import { type NextRequest } from 'next/server';
import { searchCarBrands } from '@/actions/car-brand/search';
import { createCarBrand } from '@/actions/car-brand/create';
import { carBrandFilterSchema } from '@/domain/car-brand.filter';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin, withPublic } from '@/api/with-context';

export const GET = withPublic(async (request: NextRequest) => {
  const carBrandFilter = carBrandFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!carBrandFilter.success) {
    return badRequestResponseFromZod(carBrandFilter);
  }

  const result = await searchCarBrands(carBrandFilter.data);
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createCarBrand, data);
});
