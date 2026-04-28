import { type NextRequest } from 'next/server';
import { searchDocumentationGroups } from '@/actions/documentation-group/search';
import { createDocumentationGroup } from '@/actions/documentation-group/create';
import { documentationGroupFilterSchema } from '@/domain/documentation-group.filter';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin, withPublic } from '@/api/with-context';

export const GET = withPublic(async (request: NextRequest) => {
  const parsed = documentationGroupFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return badRequestResponseFromZod(parsed);
  }
  const result = await searchDocumentationGroups(parsed.data);
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createDocumentationGroup, data);
});
