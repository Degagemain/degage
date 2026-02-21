import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@/storage/client/client';

const CSV_PATH = join(process.cwd(), 'seeding', 'car-tax-euro-norm-adjustment.csv');

export async function seedCarTaxEuroNormAdjustments(prisma: PrismaClient) {
  const count = await prisma.carTaxEuroNormAdjustment.count();
  if (count > 0) {
    console.log('Car tax euro norm adjustments already seeded, skipping.');
    return;
  }

  const defaultFiscalRegion = await prisma.fiscalRegion.findFirstOrThrow({
    where: { isDefault: true },
  });

  const lines = readFileSync(CSV_PATH, 'utf-8')
    .split('\n')
    .filter((l) => l.trim());

  console.log('Seeding car tax euro norm adjustments...');
  for (let i = 1; i < lines.length; i++) {
    const [euroNormGroup, defaultAdjustment, dieselAdjustment] = lines[i]!.split(',');
    await prisma.carTaxEuroNormAdjustment.create({
      data: {
        fiscalRegionId: defaultFiscalRegion.id,
        euroNormGroup: Number(euroNormGroup),
        defaultAdjustment: Number(defaultAdjustment),
        dieselAdjustment: Number(dieselAdjustment),
      },
    });
  }
  console.log(`  Seeded ${lines.length - 1} car tax euro norm adjustment(s).`);
}
