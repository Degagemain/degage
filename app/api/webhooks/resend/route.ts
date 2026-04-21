import { NextResponse, after } from 'next/server';
import { processInboundSupportEmail } from '@/actions/support/process-inbound-email';
import { getResendClient } from '@/integrations/resend';
import { withPublic } from '@/api/with-context';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const maxDuration = 60;

type ResendReceivedEvent = {
  type?: string;
  data?: {
    to?: string[];
  };
};

const normalizeAddress = (value: string): string => {
  const trimmed = value.trim().toLowerCase();
  const match = trimmed.match(/<([^>]+)>/);
  return (match?.[1] ?? trimmed).trim();
};

const parseEvent = async (rawBody: string, request: Request): Promise<ResendReceivedEvent | null> => {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  const resend = getResendClient();

  if (webhookSecret) {
    if (!resend) return null;
    try {
      const verified = resend.webhooks.verify({
        payload: rawBody,
        webhookSecret,
        headers: {
          id: request.headers.get('svix-id') ?? '',
          timestamp: request.headers.get('svix-timestamp') ?? '',
          signature: request.headers.get('svix-signature') ?? '',
        },
      });
      return verified as ResendReceivedEvent;
    } catch {
      return null;
    }
  }

  try {
    return JSON.parse(rawBody) as ResendReceivedEvent;
  } catch {
    return null;
  }
};

export const POST = withPublic(async (request) => {
  const botSupportMail = process.env.BOT_SUPPORT_MAIL?.trim().toLowerCase();
  if (!botSupportMail) {
    logger.error('[resend webhook] missing BOT_SUPPORT_MAIL configuration');
    return NextResponse.json({ code: 'missing_config', errors: [{ message: 'BOT_SUPPORT_MAIL is not configured' }] }, { status: 500 });
  }

  const rawBody = await request.text();
  const event = await parseEvent(rawBody, request);
  if (!event) {
    logger.warn('[resend webhook] rejected invalid webhook payload/signature');
    return NextResponse.json({ code: 'invalid_webhook', errors: [{ message: 'Invalid webhook payload' }] }, { status: 401 });
  }

  const recipients = (event.data?.to ?? []).map((value) => normalizeAddress(value));
  const addressedToSupport = recipients.includes(botSupportMail);
  if (!addressedToSupport) {
    logger.warn('[resend webhook] ignored event not addressed to support mailbox', {
      recipientCount: recipients.length,
    });
    return new NextResponse(null, { status: 200 });
  }

  after(async () => {
    try {
      await processInboundSupportEmail(event);
    } catch (error) {
      logger.exception(error, { phase: 'processInboundSupportEmail' });
    }
  });

  return new NextResponse(null, { status: 200 });
});
