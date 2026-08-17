import { describe, expect, it } from 'vitest';
import { fuelTypeSchema } from '@/domain/fuel-type.model';

describe('fuelTypeSchema', () => {
  it('defaults order to 0', () => {
    const result = fuelTypeSchema.parse({
      id: null,
      code: 'electric',
      name: 'Electric',
      translations: [{ locale: 'en', name: 'Electric' }],
    });

    expect(result.order).toBe(0);
  });

  it('parses an explicit order', () => {
    const result = fuelTypeSchema.parse({
      id: null,
      code: 'diesel',
      name: 'Diesel',
      order: 10,
      translations: [{ locale: 'en', name: 'Diesel' }],
    });

    expect(result.order).toBe(10);
  });

  it('rejects a non-integer order', () => {
    const result = fuelTypeSchema.safeParse({
      id: null,
      code: 'diesel',
      name: 'Diesel',
      order: 1.5,
      translations: [{ locale: 'en', name: 'Diesel' }],
    });

    expect(result.success).toBe(false);
  });
});
