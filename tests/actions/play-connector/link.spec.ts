import { randomBytes } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/play-connector/login', () => ({
  loginToPlay: vi.fn(),
}));

vi.mock('@/storage/play-connector/play-connector.upsert', () => ({
  dbPlayConnectorUpsert: vi.fn(),
}));

import { linkPlayConnector } from '@/actions/play-connector/link';
import { loginToPlay } from '@/play-connector/login';
import { PlayConnectorError } from '@/play-connector/errors';
import { dbPlayConnectorUpsert } from '@/storage/play-connector/play-connector.upsert';
import { playConnectorRecord } from '../../builders/play-connector.builder';

const TEST_KEY = randomBytes(32).toString('base64');

describe('linkPlayConnector', () => {
  beforeEach(() => {
    process.env.PLAY_CONNECTOR_ENCRYPTION_KEY = TEST_KEY;
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.PLAY_CONNECTOR_ENCRYPTION_KEY;
  });

  it('validates login before storing encrypted credentials', async () => {
    vi.mocked(loginToPlay).mockResolvedValueOnce({
      cookieHeader: 'PLAY_SESSION=abc',
      expiresAt: new Date('2026-06-20T09:00:00.000Z'),
    });
    vi.mocked(dbPlayConnectorUpsert).mockResolvedValueOnce(
      playConnectorRecord({
        email: 'user@example.com',
        sessionExpiresAt: new Date('2026-06-20T09:00:00.000Z'),
      }),
    );

    const status = await linkPlayConnector('user-1', {
      email: 'user@example.com',
      password: 'secret',
    });

    expect(loginToPlay).toHaveBeenCalledWith('user@example.com', 'secret');
    expect(dbPlayConnectorUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        email: 'user@example.com',
        encryptedPassword: expect.any(String),
        encryptedSessionCookie: expect.any(String),
      }),
    );
    expect(status.status).toBe('success');
  });

  it('does not store credentials when login fails', async () => {
    vi.mocked(loginToPlay).mockRejectedValueOnce(new PlayConnectorError('login_failed', 'Play login failed'));

    await expect(
      linkPlayConnector('user-1', {
        email: 'user@example.com',
        password: 'wrong',
      }),
    ).rejects.toMatchObject({ code: 'link_failed' });

    expect(dbPlayConnectorUpsert).not.toHaveBeenCalled();
  });
});
