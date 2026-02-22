import { dbSimulationReadWithRelations } from '@/storage/simulation/simulation.read';

export const readSimulation = async (id: string) => {
  return dbSimulationReadWithRelations(id);
};
