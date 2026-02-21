import { PrismaClient } from '@/storage/client/client';

const DEFAULT_FISCAL_REGION = {
  code: 'vlaanderen',
  isDefault: true,
  translations: [
    { locale: 'en', name: 'Flanders' },
    { locale: 'nl', name: 'Vlaanderen' },
    { locale: 'fr', name: 'Flandre' },
  ],
};

export async function seedFiscalRegions(prisma: PrismaClient) {
  const count = await prisma.fiscalRegion.count();
  if (count > 0) {
    console.log('Fiscal regions already seeded, skipping.');
    return;
  }

  console.log('Seeding fiscal regions...');

  await prisma.fiscalRegion.create({
    data: {
      code: DEFAULT_FISCAL_REGION.code,
      isDefault: DEFAULT_FISCAL_REGION.isDefault,
      translations: {
        createMany: { data: DEFAULT_FISCAL_REGION.translations },
      },
    },
  });
  console.log(`  Seeded: ${DEFAULT_FISCAL_REGION.code} (Vlaanderen)`);

  console.log('Fiscal region seeding complete.');
}
