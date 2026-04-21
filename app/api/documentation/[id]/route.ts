import type { NextRequest } from 'next/server';
import { type IdRouteParams, NotFoundError, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteDocumentation } from '@/actions/documentation/delete';
import { updateDocumentation } from '@/actions/documentation/update';
import { readDocumentation } from '@/actions/documentation/read';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(async (docId: string) => {
    const doc = await readDocumentation(docId);
    if (!doc) {
      throw new NotFoundError();
    }
    return doc;
  }, id);
});

export const PUT = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  return tryUpdateResource(request, context as IdRouteParams, updateDocumentation);
});

export const DELETE = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteDocumentation, id);
});
