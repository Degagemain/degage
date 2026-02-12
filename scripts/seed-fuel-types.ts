import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../app/storage/client/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const fuelTypes = [
  {
    code: 'ELECTRIC',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Electric' },
      { locale: 'nl', name: 'Elektrisch' },
      { locale: 'fr', name: 'Électrique' },
    ],
  },
  {
    code: 'DIESEL',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Diesel' },
      { locale: 'nl', name: 'Diesel' },
      { locale: 'fr', name: 'Diesel' },
    ],
  },
  {
    code: 'GASOLINE',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Gasoline' },
      { locale: 'nl', name: 'Benzine' },
      { locale: 'fr', name: 'Essence' },
    ],
  },
  {
    code: 'HYBRID',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Hybrid' },
      { locale: 'nl', name: 'Hybride' },
      { locale: 'fr', name: 'Hybride' },
    ],
  },
  {
    code: 'PLUGIN_HYBRID',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Plugin Hybrid' },
      { locale: 'nl', name: 'Plugin Hybride' },
      { locale: 'fr', name: 'Hybride Rechargeable' },
    ],
  },
  {
    code: 'LPG',
    isActive: true,
    translations: [
      { locale: 'en', name: 'LPG' },
      { locale: 'nl', name: 'LPG' },
      { locale: 'fr', name: 'GPL' },
    ],
  },
  {
    code: 'CNG',
    isActive: true,
    translations: [
      { locale: 'en', name: 'CNG' },
      { locale: 'nl', name: 'CNG' },
      { locale: 'fr', name: 'GNC' },
    ],
  },
];

async function seed() {
  console.log('Seeding fuel types...');

  for (const ft of fuelTypes) {
    await prisma.fuelType.upsert({
      where: { code: ft.code },
      update: {
        isActive: ft.isActive,
        translations: {
          deleteMany: {},
          createMany: { data: ft.translations },
        },
      },
      create: {
        code: ft.code,
        isActive: ft.isActive,
        translations: {
          createMany: { data: ft.translations },
        },
      },
    });
    console.log(`  Seeded: ${ft.code}`);
  }

  console.log('Fuel type seeding complete.');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
