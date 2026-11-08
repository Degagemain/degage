import { describe, expect, it } from 'vitest';
import { ContractTypeCode, contractTypeSchema } from '@/domain/contract-type.model';

const validContractType = {
  id: null,
  code: ContractTypeCode.CarOnboarding,
  defaultSignee: null,
  defaultViewers: [],
  documensoTemplateEnvelopeId: null,
  createdAt: null,
  updatedAt: null,
};

describe('contractTypeSchema', () => {
  it('accepts a valid contract type', () => {
    const result = contractTypeSchema.safeParse(validContractType);
    expect(result.success).toBe(true);
  });

  it('accepts an admin-entered code and normalizes it', () => {
    const result = contractTypeSchema.safeParse({
      ...validContractType,
      code: '  Fleet-Agreement ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe('fleet-agreement');
    }
  });

  it('rejects an empty or malformed code', () => {
    expect(contractTypeSchema.safeParse({ ...validContractType, code: '' }).success).toBe(false);
    expect(contractTypeSchema.safeParse({ ...validContractType, code: 'Bad code' }).success).toBe(false);
  });
});
