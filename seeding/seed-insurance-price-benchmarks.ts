import { PrismaClient } from '@/storage/client/client';

/** Sentinel for "no upper bound" on car price. */
const UNBOUNDED_CAR_PRICE = 999_999_999;

const SEED_DATA: { year: number; maxCarPrice: number; baseRate: number; rate: number }[] = [
  // Low car price band
  { year: 2024, maxCarPrice: 10_000, baseRate: 395, rate: 0.015 },
  { year: 2025, maxCarPrice: 10_000, baseRate: 395, rate: 0.015 },
  { year: 2026, maxCarPrice: 10_000, baseRate: 426, rate: 0.0162 },
  // High car price band (unbounded)
  { year: 2024, maxCarPrice: UNBOUNDED_CAR_PRICE, baseRate: 365, rate: 0.035 },
  { year: 2025, maxCarPrice: UNBOUNDED_CAR_PRICE, baseRate: 365, rate: 0.035 },
  { year: 2026, maxCarPrice: UNBOUNDED_CAR_PRICE, baseRate: 394.23, rate: 0.0378 },
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
