import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/server', async () => {
  const actual = await vi.importActual<typeof import('next/server')>('next/server');
  return {
    ...actual,
    after: (callback: () => void | Promise<void>) => {
      void callback();
    },
  };
});

vi.mock('@/actions/support/process-inbound-email', () => ({
  processInboundSupportEmail: vi.fn(),
}));

vi.mock('@/integrations/resend', () => ({
  getResendClient: vi.fn(),
}));

import { POST } from '@/api/webhooks/resend/route';
import { processInboundSupportEmail } from '@/actions/support/process-inbound-email';

describe('POST /api/webhooks/resend', () => {
  const originalBotSupportMail = process.env.BOT_SUPPORT_MAIL;
  const originalWebhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  beforeEach(() => {
    process.env.BOT_SUPPORT_MAIL = 'support@example.com';
    delete process.env.RESEND_WEBHOOK_SECRET;
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env.BOT_SUPPORT_MAIL = originalBotSupportMail;
    process.env.RESEND_WEBHOOK_SECRET = originalWebhookSecret;
  });

  it('returns 200 and triggers background processing for matching recipient', async () => {
    const request = new Request('http://localhost/api/webhooks/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'email.received',
        data: {
          to: ['Support <support@example.com>'],
        },
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(processInboundSupportEmail).toHaveBeenCalledTimes(1);
  });

  it('returns 200 but ignores emails not sent to BOT_SUPPORT_MAIL', async () => {
    const request = new Request('http://localhost/api/webhooks/resend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'email.received',
        data: {
          to: ['other@example.com'],
        },
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(processInboundSupportEmail).not.toHaveBeenCalled();
  });
});
