import { Town } from '@/domain/town.model';
import { getPrismaClient } from '@/storage/utils';
import { dbTownToDomain, townToDbUpdate } from './town.mappers';

export const dbTownUpdate = async (town: Town): Promise<Town> => {
  const prisma = getPrismaClient();
  const updated = await prisma.town.update({
    where: { id: town.id! },
    data: townToDbUpdate(town),
  });
  return dbTownToDomain(updated);
};
