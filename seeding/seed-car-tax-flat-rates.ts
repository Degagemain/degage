import { PrismaClient } from '@/storage/client/client';

const START_DATE = new Date(Date.UTC(2026, 0, 1)); // 01 Jan 2026 UTC

export async function seedCarTaxFlatRates(prisma: PrismaClient) {
  const count = await prisma.carTaxFlatRate.count();
  if (count > 0) {
    console.log('Car tax flat rates already seeded, skipping.');
    return;
  }

  const defaultFiscalRegion = await prisma.fiscalRegion.findFirstOrThrow({
    where: { isDefault: true },
  });

  console.log('Seeding car tax flat rates...');
  await prisma.carTaxFlatRate.create({
    data: {
      fiscalRegionId: defaultFiscalRegion.id,
      start: START_DATE,
      rate: 102.96,
    },
  });
  console.log('  Seeded 1 car tax flat rate(s).');
}
