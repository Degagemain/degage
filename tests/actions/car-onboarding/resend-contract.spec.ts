import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/car-onboarding/read', () => ({
  readCarOnboarding: vi.fn(),
}));

vi.mock('@/actions/contract/resend', () => ({
  resendContract: vi.fn(),
}));

import { resendCarOnboardingContract } from '@/actions/car-onboarding/resend-contract';
import { CarOnboardingContractMissingError } from '@/actions/car-onboarding/car-onboarding-contract.error';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { resendContract } from '@/actions/contract/resend';
import { ContractStatus } from '@/domain/contract.model';
import { Role } from '@/domain/role.model';
import { carOnboarding } from '../../builders/car-onboarding.builder';
import { contract } from '../../builders/contract.builder';

describe('resendCarOnboardingContract', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('resends the linked contract', async () => {
    const linked = contract({ status: ContractStatus.Sent });
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(
      carOnboarding({
        contract: { id: linked.id!, status: ContractStatus.Sent, name: 'car-onboarding' },
      }),
    );
    vi.mocked(resendContract).mockResolvedValueOnce(linked);

    const result = await resendCarOnboardingContract('550e8400-e29b-41d4-a716-446655440000', { id: 'admin', role: Role.ADMIN });

    expect(resendContract).toHaveBeenCalledWith(linked.id);
    expect(result).toEqual(linked);
  });

  it('rejects when no contract is linked', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ contract: null }));

    await expect(resendCarOnboardingContract('550e8400-e29b-41d4-a716-446655440000', { id: 'admin', role: Role.ADMIN })).rejects.toBeInstanceOf(
      CarOnboardingContractMissingError,
    );
  });

  it('rejects non-admins', async () => {
    await expect(resendCarOnboardingContract('550e8400-e29b-41d4-a716-446655440000', { id: 'user', role: Role.USER })).rejects.toBeInstanceOf(
      CarOnboardingForbiddenError,
    );
  });
});
