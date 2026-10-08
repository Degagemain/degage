import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/storage/simulation/simulation.read', () => ({
  dbSimulationRead: vi.fn(),
}));

vi.mock('@/storage/user/user.read-auth', () => ({
  dbUserReadAuthContext: vi.fn(),
}));

vi.mock('@/storage/car-onboarding/car-onboarding.update', () => ({
  dbCarOnboardingUpdateOwner: vi.fn(),
}));

vi.mock('@/integrations/posthog', () => ({
  captureEvent: vi.fn(),
}));

import { claimCarOnboardingFromSimulation } from '@/actions/car-onboarding/claim-from-simulation';
import { dbSimulationRead } from '@/storage/simulation/simulation.read';
import { dbUserReadAuthContext } from '@/storage/user/user.read-auth';
import { dbCarOnboardingUpdateOwner } from '@/storage/car-onboarding/car-onboarding.update';
import { captureEvent } from '@/integrations/posthog';
import { carOnboarding } from '../../builders/car-onboarding.builder';
import { simulation } from '../../builders/simulation.builder';

describe('claimCarOnboardingFromSimulation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const id = '550e8400-e29b-41d4-a716-446655440000';
  const simulationId = '550e8400-e29b-41d4-a716-446655440010';
  const caller = { id: 'user-1', role: 'user', banned: false, email: 'owner@example.com', emailVerified: true };
  const userWithRole = (role: string) => ({ id: 'someone', role, emailVerified: true, banned: false });

  it('assigns an onboarding without owner to the caller with the simulation email', async () => {
    vi.mocked(dbSimulationRead).mockResolvedValueOnce(simulation({ id: simulationId, email: 'Owner@Example.com ' }));

    const claimed = await claimCarOnboardingFromSimulation(carOnboarding({ id, owner: null, simulation: { id: simulationId } }), caller);

    expect(claimed).toBe(true);
    expect(dbCarOnboardingUpdateOwner).toHaveBeenCalledWith(id, caller.id);
    expect(captureEvent).toHaveBeenCalledWith('car onboarding claimed', { car_onboarding_id: id, replaced_admin_owner: false });
  });

  it('replaces an admin owner', async () => {
    vi.mocked(dbSimulationRead).mockResolvedValueOnce(simulation({ id: simulationId, email: caller.email }));
    vi.mocked(dbUserReadAuthContext).mockResolvedValueOnce(userWithRole('admin'));

    const claimed = await claimCarOnboardingFromSimulation(
      carOnboarding({ id, owner: { id: 'admin-1' }, simulation: { id: simulationId } }),
      caller,
    );

    expect(claimed).toBe(true);
    expect(dbUserReadAuthContext).toHaveBeenCalledWith('admin-1');
    expect(dbCarOnboardingUpdateOwner).toHaveBeenCalledWith(id, caller.id);
  });

  it('keeps a non-admin owner', async () => {
    vi.mocked(dbSimulationRead).mockResolvedValueOnce(simulation({ id: simulationId, email: caller.email }));
    vi.mocked(dbUserReadAuthContext).mockResolvedValueOnce(userWithRole('user'));

    const claimed = await claimCarOnboardingFromSimulation(
      carOnboarding({ id, owner: { id: 'user-2' }, simulation: { id: simulationId } }),
      caller,
    );

    expect(claimed).toBe(false);
    expect(dbCarOnboardingUpdateOwner).not.toHaveBeenCalled();
  });

  it('does nothing when the simulation email is different', async () => {
    vi.mocked(dbSimulationRead).mockResolvedValueOnce(simulation({ id: simulationId, email: 'someone-else@example.com' }));

    const claimed = await claimCarOnboardingFromSimulation(carOnboarding({ id, owner: null, simulation: { id: simulationId } }), caller);

    expect(claimed).toBe(false);
    expect(dbCarOnboardingUpdateOwner).not.toHaveBeenCalled();
  });

  it('does nothing when the caller email is not verified', async () => {
    const claimed = await claimCarOnboardingFromSimulation(carOnboarding({ id, owner: null, simulation: { id: simulationId } }), {
      ...caller,
      emailVerified: false,
    });

    expect(claimed).toBe(false);
    expect(dbSimulationRead).not.toHaveBeenCalled();
  });

  it('does nothing for an admin caller', async () => {
    const claimed = await claimCarOnboardingFromSimulation(carOnboarding({ id, owner: null, simulation: { id: simulationId } }), {
      ...caller,
      role: 'admin',
    });

    expect(claimed).toBe(false);
    expect(dbSimulationRead).not.toHaveBeenCalled();
  });

  it('does nothing without a linked simulation', async () => {
    const claimed = await claimCarOnboardingFromSimulation(carOnboarding({ id, owner: null, simulation: null }), caller);

    expect(claimed).toBe(false);
    expect(dbSimulationRead).not.toHaveBeenCalled();
  });

  it('does nothing when the caller already owns the onboarding', async () => {
    const claimed = await claimCarOnboardingFromSimulation(
      carOnboarding({ id, owner: { id: caller.id }, simulation: { id: simulationId } }),
      caller,
    );

    expect(claimed).toBe(false);
    expect(dbSimulationRead).not.toHaveBeenCalled();
  });
});
