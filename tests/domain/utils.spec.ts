import { describe, expect, it } from 'vitest';
import {
  DashPlaceholder,
  DefaultTake,
  MaxTake,
  SortOrder,
  asTextOrDash,
  buildCsvLinesFromColumns,
  calculateOwnerKmPerYear,
  encodeCsvDocument,
  escapeCsvCell,
  formatDateOrDash,
  formatPriceInThousands,
  joinCsvRow,
} from '@/domain/utils';

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

describe('formatPriceInThousands', () => {
  it('formats whole thousands with k suffix', () => {
    expect(formatPriceInThousands(15_000)).toBe('15k');
    expect(formatPriceInThousands(250_000)).toBe('250k');
  });

  it('rounds to nearest thousand', () => {
    expect(formatPriceInThousands(15_400)).toBe('15k');
    expect(formatPriceInThousands(15_600)).toBe('16k');
  });
});

describe('csv', () => {
  it('escapeCsvCell quotes fields that need it', () => {
    expect(escapeCsvCell('a')).toBe('a');
    expect(escapeCsvCell('a,b')).toBe('"a,b"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvCell('a\nb')).toBe('"a\nb"');
  });

  it('joinCsvRow escapes each cell', () => {
    expect(joinCsvRow(['x', 'y, z'])).toBe('x,"y, z"');
  });

  it('encodeCsvDocument prefixes BOM and uses CRLF', () => {
    expect(encodeCsvDocument(['a', 'b'])).toBe('\uFEFFa\r\nb');
  });

  it('buildCsvLinesFromColumns builds header and lines', () => {
    const lines = buildCsvLinesFromColumns(
      [{ a: 'x', b: 1 }],
      [
        { label: 'A', format: (row) => row.a },
        { label: 'B', format: (row) => String(row.b) },
      ],
    );
    expect(lines).toEqual(['A,B', 'x,1']);
  });
});

describe('dash formatters', () => {
  it('asTextOrDash returns dash for null and blank values', () => {
    expect(asTextOrDash(null)).toBe(DashPlaceholder);
    expect(asTextOrDash('   ')).toBe(DashPlaceholder);
  });

  it('asTextOrDash trims non-empty values', () => {
    expect(asTextOrDash('  abc  ')).toBe('abc');
  });

  it('formatDateOrDash returns dash for invalid date values', () => {
    expect(formatDateOrDash(null, 'en', false)).toBe(DashPlaceholder);
    expect(formatDateOrDash('not-a-date', 'en', false)).toBe(DashPlaceholder);
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
