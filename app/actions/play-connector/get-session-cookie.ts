import { logger } from '@/lib/logger';
import { PlayConnectorActionError, playConnectorActionErrorCodes } from '@/domain/play-connector.errors';
import { decryptPlayConnectorSecret, encryptPlayConnectorSecret } from '@/play-connector/crypto';
import { loginToPlay } from '@/play-connector/login';
import { PlayConnectorError } from '@/play-connector/errors';
import { dbPlayConnectorReadByUserId } from '@/storage/play-connector/play-connector.read';
import { dbPlayConnectorRecordLoginFailure } from '@/storage/play-connector/play-connector.record-login-failure';
import { dbPlayConnectorUpdateSession } from '@/storage/play-connector/play-connector.update-session';

const RETRY_DELAY_MS = 2000;
const MAX_LOGIN_ATTEMPTS = 2;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export type PlaySessionCookieResult = {
  cookieHeader: string;
};

export const getPlaySessionCookie = async (userId: string): Promise<PlaySessionCookieResult> => {
  const row = await dbPlayConnectorReadByUserId(userId);
  if (!row) {
    throw new PlayConnectorActionError(playConnectorActionErrorCodes.notConfigured, 'Play connector is not configured');
  }

  const now = new Date();
  if (row.loginBlockedUntil && row.loginBlockedUntil.getTime() > now.getTime()) {
    throw new PlayConnectorActionError(playConnectorActionErrorCodes.credentialsInvalid, 'Play connector credentials are temporarily blocked');
  }

  if (row.encryptedSessionCookie && row.sessionExpiresAt && row.sessionExpiresAt.getTime() > now.getTime()) {
    return { cookieHeader: decryptPlayConnectorSecret(row.encryptedSessionCookie) };
  }

  const password = decryptPlayConnectorSecret(row.encryptedPassword);
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_LOGIN_ATTEMPTS; attempt++) {
    try {
      const login = await loginToPlay(row.email, password);
      const encryptedSessionCookie = encryptPlayConnectorSecret(login.cookieHeader);

      await dbPlayConnectorUpdateSession({
        userId,
        encryptedSessionCookie,
        sessionExpiresAt: login.expiresAt,
      });

      return { cookieHeader: login.cookieHeader };
    } catch (error) {
      lastError = error;
      if (attempt < MAX_LOGIN_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  await dbPlayConnectorRecordLoginFailure(userId);

  if (lastError instanceof PlayConnectorError) {
    logger.error('[play-connector] session refresh failed after retries', {
      code: playConnectorActionErrorCodes.loginFailed,
      userId,
      attempts: MAX_LOGIN_ATTEMPTS,
    });
    throw new PlayConnectorActionError(playConnectorActionErrorCodes.loginFailed, 'Play login failed');
  }

  throw lastError;
};
