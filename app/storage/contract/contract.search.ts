import type { Contract } from '@/domain/contract.model';
import type { ContractFilter } from '@/domain/contract.filter';
import type { Page } from '@/domain/page.model';
import type { Prisma } from '@/storage/client/client';
import { getPrismaClient } from '@/storage/utils';
import { contractInclude, dbContractToDomain } from './contract.mappers';

export const filterToQuery = (filter: ContractFilter): Prisma.ContractWhereInput => {
  const q = filter.query?.trim();
  return {
    status: filter.status ?? undefined,
    typeId: filter.typeId ?? undefined,
    userId: filter.userId ?? undefined,
    ...(q
      ? {
          OR: [
            { user: { name: { contains: q, mode: 'insensitive' } } },
            { user: { email: { contains: q, mode: 'insensitive' } } },
            { type: { name: { contains: q, mode: 'insensitive' } } },
            { type: { code: { contains: q, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };
};

export const dbContractSearch = async (filter: ContractFilter): Promise<Page<Contract>> => {
  const prisma = getPrismaClient();
  const where = filterToQuery(filter);
  const total = await prisma.contract.count({ where });
  const rows = await prisma.contract.findMany({
    where,
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
    include: contractInclude,
  });
  return {
    records: rows.map(dbContractToDomain),
    total,
  };
};
