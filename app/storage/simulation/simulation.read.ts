import { Simulation } from '@/domain/simulation.model';
import { getPrismaClient } from '@/storage/utils';
import { dbSimulationToDomain } from './simulation.mappers';

export const dbSimulationRead = async (id: string): Promise<Simulation> => {
  const prisma = getPrismaClient();
  const simulation = await prisma.simulation.findUniqueOrThrow({
    where: { id },
  });
  return dbSimulationToDomain(simulation);
};
