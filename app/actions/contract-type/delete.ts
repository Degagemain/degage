import { dbContractTypeDelete } from '@/storage/contract-type/contract-type.delete';

export const deleteContractType = async (id: string): Promise<void> => {
  await dbContractTypeDelete(id);
};
