import { describe, expect, it } from 'vitest';
import { insurerSchema } from '@/domain/insurer.model';

describe('insurer.model', () => {
  it('parses a valid insurer', () => {
    const result = insurerSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Ethias',
      supportsInstantOnboarding: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('defaults supportsInstantOnboarding to false', () => {
    const result = insurerSchema.safeParse({
      id: null,
      name: 'AXA',
      createdAt: null,
      updatedAt: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.supportsInstantOnboarding).toBe(false);
    }
  });

  it('fails when name is empty', () => {
    const result = insurerSchema.safeParse({
      id: null,
      name: '',
      supportsInstantOnboarding: false,
      createdAt: null,
      updatedAt: null,
    });
    expect(result.success).toBe(false);
  });
});
