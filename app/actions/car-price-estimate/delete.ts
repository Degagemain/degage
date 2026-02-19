import { dbCarPriceEstimateDelete } from '@/storage/car-price-estimate/car-price-estimate.delete';

export const deleteCarPriceEstimate = async (id: string): Promise<void> => {
  await dbCarPriceEstimateDelete(id);
};
