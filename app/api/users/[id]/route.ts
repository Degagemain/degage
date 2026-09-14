import type { NextRequest } from 'next/server';
import { type IdRouteParams, getStringIdFromRoute, tryReadResource, tryUpdateResource } from '@/api/utils';
import { readUser } from '@/actions/user/read';
import { updateUser } from '@/actions/user/update';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (_request, context) => {
  const id = await getStringIdFromRoute(context as IdRouteParams);
  return tryReadResource(readUser, id);
});

export const PUT = withAdmin(async (request: NextRequest, context) => {
  return tryUpdateResource(request, context as IdRouteParams, updateUser, getStringIdFromRoute);
});
