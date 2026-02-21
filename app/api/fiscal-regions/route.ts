import { type NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import { searchFiscalRegions } from '@/actions/fiscal-region/search';
import { createFiscalRegion } from '@/actions/fiscal-region/create';
import { fiscalRegionFilterSchema } from '@/domain/fiscal-region.filter';
import { forbiddenResponse, fromZodParseResult, safeParseRequestJson, tryCreateResource, unauthorizedResponse } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  if (!isAdmin(session.user)) {
    return forbiddenResponse('Admin access required');
  }

  const fiscalRegionFilter = fiscalRegionFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!fiscalRegionFilter.success) {
    return fromZodParseResult(fiscalRegionFilter);
  }

  const result = await searchFiscalRegions(fiscalRegionFilter.data);
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
  return tryCreateResource(createFiscalRegion, data);
});
