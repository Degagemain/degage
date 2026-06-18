import { randomBytes } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { decryptPlayConnectorSecret, encryptPlayConnectorSecret } from '@/play-connector/crypto';

const TEST_KEY = randomBytes(32).toString('base64');

describe('play-connector crypto', () => {
  beforeEach(() => {
    process.env.PLAY_CONNECTOR_ENCRYPTION_KEY = TEST_KEY;
  });

  afterEach(() => {
    delete process.env.PLAY_CONNECTOR_ENCRYPTION_KEY;
  });

  it('round-trips plaintext', () => {
    const encrypted = encryptPlayConnectorSecret('secret-password');
    expect(encrypted).not.toBe('secret-password');
    expect(decryptPlayConnectorSecret(encrypted)).toBe('secret-password');
  });

  it('throws when key is missing', () => {
    delete process.env.PLAY_CONNECTOR_ENCRYPTION_KEY;
    expect(() => encryptPlayConnectorSecret('x')).toThrow('PLAY_CONNECTOR_ENCRYPTION_KEY is not configured');
  });
});
