import { CarPriceEstimate, carPriceEstimateSchema } from '@/domain/car-price-estimate.model';
import { dbCarPriceEstimateCreate } from '@/storage/car-price-estimate/car-price-estimate.create';

export const createCarPriceEstimate = async (cpe: CarPriceEstimate): Promise<CarPriceEstimate> => {
  const validated = carPriceEstimateSchema.parse(cpe);
  return dbCarPriceEstimateCreate(validated);
};
