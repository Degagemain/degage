import { PrismaClient } from '@/storage/client/client';

const PROVINCE_NAMES = [
  'Brussels Hoofdstedelijk Gewest',
  'Waals-Brabant',
  'Vlaams-Brabant',
  'Antwerpen',
  'Limburg',
  'Luik',
  'Namen',
  'Henegouwen',
  'Luxemburg',
  'West-Vlaanderen',
  'Oost-Vlaanderen',
];

export async function seedProvinces(prisma: PrismaClient) {
  const count = await prisma.province.count();
  if (count > 0) {
    console.log('Provinces already seeded, skipping.');
    return;
  }

  console.log('Seeding provinces...');

  for (const name of PROVINCE_NAMES) {
    await prisma.province.create({
      data: { name },
    });
    console.log(`  Seeded: ${name}`);
  }

  console.log('Province seeding complete.');
}
