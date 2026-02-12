import { CarBrand } from '@/domain/car-brand.model';
import { CarBrandFilter } from '@/domain/car-brand.filter';
import { Page } from '@/domain/page.model';
import { dbCarBrandSearch } from '@/storage/car-brand/car-brand.search';

export const searchCarBrands = async (filter: CarBrandFilter): Promise<Page<CarBrand>> => {
  return dbCarBrandSearch(filter);
};
