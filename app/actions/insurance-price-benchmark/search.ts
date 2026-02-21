import { InsurancePriceBenchmark } from '@/domain/insurance-price-benchmark.model';
import { InsurancePriceBenchmarkFilter } from '@/domain/insurance-price-benchmark.filter';
import { Page } from '@/domain/page.model';
import { dbInsurancePriceBenchmarkSearch } from '@/storage/insurance-price-benchmark/insurance-price-benchmark.search';

export const searchInsurancePriceBenchmarks = async (filter: InsurancePriceBenchmarkFilter): Promise<Page<InsurancePriceBenchmark>> => {
  return dbInsurancePriceBenchmarkSearch(filter);
};
