import type { NextRequest } from 'next/server';
import { type IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteEmailTemplate } from '@/actions/email-template/delete';
import { updateEmailTemplate } from '@/actions/email-template/update';
import { readEmailTemplate } from '@/actions/email-template/read';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readEmailTemplate, id);
});

export const PUT = withAdmin(async (request: NextRequest, context) => {
  return tryUpdateResource(request, context as IdRouteParams, updateEmailTemplate);
});

export const DELETE = withAdmin(async (_request, context) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteEmailTemplate, id);
});
