import type { PlayConnectorLinkInput } from '@/domain/play-connector.model';
import { playConnectorLinkInputSchema } from '@/domain/play-connector.model';
import { PlayConnectorActionError, playConnectorActionErrorCodes } from '@/domain/play-connector.errors';
import { encryptPlayConnectorSecret } from '@/play-connector/crypto';
import { loginToPlay } from '@/play-connector/login';
import { PlayConnectorError } from '@/play-connector/errors';
import { dbPlayConnectorUpsert } from '@/storage/play-connector/play-connector.upsert';
import { dbPlayConnectorToStatus } from '@/storage/play-connector/play-connector.mappers';

export const linkPlayConnector = async (userId: string, input: PlayConnectorLinkInput) => {
  const validated = playConnectorLinkInputSchema.parse(input);

  try {
    const login = await loginToPlay(validated.email, validated.password);

    const row = await dbPlayConnectorUpsert({
      userId,
      email: validated.email,
      encryptedPassword: encryptPlayConnectorSecret(validated.password),
      encryptedSessionCookie: encryptPlayConnectorSecret(login.cookieHeader),
      sessionExpiresAt: login.expiresAt,
    });

    return dbPlayConnectorToStatus(row);
  } catch (error) {
    if (error instanceof PlayConnectorError) {
      throw new PlayConnectorActionError(playConnectorActionErrorCodes.linkFailed, 'Play connector link failed');
    }
    throw error;
  }
};
