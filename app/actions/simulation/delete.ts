import { dbSimulationDelete } from '@/storage/simulation/simulation.delete';

export const deleteSimulation = async (id: string): Promise<void> => {
  await dbSimulationDelete(id);
};
