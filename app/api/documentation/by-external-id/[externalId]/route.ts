import { isAdmin } from '@/domain/role.utils';
import { getDocumentationByExternalIdForViewer } from '@/actions/documentation/get-by-external-id-for-viewer';
import { forbiddenResponse, notFoundResponse } from '@/api/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { withPublic } from '@/api/with-context';

// Public endpoint — admin-level visibility is toggled based on the viewer's role,
// non-admins only see FAQ/published documentation (enforced in the action).
export const GET = withPublic(async (_request, context, session) => {
  const params = await context?.params;
  const raw = params?.externalId ?? '';
  const externalId = decodeURIComponent(raw);

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
