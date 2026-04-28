import type { NextRequest } from 'next/server';
import { isAdmin } from '@/domain/role.utils';
import { documentationFilterFromSearchParams, documentationFilterSchema } from '@/domain/documentation.filter';
import { searchDocumentation } from '@/actions/documentation/search';
import { createDocumentation } from '@/actions/documentation/create';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin, withPublic } from '@/api/with-context';

// GET is public for anonymous visitors. Non-admins are always scoped to the public
// documentation catalog (isPublic: true); admins may query without that constraint.
export const GET = withPublic(async (request: NextRequest, _context, session) => {
  const viewerIsAdmin = session?.user ? isAdmin(session.user) : false;
  const isAuthenticated = Boolean(session?.user);

  const rawParams = documentationFilterFromSearchParams(request.nextUrl.searchParams);
  const filterResult = documentationFilterSchema.safeParse(rawParams);
  if (!filterResult.success) {
    return badRequestResponseFromZod(filterResult);
  }
  const filter = filterResult.data;

  const searchFilter = viewerIsAdmin ? filter : { ...filter, isPublic: true };

  const result = await searchDocumentation(searchFilter, { isViewerAdmin: viewerIsAdmin, isAuthenticated });
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createDocumentation, data);
});
