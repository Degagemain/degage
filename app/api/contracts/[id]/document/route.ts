import { ContractDocumentForbiddenError, getContractDocumentViewUrl } from '@/actions/contract/get-document-view-url';
import { type IdRouteParams, forbiddenResponse, getIdFromRoute, responseFromCaughtError } from '@/api/utils';
import { withAuth } from '@/api/with-context';
import { logger } from '@/lib/logger';
import { statusCodes } from '@/api/status-codes';

export const GET = withAuth(async (_request, context, session) => {
  try {
    const id = await getIdFromRoute(context as IdRouteParams);
    const url = await getContractDocumentViewUrl(id, session.user);
    return Response.json({ url });
  } catch (error) {
    if (error instanceof ContractDocumentForbiddenError) {
      return forbiddenResponse(error.message);
    }
    const mapped = responseFromCaughtError(error);
    if (mapped) return mapped;
    logger.exception(error, { helper: 'contracts/[id]/document' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
