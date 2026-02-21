import { CarTaxFlatRate } from '@/domain/car-tax-flat-rate.model';
import { CarTaxFlatRateFilter } from '@/domain/car-tax-flat-rate.filter';
import { Page } from '@/domain/page.model';
import { dbCarTaxFlatRateSearch } from '@/storage/car-tax-flat-rate/car-tax-flat-rate.search';

export const searchCarTaxFlatRates = async (filter: CarTaxFlatRateFilter): Promise<Page<CarTaxFlatRate>> => {
  return dbCarTaxFlatRateSearch(filter);
};
