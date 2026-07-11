import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteRoadAssistancePlan } from '@/actions/road-assistance-plan/delete';
import { updateRoadAssistancePlan } from '@/actions/road-assistance-plan/update';
import { readRoadAssistancePlan } from '@/actions/road-assistance-plan/read';
import { withAdmin, withAuth } from '@/api/with-context';

export const GET = withAuth(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readRoadAssistancePlan, id);
});

export const PUT = withAdmin(async (request: NextRequest, context) => {
  return tryUpdateResource(request, context as IdRouteParams, updateRoadAssistancePlan);
});

export const DELETE = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteRoadAssistancePlan, id);
});
