import { HubBenchmark } from '@/domain/hub-benchmark.model';
import { getPrismaClient } from '@/storage/utils';
import { dbHubBenchmarkToDomain } from './hub-benchmark.mappers';

export const dbHubBenchmarkRead = async (id: string): Promise<HubBenchmark> => {
  const prisma = getPrismaClient();
  const hb = await prisma.hubBenchmark.findUniqueOrThrow({
    where: { id },
  });
  return dbHubBenchmarkToDomain(hb);
};

/**
 * Find the closest hub benchmark where inputKm <= benchmark.ownerKm.
 * Picks the benchmark with the smallest ownerKm that is still >= inputKm.
 * If no such benchmark exists, falls back to the one with the largest ownerKm.
 * Returns null only if the hub has no benchmarks at all.
 */
export const dbHubBenchmarkFindClosest = async (hubId: string, inputKm: number): Promise<HubBenchmark | null> => {
  const prisma = getPrismaClient();
  const result = await prisma.hubBenchmark.findFirst({
    where: {
      hubId,
      ownerKm: { gte: inputKm },
    },
    orderBy: { ownerKm: 'asc' },
  });

  if (result) return dbHubBenchmarkToDomain(result);

  // Fallback: inputKm exceeds all benchmarks — return the highest one
  const fallback = await prisma.hubBenchmark.findFirst({
    where: { hubId },
    orderBy: { ownerKm: 'desc' },
  });

  return fallback ? dbHubBenchmarkToDomain(fallback) : null;
};
