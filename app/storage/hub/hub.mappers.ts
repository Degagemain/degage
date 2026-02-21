import { Hub } from '@/domain/hub.model';
import { Prisma } from '@/storage/client/client';

export const dbHubToDomain = (hub: Prisma.HubGetPayload<object>): Hub => {
  return {
    id: hub.id,
    name: hub.name,
    isDefault: hub.isDefault,
    simMaxAge: hub.simMaxAge,
    simMaxKm: hub.simMaxKm,
    simMinEuroNormGroupDiesel: hub.simMinEuroNormGroupDiesel,
    simMinEcoScoreForBonus: hub.simMinEcoScoreForBonus,
    simMaxKmForBonus: hub.simMaxKmForBonus,
    simMaxAgeForBonus: hub.simMaxAgeForBonus,
    simDepreciationKm: hub.simDepreciationKm,
    simDepreciationKmElectric: hub.simDepreciationKmElectric,
    simInspectionCostPerYear: Number(hub.simInspectionCostPerYear),
    simMaintenanceCostPerYear: Number(hub.simMaintenanceCostPerYear),
    createdAt: hub.createdAt,
    updatedAt: hub.updatedAt,
  };
};

export const hubToDbCreate = (hub: Hub): Prisma.HubCreateInput => {
  return {
    name: hub.name,
    isDefault: hub.isDefault,
    simMaxAge: hub.simMaxAge,
    simMaxKm: hub.simMaxKm,
    simMinEuroNormGroupDiesel: hub.simMinEuroNormGroupDiesel,
    simMinEcoScoreForBonus: hub.simMinEcoScoreForBonus,
    simMaxKmForBonus: hub.simMaxKmForBonus,
    simMaxAgeForBonus: hub.simMaxAgeForBonus,
    simDepreciationKm: hub.simDepreciationKm,
    simDepreciationKmElectric: hub.simDepreciationKmElectric,
    simInspectionCostPerYear: hub.simInspectionCostPerYear,
    simMaintenanceCostPerYear: hub.simMaintenanceCostPerYear,
  };
};

export const hubToDbUpdate = (hub: Hub): Prisma.HubUpdateInput => {
  return {
    name: hub.name,
    isDefault: hub.isDefault,
    simMaxAge: hub.simMaxAge,
    simMaxKm: hub.simMaxKm,
    simMinEuroNormGroupDiesel: hub.simMinEuroNormGroupDiesel,
    simMinEcoScoreForBonus: hub.simMinEcoScoreForBonus,
    simMaxKmForBonus: hub.simMaxKmForBonus,
    simMaxAgeForBonus: hub.simMaxAgeForBonus,
    simDepreciationKm: hub.simDepreciationKm,
    simDepreciationKmElectric: hub.simDepreciationKmElectric,
    simInspectionCostPerYear: hub.simInspectionCostPerYear,
    simMaintenanceCostPerYear: hub.simMaintenanceCostPerYear,
  };
};
