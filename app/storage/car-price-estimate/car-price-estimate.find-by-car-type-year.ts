import { CarPriceEstimate } from '@/domain/car-price-estimate.model';
import { getPrismaClient } from '@/storage/utils';
import { dbCarPriceEstimateToDomain } from './car-price-estimate.mappers';

export const dbCarPriceEstimateFindByCarTypeAndYear = async (carTypeId: string, year: number): Promise<CarPriceEstimate | null> => {
  const prisma = getPrismaClient();
  const result = await prisma.carPriceEstimate.findFirst({
    where: { carTypeId, year },
  });
  return result ? dbCarPriceEstimateToDomain(result) : null;
};
