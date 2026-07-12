import type { Simulation } from '@/domain/simulation.model';
import { dbSimulationReadPublic, dbSimulationReadWithRelations } from '@/storage/simulation/simulation.read';

export type PublicSimulation = Omit<Simulation, 'email'> & {
  email: string | null;
  townHasActiveMembers: boolean;
  townMunicipality: string;
};

export const readSimulation = async (id: string) => {
  return dbSimulationReadWithRelations(id);
};

export const readPublicSimulation = async (id: string, options?: { includeEmail?: boolean }): Promise<PublicSimulation> => {
  return dbSimulationReadPublic(id, options);
};
