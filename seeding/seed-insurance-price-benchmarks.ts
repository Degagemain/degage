import { PrismaClient } from '@/storage/client/client';

/** Sentinel for "no upper bound" (mileage >= 10_000 km). */
const UNBOUNDED_MILEAGE = 999_999_999;

const SEED_DATA: { year: number; maxMileageExclusive: number; kmPrice: number }[] = [
  // Mileage < 10_000 km
  { year: 2024, maxMileageExclusive: 10_000, kmPrice: 0.015 },
  { year: 2025, maxMileageExclusive: 10_000, kmPrice: 0.015 },
  { year: 2026, maxMileageExclusive: 10_000, kmPrice: 0.0162 },
  // Mileage >= 10_000 km
  { year: 2024, maxMileageExclusive: UNBOUNDED_MILEAGE, kmPrice: 0.035 },
  { year: 2025, maxMileageExclusive: UNBOUNDED_MILEAGE, kmPrice: 0.035 },
  { year: 2026, maxMileageExclusive: UNBOUNDED_MILEAGE, kmPrice: 0.0378 },
];

export async function seedInsurancePriceBenchmarks(prisma: PrismaClient) {
  const count = await prisma.insurancePriceBenchmark.count();
  if (count > 0) {
    console.log('Insurance price benchmarks already seeded, skipping.');
    return;
  }

  console.log('Seeding insurance price benchmarks...');

  await prisma.insurancePriceBenchmark.createMany({
    data: SEED_DATA,
  });

  console.log(`Insurance price benchmark seeding complete (${SEED_DATA.length} records).`);
}
