import { CarPriceEstimate } from '@/domain/car-price-estimate.model';
import { getPrismaClient } from '@/storage/utils';
import { dbCarPriceEstimateToDomain } from './car-price-estimate.mappers';

export const dbCarPriceEstimateRead = async (id: string): Promise<CarPriceEstimate> => {
  const prisma = getPrismaClient();
  const cpe = await prisma.carPriceEstimate.findUniqueOrThrow({
    where: { id },
  });
  return dbCarPriceEstimateToDomain(cpe);
};
