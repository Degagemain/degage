import type { ContractType } from '@/domain/contract-type.model';
import type { ContractTypeFilter } from '@/domain/contract-type.filter';
import type { Page } from '@/domain/page.model';
import { dbContractTypeSearch } from '@/storage/contract-type/contract-type.search';

export const searchContractTypes = async (filter: ContractTypeFilter): Promise<Page<ContractType>> => {
  return dbContractTypeSearch(filter);
};
