import { Simulation } from '@/domain/simulation.model';
import { getPrismaClient } from '@/storage/utils';
import { dbSimulationToDomain, simulationToDbUpdate } from './simulation.mappers';

export const dbSimulationUpdate = async (simulation: Simulation): Promise<Simulation> => {
  const prisma = getPrismaClient();
  if (simulation.id == null) {
    throw new Error('Simulation id is required for update');
  }
  const updated = await prisma.simulation.update({
    where: { id: simulation.id },
    data: simulationToDbUpdate(simulation),
  });
  return dbSimulationToDomain(updated);
};
