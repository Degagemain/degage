import { createHmac } from 'crypto';
import { describe, expect, it } from 'vitest';

import { verifyNotionWebhookSignature } from '@/actions/notion/verify-webhook-signature';

describe('verifyNotionWebhookSignature', () => {
  it('accepts a valid sha256 signature', () => {
    const token = 'secret_test_token';
    const body = '{"type":"page.created"}';
    const sig = `sha256=${createHmac('sha256', token).update(body, 'utf8').digest('hex')}`;
    expect(verifyNotionWebhookSignature(body, sig, token)).toBe(true);
  });

  it('rejects wrong signature', () => {
    expect(verifyNotionWebhookSignature('{}', 'sha256=deadbeef', 'token')).toBe(false);
  });
});
