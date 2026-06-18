import type { PlayConnectorStatus } from '@/domain/play-connector.model';
import { dbPlayConnectorReadByUserId } from '@/storage/play-connector/play-connector.read';
import { dbPlayConnectorToStatus } from '@/storage/play-connector/play-connector.mappers';

export const readPlayConnectorStatus = async (userId: string): Promise<PlayConnectorStatus> => {
  const row = await dbPlayConnectorReadByUserId(userId);
  return dbPlayConnectorToStatus(row);
};
