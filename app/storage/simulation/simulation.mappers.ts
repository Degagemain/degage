import { Simulation, SimulationResultCode, SimulationStep, simulationStepSchema } from '@/domain/simulation.model';
import { Prisma } from '@/storage/client/client';
import { type ContentLocale, defaultContentLocale } from '@/i18n/locales';

type SimulationDb = Prisma.SimulationGetPayload<object>;

type SimulationWithRelations = Prisma.SimulationGetPayload<{
  include: {
    town: true;
    brand: { include: { translations: true } };
    fuelType: { include: { translations: true } };
    carType: true;
  };
}>;

function townDisplayLabel(town: { zip: string; name: string; municipality: string }): string {
  return town.name !== town.municipality ? `${town.zip} ${town.name} (${town.municipality})` : `${town.zip} ${town.name}`;
}

const pickTranslationName = (translations: { locale: string; name: string }[], locale: ContentLocale): string => {
  const t = translations.find((x) => x.locale === locale) ?? translations.find((x) => x.locale === defaultContentLocale) ?? translations[0];
  return t?.name ?? '';
};

const mapResultCodeFromDb = (value: string): SimulationResultCode => {
  return value as SimulationResultCode;
};

function parseSteps(steps: unknown): SimulationStep[] {
  if (steps == null) return [];
  if (!Array.isArray(steps)) return [];
  return steps.map((s) => simulationStepSchema.parse(s));
}

