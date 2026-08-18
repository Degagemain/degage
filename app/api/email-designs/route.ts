import { searchEmailDesigns } from '@/actions/email-design/search';
import { responseFromCaughtError } from '@/api/utils';
import { withAdmin } from '@/api/with-context';
import { logger } from '@/lib/logger';
import { statusCodes } from '@/api/status-codes';

export const GET = withAdmin(async () => {
  try {
    const result = await searchEmailDesigns();
    return Response.json(result);
  } catch (error) {
    const mapped = responseFromCaughtError(error);
    if (mapped) return mapped;
    logger.exception(error, { helper: 'GET /api/email-designs' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
