import { Hub } from '@/domain/hub.model';
import { getPrismaClient } from '@/storage/utils';
import { dbHubToDomain, hubToDbUpdate } from './hub.mappers';

export const dbHubUpdate = async (hub: Hub): Promise<Hub> => {
  const prisma = getPrismaClient();
  const updated = await prisma.hub.update({
    where: { id: hub.id! },
    data: hubToDbUpdate(hub),
  });
  return dbHubToDomain(updated);
};
