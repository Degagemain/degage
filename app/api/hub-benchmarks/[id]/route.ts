import type { NextRequest } from 'next/server';
import { errorResponseIfNotAdmin } from '@/api/authorization-utils';
import { IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteHubBenchmark } from '@/actions/hub-benchmark/delete';
import { updateHubBenchmark } from '@/actions/hub-benchmark/update';
import { readHubBenchmark } from '@/actions/hub-benchmark/read';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readHubBenchmark, id);
});

export const PUT = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  return tryUpdateResource(request, context as IdRouteParams, updateHubBenchmark);
});

export const DELETE = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const denied = await errorResponseIfNotAdmin();
  if (denied) return denied;

  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteHubBenchmark, id);
});
