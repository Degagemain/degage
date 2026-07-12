import type { Simulation } from '@/domain/simulation.model';
import { dbSimulationReadPublic, dbSimulationReadWithRelations } from '@/storage/simulation/simulation.read';

export type PublicSimulation = Omit<Simulation, 'email'> & {
  email: null;
  townHasActiveMembers: boolean;
  townMunicipality: string;
};

export const readSimulation = async (id: string) => {
  return dbSimulationReadWithRelations(id);
};

export const readPublicSimulation = async (id: string): Promise<PublicSimulation> => {
  return dbSimulationReadPublic(id);
};
