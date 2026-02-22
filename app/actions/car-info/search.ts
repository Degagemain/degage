import { CarInfo } from '@/domain/car-info.model';
import { CarInfoFilter } from '@/domain/car-info.filter';
import { Page } from '@/domain/page.model';
import { dbCarInfoSearch } from '@/storage/car-info/car-info.search';

export const searchCarInfos = async (filter: CarInfoFilter): Promise<Page<CarInfo>> => {
  return dbCarInfoSearch(filter);
};
