import type { Contract } from '@/domain/contract.model';
import { getPrismaClient } from '@/storage/utils';
import { contractInclude, contractToDbCreate, dbContractToDomain } from './contract.mappers';

export const dbContractCreate = async (contract: Contract): Promise<Contract> => {
  const prisma = getPrismaClient();
  const created = await prisma.contract.create({
    data: contractToDbCreate(contract),
    include: contractInclude,
  });
  return dbContractToDomain(created);
};
