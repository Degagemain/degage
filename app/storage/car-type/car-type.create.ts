import { CarType } from '@/domain/car-type.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { carTypeToDbCreate, dbCarTypeToDomain } from './car-type.mappers';

export const dbCarTypeCreate = async (carType: CarType): Promise<CarType> => {
  const prisma = getPrismaClient();
  const created = await prisma.carType.create({
    data: carTypeToDbCreate(carType),
    include: { translations: true },
  });
  return dbCarTypeToDomain(created, getRequestContentLocale());
};
