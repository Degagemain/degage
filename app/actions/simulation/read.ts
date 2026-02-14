import { dbSimulationRead } from '@/storage/simulation/simulation.read';

export const readSimulation = async (id: string) => {
  return dbSimulationRead(id);
};
