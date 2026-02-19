import { HubBenchmark } from '@/domain/hub-benchmark.model';
import { HubBenchmarkFilter } from '@/domain/hub-benchmark.filter';
import { Page } from '@/domain/page.model';
import { dbHubBenchmarkSearch } from '@/storage/hub-benchmark/hub-benchmark.search';

export const searchHubBenchmarks = async (filter: HubBenchmarkFilter): Promise<Page<HubBenchmark>> => {
  return dbHubBenchmarkSearch(filter);
};
