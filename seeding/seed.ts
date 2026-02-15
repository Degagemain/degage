import { seedFuelTypes } from './seed-fuel-types';
import { seedCarBrands } from './seed-car-brands';
import { seedCarTypes } from './seed-car-types';
import { seedEuroNorms } from './seed-euro-norms';
import { seedSystemParameters } from './seed-system-parameters';
import { getPrismaClient } from '@/storage/utils';

const prisma = getPrismaClient();

async function seed() {
  await seedFuelTypes(prisma);
  await seedCarBrands(prisma);
  await seedEuroNorms(prisma);
  await seedCarTypes(prisma);
  await seedSystemParameters(prisma);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
