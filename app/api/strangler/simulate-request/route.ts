import { type NextRequest } from 'next/server';
import { statusCodes } from '@/api/status-codes';
import { parseInfosessionTable } from '@/api/strangler/infosession-table.parser';

const DEGAPP_INFOSESSION_URL = 'https://degapp.be/infosession';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cookieHeader } = body as { cookieHeader?: string };

    if (!cookieHeader || typeof cookieHeader !== 'string') {
      return Response.json(
        { code: 'validation_error', errors: [{ message: 'cookieHeader is required' }] },
        { status: statusCodes.BAD_REQUEST },
      );
    }

    const response = await fetch(DEGAPP_INFOSESSION_URL, {
      method: 'GET',
      headers: {
        Cookie: cookieHeader,
      },
    });

    const html = await response.text();

    console.log('[strangler/simulate-request] HTML from degapp.be/infosession:\n', html);

    const infosessions = parseInfosessionTable(html);

    return Response.json({ infosessions, status: response.status });
  } catch (error) {
    console.error('[strangler/simulate-request]', error);
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'Simulate request failed' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
