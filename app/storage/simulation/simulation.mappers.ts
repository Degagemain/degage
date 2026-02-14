import { Simulation, SimulationResultCode, SimulationStep, simulationStepSchema } from '@/domain/simulation.model';
import { Prisma } from '@/storage/client/client';

type SimulationDb = Prisma.SimulationGetPayload<object>;

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
    brandId: db.brandId,
    fuelTypeId: db.fuelTypeId,
    carTypeId: db.carTypeId,
    carTypeOther: db.carTypeOther,
    km: db.km,
    firstRegisteredAt: db.firstRegisteredAt,
    isVan: db.isVan,
    resultCode: mapResultCodeFromDb(db.resultCode),
    estimatedPrice: db.estimatedPrice != null ? Number(db.estimatedPrice) : null,
    steps: parseSteps(db.steps),
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
};

export const simulationToDbCreate = (simulation: Simulation): Prisma.SimulationCreateInput => {
  return {
    brand: { connect: { id: simulation.brandId } },
    fuelType: { connect: { id: simulation.fuelTypeId } },
    carType: simulation.carTypeId != null ? { connect: { id: simulation.carTypeId } } : undefined,
    carTypeOther: simulation.carTypeOther ?? undefined,
    km: simulation.km,
    firstRegisteredAt: simulation.firstRegisteredAt,
    isVan: simulation.isVan,
    resultCode: simulation.resultCode,
    estimatedPrice: simulation.estimatedPrice ?? undefined,
    steps: simulation.steps as unknown as Prisma.InputJsonValue,
  };
};

export const simulationToDbUpdate = (simulation: Simulation): Prisma.SimulationUpdateInput => {
  return {
    brand: { connect: { id: simulation.brandId } },
    fuelType: { connect: { id: simulation.fuelTypeId } },
    carType: simulation.carTypeId != null ? { connect: { id: simulation.carTypeId } } : undefined,
    carTypeOther: simulation.carTypeOther ?? undefined,
    km: simulation.km,
    firstRegisteredAt: simulation.firstRegisteredAt,
    isVan: simulation.isVan,
    resultCode: simulation.resultCode,
    estimatedPrice: simulation.estimatedPrice ?? undefined,
    steps: simulation.steps as unknown as Prisma.InputJsonValue,
  };
};
