import { Hub } from '@/domain/hub.model';
import { getPrismaClient } from '@/storage/utils';
import { dbHubToDomain, hubToDbCreate } from './hub.mappers';

export const dbHubCreate = async (hub: Hub): Promise<Hub> => {
  const prisma = getPrismaClient();
  const created = await prisma.hub.create({
    data: hubToDbCreate(hub),
  });
  return dbHubToDomain(created);
};
