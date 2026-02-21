import { InsurancePriceBenchmark } from '@/domain/insurance-price-benchmark.model';
import { dbInsurancePriceBenchmarkRead } from '@/storage/insurance-price-benchmark/insurance-price-benchmark.read';

export const readInsurancePriceBenchmark = async (id: string): Promise<InsurancePriceBenchmark> => {
  return dbInsurancePriceBenchmarkRead(id);
};
