import { type Contract, ContractStatus, contractSchema } from '@/domain/contract.model';
import { ContractNotDraftError } from '@/actions/contract/contract.error';
import { dbContractRead } from '@/storage/contract/contract.read';
import { dbContractUpdate } from '@/storage/contract/contract.update';

export const updateContract = async (contract: Contract): Promise<Contract> => {
  const existing = await dbContractRead(contract.id!);
  if (existing.status !== ContractStatus.Draft) {
    throw new ContractNotDraftError();
  }

  const validated = contractSchema.parse({
    ...contract,
    status: ContractStatus.Draft,
    document: null,
    documensoDocumentEnvelopeId: null,
  });
  return dbContractUpdate(validated);
};
