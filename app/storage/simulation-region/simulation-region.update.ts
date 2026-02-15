import { SimulationRegion } from '@/domain/simulation-region.model';
import { getPrismaClient } from '@/storage/utils';
import { dbSimulationRegionToDomain, simulationRegionToDbUpdate } from './simulation-region.mappers';

export const dbSimulationRegionUpdate = async (region: SimulationRegion): Promise<SimulationRegion> => {
  const prisma = getPrismaClient();
  const updated = await prisma.simulationRegion.update({
    where: { id: region.id! },
    data: simulationRegionToDbUpdate(region),
  });
  return dbSimulationRegionToDomain(updated);
};
