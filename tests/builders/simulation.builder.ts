import { Simulation, SimulationResultCode, SimulationRunInput, SimulationStepIcon } from '@/domain/simulation.model';

export const simulation = (data: Partial<Simulation> = {}): Simulation => {
  const TOWN = { id: '550e8400-e29b-41d4-a716-446655440099' as const, name: 'Test Town' as const };
  const BRAND = { id: '550e8400-e29b-41d4-a716-446655440001' as const, name: 'Test Brand' as const };
  const FUEL = { id: '550e8400-e29b-41d4-a716-446655440002' as const, name: 'Diesel' as const };
  return {
    id: data.id ?? '550e8400-e29b-41d4-a716-446655440000',
    town: data.town ?? TOWN,
    brand: data.brand ?? BRAND,
    fuelType: data.fuelType ?? FUEL,
    carType: data.carType !== undefined ? data.carType : null,
    carTypeOther: data.carTypeOther ?? null,
    mileage: data.mileage ?? 50_000,
    ownerKmPerYear: data.ownerKmPerYear ?? 10_000,
    seats: data.seats ?? 5,
    firstRegisteredAt: data.firstRegisteredAt ?? new Date('2020-01-01'),
    isVan: data.isVan ?? false,
    isNewCar: data.isNewCar ?? false,
    purchasePrice: data.purchasePrice ?? null,
    rejectionReason: data.rejectionReason ?? null,
    resultCode: data.resultCode ?? SimulationResultCode.MANUAL_REVIEW,
    resultEuroNorm: data.resultEuroNorm ?? null,
    resultEcoScore: data.resultEcoScore ?? null,
    resultConsumption: data.resultConsumption ?? null,
    resultCc: data.resultCc ?? null,
    resultCo2: data.resultCo2 ?? null,
    resultInsuranceCostPerYear: data.resultInsuranceCostPerYear ?? null,
    resultTaxCostPerYear: data.resultTaxCostPerYear ?? null,
    resultInspectionCostPerYear: data.resultInspectionCostPerYear ?? null,
    resultMaintenanceCostPerYear: data.resultMaintenanceCostPerYear ?? null,
    resultBenchmarkMinKm: data.resultBenchmarkMinKm ?? null,
    resultBenchmarkAvgKm: data.resultBenchmarkAvgKm ?? null,
    resultBenchmarkMaxKm: data.resultBenchmarkMaxKm ?? null,
    resultRoundedKmCost: data.resultRoundedKmCost ?? null,
    resultDepreciationCostKm: data.resultDepreciationCostKm ?? null,
    resultEstimatedCarValue: data.resultEstimatedCarValue ?? null,
    error: data.error ?? null,
    duration: data.duration ?? 45,
    email: data.email !== undefined ? data.email : null,
    steps: data.steps ?? [
      {
        status: SimulationStepIcon.OK,
        message: 'Less than 250 000 km',
      },
      {
        status: SimulationStepIcon.OK,
        message: 'Car not older than 15 years',
      },
      {
        status: SimulationStepIcon.INFO,
        message: 'Car price is estimated at 15k',
      },
    ],
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  };
};

const defaultIdName = (id: string) => ({ id, name: undefined as string | undefined });

export const simulationRunInput = (data: Partial<SimulationRunInput> = {}): SimulationRunInput => {
  return {
    town: data.town ?? defaultIdName('550e8400-e29b-41d4-a716-446655440099'),
    brand: data.brand ?? defaultIdName('550e8400-e29b-41d4-a716-446655440001'),
    fuelType: data.fuelType ?? defaultIdName('550e8400-e29b-41d4-a716-446655440002'),
    carType: data.carType !== undefined ? data.carType : defaultIdName('550e8400-e29b-41d4-a716-446655440003'),
    carTypeOther: data.carTypeOther !== undefined ? data.carTypeOther : null,
    mileage: data.mileage ?? 50_000,
    ownerKmPerYear: data.ownerKmPerYear ?? 10_000,
    seats: data.seats ?? 5,
    firstRegisteredAt: data.firstRegisteredAt ?? new Date('2020-01-01'),
    isVan: data.isVan ?? false,
    isNewCar: data.isNewCar ?? false,
    purchasePrice: data.purchasePrice ?? null,
    backtestYear: data.backtestYear ?? null,
  };
};
