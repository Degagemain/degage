import { NextResponse, after } from 'next/server';
import { type DocumensoWebhookEvent, completeContractFromDocumenso } from '@/actions/contract/complete-from-documenso';
import { verifyDocumensoWebhookSecret } from '@/integrations/documenso';
import { withPublic } from '@/api/with-context';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const maxDuration = 60;

export const POST = withPublic(async (request) => {
  if (!verifyDocumensoWebhookSecret(request)) {
    logger.warn('[documenso webhook] rejected invalid secret');
    return NextResponse.json({ code: 'invalid_webhook', errors: [{ message: 'Invalid webhook secret' }] }, { status: 401 });
  }

  let event: DocumensoWebhookEvent;
  try {
    event = (await request.json()) as DocumensoWebhookEvent;
  } catch {
    return NextResponse.json({ code: 'invalid_webhook', errors: [{ message: 'Invalid webhook payload' }] }, { status: 401 });
  }

  after(async () => {
    try {
      await completeContractFromDocumenso(event);
    } catch (error) {
      logger.exception(error, { phase: 'completeContractFromDocumenso' });
    }
  });

  return new NextResponse(null, { status: 200 });
});
