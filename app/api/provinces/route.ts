import { type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import { searchProvinces } from '@/actions/province/search';
import { createProvince } from '@/actions/province/create';
import { provinceFilterSchema } from '@/domain/province.filter';
import { forbiddenResponse, fromZodParseResult, safeParseRequestJson, tryCreateResource, unauthorizedResponse } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  const provinceFilter = provinceFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!provinceFilter.success) {
    return fromZodParseResult(provinceFilter);
  }

  const result = await searchProvinces(provinceFilter.data);
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
  return tryCreateResource(createProvince, data);
});
