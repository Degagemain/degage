import { ContractStatus } from '@/domain/contract.model';
import { ContractNotDraftError } from '@/actions/contract/contract.error';
import { dbContractDelete } from '@/storage/contract/contract.delete';
import { dbContractRead } from '@/storage/contract/contract.read';

export const deleteContract = async (id: string): Promise<void> => {
  const existing = await dbContractRead(id);
  if (existing.status !== ContractStatus.Draft) {
    throw new ContractNotDraftError('Only draft contracts can be deleted');
  }
  await dbContractDelete(id);
};
