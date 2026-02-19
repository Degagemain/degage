import { CarPriceEstimate } from '@/domain/car-price-estimate.model';
import { getPrismaClient } from '@/storage/utils';
import { carPriceEstimateToDbCreate, dbCarPriceEstimateToDomain } from './car-price-estimate.mappers';

export const dbCarPriceEstimateCreate = async (cpe: CarPriceEstimate): Promise<CarPriceEstimate> => {
  const prisma = getPrismaClient();
  const created = await prisma.carPriceEstimate.create({
    data: carPriceEstimateToDbCreate(cpe),
  });
  return dbCarPriceEstimateToDomain(created);
};
