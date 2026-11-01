import type { Contract } from '@/domain/contract.model';
import { dbContractRead } from '@/storage/contract/contract.read';

export const readContract = async (id: string): Promise<Contract> => {
  return dbContractRead(id);
};
