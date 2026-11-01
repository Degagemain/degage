import type { ContractType } from '@/domain/contract-type.model';
import type { ContractTypeFilter } from '@/domain/contract-type.filter';
import type { Page } from '@/domain/page.model';
import type { Prisma } from '@/storage/client/client';
import { getPrismaClient } from '@/storage/utils';
import { contractTypeInclude, dbContractTypeToDomain } from './contract-type.mappers';

export const filterToQuery = (filter: ContractTypeFilter): Prisma.ContractTypeWhereInput => {
  const q = filter.query?.trim();
  if (!q) return {};
  return {
    OR: [{ code: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }],
  };
};

export const dbContractTypeSearch = async (filter: ContractTypeFilter): Promise<Page<ContractType>> => {
  const prisma = getPrismaClient();
  const where = filterToQuery(filter);
  const total = await prisma.contractType.count({ where });
  const rows = await prisma.contractType.findMany({
    where,
    skip: filter.skip,
    take: filter.take,
    orderBy: filter.sortBy ? { [filter.sortBy]: filter.sortOrder } : undefined,
    include: contractTypeInclude,
  });
  return {
    records: rows.map(dbContractTypeToDomain),
    total,
  };
};
