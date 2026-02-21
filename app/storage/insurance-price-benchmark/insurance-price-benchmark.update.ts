import { InsurancePriceBenchmark } from '@/domain/insurance-price-benchmark.model';
import { getPrismaClient } from '@/storage/utils';
import { dbInsurancePriceBenchmarkToDomain, insurancePriceBenchmarkToDbUpdate } from './insurance-price-benchmark.mappers';

export const dbInsurancePriceBenchmarkUpdate = async (b: InsurancePriceBenchmark): Promise<InsurancePriceBenchmark> => {
  const prisma = getPrismaClient();
  const updated = await prisma.insurancePriceBenchmark.update({
    where: { id: b.id! },
    data: insurancePriceBenchmarkToDbUpdate(b),
  });
  return dbInsurancePriceBenchmarkToDomain(updated);
};
