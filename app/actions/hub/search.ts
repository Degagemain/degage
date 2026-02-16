import { Hub } from '@/domain/hub.model';
import { HubFilter } from '@/domain/hub.filter';
import { Page } from '@/domain/page.model';
import { dbHubSearch } from '@/storage/hub/hub.search';

export const searchHubs = async (filter: HubFilter): Promise<Page<Hub>> => {
  return dbHubSearch(filter);
};
