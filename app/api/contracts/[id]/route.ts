import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteContract } from '@/actions/contract/delete';
import { updateContract } from '@/actions/contract/update';
import { readContract } from '@/actions/contract/read';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readContract, id);
});

export const PUT = withAdmin(async (request: NextRequest, context) => {
  return tryUpdateResource(request, context as IdRouteParams, updateContract);
});

export const DELETE = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteContract, id);
});
