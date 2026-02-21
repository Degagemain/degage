import { PrismaClient } from '@/storage/client/client';
import { hubSchema } from '@/domain/hub.model';
import { createHub } from '@/actions/hub/create';
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
    const validated = hubSchema.parse({
      id: null,
      name: hub.name,
      isDefault: hub.isDefault,
    });
    await createHub(validated);
    console.log(`  Seeded: ${hub.name}${hub.isDefault ? ' (default)' : ''}`);
  }

  console.log('Hub seeding complete.');
}
