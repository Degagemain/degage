import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

vi.mock('@/storage/simulation/simulation.mappers', () => ({
  simulationToDbCreate: vi.fn(),
  dbSimulationToDomain: vi.fn(),
}));

import { dbSimulationCreate } from '@/storage/simulation/simulation.create';
import { getPrismaClient } from '@/storage/utils';
import { dbSimulationToDomain, simulationToDbCreate } from '@/storage/simulation/simulation.mappers';
import { simulation } from '../../builders/simulation.builder';

describe('dbSimulationCreate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates a simulation and returns domain model', async () => {
    const input = simulation({ id: null, createdAt: null, updatedAt: null });
    const dbCreateData = {
      townId: input.town.id,
      brandId: input.brand.id,
      km: input.mileage,
      ownerKmPerYear: input.ownerKmPerYear,
    };
    const createdDb = {
      id: 'new-id',
      townId: input.town.id,
      brandId: input.brand.id,
      fuelTypeId: input.fuelType.id,
      carTypeId: input.carType?.id ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    const expectedDomain = simulation({ id: 'new-id' });

    const mockPrisma = {
      simulation: {
        create: vi.fn().mockResolvedValue(createdDb),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(simulationToDbCreate).mockReturnValue(dbCreateData as any);
    vi.mocked(dbSimulationToDomain).mockReturnValue(expectedDomain);

    const result = await dbSimulationCreate(input);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(simulationToDbCreate).toHaveBeenCalledWith(input);
    expect(mockPrisma.simulation.create).toHaveBeenCalledWith({
      data: dbCreateData,
    });
    expect(dbSimulationToDomain).toHaveBeenCalledWith(createdDb);
    expect(result).toEqual(expectedDomain);
  });
});
