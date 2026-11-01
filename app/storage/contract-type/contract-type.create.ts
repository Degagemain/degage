import type { ContractType } from '@/domain/contract-type.model';
import { getPrismaClient } from '@/storage/utils';
import { contractTypeInclude, contractTypeToDbCreate, dbContractTypeToDomain } from './contract-type.mappers';

export const dbContractTypeCreate = async (contractType: ContractType): Promise<ContractType> => {
  const prisma = getPrismaClient();
  const created = await prisma.contractType.create({
    data: contractTypeToDbCreate(contractType),
    include: contractTypeInclude,
  });
  return dbContractTypeToDomain(created);
};
