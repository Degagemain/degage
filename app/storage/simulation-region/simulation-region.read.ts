import { SimulationRegion } from '@/domain/simulation-region.model';
import { getPrismaClient } from '@/storage/utils';
import { dbSimulationRegionToDomain } from './simulation-region.mappers';

export const dbSimulationRegionRead = async (id: string): Promise<SimulationRegion> => {
  const prisma = getPrismaClient();
  const region = await prisma.simulationRegion.findUniqueOrThrow({
    where: { id },
  });
  return dbSimulationRegionToDomain(region);
};
