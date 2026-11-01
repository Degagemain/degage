import { Contract, ContractStatus } from '@/domain/contract.model';
import { ContractTypeCode } from '@/domain/contract-type.model';

export const contract = (data: Partial<Contract> = {}): Contract => ({
  id: data.id ?? '550e8400-e29b-41d4-a716-446655440020',
  user: data.user ?? { id: 'user_owner_1', name: 'Owner' },
  type: data.type ?? {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Car onboarding',
    code: ContractTypeCode.CarOnboarding,
  },
  startDate: data.startDate ?? new Date('2026-02-01T00:00:00.000Z'),
  endDate: data.endDate ?? null,
  status: data.status ?? ContractStatus.Draft,
  document: data.document ?? null,
  documensoDocumentEnvelopeId: data.documensoDocumentEnvelopeId ?? null,
  createdAt: data.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: data.updatedAt ?? new Date('2026-01-01T00:00:00.000Z'),
});
