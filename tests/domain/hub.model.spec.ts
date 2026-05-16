import { describe, expect, it } from 'vitest';

import { hubSchema } from '@/domain/hub.model';

describe('hubSchema', () => {
  it('defaults shared kilometer scenarios', () => {
    const result = hubSchema.parse({
      id: null,
      name: 'Default hub',
      isDefault: true,
    });

    expect(result.minSharedKm).toBe(3_000);
    expect(result.avgSharedKm).toBe(5_000);
    expect(result.maxSharedKm).toBe(7_000);
  });
});
