import { FuelType } from '@/domain/fuel-type.model';
import { FuelTypeFilter } from '@/domain/fuel-type.filter';
import { Page } from '@/domain/page.model';
import { dbFuelTypeSearch } from '@/storage/fuel-type/fuel-type.search';

export const searchFuelTypes = async (filter: FuelTypeFilter): Promise<Page<FuelType>> => {
  return dbFuelTypeSearch(filter);
};
