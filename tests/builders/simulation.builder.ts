import { Simulation, SimulationResultCode, SimulationRunInput, SimulationStepCode, SimulationStepStatus } from '@/domain/simulation.model';

export const simulation = (data: Partial<Simulation> = {}): Simulation => {
  return {
    id: data.id ?? '550e8400-e29b-41d4-a716-446655440000',
    brandId: data.brandId ?? '550e8400-e29b-41d4-a716-446655440001',
    fuelTypeId: data.fuelTypeId ?? '550e8400-e29b-41d4-a716-446655440002',
    carTypeId: data.carTypeId ?? null,
    carTypeOther: data.carTypeOther ?? null,
    km: data.km ?? 50_000,
    firstRegisteredAt: data.firstRegisteredAt ?? new Date('2020-01-01'),
    isVan: data.isVan ?? false,
    resultCode: data.resultCode ?? SimulationResultCode.MANUAL_REVIEW,
    estimatedPrice: data.estimatedPrice ?? null,
    steps: data.steps ?? [
      {
        code: SimulationStepCode.KM_LIMIT,
        status: SimulationStepStatus.OK,
        message: 'Less than 250 000 km',
      },
      {
        code: SimulationStepCode.CAR_LIMIT,
        status: SimulationStepStatus.OK,
        message: 'Car not older than 15 years',
      },
      {
        code: SimulationStepCode.PRICE_ESTIMATED,
        status: SimulationStepStatus.INFO,
        message: 'Car price is estimated at 15k',
      },
    ],
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  };
};

export const simulationRunInput = (data: Partial<SimulationRunInput> = {}): SimulationRunInput => {
  return {
    brandId: data.brandId ?? '550e8400-e29b-41d4-a716-446655440001',
    fuelTypeId: data.fuelTypeId ?? '550e8400-e29b-41d4-a716-446655440002',
    carTypeId: data.carTypeId !== undefined ? data.carTypeId : '550e8400-e29b-41d4-a716-446655440003',
    carTypeOther: data.carTypeOther !== undefined ? data.carTypeOther : null,
    km: data.km ?? 50_000,
    firstRegisteredAt: data.firstRegisteredAt ?? new Date('2020-01-01'),
    isVan: data.isVan ?? false,
  };
};
