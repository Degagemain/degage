import { SystemParameter } from '@/domain/system-parameter.model';
import { SystemParameterFilter } from '@/domain/system-parameter.filter';
import { Page } from '@/domain/page.model';
import { dbSystemParameterSearch } from '@/storage/system-parameter/system-parameter.search';

export const searchSystemParameters = async (filter: SystemParameterFilter): Promise<Page<SystemParameter>> => {
  return dbSystemParameterSearch(filter);
};
