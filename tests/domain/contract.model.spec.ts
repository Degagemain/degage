import { describe, expect, it } from 'vitest';
import { ContractStatus, contractSchema } from '@/domain/contract.model';
import { ContractTypeCode } from '@/domain/contract-type.model';

describe('contractSchema', () => {
  it('accepts a draft contract without a document', () => {
    const result = contractSchema.safeParse({
      id: null,
      user: { id: 'user_1', name: 'Owner' },
      type: { id: '550e8400-e29b-41d4-a716-446655440010', name: ContractTypeCode.CarOnboarding, code: ContractTypeCode.CarOnboarding },
      startDate: new Date('2026-02-01T00:00:00.000Z'),
      endDate: null,
      status: ContractStatus.Draft,
      document: null,
      documensoDocumentEnvelopeId: null,
      createdAt: null,
      updatedAt: null,
    });
    expect(result.success).toBe(true);
  });

  it('fails when user id is missing', () => {
    const result = contractSchema.safeParse({
      id: null,
      user: { id: '' },
      type: { id: '550e8400-e29b-41d4-a716-446655440010', name: ContractTypeCode.CarOnboarding },
      startDate: new Date('2026-02-01T00:00:00.000Z'),
      status: ContractStatus.Draft,
    });
    expect(result.success).toBe(false);
  });
});
