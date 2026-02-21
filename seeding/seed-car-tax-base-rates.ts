import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@/storage/client/client';

const CSV_PATH = join(process.cwd(), 'seeding', 'car-tax-base-rates.csv');

function parseDateUtc(s: string): Date {
  const [day, month, year] = s.split('/').map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!));
}

export async function seedCarTaxBaseRates(prisma: PrismaClient) {
  const count = await prisma.carTaxBaseRate.count();
  if (count > 0) {
    console.log('Car tax base rates already seeded, skipping.');
    return;
  }

  const defaultFiscalRegion = await prisma.fiscalRegion.findFirstOrThrow({
    where: { isDefault: true },
  });

  const lines = readFileSync(CSV_PATH, 'utf-8').split('\n');

  console.log('Seeding car tax base rates...');
  for (let i = 1; i < lines.length; i++) {
    const [maxCc, fiscalPk, start, end, rate] = lines[i]!.trim().split(',');
    if (!maxCc) continue;
    await prisma.carTaxBaseRate.create({
      data: {
        fiscalRegionId: defaultFiscalRegion.id,
        maxCc: Number(maxCc),
        fiscalPk: Number(fiscalPk),
        start: parseDateUtc(start!),
        end: parseDateUtc(end!),
        rate: Number(rate),
      },
    });
  }
  console.log(`  Seeded ${lines.length - 1} car tax base rate(s).`);
}
