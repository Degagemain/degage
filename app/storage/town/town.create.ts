import { Town } from '@/domain/town.model';
import { getPrismaClient } from '@/storage/utils';
import { dbTownToDomain, townToDbCreate } from './town.mappers';

export const dbTownCreate = async (town: Town): Promise<Town> => {
  const prisma = getPrismaClient();
  const created = await prisma.town.create({
    data: townToDbCreate(town),
  });
  return dbTownToDomain(created);
};
