import type { NextRequest } from 'next/server';
import { isAdmin } from '@/domain/role.utils';
import { documentationFilterFromSearchParams, documentationFilterSchema } from '@/domain/documentation.filter';
import { searchDocumentation } from '@/actions/documentation/search';
import { createDocumentation } from '@/actions/documentation/create';
import { badRequestResponseFromZod, forbiddenResponse, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin, withPublic } from '@/api/with-context';

// GET is public to allow anonymous visitors to read FAQ entries. Non-admins may
// only request the FAQ subset — any broader query requires admin access.
export const GET = withPublic(async (request: NextRequest, _context, session) => {
  const viewerIsAdmin = session?.user ? isAdmin(session.user) : false;
  const isAuthenticated = Boolean(session?.user);

  const rawParams = documentationFilterFromSearchParams(request.nextUrl.searchParams);
  const filterResult = documentationFilterSchema.safeParse(rawParams);
  if (!filterResult.success) {
    return badRequestResponseFromZod(filterResult);
  }
  const filter = filterResult.data;

  if (!viewerIsAdmin && filter.isFaq !== true) {
    return forbiddenResponse('Only FAQ listings are available without admin access');
  }

  const result = await searchDocumentation(filter, { isViewerAdmin: viewerIsAdmin, isAuthenticated });
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createDocumentation, data);
});
