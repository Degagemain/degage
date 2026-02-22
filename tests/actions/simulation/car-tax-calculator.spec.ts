import { describe, expect, it } from 'vitest';

import { calculateCo2Diff } from '@/actions/simulation/car-tax-calculator';

const RATE = 1000;

/** First registration on or after 2021-01-01 → threshold 149 g/km (WLTP). */
const FIRST_REG_2021_OR_LATER = new Date(Date.UTC(2021, 0, 1));
/** First registration before 2021 → threshold 122 g/km. */
const FIRST_REG_BEFORE_2021 = new Date(Date.UTC(2020, 11, 31));

describe('calculateCo2Diff', () => {
  describe('vehicles with first registration in 2021 or later (threshold 149 g/km)', () => {
    it('increases rate by 0.30% per g/km when CO2 is above 149 and not higher than 500', () => {
      const { co2Diff, diff, co2Range } = calculateCo2Diff(FIRST_REG_2021_OR_LATER, 200, RATE);
      expect(co2Range).toEqual([25, 150, 500]);
      expect(diff).toBe(300); // 500 - 200
      expect(co2Diff).toBe(RATE * 300 * 0.003); // +0.30% per g/km above 149
    });

    it('at exactly 150 g/km (above 149): diff is 500 - 150, positive co2Diff', () => {
      const { co2Diff, diff } = calculateCo2Diff(FIRST_REG_2021_OR_LATER, 150, RATE);
      expect(diff).toBe(350);
      expect(co2Diff).toBe(RATE * 350 * 0.003);
    });

    it('at 500 g/km (cap): no increase (diff 0)', () => {
      const { co2Diff, diff } = calculateCo2Diff(FIRST_REG_2021_OR_LATER, 500, RATE);
      expect(diff).toBe(0);
      expect(co2Diff).toBe(0);
    });

    it('decreases rate by 0.30% per g/km when CO2 is below 149 but higher than 24', () => {
      const { co2Diff, diff, co2Range } = calculateCo2Diff(FIRST_REG_2021_OR_LATER, 100, RATE);
      expect(co2Range).toEqual([25, 150, 500]);
      expect(diff).toBe(75); // 100 - 25
      expect(co2Diff).toBe(-RATE * 75 * 0.003);
    });

    it('at exactly 149 g/km (below threshold): reduction applies', () => {
      const { co2Diff, diff } = calculateCo2Diff(FIRST_REG_2021_OR_LATER, 149, RATE);
      expect(diff).toBe(124); // 149 - 25
      expect(co2Diff).toBe(-RATE * 124 * 0.003);
    });

    it('at 25 g/km (min of band): no adjustment (diff 0)', () => {
      const { co2Diff, diff } = calculateCo2Diff(FIRST_REG_2021_OR_LATER, 25, RATE);
      expect(diff).toBe(0);
      expect(co2Diff).toBeCloseTo(0);
    });
  });

  describe('vehicles with first registration before 2021 (threshold 122 g/km)', () => {
    it('increases rate by 0.30% per g/km when CO2 is above 122 and not higher than 500', () => {
      const { co2Diff, diff, co2Range } = calculateCo2Diff(FIRST_REG_BEFORE_2021, 200, RATE);
      expect(co2Range).toEqual([25, 123, 500]);
      expect(diff).toBe(300); // 500 - 200
      expect(co2Diff).toBe(RATE * 300 * 0.003);
    });

    it('at exactly 123 g/km (above 122): diff is 500 - 123, positive co2Diff', () => {
      const { co2Diff, diff } = calculateCo2Diff(FIRST_REG_BEFORE_2021, 123, RATE);
      expect(diff).toBe(377);
      expect(co2Diff).toBe(RATE * 377 * 0.003);
    });

    it('decreases rate by 0.30% per g/km when CO2 is below 122 but higher than 24', () => {
      const { co2Diff, diff, co2Range } = calculateCo2Diff(FIRST_REG_BEFORE_2021, 100, RATE);
      expect(co2Range).toEqual([25, 123, 500]);
      expect(diff).toBe(75); // 100 - 25
      expect(co2Diff).toBe(-RATE * 75 * 0.003);
    });

    it('at exactly 122 g/km (below threshold): reduction applies', () => {
      const { co2Diff, diff } = calculateCo2Diff(FIRST_REG_BEFORE_2021, 122, RATE);
      expect(diff).toBe(97); // 122 - 25
      expect(co2Diff).toBe(-RATE * 97 * 0.003);
    });

    it('at 25 g/km (min of band): no adjustment (diff 0)', () => {
      const { co2Diff, diff } = calculateCo2Diff(FIRST_REG_BEFORE_2021, 25, RATE);
      expect(diff).toBe(0);
      expect(co2Diff).toBeCloseTo(0);
    });
  });

  describe('boundary: registration date exactly 2021-01-01', () => {
    it('uses 2021+ rule (threshold 149) when date is 2021-01-01', () => {
      const onCutoff = new Date(Date.UTC(2021, 0, 1));
      const { co2Range } = calculateCo2Diff(onCutoff, 130, RATE);
      expect(co2Range).toEqual([25, 150, 500]); // 2021 rule
    });

    it('uses pre-2021 rule (threshold 122) when date is 2020-12-31', () => {
      const beforeCutoff = new Date(Date.UTC(2020, 11, 31));
      const { co2Range } = calculateCo2Diff(beforeCutoff, 130, RATE);
      expect(co2Range).toEqual([25, 123, 500]); // pre-2021 rule
    });
  });

  describe('return shape', () => {
    it('returns co2Diff, co2Factor, diff, and co2Range', () => {
      const result = calculateCo2Diff(FIRST_REG_2021_OR_LATER, 100, RATE);
      expect(result).toHaveProperty('co2Diff');
      expect(result).toHaveProperty('co2Factor');
      expect(result).toHaveProperty('diff');
      expect(result).toHaveProperty('co2Range');
      expect(result.co2Factor).toBe(result.diff * 0.003);
    });
  });
});
