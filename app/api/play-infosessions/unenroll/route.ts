import { logger } from '@/lib/logger';
import { unenrollPlayInfosession } from '@/actions/play-infosession/unenroll';
import { PlayConnectorActionError } from '@/domain/play-connector.errors';
import { PlayConnectorError } from '@/play-connector/errors';
import { statusCodes } from '@/api/status-codes';
import { withAuth } from '@/api/with-context';

export const PUT = withAuth(async (_request, _context, session) => {
  try {
    await unenrollPlayInfosession(session.user.id);
    return new Response(null, { status: statusCodes.NO_CONTENT });
  } catch (error) {
    if (error instanceof PlayConnectorActionError) {
      logger.error('[play-connector] infosession unenroll failed', { code: error.code, message: error.message });
      const status =
        error.code === 'not_configured' || error.code === 'credentials_invalid' ? statusCodes.BAD_REQUEST : statusCodes.INTERNAL_SERVER_ERROR;
      return Response.json({ code: error.code, errors: [{ message: error.message }] }, { status });
    }
    if (error instanceof PlayConnectorError) {
      logger.error('[play-connector] infosession unenroll failed', { code: error.code, message: error.message });
      return Response.json({ code: error.code, errors: [{ message: error.message }] }, { status: statusCodes.INTERNAL_SERVER_ERROR });
    }
    logger.exception(error, { route: 'PUT /api/play-infosessions/unenroll' });
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
