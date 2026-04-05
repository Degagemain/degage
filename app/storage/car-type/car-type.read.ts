import { CarType } from '@/domain/car-type.model';
import { getRequestContentLocale } from '@/context/request-context';
import { getPrismaClient } from '@/storage/utils';
import { dbCarTypeToDomainWithRelations } from './car-type.mappers';

export const dbCarTypeRead = async (id: string): Promise<CarType> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const carType = await prisma.carType.findUniqueOrThrow({
    where: { id },
    include: {
      brand: { include: { translations: true } },
      fuelType: { include: { translations: true } },
    },
  });
  return dbCarTypeToDomainWithRelations(carType, locale);
};
