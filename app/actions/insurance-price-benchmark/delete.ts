import { dbInsurancePriceBenchmarkDelete } from '@/storage/insurance-price-benchmark/insurance-price-benchmark.delete';

export const deleteInsurancePriceBenchmark = async (id: string): Promise<void> => {
  await dbInsurancePriceBenchmarkDelete(id);
};
