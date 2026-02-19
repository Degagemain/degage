import { CarPriceEstimate } from '@/domain/car-price-estimate.model';
import { dbCarPriceEstimateRead } from '@/storage/car-price-estimate/car-price-estimate.read';

export const readCarPriceEstimate = async (id: string): Promise<CarPriceEstimate> => {
  return dbCarPriceEstimateRead(id);
};
