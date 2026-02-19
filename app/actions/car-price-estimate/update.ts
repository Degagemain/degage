import * as z from 'zod';
import { CarPriceEstimate, carPriceEstimateSchema } from '@/domain/car-price-estimate.model';
import { dbCarPriceEstimateUpdate } from '@/storage/car-price-estimate/car-price-estimate.update';

export const updateCarPriceEstimate = async (cpe: CarPriceEstimate): Promise<CarPriceEstimate> => {
  const validated = carPriceEstimateSchema.parse(cpe);
  z.uuid().parse(validated.id);
  return dbCarPriceEstimateUpdate(validated);
};
