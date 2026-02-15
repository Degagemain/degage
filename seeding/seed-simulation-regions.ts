import { PrismaClient } from '@/storage/client/client';

const SIMULATION_REGIONS: { name: string; isDefault: boolean }[] = [
  { name: 'default', isDefault: true },
  { name: 'Kernregio (Gent)', isDefault: false },
];

export async function seedSimulationRegions(prisma: PrismaClient) {
  const count = await prisma.simulationRegion.count();
  if (count > 0) {
    console.log('Simulation regions already seeded, skipping.');
    return;
  }

  console.log('Seeding simulation regions...');

  for (const region of SIMULATION_REGIONS) {
    await prisma.simulationRegion.create({
      data: { name: region.name, isDefault: region.isDefault },
    });
    console.log(`  Seeded: ${region.name}${region.isDefault ? ' (default)' : ''}`);
  }

  console.log('Simulation region seeding complete.');
}
