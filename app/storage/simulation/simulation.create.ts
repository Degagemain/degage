import { Simulation } from '@/domain/simulation.model';
import { getPrismaClient } from '@/storage/utils';
import { dbSimulationToDomain, simulationToDbCreate } from './simulation.mappers';

export const dbSimulationCreate = async (simulation: Simulation): Promise<Simulation> => {
  const prisma = getPrismaClient();
  const created = await prisma.simulation.create({
    data: simulationToDbCreate(simulation),
  });
  return dbSimulationToDomain(created);
};
