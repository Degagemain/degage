import { PrismaClient } from '@/storage/client/client';

const EURO_NORMS: { code: string; name: string; start: string; end: string | null }[] = [
  { code: 'euro-1', name: 'Euro 1', start: '1992-07-01', end: '1996-12-31' },
  { code: 'euro-2', name: 'Euro 2', start: '1997-01-01', end: '2000-12-31' },
  { code: 'euro-3', name: 'Euro 3', start: '2001-01-01', end: '2005-12-31' },
  { code: 'euro-4', name: 'Euro 4', start: '2006-01-01', end: '2010-12-31' },
  { code: 'euro-5', name: 'Euro 5', start: '2011-01-01', end: '2015-08-31' },
  { code: 'euro-6b', name: 'Euro 6b', start: '2015-09-01', end: '2018-08-31' },
  { code: 'euro-6c', name: 'Euro 6c', start: '2018-09-01', end: '2019-08-31' },
  { code: 'euro-6d-temp', name: 'Euro 6d-TEMP', start: '2019-09-01', end: '2020-12-31' },
  { code: 'euro-6d', name: 'Euro 6d', start: '2021-01-01', end: null },
  { code: 'euro-6e', name: 'Euro 6e', start: '2024-09-01', end: null },
  { code: 'euro-6e-bis', name: 'Euro 6e bis', start: '2025-01-01', end: null },
  { code: 'euro-7-7a', name: 'Euro 7 / 7A', start: '2025-07-01', end: null },
];

export async function seedEuroNorms(prisma: PrismaClient) {
  console.log('Seeding euro norms...');

  for (const en of EURO_NORMS) {
    await prisma.euroNorm.upsert({
      where: { code: en.code },
      update: {
        name: en.name,
        isActive: true,
        start: new Date(en.start),
        end: en.end ? new Date(en.end) : null,
      },
      create: {
        code: en.code,
        name: en.name,
        isActive: true,
        start: new Date(en.start),
        end: en.end ? new Date(en.end) : null,
      },
    });
    console.log(`  Seeded: ${en.code}`);
  }

  console.log('Euro norm seeding complete.');
}
