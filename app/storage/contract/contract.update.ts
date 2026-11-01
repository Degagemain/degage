import type { Contract } from '@/domain/contract.model';
import { getPrismaClient } from '@/storage/utils';
import { contractInclude, contractToDbUpdate, dbContractToDomain } from './contract.mappers';

export const dbContractUpdate = async (contract: Contract): Promise<Contract> => {
  const prisma = getPrismaClient();
  const updated = await prisma.contract.update({
    where: { id: contract.id! },
    data: contractToDbUpdate(contract),
    include: contractInclude,
  });
  return dbContractToDomain(updated);
};

export const dbContractMarkSent = async (id: string, documensoDocumentEnvelopeId: string): Promise<Contract> => {
  const prisma = getPrismaClient();
  const updated = await prisma.contract.update({
    where: { id },
    data: {
      status: 'sent',
      documensoDocumentEnvelopeId,
    },
    include: contractInclude,
  });
  return dbContractToDomain(updated);
};

export const dbContractMarkSigned = async (id: string, documentId: string): Promise<Contract> => {
  const prisma = getPrismaClient();
  const updated = await prisma.contract.update({
    where: { id },
    data: {
      status: 'signed',
      document: { connect: { id: documentId } },
    },
    include: contractInclude,
  });
  return dbContractToDomain(updated);
};
