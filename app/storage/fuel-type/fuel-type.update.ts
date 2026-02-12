import { FuelType } from '@/domain/fuel-type.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbFuelTypeToDomain, fuelTypeToDbUpdate } from './fuel-type.mappers';

export const dbFuelTypeUpdate = async (fuelType: FuelType): Promise<FuelType> => {
  const prisma = getPrismaClient();
  const updated = await prisma.fuelType.update({
    where: { id: fuelType.id! },
    data: fuelTypeToDbUpdate(fuelType),
    include: { translations: true },
  });
  return dbFuelTypeToDomain(updated, getRequestContentLocale());
};
