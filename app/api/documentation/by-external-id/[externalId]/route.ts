import type { NextRequest } from 'next/server';
import { isAdmin } from '@/domain/role.utils';
import { getDocumentationByExternalIdForViewer } from '@/actions/documentation/get-by-external-id-for-viewer';
import { forbiddenResponse, notFoundResponse } from '@/api/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { withPublic } from '@/api/with-context';

// Public endpoint — admin-level visibility is toggled based on the viewer's role,
// unless ?publicCatalog=true (help center): then only public docs are returned for everyone.
export const GET = withPublic(async (request: NextRequest, context, session) => {
  const params = await context?.params;
  const raw = params?.externalId ?? '';
  const externalId = decodeURIComponent(raw);

  const isViewerAdmin = session?.user ? isAdmin(session.user) : false;
  const locale = getRequestContentLocale();
  const publicCatalogOnly = new URL(request.url).searchParams.get('publicCatalog') === 'true';

  const result = await getDocumentationByExternalIdForViewer(externalId, locale, isViewerAdmin, {
    publicCatalogOnly,
  });

  if (!result.ok) {
    if (result.reason === 'forbidden') {
      return forbiddenResponse('You do not have access to this documentation');
    }
    return notFoundResponse();
  }

  return Response.json(result.doc);
});
