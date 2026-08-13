import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/fuel-type/fuel-type.read', () => ({
  dbFuelTypeRead: vi.fn(),
}));

vi.mock('@/storage/town/town.read', () => ({
  dbTownRead: vi.fn(),
}));

vi.mock('@/storage/play-connector/play-connector.read', () => ({
  dbPlayConnectorReadByUserId: vi.fn(),
}));

vi.mock('@/actions/simulation/read', () => ({
  readSimulation: vi.fn(),
}));

import { mapCarOnboardingToPlayCar } from '@/actions/car-onboarding/map-to-play-car';
import { readSimulation } from '@/actions/simulation/read';
import { dbFuelTypeRead } from '@/storage/fuel-type/fuel-type.read';
import { dbPlayConnectorReadByUserId } from '@/storage/play-connector/play-connector.read';
import { dbTownRead } from '@/storage/town/town.read';
import { carOnboarding } from '../../builders/car-onboarding.builder';
import { fuelType } from '../../builders/fuel-type.builder';
import { simulation } from '../../builders/simulation.builder';

const townId = '550e8400-e29b-41d4-a716-446655440099';
const fuelTypeId = '550e8400-e29b-41d4-a716-446655440002';
const ownerId = '550e8400-e29b-41d4-a716-446655440098';

describe('mapCarOnboardingToPlayCar', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('maps onboarding fields onto the play car update input', async () => {
    vi.mocked(dbFuelTypeRead).mockResolvedValueOnce(fuelType({ id: fuelTypeId, code: 'diesel' }));
    vi.mocked(dbTownRead).mockResolvedValueOnce({
      id: townId,
      zip: '9000',
      name: 'Gent',
    } as never);
    vi.mocked(dbPlayConnectorReadByUserId).mockResolvedValueOnce({ email: 'owner@example.com' } as never);
    vi.mocked(readSimulation).mockResolvedValueOnce(
      simulation({
        ownerKmPerYear: 8000,
        resultConsumption: 5.4,
      }),
    );

    const result = await mapCarOnboardingToPlayCar(
      carOnboarding({
        carName: 'TestCar',
        brand: { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Volkswagen' },
        carType: { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Golf' },
        fuelType: { id: fuelTypeId, name: 'Diesel' },
        isPurchased: true,
        isVan: true,
        seats: 5,
        firstRegisteredAt: new Date('2018-03-01'),
        carValue: 12000,
        depreciationCostKm: 0.07,
        mileage: 75000,
        street: 'Grensstraat',
        houseNumber: '282',
        town: { id: townId, name: '9000 Gent' },
        insurer: { id: '550e8400-e29b-41d4-a716-446655440010', name: 'Belfius' },
        plate: '2gmm225',
        vin: 'W0VBD8ER6M8016851',
        shareStartDate: new Date(2026, 9, 1),
        roadAssistancePlanDescription: 'Touring',
        existingRoadAssistancePlanEndDate: new Date(2027, 0, 15),
        simulation: { id: '550e8400-e29b-41d4-a716-446655440050' },
        owner: { id: ownerId, hasPlayConnector: true },
      }),
    );

    expect(result).toMatchObject({
      name: 'TestCar',
      brand: 'Volkswagen',
      type: 'Golf',
      fuel: 'DIESEL',
      purchaseDate: 'OVERTHAN',
      seats: 5,
      doors: 5,
      year: 2018,
      estimatedValue: 12000,
      carAgreedValue: 12000,
      deprec: 0.07,
      carInitialMileage: 75000,
      location: { street: 'Grensstraat', num: '282', zip: '9000', city: 'Gent' },
      country: 'België',
      insurance: { name: 'Belfius' },
      technicalCarDetails: { licensePlate: '2gmm225' },
      chassisNumber: 'W0VBD8ER6M8016851',
      startSharing: '2026-10-01',
      carType: 'LIGHT_FREIGHT',
      assistanceName: 'Touring',
      assistanceExpiration: '2027-01-15',
      ownerAnnualKm: 8000,
      fuelEconomy: 5.4,
      email: 'owner@example.com',
    });
  });

  it('maps fuel codes and prefers carTypeOther', async () => {
    vi.mocked(dbFuelTypeRead).mockResolvedValueOnce(fuelType({ id: fuelTypeId, code: 'plugin-hybrid' }));

    const result = await mapCarOnboardingToPlayCar(
      carOnboarding({
        fuelType: { id: fuelTypeId, name: 'Petrol PHEV' },
        carType: { id: '550e8400-e29b-41d4-a716-446655440003', name: 'A4' },
        carTypeOther: 'Custom van',
        isPurchased: false,
        isVan: false,
      }),
    );

    expect(result.fuel).toBe('PLUGINHYBRID');
    expect(result.type).toBe('Custom van');
    expect(result.purchaseDate).toBe('STILLTOBEPURCHASED');
    expect(result.carType).toBe('PASSENGER_CAR');
  });

  it('maps a purchased young car to LESSTHAN', async () => {
    const result = await mapCarOnboardingToPlayCar(
      carOnboarding({
        isPurchased: true,
        firstRegisteredAt: new Date(),
      }),
    );

    expect(result.purchaseDate).toBe('LESSTHAN');
  });

  it('derives doors from seats', async () => {
    await expect(mapCarOnboardingToPlayCar(carOnboarding({ seats: 2 }))).resolves.toMatchObject({ seats: 2, doors: 2 });
    await expect(mapCarOnboardingToPlayCar(carOnboarding({ seats: 4 }))).resolves.toMatchObject({ seats: 4, doors: 4 });
    await expect(mapCarOnboardingToPlayCar(carOnboarding({ seats: 7 }))).resolves.toMatchObject({ seats: 7, doors: 5 });
  });
});
