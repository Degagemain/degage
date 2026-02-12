import { type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import { searchCarBrands } from '@/actions/car-brand/search';
import { createCarBrand } from '@/actions/car-brand/create';
import { carBrandFilterSchema } from '@/domain/car-brand.filter';
import { forbiddenResponse, fromZodParseResult, tryCreateResource, unauthorizedResponse } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
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

  try {
    const carBrand = await request.json();
    return tryCreateResource(createCarBrand, carBrand);
  } catch (error) {
    console.error(error);
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'Failed to parse request body' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
