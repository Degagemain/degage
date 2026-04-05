import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import { documentationFilterFromSearchParams, documentationFilterSchema } from '@/domain/documentation.filter';
import { searchDocumentation } from '@/actions/documentation/search';
import { createDocumentation } from '@/actions/documentation/create';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { badRequestResponseFromZod, forbiddenResponse, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest) => {
  const session = await auth.api.getSession({ headers: await headers() });
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

export const POST = withContext(async (request: NextRequest) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createDocumentation, data);
});
