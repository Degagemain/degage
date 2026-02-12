import { CarType } from '@/domain/car-type.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbCarTypeToDomain } from './car-type.mappers';

export const dbCarTypeRead = async (id: string): Promise<CarType> => {
  const prisma = getPrismaClient();
  const carType = await prisma.carType.findUniqueOrThrow({
    where: { id },
    include: { translations: true },
  });
  return dbCarTypeToDomain(carType, getRequestContentLocale());
};
