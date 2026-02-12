import { CarBrand } from '@/domain/car-brand.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { carBrandToDbCreate, dbCarBrandToDomain } from './car-brand.mappers';

export const dbCarBrandCreate = async (carBrand: CarBrand): Promise<CarBrand> => {
  const prisma = getPrismaClient();
  const created = await prisma.carBrand.create({
    data: carBrandToDbCreate(carBrand),
    include: { translations: true },
  });
  return dbCarBrandToDomain(created, getRequestContentLocale());
};
