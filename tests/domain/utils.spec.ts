import { describe, expect, it } from 'vitest';
import { DefaultTake, MaxTake, SortOrder, calculateOwnerKmPerYear } from '@/domain/utils';

describe('calculateOwnerKmPerYear', () => {
  it('returns mileage divided by years since first registration', () => {
    const ref = new Date('2025-01-01');
    const firstReg = new Date('2020-01-01'); // 5 years
    expect(calculateOwnerKmPerYear(50_000, firstReg, ref)).toBe(10_000);
  });

  it('uses at least 1 year to avoid division by zero', () => {
    const ref = new Date('2024-06-01');
    const firstReg = new Date('2024-01-01'); // < 1 year
    expect(calculateOwnerKmPerYear(5_000, firstReg, ref)).toBe(5_000); // 5000/1
  });

  it('rounds to nearest integer', () => {
    const ref = new Date('2025-01-01');
    const firstReg = new Date('2022-01-01'); // 3 years
    expect(calculateOwnerKmPerYear(10_000, firstReg, ref)).toBe(3_333);
  });
});

describe('Domain Utils', () => {
  describe('SortOrder enum', () => {
    it('should have ASC value', () => {
      expect(SortOrder.ASC).toBe('asc');
    });

    it('should have DESC value', () => {
      expect(SortOrder.DESC).toBe('desc');
    });
  });

  describe('constants', () => {
    it('should have correct DefaultTake value', () => {
      expect(DefaultTake).toBe(24);
    });

    it('should have correct MaxTake value', () => {
      expect(MaxTake).toBe(100);
    });
  });
});
