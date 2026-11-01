import type { Contract } from '@/domain/contract.model';
import type { ContractFilter } from '@/domain/contract.filter';
import type { Page } from '@/domain/page.model';
import { dbContractSearch } from '@/storage/contract/contract.search';

export const searchContracts = async (filter: ContractFilter): Promise<Page<Contract>> => {
  return dbContractSearch(filter);
};
