import type { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import { getDocumentationByExternalIdForViewer } from '@/actions/documentation/get-by-external-id-for-viewer';
import { forbiddenResponse, notFoundResponse } from '@/api/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { withContext } from '@/api/with-context';

export const GET = withContext(async (request: NextRequest, context?: { params: Promise<Record<string, string>> }) => {
  const params = await context?.params;
  const raw = params?.externalId ?? '';
  const externalId = decodeURIComponent(raw);

  const session = await auth.api.getSession({ headers: await headers() });
  const isViewerAdmin = session?.user ? isAdmin(session.user) : false;
  const locale = getRequestContentLocale();

  const result = await getDocumentationByExternalIdForViewer(externalId, locale, isViewerAdmin);

  if (!result.ok) {
    if (result.reason === 'forbidden') {
      return forbiddenResponse('You do not have access to this documentation');
    }
    return notFoundResponse();
  }

  return Response.json(result.doc);
});
