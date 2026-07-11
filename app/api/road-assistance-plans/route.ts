import { type NextRequest } from 'next/server';
import { searchRoadAssistancePlans } from '@/actions/road-assistance-plan/search';
import { createRoadAssistancePlan } from '@/actions/road-assistance-plan/create';
import { roadAssistancePlanFilterSchema } from '@/domain/road-assistance-plan.filter';
import { badRequestResponseFromZod, safeParseRequestJson, tryCreateResource } from '@/api/utils';
import { withAdmin, withAuth } from '@/api/with-context';

export const GET = withAuth(async (request: NextRequest) => {
  const roadAssistancePlanFilter = roadAssistancePlanFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!roadAssistancePlanFilter.success) {
    return badRequestResponseFromZod(roadAssistancePlanFilter);
  }

  const result = await searchRoadAssistancePlans(roadAssistancePlanFilter.data);
  return Response.json(result);
});

export const POST = withAdmin(async (request: NextRequest) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;
  return tryCreateResource(createRoadAssistancePlan, data);
});
