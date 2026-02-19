import { CarPriceEstimate } from '@/domain/car-price-estimate.model';
import { getPrismaClient } from '@/storage/utils';
import { carPriceEstimateToDbUpdate, dbCarPriceEstimateToDomain } from './car-price-estimate.mappers';

export const dbCarPriceEstimateUpdate = async (cpe: CarPriceEstimate): Promise<CarPriceEstimate> => {
  const prisma = getPrismaClient();
  const updated = await prisma.carPriceEstimate.update({
    where: { id: cpe.id! },
    data: carPriceEstimateToDbUpdate(cpe),
  });
  return dbCarPriceEstimateToDomain(updated);
};
