import { FuelType } from '@/domain/fuel-type.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbFuelTypeToDomain } from './fuel-type.mappers';

export const dbFuelTypeRead = async (id: string): Promise<FuelType> => {
  const prisma = getPrismaClient();
  const fuelType = await prisma.fuelType.findUniqueOrThrow({
    where: { id },
    include: { translations: true },
  });
  return dbFuelTypeToDomain(fuelType, getRequestContentLocale());
};
