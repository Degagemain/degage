import { TownFilter } from '@/domain/town.filter';
import { Town } from '@/domain/town.model';
import { Page } from '@/domain/page.model';
import { dbTownSearch } from '@/storage/town/town.search';

export const searchTowns = async (filter: TownFilter): Promise<Page<Town>> => {
  return dbTownSearch(filter);
};
