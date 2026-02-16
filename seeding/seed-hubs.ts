import { PrismaClient } from '@/storage/client/client';

const HUBS: { name: string; isDefault: boolean }[] = [
  { name: 'default', isDefault: true },
  { name: 'Kernregio (Gent)', isDefault: false },
];

export async function seedHubs(prisma: PrismaClient) {
  const count = await prisma.hub.count();
  if (count > 0) {
    console.log('Hubs already seeded, skipping.');
    return;
  }

  console.log('Seeding hubs...');

  for (const hub of HUBS) {
    await prisma.hub.create({
      data: { name: hub.name, isDefault: hub.isDefault },
    });
    console.log(`  Seeded: ${hub.name}${hub.isDefault ? ' (default)' : ''}`);
  }

  console.log('Hub seeding complete.');
}
