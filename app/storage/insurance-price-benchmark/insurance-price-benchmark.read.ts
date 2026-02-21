import { InsurancePriceBenchmark } from '@/domain/insurance-price-benchmark.model';
import { getPrismaClient } from '@/storage/utils';
import { dbInsurancePriceBenchmarkToDomain } from './insurance-price-benchmark.mappers';

export const dbInsurancePriceBenchmarkRead = async (id: string): Promise<InsurancePriceBenchmark> => {
  const prisma = getPrismaClient();
  const row = await prisma.insurancePriceBenchmark.findUniqueOrThrow({
    where: { id },
  });
  return dbInsurancePriceBenchmarkToDomain(row);
};

/**
 * Returns the price benchmark that applies for the given year and car price.
 * The applicable row is the one where carPrice < maxCarPrice (bands are [0, maxCarPrice)).
 * Picks the band with the smallest maxCarPrice that is still > carPrice.
 * If carPrice exceeds all bands for that year, returns the row with the largest maxCarPrice (unbounded band).
 * Returns null if no benchmarks exist for the year.
 */
export const dbInsurancePriceBenchmarkFindByYearAndCarPrice = async (
  year: number,
  carPrice: number,
): Promise<InsurancePriceBenchmark | null> => {
  const prisma = getPrismaClient();

  const applicable = await prisma.insurancePriceBenchmark.findFirst({
    where: {
      year,
      maxCarPrice: { gt: carPrice },
    },
    orderBy: { maxCarPrice: 'asc' },
  });

  if (applicable) return dbInsurancePriceBenchmarkToDomain(applicable);

  const fallback = await prisma.insurancePriceBenchmark.findFirst({
    where: { year },
    orderBy: { maxCarPrice: 'desc' },
  });

  return fallback ? dbInsurancePriceBenchmarkToDomain(fallback) : null;
};

/**
 * Returns the most recent insurance price benchmark (by updatedAt) for the given year
 * where carValue < maxCarPrice (strictly). Returns null if no such record exists.
 */
export const dbInsurancePriceBenchmarkFindMostRecentByYearAndCarPriceBelowMax = async (
  year: number,
  carValue: number,
): Promise<InsurancePriceBenchmark | null> => {
  const prisma = getPrismaClient();
  const row = await prisma.insurancePriceBenchmark.findFirst({
    where: {
      year,
      maxCarPrice: { gt: carValue },
    },
    orderBy: { updatedAt: 'desc' },
  });
  return row ? dbInsurancePriceBenchmarkToDomain(row) : null;
};
