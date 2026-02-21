import { InsurancePriceBenchmark, insurancePriceBenchmarkSchema } from '@/domain/insurance-price-benchmark.model';
import { dbInsurancePriceBenchmarkCreate } from '@/storage/insurance-price-benchmark/insurance-price-benchmark.create';

export const createInsurancePriceBenchmark = async (b: InsurancePriceBenchmark): Promise<InsurancePriceBenchmark> => {
  const validated = insurancePriceBenchmarkSchema.parse(b);
  return dbInsurancePriceBenchmarkCreate(validated);
};
