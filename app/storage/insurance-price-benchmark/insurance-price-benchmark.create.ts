import { InsurancePriceBenchmark } from '@/domain/insurance-price-benchmark.model';
import { getPrismaClient } from '@/storage/utils';
import { dbInsurancePriceBenchmarkToDomain, insurancePriceBenchmarkToDbCreate } from './insurance-price-benchmark.mappers';

export const dbInsurancePriceBenchmarkCreate = async (b: InsurancePriceBenchmark): Promise<InsurancePriceBenchmark> => {
  const prisma = getPrismaClient();
  const created = await prisma.insurancePriceBenchmark.create({
    data: insurancePriceBenchmarkToDbCreate(b),
  });
  return dbInsurancePriceBenchmarkToDomain(created);
};
