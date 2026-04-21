import type { NextRequest } from 'next/server';
import { IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteHubBenchmark } from '@/actions/hub-benchmark/delete';
import { updateHubBenchmark } from '@/actions/hub-benchmark/update';
import { readHubBenchmark } from '@/actions/hub-benchmark/read';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readHubBenchmark, id);
});

export const PUT = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  return tryUpdateResource(request, context as IdRouteParams, updateHubBenchmark);
});

export const DELETE = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteHubBenchmark, id);
});
