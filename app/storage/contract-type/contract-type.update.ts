import type { ContractType } from '@/domain/contract-type.model';
import { getPrismaClient } from '@/storage/utils';
import { contractTypeInclude, contractTypeToDbUpdate, dbContractTypeToDomain } from './contract-type.mappers';

export const dbContractTypeUpdate = async (contractType: ContractType): Promise<ContractType> => {
  const prisma = getPrismaClient();
  const updated = await prisma.contractType.update({
    where: { id: contractType.id! },
    data: contractTypeToDbUpdate(contractType),
    include: contractTypeInclude,
  });
  return dbContractTypeToDomain(updated);
};

export const dbContractTypeUpdateTemplateEnvelopeId = async (id: string, documensoTemplateEnvelopeId: string): Promise<ContractType> => {
  const prisma = getPrismaClient();
  const updated = await prisma.contractType.update({
    where: { id },
    data: { documensoTemplateEnvelopeId },
    include: contractTypeInclude,
  });
  return dbContractTypeToDomain(updated);
};
