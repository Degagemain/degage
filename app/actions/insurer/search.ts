import { InsurerFilter } from '@/domain/insurer.filter';
import { dbInsurerSearch } from '@/storage/insurer/insurer.search';

export const searchInsurers = async (filter: InsurerFilter) => {
  return dbInsurerSearch(filter);
};
