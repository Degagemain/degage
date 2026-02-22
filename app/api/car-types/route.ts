import { type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import { searchCarTypes } from '@/actions/car-type/search';
import { createCarType } from '@/actions/car-type/create';
import { carTypeFilterSchema } from '@/domain/car-type.filter';
import { forbiddenResponse, fromZodParseResult, safeParseRequestJson, tryCreateResource, unauthorizedResponse } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const sp = request.nextUrl.searchParams;
  const params: Record<string, unknown> = {};
  for (const [key, value] of sp.entries()) {
    if (key === 'brandId' || key === 'fuelTypeId') continue;
    params[key] = value;
  }
  params.brandIds = sp.getAll('brandId');
  params.fuelTypeIds = sp.getAll('fuelTypeId');

  const carTypeFilter = carTypeFilterSchema.safeParse(params);
  if (!carTypeFilter.success) {
    return fromZodParseResult(carTypeFilter);
  }

  const result = await searchCarTypes(carTypeFilter.data);
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
  return tryCreateResource(createCarType, data);
});
