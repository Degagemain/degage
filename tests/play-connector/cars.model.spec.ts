import { describe, expect, it } from 'vitest';

import { playCarCreateInputSchema } from '@/play-connector/cars.model';

describe('playCarCreateInputSchema', () => {
  it('accepts an empty object', () => {
    expect(playCarCreateInputSchema.parse({})).toEqual({});
  });

  it('accepts valid fuel and purchaseDate enums', () => {
    expect(
      playCarCreateInputSchema.parse({
        fuel: 'PETROL',
        purchaseDate: 'LESSTHAN',
      }),
    ).toEqual({
      fuel: 'PETROL',
      purchaseDate: 'LESSTHAN',
    });
  });

  it('rejects unknown fuel values', () => {
    expect(playCarCreateInputSchema.safeParse({ fuel: 'BIODIESEL' }).success).toBe(false);
  });

  it('rejects unknown purchaseDate values', () => {
    expect(playCarCreateInputSchema.safeParse({ purchaseDate: 'TOMORROW' }).success).toBe(false);
  });

  it('rejects unknown keys', () => {
    expect(playCarCreateInputSchema.safeParse({ status: 'REGISTERED' }).success).toBe(false);
  });
});
