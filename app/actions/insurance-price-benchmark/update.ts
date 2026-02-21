import * as z from 'zod';
import { InsurancePriceBenchmark, insurancePriceBenchmarkSchema } from '@/domain/insurance-price-benchmark.model';
import { dbInsurancePriceBenchmarkUpdate } from '@/storage/insurance-price-benchmark/insurance-price-benchmark.update';

export const updateInsurancePriceBenchmark = async (b: InsurancePriceBenchmark): Promise<InsurancePriceBenchmark> => {
  const validated = insurancePriceBenchmarkSchema.parse(b);
  z.uuid().parse(validated.id);
  return dbInsurancePriceBenchmarkUpdate(validated);
};
