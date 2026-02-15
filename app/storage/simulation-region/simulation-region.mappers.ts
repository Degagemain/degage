import { SimulationRegion } from '@/domain/simulation-region.model';
import { Prisma } from '@/storage/client/client';

export const dbSimulationRegionToDomain = (region: Prisma.SimulationRegionGetPayload<object>): SimulationRegion => {
  return {
    id: region.id,
    name: region.name,
    isDefault: region.isDefault,
    createdAt: region.createdAt,
    updatedAt: region.updatedAt,
  };
};

export const simulationRegionToDbCreate = (region: SimulationRegion): Prisma.SimulationRegionCreateInput => {
  return {
    name: region.name,
    isDefault: region.isDefault,
  };
};

export const simulationRegionToDbUpdate = (region: SimulationRegion): Prisma.SimulationRegionUpdateInput => {
  return {
    name: region.name,
    isDefault: region.isDefault,
  };
};
