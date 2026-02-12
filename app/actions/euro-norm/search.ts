import { EuroNorm } from '@/domain/euro-norm.model';
import { EuroNormFilter } from '@/domain/euro-norm.filter';
import { Page } from '@/domain/page.model';
import { dbEuroNormSearch } from '@/storage/euro-norm/euro-norm.search';

export const searchEuroNorms = async (filter: EuroNormFilter): Promise<Page<EuroNorm>> => {
  return dbEuroNormSearch(filter);
};
