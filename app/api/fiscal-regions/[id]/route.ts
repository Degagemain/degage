import type { NextRequest } from 'next/server';
import { IdRouteParams, getIdFromRoute, tryDeleteResource, tryReadResource, tryUpdateResource } from '@/api/utils';
import { deleteFiscalRegion } from '@/actions/fiscal-region/delete';
import { updateFiscalRegion } from '@/actions/fiscal-region/update';
import { readFiscalRegion } from '@/actions/fiscal-region/read';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryReadResource(readFiscalRegion, id);
});

export const PUT = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  return tryUpdateResource(request, context as IdRouteParams, updateFiscalRegion);
});

export const DELETE = withAdmin(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const id = await getIdFromRoute(context as IdRouteParams);
  return tryDeleteResource(deleteFiscalRegion, id);
});
