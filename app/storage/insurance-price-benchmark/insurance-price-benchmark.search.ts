import { InsurancePriceBenchmark } from '@/domain/insurance-price-benchmark.model';
import { InsurancePriceBenchmarkFilter } from '@/domain/insurance-price-benchmark.filter';
import { getPrismaClient } from '@/storage/utils';
import { Page } from '@/domain/page.model';
import { Prisma } from '@/storage/client/client';
import { dbInsurancePriceBenchmarkToDomain } from './insurance-price-benchmark.mappers';

export const filterToQuery = (filter: InsurancePriceBenchmarkFilter): Prisma.InsurancePriceBenchmarkWhereInput => {
  return {
    year: filter.year ?? undefined,
  };
};

export const dbInsurancePriceBenchmarkSearch = async (filter: InsurancePriceBenchmarkFilter): Promise<Page<InsurancePriceBenchmark>> => {
  const prisma = getPrismaClient();
  const whereClause = filterToQuery(filter);
  const total = await prisma.insurancePriceBenchmark.count({ where: whereClause });
  const records = await prisma.insurancePriceBenchmark.findMany({
    where: whereClause,
    skip: filter.skip,
    take: filter.take,
    orderBy: { [filter.sortBy]: filter.sortOrder },
  });
  return {
    records: records.map(dbInsurancePriceBenchmarkToDomain),
    total,
  };
};
