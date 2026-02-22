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
