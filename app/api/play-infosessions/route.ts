import { logger } from '@/lib/logger';
import { listPlayInfosessions } from '@/actions/play-infosession/list';
import { PlayConnectorActionError } from '@/domain/play-connector.errors';
import { PlayConnectorError } from '@/play-connector/errors';
import { statusCodes } from '@/api/status-codes';
import { withAuth } from '@/api/with-context';

export const GET = withAuth(async (_request, _context, session) => {
  try {
    const infosessions = await listPlayInfosessions(session.user.id);
    return Response.json({ infosessions });
  } catch (error) {
    if (error instanceof PlayConnectorActionError) {
      logger.error('[play-connector] infosessions request failed', { code: error.code, message: error.message });
      const status =
        error.code === 'not_configured' || error.code === 'credentials_invalid' ? statusCodes.BAD_REQUEST : statusCodes.INTERNAL_SERVER_ERROR;
      return Response.json({ code: error.code, errors: [{ message: error.message }] }, { status });
    }
    if (error instanceof PlayConnectorError) {
      logger.error('[play-connector] infosessions request failed', { code: error.code, message: error.message });
      return Response.json({ code: error.code, errors: [{ message: error.message }] }, { status: statusCodes.INTERNAL_SERVER_ERROR });
    }
    logger.exception(error, { route: 'GET /api/play-infosessions' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
