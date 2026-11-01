import { type Contract, ContractStatus, contractSchema } from '@/domain/contract.model';
import { dbContractCreate } from '@/storage/contract/contract.create';

export const createContract = async (contract: Contract): Promise<Contract> => {
  const validated = contractSchema.parse({
    ...contract,
    status: ContractStatus.Draft,
    document: null,
    documensoDocumentEnvelopeId: null,
  });
  return dbContractCreate(validated);
};
