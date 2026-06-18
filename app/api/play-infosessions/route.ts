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
      const status =
        error.code === 'not_configured' || error.code === 'credentials_invalid' ? statusCodes.BAD_REQUEST : statusCodes.INTERNAL_SERVER_ERROR;
      return Response.json({ code: error.code, errors: [{ message: error.message }] }, { status });
    }
    if (error instanceof PlayConnectorError) {
      return Response.json({ code: error.code, errors: [{ message: error.message }] }, { status: statusCodes.INTERNAL_SERVER_ERROR });
    }
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});
