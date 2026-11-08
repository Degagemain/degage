import type { ContractType } from '@/domain/contract-type.model';
import type { ContractTypeCodeValue } from '@/domain/contract-type.model';
import { dbContractTypeRead, dbContractTypeReadByCode } from '@/storage/contract-type/contract-type.read';

export const readContractType = async (id: string): Promise<ContractType> => {
  return dbContractTypeRead(id);
};

export const readContractTypeByCode = async (code: ContractTypeCodeValue): Promise<ContractType | null> => {
  return dbContractTypeReadByCode(code);
};
