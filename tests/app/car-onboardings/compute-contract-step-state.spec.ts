import { describe, expect, it } from 'vitest';

import { computeContractStepState } from '@/app/car-onboardings/lib/compute-contract-step-state';
import { CarOnboardingInPreparationStatus } from '@/domain/car-onboarding.model';
import { ContractStatus } from '@/domain/contract.model';
import { carOnboarding } from '../../builders/car-onboarding.builder';

describe('computeContractStepState', () => {
  it('blocks until preparation is locked', () => {
    expect(
      computeContractStepState(
        carOnboarding({
          statusInPreparation: CarOnboardingInPreparationStatus.READY,
          contract: { id: '550e8400-e29b-41d4-a716-446655440020', status: ContractStatus.Sent },
        }),
      ),
    ).toBe('blocked');
  });

  it('blocks when locked but no contract exists', () => {
    expect(
      computeContractStepState(
        carOnboarding({
          statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
          contract: null,
        }),
      ),
    ).toBe('blocked');
  });

  it('is todo when the contract is sent', () => {
    expect(
      computeContractStepState(
        carOnboarding({
          statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
          contract: { id: '550e8400-e29b-41d4-a716-446655440020', status: ContractStatus.Sent },
        }),
      ),
    ).toBe('todo');
  });

  it('is done when the contract is signed', () => {
    expect(
      computeContractStepState(
        carOnboarding({
          statusInPreparation: CarOnboardingInPreparationStatus.LOCKED,
          contract: { id: '550e8400-e29b-41d4-a716-446655440020', status: ContractStatus.Signed },
        }),
      ),
    ).toBe('done');
  });
});
