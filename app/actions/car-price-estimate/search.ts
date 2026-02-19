import { CarPriceEstimate } from '@/domain/car-price-estimate.model';
import { CarPriceEstimateFilter } from '@/domain/car-price-estimate.filter';
import { Page } from '@/domain/page.model';
import { dbCarPriceEstimateSearch } from '@/storage/car-price-estimate/car-price-estimate.search';

export const searchCarPriceEstimates = async (filter: CarPriceEstimateFilter): Promise<Page<CarPriceEstimate>> => {
  return dbCarPriceEstimateSearch(filter);
};
