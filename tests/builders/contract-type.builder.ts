import { ContractType, ContractTypeCode } from '@/domain/contract-type.model';

export const contractType = (data: Partial<ContractType> = {}): ContractType => ({
  id: data.id ?? '550e8400-e29b-41d4-a716-446655440010',
  code: data.code ?? ContractTypeCode.CarOnboarding,
  name: data.name ?? 'Car onboarding',
  defaultSignee: data.defaultSignee ?? null,
  defaultViewers: data.defaultViewers ?? [],
  documensoTemplateEnvelopeId: data.documensoTemplateEnvelopeId ?? null,
  createdAt: data.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: data.updatedAt ?? new Date('2026-01-01T00:00:00.000Z'),
});
