import type { ContractType } from '@/domain/contract-type.model';
import type { ContractTypeCodeValue } from '@/domain/contract-type.model';
import { getPrismaClient } from '@/storage/utils';
import { contractTypeInclude, dbContractTypeToDomain } from './contract-type.mappers';

export const dbContractTypeRead = async (id: string): Promise<ContractType> => {
  const prisma = getPrismaClient();
  const row = await prisma.contractType.findUniqueOrThrow({
    where: { id },
    include: contractTypeInclude,
  });
  return dbContractTypeToDomain(row);
};

export const dbContractTypeReadByCode = async (code: ContractTypeCodeValue): Promise<ContractType | null> => {
  const prisma = getPrismaClient();
  const row = await prisma.contractType.findUnique({
    where: { code },
    include: contractTypeInclude,
  });
  return row ? dbContractTypeToDomain(row) : null;
};
