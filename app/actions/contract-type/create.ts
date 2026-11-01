import { type ContractType, contractTypeSchema } from '@/domain/contract-type.model';
import { dbContractTypeCreate } from '@/storage/contract-type/contract-type.create';

export const createContractType = async (contractType: ContractType): Promise<ContractType> => {
  const validated = contractTypeSchema.parse({
    ...contractType,
    documensoTemplateEnvelopeId: null,
  });
  return dbContractTypeCreate(validated);
};
