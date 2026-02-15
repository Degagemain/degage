import { PrismaClient } from '@/storage/client/client';
import { SystemParameterCategory } from '@/domain/system-parameter.model';

const SIMULATION_PARAMETERS = [
  {
    code: 'maxAgeYears',
    category: SystemParameterCategory.SIMULATION,
    type: 'number' as const,
    valueNumber: 15,
    translations: [
      {
        locale: 'en',
        name: 'Max age (years)',
        description: 'Used in the simulation to reject cars that exceed this age.',
      },
      {
        locale: 'nl',
        name: 'Max leeftijd (jaar)',
        description: 'Gebruikt in de simulatie om auto’s die deze leeftijd overschrijden te weigeren.',
      },
      {
        locale: 'fr',
        name: 'Âge max. (années)',
        description: 'Utilisé dans la simulation pour refuser les voitures qui dépassent cet âge.',
      },
    ],
  },
  {
    code: 'maxKm',
    category: SystemParameterCategory.SIMULATION,
    type: 'number' as const,
    valueNumber: 200_000,
    translations: [
      {
        locale: 'en',
        name: 'Maximum km',
        description: 'Used in the simulation to reject cars that exceed this mileage.',
      },
      {
        locale: 'nl',
        name: 'Maximum km',
        description: 'Gebruikt in de simulatie om auto’s die dit aantal km overschrijden te weigeren.',
      },
      {
        locale: 'fr',
        name: 'Kilométrage max.',
        description: 'Utilisé dans la simulation pour refuser les voitures qui dépassent ce kilométrage.',
      },
    ],
  },
];

export async function seedSystemParameters(prisma: PrismaClient) {
  console.log('Seeding system parameters...');

  for (const param of SIMULATION_PARAMETERS) {
    const existing = await prisma.systemParameter.findUnique({
      where: { code: param.code },
    });

    if (existing) {
      console.log(`  Skipped (exists): ${param.code}`);
      continue;
    }

    await prisma.systemParameter.create({
      data: {
        code: param.code,
        category: param.category as 'simulation',
        type: param.type,
        valueNumber: param.valueNumber,
        translations: {
          createMany: {
            data: param.translations,
          },
        },
      },
    });
    console.log(`  Seeded: ${param.code}`);
  }

  console.log('System parameters seeding complete.');
}
