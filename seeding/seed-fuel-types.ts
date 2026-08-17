import { PrismaClient } from '@/storage/client/client';

const fuelTypes = [
  {
    code: 'electric',
    isActive: true,
    order: 0,
    pricePer: 0.39,
    co2Contribution: 4,
    translations: [
      { locale: 'en', name: 'Electric' },
      { locale: 'nl', name: 'Elektrisch' },
      { locale: 'fr', name: 'Électrique' },
    ],
  },
  {
    code: 'diesel',
    isActive: true,
    order: 10,
    pricePer: 2,
    co2Contribution: 1,
    translations: [
      { locale: 'en', name: 'Diesel' },
      { locale: 'nl', name: 'Diesel' },
      { locale: 'fr', name: 'Diesel' },
    ],
  },
  {
    code: 'gasoline',
    isActive: true,
    order: 20,
    pricePer: 1.9,
    co2Contribution: 2,
    translations: [
      { locale: 'en', name: 'Gasoline' },
      { locale: 'nl', name: 'Benzine' },
      { locale: 'fr', name: 'Essence' },
    ],
  },
  {
    code: 'hybrid',
    isActive: true,
    order: 30,
    pricePer: 1.2,
    co2Contribution: 2,
    translations: [
      { locale: 'en', name: 'Hybrid' },
      { locale: 'nl', name: 'Hybride' },
      { locale: 'fr', name: 'Hybride' },
    ],
  },
  {
    code: 'plugin-hybrid',
    isActive: true,
    order: 40,
    pricePer: 0.9,
    co2Contribution: 2,
    translations: [
      { locale: 'en', name: 'Plugin Hybrid' },
      { locale: 'nl', name: 'Plugin Hybride' },
      { locale: 'fr', name: 'Hybride Rechargeable' },
    ],
  },
  {
    code: 'lpg',
    isActive: true,
    order: 50,
    pricePer: 1,
    co2Contribution: 3,
    translations: [
      { locale: 'en', name: 'LPG' },
      { locale: 'nl', name: 'LPG' },
      { locale: 'fr', name: 'GPL' },
    ],
  },
  {
    code: 'cng',
    isActive: true,
    order: 60,
    pricePer: 1.75,
    co2Contribution: 3,
    translations: [
      { locale: 'en', name: 'CNG' },
      { locale: 'nl', name: 'CNG' },
      { locale: 'fr', name: 'GNC' },
    ],
  },
  {
    code: 'hydrogen',
    isActive: true,
    order: 70,
    pricePer: 0,
    co2Contribution: 0,
    translations: [
      { locale: 'en', name: 'Hydrogen' },
      { locale: 'nl', name: 'Waterstof' },
      { locale: 'fr', name: 'Hydrogène' },
    ],
  },
];

export async function seedFuelTypes(prisma: PrismaClient) {
  console.log('Seeding fuel types...');

  for (const ft of fuelTypes) {
    await prisma.fuelType.upsert({
      where: { code: ft.code },
      update: {
        isActive: ft.isActive,
        order: ft.order,
        pricePer: ft.pricePer,
        co2Contribution: ft.co2Contribution,
        translations: {
          deleteMany: {},
          createMany: { data: ft.translations },
        },
      },
      create: {
        code: ft.code,
        isActive: ft.isActive,
        order: ft.order,
        pricePer: ft.pricePer,
        co2Contribution: ft.co2Contribution,
        translations: {
          createMany: { data: ft.translations },
        },
      },
    });
    console.log(`  Seeded: ${ft.code}`);
  }

  console.log('Fuel type seeding complete.');
}
