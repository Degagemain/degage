import { describe, expect, it } from 'vitest';
import { featureFlagEnabledUpdateSchema, featureFlagSchema } from '@/domain/feature-flag.model';
import { featureFlagFilterSchema } from '@/domain/feature-flag.filter';

describe('featureFlagSchema', () => {
  it('accepts a valid feature flag', () => {
    const result = featureFlagSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      code: 'support-chat',
      description: 'Controls support chat.',
      enabled: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result.success).toBe(true);
  });

  it('defaults enabled to false', () => {
    const result = featureFlagSchema.safeParse({
      id: null,
      code: 'support-chat',
      description: '',
      createdAt: null,
      updatedAt: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enabled).toBe(false);
    }
  });

  it('fails when code is empty', () => {
    const result = featureFlagSchema.safeParse({
      id: null,
      code: '',
      description: '',
      enabled: false,
      createdAt: null,
      updatedAt: null,
    });
    expect(result.success).toBe(false);
  });
});

describe('featureFlagEnabledUpdateSchema', () => {
  it('accepts enabled only', () => {
    const result = featureFlagEnabledUpdateSchema.safeParse({ enabled: true });
    expect(result.success).toBe(true);
  });

  it('rejects unknown fields', () => {
    const result = featureFlagEnabledUpdateSchema.safeParse({ enabled: true, code: 'x' });
    expect(result.success).toBe(false);
  });
});

describe('featureFlagFilterSchema', () => {
  it('applies defaults', () => {
    const result = featureFlagFilterSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sortBy).toBe('code');
      expect(result.data.sortOrder).toBe('asc');
    }
  });
});
