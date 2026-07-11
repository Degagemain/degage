import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/simulation/read', () => ({
  readSimulation: vi.fn(),
}));

vi.mock('@/storage/car-onboarding/car-onboarding.create', () => ({
  dbCarOnboardingCreate: vi.fn(),
}));

vi.mock('@/actions/car-onboarding/read', () => ({
  readCarOnboarding: vi.fn(),
}));

import { createCarOnboarding } from '@/actions/car-onboarding/create';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { readSimulation } from '@/actions/simulation/read';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { dbCarOnboardingCreate } from '@/storage/car-onboarding/car-onboarding.create';
import { carOnboarding } from '../../builders/car-onboarding.builder';
import { simulation } from '../../builders/simulation.builder';

describe('createCarOnboarding', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const ownerId = '550e8400-e29b-41d4-a716-446655440099';
  const mockUser = { id: ownerId, role: 'user', banned: false };
  const mockAdmin = { id: '550e8400-e29b-41d4-a716-446655440098', role: 'admin', banned: false };
  const simulationId = '550e8400-e29b-41d4-a716-446655440010';
  const createdId = '550e8400-e29b-41d4-a716-446655440000';

  it('creates from simulation with owner set to caller', async () => {
    const sim = simulation({ id: simulationId, isPurchased: true });
    vi.mocked(readSimulation).mockResolvedValueOnce(sim);
    vi.mocked(dbCarOnboardingCreate).mockImplementationOnce(async (draft) => carOnboarding({ ...draft, id: createdId }));
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: createdId, owner: { id: ownerId, name: 'User' } }));

    const result = await createCarOnboarding({ simulation: { id: simulationId } }, mockUser);

    expect(readSimulation).toHaveBeenCalledWith(simulationId);
    expect(dbCarOnboardingCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: { id: ownerId },
        simulation: { id: simulationId },
        isPurchased: true,
        town: { id: sim.town.id },
      }),
    );
    expect(readCarOnboarding).toHaveBeenCalledWith(createdId);
    expect(result.id).toBe(createdId);
  });

  it('creates from simulation when caller id is not a uuid', async () => {
    const nonUuidCaller = { id: 'better-auth-admin-id', role: 'admin', banned: false };
    const sim = simulation({ id: simulationId });
    vi.mocked(readSimulation).mockResolvedValueOnce(sim);
    vi.mocked(dbCarOnboardingCreate).mockImplementationOnce(async (draft) => carOnboarding({ ...draft, id: createdId }));
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: createdId, owner: { id: nonUuidCaller.id } }));

    await createCarOnboarding({ simulation: { id: simulationId } }, nonUuidCaller);

    expect(dbCarOnboardingCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: { id: nonUuidCaller.id },
      }),
    );
  });

  it('allows admin to create empty shell without simulation', async () => {
    vi.mocked(dbCarOnboardingCreate).mockImplementationOnce(async (draft) => carOnboarding({ ...draft, id: createdId }));
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: createdId }));

    const result = await createCarOnboarding({}, mockAdmin);

    expect(readSimulation).not.toHaveBeenCalled();
    expect(dbCarOnboardingCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: null,
        simulation: null,
        statusInPreparation: 'open',
      }),
    );
    expect(result.id).toBe(createdId);
  });

  it('applies admin car type flags when creating empty shell', async () => {
    vi.mocked(dbCarOnboardingCreate).mockImplementationOnce(async (draft) => carOnboarding({ ...draft, id: createdId }));
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: createdId, isPurchased: true, isNewCar: true }));

    await createCarOnboarding({ isPurchased: true, isNewCar: true }, mockAdmin);

    expect(dbCarOnboardingCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        isPurchased: true,
        isNewCar: true,
        hasInsuranceContract: false,
        insurerStatus: 'notApplicable',
      }),
    );
  });

  it('forces isNewCar false when creating existing car shell', async () => {
    vi.mocked(dbCarOnboardingCreate).mockImplementationOnce(async (draft) => carOnboarding({ ...draft, id: createdId }));
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ id: createdId }));

    await createCarOnboarding({ isPurchased: false, isNewCar: false }, mockAdmin);

    expect(dbCarOnboardingCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        isPurchased: false,
        isNewCar: false,
        hasInsuranceContract: true,
      }),
    );
  });

  it('throws when non-admin creates without simulation', async () => {
    await expect(createCarOnboarding({}, mockUser)).rejects.toThrow(CarOnboardingForbiddenError);
    expect(dbCarOnboardingCreate).not.toHaveBeenCalled();
  });

  it('propagates when simulation is not found', async () => {
    vi.mocked(readSimulation).mockRejectedValueOnce({ code: 'P2025' });

    await expect(createCarOnboarding({ simulation: { id: simulationId } }, mockUser)).rejects.toEqual({ code: 'P2025' });
    expect(dbCarOnboardingCreate).not.toHaveBeenCalled();
  });
});
