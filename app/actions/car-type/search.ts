import { CarType } from '@/domain/car-type.model';
import { CarTypeFilter } from '@/domain/car-type.filter';
import { Page } from '@/domain/page.model';
import { dbCarTypeSearch } from '@/storage/car-type/car-type.search';

export const searchCarTypes = async (filter: CarTypeFilter): Promise<Page<CarType>> => {
  return dbCarTypeSearch(filter);
};
