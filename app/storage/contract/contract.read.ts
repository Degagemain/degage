import type { Contract } from '@/domain/contract.model';
import { getPrismaClient } from '@/storage/utils';
import { contractInclude, dbContractToDomain } from './contract.mappers';

export const dbContractRead = async (id: string): Promise<Contract> => {
  const prisma = getPrismaClient();
  const row = await prisma.contract.findUniqueOrThrow({
    where: { id },
    include: contractInclude,
  });
  return dbContractToDomain(row);
};

export const dbContractReadByDocumensoEnvelopeId = async (documensoDocumentEnvelopeId: string): Promise<Contract | null> => {
  const prisma = getPrismaClient();
  const row = await prisma.contract.findFirst({
    where: { documensoDocumentEnvelopeId },
    include: contractInclude,
  });
  return row ? dbContractToDomain(row) : null;
};
