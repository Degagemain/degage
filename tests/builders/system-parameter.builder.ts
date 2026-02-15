import { SystemParameter, SystemParameterCategory, SystemParameterType } from '@/domain/system-parameter.model';

export const systemParameter = (data: Partial<SystemParameter> = {}): SystemParameter => {
  return {
    id: data.id ?? '550e8400-e29b-41d4-a716-446655440000',
    code: data.code ?? 'maxAgeYears',
    category: data.category ?? SystemParameterCategory.SIMULATION,
    type: data.type ?? SystemParameterType.NUMBER,
    name: data.name ?? 'Max age (years)',
    description: data.description ?? 'Maximum age for acceptance.',
    translations: data.translations ?? [{ locale: 'en', name: 'Max age (years)', description: 'Maximum age.' }],
    valueNumber: data.valueNumber ?? 15,
    valueNumberMin: data.valueNumberMin ?? null,
    valueNumberMax: data.valueNumberMax ?? null,
    valueEuronormId: data.valueEuronormId ?? null,
    createdAt: data.createdAt ?? new Date(),
    updatedAt: data.updatedAt ?? new Date(),
  };
};
