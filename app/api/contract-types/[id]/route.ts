import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteContractType } from '@/actions/contract-type/delete';
import { updateContractType } from '@/actions/contract-type/update';
import { readContractType } from '@/actions/contract-type/read';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readContractType, id);
});

export const PUT = withAdmin(async (request: NextRequest, context) => {
  return tryUpdateResource(request, context as IdRouteParams, updateContractType);
});

export const DELETE = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteContractType, id);
});
