import { CarType } from '@/domain/car-type.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { carTypeToDbUpdate, dbCarTypeToDomain } from './car-type.mappers';

export const dbCarTypeUpdate = async (carType: CarType): Promise<CarType> => {
  const prisma = getPrismaClient();
  const updated = await prisma.carType.update({
    where: { id: carType.id! },
    data: carTypeToDbUpdate(carType),
    include: { translations: true },
  });
  return dbCarTypeToDomain(updated, getRequestContentLocale());
};
