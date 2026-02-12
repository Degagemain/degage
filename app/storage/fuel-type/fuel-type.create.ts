import { FuelType } from '@/domain/fuel-type.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbFuelTypeToDomain, fuelTypeToDbCreate } from './fuel-type.mappers';

export const dbFuelTypeCreate = async (fuelType: FuelType): Promise<FuelType> => {
  const prisma = getPrismaClient();
  const created = await prisma.fuelType.create({
    data: fuelTypeToDbCreate(fuelType),
    include: { translations: true },
  });
  return dbFuelTypeToDomain(created, getRequestContentLocale());
};
