import { sendContract } from '@/actions/contract/send';
import { type IdRouteParams, getIdFromRoute, responseFromCaughtError } from '@/api/utils';
import { withAdmin } from '@/api/with-context';
import { logger } from '@/lib/logger';
import { statusCodes } from '@/api/status-codes';

export const POST = withAdmin(async (_request, context) => {
  try {
    const id = await getIdFromRoute(context as IdRouteParams);
    const contract = await sendContract(id);
    return Response.json(contract);
  } catch (error) {
    const mapped = responseFromCaughtError(error);
    if (mapped) return mapped;
    logger.exception(error, { helper: 'contracts/[id]/send' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
