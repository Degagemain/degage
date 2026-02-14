import { type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import { searchFuelTypes } from '@/actions/fuel-type/search';
import { createFuelType } from '@/actions/fuel-type/create';
import { fuelTypeFilterSchema } from '@/domain/fuel-type.filter';
import { forbiddenResponse, fromZodParseResult, safeParseRequestJson, tryCreateResource, unauthorizedResponse } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  const fuelTypeFilter = fuelTypeFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!fuelTypeFilter.success) {
    return fromZodParseResult(fuelTypeFilter);
  }

  const result = await searchFuelTypes(fuelTypeFilter.data);
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
  return tryCreateResource(createFuelType, data);
});
