import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../app/storage/client/client';
import { seedFuelTypes } from './seed-fuel-types';
import { seedCarBrands } from './seed-car-brands';
import { seedEuroNorms } from './seed-euro-norms';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function seed() {
  await seedFuelTypes(prisma);
  await seedCarBrands(prisma);
  await seedEuroNorms(prisma);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
