import { FiscalRegion } from '@/domain/fiscal-region.model';
import { FiscalRegionFilter } from '@/domain/fiscal-region.filter';
import { Page } from '@/domain/page.model';
import { dbFiscalRegionSearch } from '@/storage/fiscal-region/fiscal-region.search';

export const searchFiscalRegions = async (filter: FiscalRegionFilter): Promise<Page<FiscalRegion>> => {
  return dbFiscalRegionSearch(filter);
};
