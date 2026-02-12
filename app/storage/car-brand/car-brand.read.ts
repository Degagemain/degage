import { CarBrand } from '@/domain/car-brand.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { dbCarBrandToDomain } from './car-brand.mappers';

export const dbCarBrandRead = async (id: string): Promise<CarBrand> => {
  const prisma = getPrismaClient();
  const carBrand = await prisma.carBrand.findUniqueOrThrow({
    where: { id },
    include: { translations: true },
  });
  return dbCarBrandToDomain(carBrand, getRequestContentLocale());
};
