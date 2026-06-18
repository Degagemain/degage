import type { PlayConnectorStatus } from '@/domain/play-connector.model';
import { dbPlayConnectorDeleteByUserId } from '@/storage/play-connector/play-connector.delete';

export const disconnectPlayConnector = async (userId: string): Promise<PlayConnectorStatus> => {
  await dbPlayConnectorDeleteByUserId(userId);

  return {
    status: 'missing',
    email: null,
    loginBlockedUntil: null,
    sessionExpiresAt: null,
  };
};
