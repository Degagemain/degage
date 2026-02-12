import { CarBrand } from '@/domain/car-brand.model';
import { getPrismaClient } from '@/storage/utils';
import { getRequestContentLocale } from '@/context/request-context';
import { carBrandToDbUpdate, dbCarBrandToDomain } from './car-brand.mappers';

export const dbCarBrandUpdate = async (carBrand: CarBrand): Promise<CarBrand> => {
  const prisma = getPrismaClient();
  const updated = await prisma.carBrand.update({
    where: { id: carBrand.id! },
    data: carBrandToDbUpdate(carBrand),
    include: { translations: true },
  });
  return dbCarBrandToDomain(updated, getRequestContentLocale());
};
