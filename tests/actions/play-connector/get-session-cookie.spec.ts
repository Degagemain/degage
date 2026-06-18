import { randomBytes } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/play-connector/login', () => ({
  loginToPlay: vi.fn(),
}));

vi.mock('@/storage/play-connector/play-connector.read', () => ({
  dbPlayConnectorReadByUserId: vi.fn(),
}));

vi.mock('@/storage/play-connector/play-connector.update-session', () => ({
  dbPlayConnectorUpdateSession: vi.fn(),
}));

vi.mock('@/storage/play-connector/play-connector.record-login-failure', () => ({
  dbPlayConnectorRecordLoginFailure: vi.fn(),
}));

import { getPlaySessionCookie } from '@/actions/play-connector/get-session-cookie';
import { loginToPlay } from '@/play-connector/login';
import { PlayConnectorError } from '@/play-connector/errors';
import { encryptPlayConnectorSecret } from '@/play-connector/crypto';
import { dbPlayConnectorReadByUserId } from '@/storage/play-connector/play-connector.read';
import { dbPlayConnectorUpdateSession } from '@/storage/play-connector/play-connector.update-session';
import { dbPlayConnectorRecordLoginFailure } from '@/storage/play-connector/play-connector.record-login-failure';
import { playConnectorRecord } from '../../builders/play-connector.builder';

const TEST_KEY = randomBytes(32).toString('base64');

describe('getPlaySessionCookie', () => {
  beforeEach(() => {
    process.env.PLAY_CONNECTOR_ENCRYPTION_KEY = TEST_KEY;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    delete process.env.PLAY_CONNECTOR_ENCRYPTION_KEY;
  });

  it('throws when connector is not configured', async () => {
    vi.mocked(dbPlayConnectorReadByUserId).mockResolvedValueOnce(null);

    await expect(getPlaySessionCookie('user-1')).rejects.toMatchObject({ code: 'not_configured' });
  });

  it('returns cached cookie when session is still valid', async () => {
    vi.setSystemTime(new Date('2026-06-18T12:00:00.000Z'));
    const cookieHeader = 'PLAY_SESSION=cached';
    vi.mocked(dbPlayConnectorReadByUserId).mockResolvedValueOnce(
      playConnectorRecord({
        encryptedSessionCookie: encryptPlayConnectorSecret(cookieHeader),
        sessionExpiresAt: new Date('2026-06-18T13:00:00.000Z'),
      }),
    );

    const result = await getPlaySessionCookie('user-1');
    expect(result.cookieHeader).toBe(cookieHeader);
    expect(loginToPlay).not.toHaveBeenCalled();
  });

  it('blocks login attempts during backoff', async () => {
    vi.setSystemTime(new Date('2026-06-18T12:00:00.000Z'));
    vi.mocked(dbPlayConnectorReadByUserId).mockResolvedValueOnce(
      playConnectorRecord({
        loginBlockedUntil: new Date('2026-06-18T12:00:05.000Z'),
      }),
    );

    await expect(getPlaySessionCookie('user-1')).rejects.toMatchObject({ code: 'credentials_invalid' });
    expect(loginToPlay).not.toHaveBeenCalled();
  });

  it('retries login twice and records failure', async () => {
    vi.setSystemTime(new Date('2026-06-18T12:00:00.000Z'));
    vi.mocked(dbPlayConnectorReadByUserId).mockResolvedValueOnce(
      playConnectorRecord({
        encryptedPassword: encryptPlayConnectorSecret('secret'),
        encryptedSessionCookie: null,
        sessionExpiresAt: null,
      }),
    );
    vi.mocked(loginToPlay).mockRejectedValue(new PlayConnectorError('login_failed', 'Play login failed'));
    vi.mocked(dbPlayConnectorRecordLoginFailure).mockResolvedValueOnce(playConnectorRecord({ credentialsInvalid: true }));

    const promise = getPlaySessionCookie('user-1').catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(2000);
    const error = await promise;

    expect(error).toMatchObject({ code: 'login_failed' });
    expect(loginToPlay).toHaveBeenCalledTimes(2);
    expect(dbPlayConnectorRecordLoginFailure).toHaveBeenCalledWith('user-1');
  });

  it('refreshes session and clears failure state on successful login', async () => {
    vi.setSystemTime(new Date('2026-06-18T12:00:00.000Z'));
    vi.mocked(dbPlayConnectorReadByUserId).mockResolvedValueOnce(
      playConnectorRecord({
        encryptedPassword: encryptPlayConnectorSecret('secret'),
        encryptedSessionCookie: null,
        sessionExpiresAt: null,
      }),
    );
    vi.mocked(loginToPlay).mockResolvedValueOnce({
      cookieHeader: 'PLAY_SESSION=fresh',
      expiresAt: new Date('2026-06-18T13:00:00.000Z'),
    });
    vi.mocked(dbPlayConnectorUpdateSession).mockResolvedValueOnce(playConnectorRecord());

    const result = await getPlaySessionCookie('user-1');
    expect(result.cookieHeader).toBe('PLAY_SESSION=fresh');
    expect(dbPlayConnectorUpdateSession).toHaveBeenCalled();
  });
});
