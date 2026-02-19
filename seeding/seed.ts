import { seedFuelTypes } from './seed-fuel-types';
import { seedCarBrands } from './seed-car-brands';
import { seedCarTypes } from './seed-car-types';
import { seedEuroNorms } from './seed-euro-norms';
import { seedProvinces } from './seed-provinces';
import { seedHubs } from './seed-hubs';
import { seedTowns } from './seed-towns';
import { getPrismaClient } from '@/storage/utils';

const prisma = getPrismaClient();

async function seed() {
  await seedFuelTypes(prisma);
  await seedCarBrands(prisma);
  await seedEuroNorms(prisma);
  await seedProvinces(prisma);
  await seedHubs(prisma);
  await seedTowns(prisma);
  await seedCarTypes(prisma);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
