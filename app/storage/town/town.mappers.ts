import { Town } from '@/domain/town.model';
import { Prisma } from '@/storage/client/client';

export const dbTownToDomain = (town: Prisma.TownGetPayload<object>): Town => {
  return {
    id: town.id,
    zip: town.zip,
    name: town.name,
    municipality: town.municipality,
    province: { id: town.provinceId, name: '' },
    simulationRegion: { id: town.simulationRegionId, name: '' },
    highDemand: town.highDemand,
    hasActiveMembers: town.hasActiveMembers,
    createdAt: town.createdAt,
    updatedAt: town.updatedAt,
  };
};

type TownWithRelations = Prisma.TownGetPayload<{
  include: { province: true; simulationRegion: true };
}>;

export const dbTownToDomainWithRelations = (town: TownWithRelations): Town => {
  return {
    ...dbTownToDomain(town),
    province: { id: town.provinceId, name: town.province.name },
    simulationRegion: { id: town.simulationRegionId, name: town.simulationRegion.name },
  };
};

export const townToDbCreate = (town: Town): Prisma.TownCreateInput => {
  return {
    zip: town.zip,
    name: town.name,
    municipality: town.municipality,
    province: { connect: { id: town.province.id } },
    simulationRegion: { connect: { id: town.simulationRegion.id } },
    highDemand: town.highDemand,
    hasActiveMembers: town.hasActiveMembers,
  };
};

export const townToDbUpdate = (town: Town): Prisma.TownUpdateInput => {
  return {
    zip: town.zip,
    name: town.name,
    municipality: town.municipality,
    province: { connect: { id: town.province.id } },
    simulationRegion: { connect: { id: town.simulationRegion.id } },
    highDemand: town.highDemand,
    hasActiveMembers: town.hasActiveMembers,
  };
};
