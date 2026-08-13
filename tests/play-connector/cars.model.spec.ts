import { describe, expect, it } from 'vitest';

import { playCarCreateInputSchema, playCarUpdateInputSchema, toPlayCarCreateInput } from '@/play-connector/cars.model';

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
    expect(playCarCreateInputSchema.safeParse({ deprec: 0.07 }).success).toBe(false);
  });
});

describe('playCarUpdateInputSchema', () => {
  it('accepts update-only fields', () => {
    expect(
      playCarUpdateInputSchema.parse({
        email: 'owner@example.com',
        carType: 'LIGHT_FREIGHT',
        chassisNumber: 'W0VBD8ER6M8016851',
        startSharing: '2026-10-01',
      }),
    ).toEqual({
      email: 'owner@example.com',
      carType: 'LIGHT_FREIGHT',
      chassisNumber: 'W0VBD8ER6M8016851',
      startSharing: '2026-10-01',
    });
  });

  it('rejects unknown vehicle types', () => {
    expect(playCarUpdateInputSchema.safeParse({ carType: 'TRUCK' }).success).toBe(false);
  });
});

describe('toPlayCarCreateInput', () => {
  it('drops update-only fields', () => {
    expect(
      toPlayCarCreateInput({
        brand: 'Opel',
        fuel: 'PETROL',
        deprec: 0.07,
        email: 'owner@example.com',
        carType: 'PASSENGER_CAR',
        chassisNumber: 'W0VBD8ER6M8016851',
      }),
    ).toEqual({
      brand: 'Opel',
      fuel: 'PETROL',
    });
  });
});
