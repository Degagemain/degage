import { Town } from '@/domain/town.model';
import { getPrismaClient } from '@/storage/utils';
import { dbTownToDomainWithRelations } from './town.mappers';

export const dbTownRead = async (id: string): Promise<Town> => {
  const prisma = getPrismaClient();
  const town = await prisma.town.findUniqueOrThrow({
    where: { id },
    include: { province: true, simulationRegion: true },
  });
  return dbTownToDomainWithRelations(town);
};