export const dbSimulationToDomain = (db: SimulationDb): Simulation => {
  return {
    id: db.id,
    townId: db.townId,
    brandId: db.brandId,
    fuelTypeId: db.fuelTypeId,
    carTypeId: db.carTypeId,
    carTypeOther: db.carTypeOther,
    mileage: db.km,
    ownerKmPerYear: db.ownerKmPerYear,
    seats: db.seats,
    firstRegisteredAt: db.firstRegisteredAt,
    isVan: db.isVan,
    isNewCar: db.isNewCar,
    purchasePrice: db.purchasePrice != null ? Number(db.purchasePrice) : null,
    rejectionReason: db.rejectionReason,
    resultCode: mapResultCodeFromDb(db.resultCode),
    resultEuroNorm: db.resultEuroNorm,
    resultEcoScore: db.resultEcoScore,
    resultConsumption: db.resultConsumption != null ? Number(db.resultConsumption) : null,
    resultCc: db.resultCc,
    resultCo2: db.resultCo2,
    resultInsuranceCostPerYear: db.resultInsuranceCostPerYear != null ? Number(db.resultInsuranceCostPerYear) : null,
    resultTaxCostPerYear: db.resultTaxCostPerYear != null ? Number(db.resultTaxCostPerYear) : null,
    resultInspectionCostPerYear: db.resultInspectionCostPerYear != null ? Number(db.resultInspectionCostPerYear) : null,
    resultMaintenanceCostPerYear: db.resultMaintenanceCostPerYear != null ? Number(db.resultMaintenanceCostPerYear) : null,
    resultBenchmarkMinKm: db.resultBenchmarkMinKm,
    resultBenchmarkAvgKm: db.resultBenchmarkAvgKm,
    resultBenchmarkMaxKm: db.resultBenchmarkMaxKm,
    resultRoundedKmCost: db.resultRoundedKmCost != null ? Number(db.resultRoundedKmCost) : null,
    resultDepreciationCostKm: db.resultDepreciationCostKm != null ? Number(db.resultDepreciationCostKm) : null,
    resultEstimatedCarValue: db.resultEstimatedCarValue != null ? Number(db.resultEstimatedCarValue) : null,
    error: db.error,
    steps: parseSteps(db.steps),
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
};

export const dbSimulationToDomainWithRelations = (db: SimulationWithRelations, locale: ContentLocale): Simulation => {
  return {
    ...dbSimulationToDomain(db),
    town: {
      id: db.townId,
      name: townDisplayLabel(db.town),
    },
    brand: {
      id: db.brandId,
      name: pickTranslationName(db.brand.translations, locale),
    },
    fuelType: {
      id: db.fuelTypeId,
      name: pickTranslationName(db.fuelType.translations, locale),
    },
    carType: db.carType
      ? {
          id: db.carType.id,
          name: db.carType.name,
        }
      : null,
  };
};

export const simulationToDbCreate = (simulation: Simulation): Prisma.SimulationCreateInput => {
  return {
    town: { connect: { id: simulation.townId } },
    brand: { connect: { id: simulation.brandId } },
    fuelType: { connect: { id: simulation.fuelTypeId } },
    carType: simulation.carTypeId != null ? { connect: { id: simulation.carTypeId } } : undefined,
    carTypeOther: simulation.carTypeOther ?? undefined,
    km: simulation.mileage,
    ownerKmPerYear: simulation.ownerKmPerYear,
    seats: simulation.seats,
    firstRegisteredAt: simulation.firstRegisteredAt,
    isVan: simulation.isVan,
    isNewCar: simulation.isNewCar,
    purchasePrice: simulation.purchasePrice ?? undefined,
    rejectionReason: simulation.rejectionReason ?? undefined,
    resultCode: simulation.resultCode,
    resultEuroNorm: simulation.resultEuroNorm ?? undefined,
    resultEcoScore: simulation.resultEcoScore ?? undefined,
    resultConsumption: simulation.resultConsumption ?? undefined,
    resultCc: simulation.resultCc ?? undefined,
    resultCo2: simulation.resultCo2 ?? undefined,
    resultInsuranceCostPerYear: simulation.resultInsuranceCostPerYear ?? undefined,
    resultTaxCostPerYear: simulation.resultTaxCostPerYear ?? undefined,
    resultInspectionCostPerYear: simulation.resultInspectionCostPerYear ?? undefined,
    resultMaintenanceCostPerYear: simulation.resultMaintenanceCostPerYear ?? undefined,
    resultBenchmarkMinKm: simulation.resultBenchmarkMinKm ?? undefined,
    resultBenchmarkAvgKm: simulation.resultBenchmarkAvgKm ?? undefined,
    resultBenchmarkMaxKm: simulation.resultBenchmarkMaxKm ?? undefined,
    resultRoundedKmCost: simulation.resultRoundedKmCost ?? undefined,
    resultDepreciationCostKm: simulation.resultDepreciationCostKm ?? undefined,
    resultEstimatedCarValue: simulation.resultEstimatedCarValue ?? undefined,
    error: simulation.error ?? undefined,
    steps: simulation.steps as unknown as Prisma.InputJsonValue,
  };
};

export const simulationToDbUpdate = (simulation: Simulation): Prisma.SimulationUpdateInput => {
  return {
    town: { connect: { id: simulation.townId } },
    brand: { connect: { id: simulation.brandId } },
    fuelType: { connect: { id: simulation.fuelTypeId } },
    carType: simulation.carTypeId != null ? { connect: { id: simulation.carTypeId } } : undefined,
    carTypeOther: simulation.carTypeOther ?? undefined,
    km: simulation.mileage,
    ownerKmPerYear: simulation.ownerKmPerYear,
    seats: simulation.seats,
    firstRegisteredAt: simulation.firstRegisteredAt,
    isVan: simulation.isVan,
    isNewCar: simulation.isNewCar,
    purchasePrice: simulation.purchasePrice ?? undefined,
    rejectionReason: simulation.rejectionReason ?? undefined,
    resultCode: simulation.resultCode,
    resultEuroNorm: simulation.resultEuroNorm ?? undefined,
    resultEcoScore: simulation.resultEcoScore ?? undefined,
    resultConsumption: simulation.resultConsumption ?? undefined,
    resultCc: simulation.resultCc ?? undefined,
    resultCo2: simulation.resultCo2 ?? undefined,
    resultInsuranceCostPerYear: simulation.resultInsuranceCostPerYear ?? undefined,
    resultTaxCostPerYear: simulation.resultTaxCostPerYear ?? undefined,
    resultInspectionCostPerYear: simulation.resultInspectionCostPerYear ?? undefined,
    resultMaintenanceCostPerYear: simulation.resultMaintenanceCostPerYear ?? undefined,
    resultBenchmarkMinKm: simulation.resultBenchmarkMinKm ?? undefined,
    resultBenchmarkAvgKm: simulation.resultBenchmarkAvgKm ?? undefined,
    resultBenchmarkMaxKm: simulation.resultBenchmarkMaxKm ?? undefined,
    resultRoundedKmCost: simulation.resultRoundedKmCost ?? undefined,
    resultDepreciationCostKm: simulation.resultDepreciationCostKm ?? undefined,
    resultEstimatedCarValue: simulation.resultEstimatedCarValue ?? undefined,
    error: simulation.error ?? undefined,
    steps: simulation.steps as unknown as Prisma.InputJsonValue,
  };
};
