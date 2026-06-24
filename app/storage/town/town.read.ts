import { Town } from '@/domain/town.model';
import { getPrismaClient } from '@/storage/utils';
import { dbTownToDomainWithRelations } from './town.mappers';

type TownZipCityRow = {
  id: string;
  name: string;
  municipality: string;
};

const normalizeCity = (value: string): string => value.trim().toLowerCase();

const matchesCity = (town: TownZipCityRow, city: string): boolean => {
  const normalized = normalizeCity(city);
  return normalizeCity(town.name) === normalized || normalizeCity(town.municipality) === normalized;
};

export const dbTownRead = async (id: string): Promise<Town> => {
  const prisma = getPrismaClient();
  const town = await prisma.town.findUniqueOrThrow({
    where: { id },
    include: { province: true, hub: true },
  });
  return dbTownToDomainWithRelations(town);
};

export const dbTownFindByZipAndCity = async (zip: string, city: string): Promise<{ id: string } | null> => {
  const prisma = getPrismaClient();
  const towns = await prisma.town.findMany({
    where: { zip },
    select: { id: true, name: true, municipality: true },
  });

  if (towns.length === 0) {
    return null;
  }

  if (towns.length === 1) {
    return { id: towns[0].id };
  }

  const matches = towns.filter((town) => matchesCity(town, city));
  if (matches.length === 1) {
    return { id: matches[0].id };
  }

  return null;
};
