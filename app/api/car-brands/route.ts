import { type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import { searchCarBrands } from '@/actions/car-brand/search';
import { createCarBrand } from '@/actions/car-brand/create';
import { carBrandFilterSchema } from '@/domain/car-brand.filter';
import { forbiddenResponse, fromZodParseResult, safeParseRequestJson, tryCreateResource, unauthorizedResponse } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  const carBrandFilter = carBrandFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!carBrandFilter.success) {
    return fromZodParseResult(carBrandFilter);
  }

  const result = await searchCarBrands(carBrandFilter.data);
  return Response.json(result);
});

export const POST = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  if (!isAdmin(session.user)) {
    return forbiddenResponse('Admin access required');
  }

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createCarBrand, data);
});
