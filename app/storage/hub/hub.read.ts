import { Hub } from '@/domain/hub.model';
import { getPrismaClient } from '@/storage/utils';
import { dbHubToDomain } from './hub.mappers';

export const dbHubRead = async (id: string): Promise<Hub> => {
  const prisma = getPrismaClient();
  const hub = await prisma.hub.findUniqueOrThrow({
    where: { id },
  });
  return dbHubToDomain(hub);
};
