const fuelTypes = [
  {
    code: 'electric',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Electric' },
      { locale: 'nl', name: 'Elektrisch' },
      { locale: 'fr', name: 'Électrique' },
    ],
  },
  {
    code: 'diesel',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Diesel' },
      { locale: 'nl', name: 'Diesel' },
      { locale: 'fr', name: 'Diesel' },
    ],
  },
  {
    code: 'gasoline',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Gasoline' },
      { locale: 'nl', name: 'Benzine' },
      { locale: 'fr', name: 'Essence' },
    ],
  },
  {
    code: 'hybrid',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Hybrid' },
      { locale: 'nl', name: 'Hybride' },
      { locale: 'fr', name: 'Hybride' },
    ],
  },
  {
    code: 'plugin-hybrid',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Plugin Hybrid' },
      { locale: 'nl', name: 'Plugin Hybride' },
      { locale: 'fr', name: 'Hybride Rechargeable' },
    ],
  },
  {
    code: 'lpg',
    isActive: true,
    translations: [
      { locale: 'en', name: 'LPG' },
      { locale: 'nl', name: 'LPG' },
      { locale: 'fr', name: 'GPL' },
    ],
  },
  {
    code: 'cng',
    isActive: true,
    translations: [
      { locale: 'en', name: 'CNG' },
      { locale: 'nl', name: 'CNG' },
      { locale: 'fr', name: 'GNC' },
    ],
  },
  {
    code: 'hydrogen',
    isActive: true,
    translations: [
      { locale: 'en', name: 'Hydrogen' },
      { locale: 'nl', name: 'Waterstof' },
      { locale: 'fr', name: 'Hydrogène' },
    ],
  },
];

export async function seedFuelTypes(prisma: { fuelType: { upsert: (args: unknown) => Promise<unknown> } }) {
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
