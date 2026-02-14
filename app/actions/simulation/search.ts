import { Simulation } from '@/domain/simulation.model';
import { SimulationFilter } from '@/domain/simulation.filter';
import { Page } from '@/domain/page.model';
import { dbSimulationSearch } from '@/storage/simulation/simulation.search';

export const searchSimulations = async (filter: SimulationFilter): Promise<Page<Simulation>> => {
  return dbSimulationSearch(filter);
};
