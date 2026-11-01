import type { ContractType } from '@/domain/contract-type.model';
import type { ContractTypeCodeValue } from '@/domain/contract-type.model';
import type { Prisma } from '@/storage/client/client';

export const contractTypeInclude = {
  defaultSignee: true,
  viewers: { include: { user: true } },
} satisfies Prisma.ContractTypeInclude;

export type ContractTypeWithRelations = Prisma.ContractTypeGetPayload<{ include: typeof contractTypeInclude }>;

export const dbContractTypeToDomain = (row: ContractTypeWithRelations): ContractType => ({
  id: row.id,
  code: row.code as ContractTypeCodeValue,
  name: row.name,
  defaultSignee: row.defaultSignee
    ? {
        id: row.defaultSignee.id,
        name: row.defaultSignee.name,
      }
    : null,
  defaultViewers: row.viewers.map((viewer) => ({
    id: viewer.user.id,
    name: viewer.user.name,
  })),
  documensoTemplateEnvelopeId: row.documensoTemplateEnvelopeId,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const contractTypeToDbCreate = (contractType: ContractType): Prisma.ContractTypeCreateInput => ({
  code: contractType.code,
  name: contractType.name,
  documensoTemplateEnvelopeId: contractType.documensoTemplateEnvelopeId,
  defaultSignee: contractType.defaultSignee ? { connect: { id: contractType.defaultSignee.id } } : undefined,
  viewers: {
    create: contractType.defaultViewers.map((viewer) => ({
      user: { connect: { id: viewer.id } },
    })),
  },
});

export const contractTypeToDbUpdate = (contractType: ContractType): Prisma.ContractTypeUpdateInput => ({
  code: contractType.code,
  name: contractType.name,
  documensoTemplateEnvelopeId: contractType.documensoTemplateEnvelopeId,
  defaultSignee: contractType.defaultSignee ? { connect: { id: contractType.defaultSignee.id } } : { disconnect: true },
  viewers: {
    deleteMany: {},
    create: contractType.defaultViewers.map((viewer) => ({
      user: { connect: { id: viewer.id } },
    })),
  },
});
