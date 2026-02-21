import { CarTaxEuroNormAdjustment } from '@/domain/car-tax-euro-norm-adjustment.model';
import { CarTaxEuroNormAdjustmentFilter } from '@/domain/car-tax-euro-norm-adjustment.filter';
import { Page } from '@/domain/page.model';
import { dbCarTaxEuroNormAdjustmentSearch } from '@/storage/car-tax-euro-norm-adjustment/car-tax-euro-norm-adjustment.search';

export const searchCarTaxEuroNormAdjustments = async (filter: CarTaxEuroNormAdjustmentFilter): Promise<Page<CarTaxEuroNormAdjustment>> => {
  return dbCarTaxEuroNormAdjustmentSearch(filter);
};
