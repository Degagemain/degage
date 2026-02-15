import { SimulationRegion } from '@/domain/simulation-region.model';
import { SimulationRegionFilter } from '@/domain/simulation-region.filter';
import { Page } from '@/domain/page.model';
import { dbSimulationRegionSearch } from '@/storage/simulation-region/simulation-region.search';

export const searchSimulationRegions = async (filter: SimulationRegionFilter): Promise<Page<SimulationRegion>> => {
  return dbSimulationRegionSearch(filter);
};
