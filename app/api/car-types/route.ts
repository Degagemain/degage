import { type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import { searchCarTypes } from '@/actions/car-type/search';
import { createCarType } from '@/actions/car-type/create';
import { carTypeFilterSchema } from '@/domain/car-type.filter';
import { forbiddenResponse, fromZodParseResult, tryCreateResource, unauthorizedResponse } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  const carTypeFilter = carTypeFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
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

  try {
    const carType = await request.json();
    return tryCreateResource(createCarType, carType);
  } catch (error) {
    console.error(error);
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'Failed to parse request body' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
