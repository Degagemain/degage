import { SimulationRegion } from '@/domain/simulation-region.model';
import { getPrismaClient } from '@/storage/utils';
import { dbSimulationRegionToDomain, simulationRegionToDbCreate } from './simulation-region.mappers';

export const dbSimulationRegionCreate = async (region: SimulationRegion): Promise<SimulationRegion> => {
  const prisma = getPrismaClient();
  const created = await prisma.simulationRegion.create({
    data: simulationRegionToDbCreate(region),
  });
  return dbSimulationRegionToDomain(created);
};
