import { PrismaClient } from '@/storage/client/client';

const INSURERS = ['Ethias', 'AG', 'KBC', 'Baloise', 'AXA', 'Belfius', 'Vivium'] as const;

export async function seedInsurers(prisma: PrismaClient) {
  const existingCount = await prisma.insurer.count();
  if (existingCount > 0) {
    console.log('Insurers already seeded, skipping.');
    return;
  }

  console.log('Seeding insurers...');

  for (const name of INSURERS) {
    await prisma.insurer.upsert({
      where: { name },
      update: { name },
      create: { name },
    });
    console.log(`  Seeded: ${name}`);
  }

  console.log('Insurer seeding complete.');
}
