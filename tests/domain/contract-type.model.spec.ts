import { describe, expect, it } from 'vitest';
import { ContractTypeCode, contractTypeCodeValues, contractTypeSchema } from '@/domain/contract-type.model';
import en from '../../messages/en.json';
import fr from '../../messages/fr.json';
import nl from '../../messages/nl.json';

describe('contractTypeSchema', () => {
  it('accepts a valid contract type', () => {
    const result = contractTypeSchema.safeParse({
      id: null,
      code: ContractTypeCode.CarOnboarding,
      name: 'Car onboarding',
      defaultSignee: null,
      defaultViewers: [],
      documensoTemplateEnvelopeId: null,
      createdAt: null,
      updatedAt: null,
    });
    expect(result.success).toBe(true);
  });

  it('fails when name is empty', () => {
    const result = contractTypeSchema.safeParse({
      id: null,
      code: ContractTypeCode.CarOnboarding,
      name: '',
      defaultSignee: null,
      defaultViewers: [],
    });
    expect(result.success).toBe(false);
  });

  it('includes car-onboarding and other in the closed code set', () => {
    expect(contractTypeCodeValues).toContain(ContractTypeCode.CarOnboarding);
    expect(contractTypeCodeValues).toContain(ContractTypeCode.Other);
  });

  it('has i18n labels for every code', () => {
    for (const [locale, messages] of [
      ['en', en],
      ['nl', nl],
      ['fr', fr],
    ] as const) {
      const codes = messages.admin.contractTypes.codes as Record<string, string>;
      for (const code of contractTypeCodeValues) {
        expect(codes[code], `${locale} missing admin.contractTypes.codes.${code}`).toEqual(expect.any(String));
        expect(codes[code]?.trim().length, `${locale} empty admin.contractTypes.codes.${code}`).toBeGreaterThan(0);
      }
    }
  });
});
