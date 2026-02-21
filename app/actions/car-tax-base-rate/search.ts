import { CarTaxBaseRate } from '@/domain/car-tax-base-rate.model';
import { CarTaxBaseRateFilter } from '@/domain/car-tax-base-rate.filter';
import { Page } from '@/domain/page.model';
import { dbCarTaxBaseRateSearch } from '@/storage/car-tax-base-rate/car-tax-base-rate.search';

export const searchCarTaxBaseRates = async (filter: CarTaxBaseRateFilter): Promise<Page<CarTaxBaseRate>> => {
  return dbCarTaxBaseRateSearch(filter);
};
