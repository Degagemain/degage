import { CarType } from '@/domain/car-type.model';
import { getPrismaClient } from '@/storage/utils';
import { carTypeToDbUpdate, dbCarTypeToDomain } from './car-type.mappers';

export const dbCarTypeUpdate = async (carType: CarType): Promise<CarType> => {
  const prisma = getPrismaClient();
  const updated = await prisma.carType.update({
    where: { id: carType.id! },
    data: carTypeToDbUpdate(carType),
  });
  return dbCarTypeToDomain(updated);
};
