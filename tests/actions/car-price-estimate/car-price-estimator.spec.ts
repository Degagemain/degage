import { describe, expect, it } from 'vitest';

import { assertValidPriceEstimate } from '@/actions/car-price-estimate/car-price-estimator';
import { InvalidCarPriceEstimateError } from '@/actions/car-price-estimate/invalid-car-price-estimate.error';

describe('assertValidPriceEstimate', () => {
  const valid = {
    price: 15_000,
    rangeMin: 8_000,
    rangeMax: 18_000,
    remarks: null,
    articleRefs: [],
  };

  it('accepts a coherent estimate', () => {
    expect(() => assertValidPriceEstimate(valid)).not.toThrow();
  });

  it('rejects non-positive price', () => {
    expect(() => assertValidPriceEstimate({ ...valid, price: 0 })).toThrow(InvalidCarPriceEstimateError);
  });

  it('rejects non-positive rangeMin', () => {
    expect(() => assertValidPriceEstimate({ ...valid, rangeMin: 0 })).toThrow(InvalidCarPriceEstimateError);
  });

  it('rejects rangeMin above price', () => {
    expect(() => assertValidPriceEstimate({ ...valid, rangeMin: 20_000 })).toThrow(InvalidCarPriceEstimateError);
  });
});
