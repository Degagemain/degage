import type { Simulation } from '@/domain/simulation.model';
import { getRequestContentLocale } from '@/context/request-context';
import { getPrismaClient } from '@/storage/utils';
import { dbSimulationToDomain, dbSimulationToDomainWithRelations } from './simulation.mappers';

export type PublicSimulationView = Omit<Simulation, 'email'> & {
  email: string | null;
  townHasActiveMembers: boolean;
  townMunicipality: string;
};

export const dbSimulationRead = async (id: string): Promise<Simulation> => {
  const prisma = getPrismaClient();
  const simulation = await prisma.simulation.findUniqueOrThrow({
    where: { id },
  });
  return dbSimulationToDomain(simulation);
};

export const dbSimulationReadWithRelations = async (id: string): Promise<Simulation> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const simulation = await prisma.simulation.findUniqueOrThrow({
    where: { id },
    include: {
      town: true,
      brand: { include: { translations: true } },
      fuelType: { include: { translations: true } },
      carType: true,
    },
  });
  return dbSimulationToDomainWithRelations(simulation, locale);
};

export const dbSimulationReadPublic = async (id: string, options?: { includeEmail?: boolean }): Promise<PublicSimulationView> => {
  const prisma = getPrismaClient();
  const locale = getRequestContentLocale();
  const simulation = await prisma.simulation.findUniqueOrThrow({
    where: { id },
    include: {
      town: true,
      brand: { include: { translations: true } },
      fuelType: { include: { translations: true } },
      carType: true,
    },
  });
  const domain = dbSimulationToDomainWithRelations(simulation, locale);
  return {
    ...domain,
    email: options?.includeEmail ? (simulation.email ?? null) : null,
    townHasActiveMembers: simulation.town.hasActiveMembers,
    townMunicipality: simulation.town.municipality,
  };
};
