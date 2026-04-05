import type { NextRequest } from 'next/server';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteHub } from '@/actions/hub/delete';
import { updateHub } from '@/actions/hub/update';
import { readHub } from '@/actions/hub/read';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readHub, id);
});

export const PUT = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  return tryUpdateResource(request, context as IdRouteParams, updateHub);
});

export const DELETE = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteHub, id);
});
