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
    km: db.km,
    seats: db.seats,
    firstRegisteredAt: db.firstRegisteredAt,
    isVan: db.isVan,
    resultCode: mapResultCodeFromDb(db.resultCode),
    estimatedPrice: db.estimatedPrice != null ? Number(db.estimatedPrice) : null,
    cylinderCc: db.cylinderCc,
    co2Emission: db.co2Emission,
    ecoscore: db.ecoscore,
    euroNormCode: db.euroNormCode,
    consumption: db.consumption != null ? Number(db.consumption) : null,
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
    km: simulation.km,
    seats: simulation.seats,
    firstRegisteredAt: simulation.firstRegisteredAt,
    isVan: simulation.isVan,
    resultCode: simulation.resultCode,
    estimatedPrice: simulation.estimatedPrice ?? undefined,
    cylinderCc: simulation.cylinderCc ?? undefined,
    co2Emission: simulation.co2Emission ?? undefined,
    ecoscore: simulation.ecoscore ?? undefined,
    euroNormCode: simulation.euroNormCode ?? undefined,
    consumption: simulation.consumption ?? undefined,
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
    km: simulation.km,
    seats: simulation.seats,
    firstRegisteredAt: simulation.firstRegisteredAt,
    isVan: simulation.isVan,
    resultCode: simulation.resultCode,
    estimatedPrice: simulation.estimatedPrice ?? undefined,
    cylinderCc: simulation.cylinderCc ?? undefined,
    co2Emission: simulation.co2Emission ?? undefined,
    ecoscore: simulation.ecoscore ?? undefined,
    euroNormCode: simulation.euroNormCode ?? undefined,
    consumption: simulation.consumption ?? undefined,
    steps: simulation.steps as unknown as Prisma.InputJsonValue,
  };
};
