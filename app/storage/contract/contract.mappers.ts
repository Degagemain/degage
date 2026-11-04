import type { Contract } from '@/domain/contract.model';
import type { ContractStatusValue } from '@/domain/contract.model';
import type { ContractTypeCodeValue } from '@/domain/contract-type.model';
import type { Prisma } from '@/storage/client/client';
import { dbDocumentToDomain } from '@/storage/document/document.mappers';

export const contractInclude = {
  user: true,
  type: true,
  document: true,
} satisfies Prisma.ContractInclude;

export type ContractWithRelations = Prisma.ContractGetPayload<{ include: typeof contractInclude }>;

export const dbContractToDomain = (row: ContractWithRelations): Contract => ({
  id: row.id,
  user: {
    id: row.user.id,
    name: row.user.name,
  },
  type: {
    id: row.type.id,
    name: row.type.code,
    code: row.type.code as ContractTypeCodeValue,
  },
  startDate: row.startDate,
  endDate: row.endDate,
  status: row.status as ContractStatusValue,
  document: row.document ? dbDocumentToDomain(row.document) : null,
  documensoDocumentEnvelopeId: row.documensoDocumentEnvelopeId,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const contractToDbCreate = (contract: Contract): Prisma.ContractCreateInput => ({
  user: { connect: { id: contract.user.id } },
  type: { connect: { id: contract.type.id } },
  startDate: contract.startDate,
  endDate: contract.endDate,
  status: contract.status,
  documensoDocumentEnvelopeId: contract.documensoDocumentEnvelopeId,
  document: contract.document?.id ? { connect: { id: contract.document.id } } : undefined,
});

export const contractToDbUpdate = (contract: Contract): Prisma.ContractUpdateInput => ({
  user: { connect: { id: contract.user.id } },
  type: { connect: { id: contract.type.id } },
  startDate: contract.startDate,
  endDate: contract.endDate,
  status: contract.status,
  documensoDocumentEnvelopeId: contract.documensoDocumentEnvelopeId,
  document: contract.document?.id ? { connect: { id: contract.document.id } } : { disconnect: true },
});
