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
 * Returns the price benchmark that applies for the given year and mileage.
 * The applicable row is the one where mileage < maxMileageExclusive (bands are [0, maxMileageExclusive)).
 * Picks the band with the smallest maxMileageExclusive that is still > mileage.
 * If mileage exceeds all bands for that year, returns the row with the largest maxMileageExclusive (unbounded band).
 * Returns null if no benchmarks exist for the year.
 */
export const dbInsurancePriceBenchmarkFindByYearAndMileage = async (year: number, mileage: number): Promise<InsurancePriceBenchmark | null> => {
  const prisma = getPrismaClient();

  const applicable = await prisma.insurancePriceBenchmark.findFirst({
    where: {
      year,
      maxMileageExclusive: { gt: mileage },
    },
    orderBy: { maxMileageExclusive: 'asc' },
  });

  if (applicable) return dbInsurancePriceBenchmarkToDomain(applicable);

  const fallback = await prisma.insurancePriceBenchmark.findFirst({
    where: { year },
    orderBy: { maxMileageExclusive: 'desc' },
  });

  return fallback ? dbInsurancePriceBenchmarkToDomain(fallback) : null;
};
