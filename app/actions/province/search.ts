import { Province } from '@/domain/province.model';
import { ProvinceFilter } from '@/domain/province.filter';
import { Page } from '@/domain/page.model';
import { dbProvinceSearch } from '@/storage/province/province.search';

export const searchProvinces = async (filter: ProvinceFilter): Promise<Page<Province>> => {
  return dbProvinceSearch(filter);
};
