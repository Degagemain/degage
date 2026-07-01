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
    minSharedKm: hub.minSharedKm,
    avgSharedKm: hub.avgSharedKm,
    maxSharedKm: hub.maxSharedKm,
    simMaxPrice: hub.simMaxPrice ?? null,
    simAcceptedPriceCategoryA: Number(hub.simAcceptedPriceCategoryA),
    simAcceptedPriceCategoryB: Number(hub.simAcceptedPriceCategoryB),
    simAcceptedDepreciationCostKm: Number(hub.simAcceptedDepreciationCostKm),
    simAcceptedElectricDepreciationCostKm: Number(hub.simAcceptedElectricDepreciationCostKm),
    simMinDepreciationCostKm: Number(hub.simMinDepreciationCostKm),
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
    minSharedKm: hub.minSharedKm,
    avgSharedKm: hub.avgSharedKm,
    maxSharedKm: hub.maxSharedKm,
    simMaxPrice: hub.simMaxPrice,
    simAcceptedPriceCategoryA: hub.simAcceptedPriceCategoryA,
    simAcceptedPriceCategoryB: hub.simAcceptedPriceCategoryB,
    simAcceptedDepreciationCostKm: hub.simAcceptedDepreciationCostKm,
    simAcceptedElectricDepreciationCostKm: hub.simAcceptedElectricDepreciationCostKm,
    simMinDepreciationCostKm: hub.simMinDepreciationCostKm,
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
    minSharedKm: hub.minSharedKm,
    avgSharedKm: hub.avgSharedKm,
    maxSharedKm: hub.maxSharedKm,
    simMaxPrice: hub.simMaxPrice,
    simAcceptedPriceCategoryA: hub.simAcceptedPriceCategoryA,
    simAcceptedPriceCategoryB: hub.simAcceptedPriceCategoryB,
    simAcceptedDepreciationCostKm: hub.simAcceptedDepreciationCostKm,
    simAcceptedElectricDepreciationCostKm: hub.simAcceptedElectricDepreciationCostKm,
    simMinDepreciationCostKm: hub.simMinDepreciationCostKm,
  };
};
