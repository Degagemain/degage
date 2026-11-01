import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/actions/car-onboarding/read', () => ({
  readCarOnboarding: vi.fn(),
}));

vi.mock('@/actions/contract-type/read', () => ({
  readContractTypeByCode: vi.fn(),
}));

vi.mock('@/actions/contract/create', () => ({
  createContract: vi.fn(),
}));

vi.mock('@/actions/contract/send', () => ({
  sendContract: vi.fn(),
}));

vi.mock('@/storage/car-onboarding/car-onboarding.update', () => ({
  dbCarOnboardingSetContract: vi.fn(),
}));

vi.mock('@/storage/user/user.read', () => ({
  dbUserRead: vi.fn(),
}));

import { startCarOnboardingContract } from '@/actions/car-onboarding/start-contract';
import {
  CarOnboardingContractAlreadyStartedError,
  CarOnboardingOwnerMissingError,
} from '@/actions/car-onboarding/car-onboarding-contract.error';
import { CarOnboardingForbiddenError } from '@/actions/car-onboarding/car-onboarding-forbidden.error';
import { readCarOnboarding } from '@/actions/car-onboarding/read';
import { createContract } from '@/actions/contract/create';
import { sendContract } from '@/actions/contract/send';
import { readContractTypeByCode } from '@/actions/contract-type/read';
import { ContractStatus } from '@/domain/contract.model';
import { ContractTypeCode } from '@/domain/contract-type.model';
import { Role } from '@/domain/role.model';
import { dbCarOnboardingSetContract } from '@/storage/car-onboarding/car-onboarding.update';
import { dbUserRead } from '@/storage/user/user.read';
import { carOnboarding } from '../../builders/car-onboarding.builder';
import { contract } from '../../builders/contract.builder';
import { contractType } from '../../builders/contract-type.builder';

describe('startCarOnboardingContract', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates, links, and sends a car-onboarding contract', async () => {
    const onboarding = carOnboarding({
      owner: { id: 'user_owner_1', name: 'Owner' },
      shareStartDate: new Date('2026-03-01T00:00:00.000Z'),
      contract: null,
    });
    const type = contractType({ code: ContractTypeCode.CarOnboarding });
    const draft = contract({ status: ContractStatus.Draft });
    const sent = contract({ ...draft, status: ContractStatus.Sent, documensoDocumentEnvelopeId: 'env' });

    vi.mocked(readCarOnboarding).mockResolvedValueOnce(onboarding);
    vi.mocked(readContractTypeByCode).mockResolvedValueOnce(type);
    vi.mocked(dbUserRead).mockResolvedValueOnce({
      id: 'user_owner_1',
      name: 'Owner',
      email: 'owner@example.com',
      emailVerified: true,
      image: null,
      locale: 'en',
      role: null,
      banned: false,
      banReason: null,
      banExpires: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    vi.mocked(createContract).mockResolvedValueOnce(draft);
    vi.mocked(sendContract).mockResolvedValueOnce(sent);

    const result = await startCarOnboardingContract(onboarding.id!, { id: 'admin', role: Role.ADMIN });

    expect(createContract).toHaveBeenCalled();
    expect(dbCarOnboardingSetContract).toHaveBeenCalledWith(onboarding.id, draft.id);
    expect(sendContract).toHaveBeenCalledWith(draft.id);
    expect(result.status).toBe(ContractStatus.Sent);
  });

  it('sends an existing draft contract', async () => {
    const draftRef = { id: '550e8400-e29b-41d4-a716-446655440020', status: ContractStatus.Draft as const };
    const onboarding = carOnboarding({ owner: { id: 'user_owner_1' }, contract: draftRef });
    const sent = contract({ id: draftRef.id, status: ContractStatus.Sent });
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(onboarding);
    vi.mocked(sendContract).mockResolvedValueOnce(sent);

    const result = await startCarOnboardingContract(onboarding.id!, { id: 'admin', role: Role.ADMIN });

    expect(createContract).not.toHaveBeenCalled();
    expect(sendContract).toHaveBeenCalledWith(draftRef.id);
    expect(result.status).toBe(ContractStatus.Sent);
  });

  it('rejects when a sent contract already exists', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(
      carOnboarding({
        owner: { id: 'user_owner_1' },
        contract: { id: '550e8400-e29b-41d4-a716-446655440020', status: ContractStatus.Sent },
      }),
    );

    await expect(startCarOnboardingContract('550e8400-e29b-41d4-a716-446655440000', { id: 'admin', role: Role.ADMIN })).rejects.toBeInstanceOf(
      CarOnboardingContractAlreadyStartedError,
    );
  });

  it('rejects when owner is missing', async () => {
    vi.mocked(readCarOnboarding).mockResolvedValueOnce(carOnboarding({ owner: null, contract: null }));

    await expect(startCarOnboardingContract('550e8400-e29b-41d4-a716-446655440000', { id: 'admin', role: Role.ADMIN })).rejects.toBeInstanceOf(
      CarOnboardingOwnerMissingError,
    );
  });

  it('rejects non-admins', async () => {
    await expect(startCarOnboardingContract('550e8400-e29b-41d4-a716-446655440000', { id: 'user', role: Role.USER })).rejects.toBeInstanceOf(
      CarOnboardingForbiddenError,
    );
  });
});
