import { describe, expect, it } from 'vitest';
import {
  SystemParameterCategory,
  SystemParameterType,
  systemParameterSchema,
  systemParameterValueUpdateSchema,
} from '@/domain/system-parameter.model';
import { systemParameterFilterSchema } from '@/domain/system-parameter.filter';

describe('systemParameterSchema', () => {
  it('accepts valid system parameter', () => {
    const result = systemParameterSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      code: 'maxAgeYears',
      category: SystemParameterCategory.SIMULATION,
      type: SystemParameterType.NUMBER,
      name: 'Max age',
      description: 'Max age in years.',
      translations: [{ locale: 'en', name: 'Max age', description: 'Desc' }],
      valueNumber: 15,
      valueNumberMin: null,
      valueNumberMax: null,
      valueEuronormId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown category', () => {
    const result = systemParameterSchema.safeParse({
      code: 'x',
      category: 'unknown',
      type: SystemParameterType.NUMBER,
      name: 'X',
      description: '',
      translations: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('systemParameterValueUpdateSchema', () => {
  it('accepts only value fields', () => {
    const result = systemParameterValueUpdateSchema.safeParse({
      valueNumber: 20,
    });
    expect(result.success).toBe(true);
  });

  it('accepts null valueNumber', () => {
    const result = systemParameterValueUpdateSchema.safeParse({
      valueNumber: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects code (definition fields not allowed)', () => {
    const result = systemParameterValueUpdateSchema.safeParse({
      code: 'maxKm',
    });
    expect(result.success).toBe(false);
  });
});

describe('systemParameterFilterSchema', () => {
  it('accepts valid filter', () => {
    const result = systemParameterFilterSchema.safeParse({
      query: 'max',
      category: SystemParameterCategory.SIMULATION,
      skip: 0,
      take: 24,
      sortBy: 'code',
      sortOrder: 'asc',
    });
    expect(result.success).toBe(true);
  });
});
