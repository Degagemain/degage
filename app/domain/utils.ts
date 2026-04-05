import { differenceInYears } from 'date-fns';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Computes owner km per year from total mileage and first registration date.
 * Uses at least 1 year to avoid division by zero for very recent registrations.
 * @param mileage Total odometer mileage (km)
 * @param firstRegisteredAt First registration date
 * @param referenceDate Date to compute years from (default: now)
 * @returns Rounded km per year
 */
export function calculateOwnerKmPerYear(mileage: number, firstRegisteredAt: Date, referenceDate: Date = new Date()): number {
  const years = Math.max(1, differenceInYears(referenceDate, firstRegisteredAt));
  return Math.round(mileage / years);
}

/**
 * Returns true if the value is null, undefined, empty string, or 0.
 */
export function isEmpty(value: number | string | null | undefined): boolean {
  return value == null || value === '' || value === 0;
}

/**
 * Formats a number as whole thousands with a "k" suffix (e.g. 15000 → "15k").
 */
export function formatPriceInThousands(price: number): string {
  return `${(Math.round(price) / 1000).toFixed(0)}k`;
}

export const DefaultTake = 24;
export const MaxTake = 100;

export const escapeCsvCell = (value: string): string => {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const joinCsvRow = (cells: string[]): string => cells.map(escapeCsvCell).join(',');

export const encodeCsvDocument = (lines: string[]): string => `\uFEFF${lines.join('\r\n')}`;

export const DashPlaceholder = '—';

export const asTextOrDash = (value: string | null | undefined): string => {
  if (value == null) return DashPlaceholder;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : DashPlaceholder;
};

export const formatDateOrDash = (value: Date | string | null | undefined, locale: string, includeTime: boolean): string => {
  if (value == null) return DashPlaceholder;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return DashPlaceholder;
  return includeTime ? d.toLocaleString(locale) : d.toLocaleDateString(locale);
};

export interface CsvColumn<Row> {
  label: string;
  format: (row: Row) => string;
}

export const buildCsvLinesFromColumns = <Row>(rows: Row[], columns: CsvColumn<Row>[]): string[] => {
  const header = joinCsvRow(columns.map((column) => column.label));
  const lines = rows.map((row) => joinCsvRow(columns.map((column) => column.format(row))));
  return [header, ...lines];
};
