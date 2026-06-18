import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';

import { disconnectPlayConnector } from '@/actions/play-connector/disconnect';
import { linkPlayConnector } from '@/actions/play-connector/link';
import { readPlayConnectorStatus } from '@/actions/play-connector/read-status';
import { PlayConnectorActionError } from '@/domain/play-connector.errors';
import { playConnectorLinkInputSchema } from '@/domain/play-connector.model';
import { safeParseRequestJson } from '@/api/utils';
import { statusCodes } from '@/api/status-codes';
import { withAuth } from '@/api/with-context';

export const GET = withAuth(async (_request, _context, session) => {
  const status = await readPlayConnectorStatus(session.user.id);
  return Response.json(status);
});

export const PUT = withAuth(async (request: NextRequest, _context, session) => {
  const { data, errorResponse } = await safeParseRequestJson(request);
  if (errorResponse) return errorResponse;

  const parsed = playConnectorLinkInputSchema.safeParse(data);
  if (!parsed.success) {
    return Response.json({ code: 'validation_error', errors: parsed.error.issues }, { status: statusCodes.BAD_REQUEST });
  }

  try {
    const status = await linkPlayConnector(session.user.id, parsed.data);
    return Response.json(status);
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ code: 'validation_error', errors: error.issues }, { status: statusCodes.BAD_REQUEST });
    }
    if (error instanceof PlayConnectorActionError) {
      return Response.json({ code: error.code, errors: [{ message: error.message }] }, { status: statusCodes.BAD_REQUEST });
    }
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
});

export const DELETE = withAuth(async (_request, _context, session) => {
  const status = await disconnectPlayConnector(session.user.id);
  return Response.json(status);
});
