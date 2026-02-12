import { PrismaClient } from '@/storage/client/client';
import * as fs from 'fs';
import * as path from 'path';

/** Maps external/HTML fuel type values (e.g. VitoFuelEN_in) to our fuel type codes. */
const HTML_FUEL_TYPE_TO_CODE: Record<string, string> = {
  Petrol: 'gasoline',
  'Petrol hybrid': 'hybrid',
  'Petrol PHEV': 'plugin-hybrid',
  CNG: 'cng',
  Diesel: 'diesel',
  'Diesel hybrid': 'hybrid',
  'Diesel PHEV': 'plugin-hybrid',
  Electricity: 'electric',
  LPG: 'lpg',
  Hydrogen: 'hydrogen',
};

type CarTypesJsonRow = {
  Merk: string;
  Model: string;
  Brandstoftype: string;
  Ecoscore: number;
};

const CAR_TYPES_JSON_PATH = path.join(process.cwd(), 'seeding', 'car-types.json');

/**
 * Converts JSON brand name (e.g. "CITROEN", "ALFA ROMEO") to our car brand code.
 */
function merkToCode(merk: string): string {
  const code = merk.toLowerCase().trim().replace(/\s+/g, '-').replace(/&/g, '-').replaceAll(' ', '');
  if (code === 'mercedes') return 'mercedes-benz';
  return code;
}

export async function seedCarTypes(prisma: PrismaClient) {
  console.log('Seeding car types...');

  const existingCount = await prisma.carType.count();
  if (existingCount > 0) {
    console.log(`  Skipped: ${existingCount} car type(s) already in database.`);
    return;
  }

  const raw = fs.readFileSync(CAR_TYPES_JSON_PATH, 'utf-8');
  const rows: CarTypesJsonRow[] = JSON.parse(raw);

  const brands = await prisma.carBrand.findMany({ select: { id: true, code: true } });
  const fuelTypes = await prisma.fuelType.findMany({ select: { id: true, code: true } });

  const brandCodeToId = new Map(brands.map((b) => [b.code, b.id]));
  const fuelCodeToId = new Map(fuelTypes.map((f) => [f.code, f.id]));

  const toCreate: { brandId: string; fuelTypeId: string; name: string; ecoscore: number }[] = [];
  let skipped = 0;

  for (const row of rows) {
    const brandCode = merkToCode(row.Merk);
    const fuelCode = HTML_FUEL_TYPE_TO_CODE[row.Brandstoftype];

    const brandId = brandCodeToId.get(brandCode);
    const fuelTypeId = fuelCode ? fuelCodeToId.get(fuelCode) : undefined;

    if (!brandId || !fuelTypeId) {
      if (!brandId) {
        console.log(`  Skipped: ${row.Merk} (unknown brand)`);
        skipped += 1;
        continue;
      }
      if (!fuelTypeId) {
        console.log(`  Skipped:${row.Brandstoftype} (unknown fuel type)`);
        skipped += 1;
        continue;
      }
    }

    toCreate.push({
      brandId,
      fuelTypeId,
      name: row.Model,
      ecoscore: row.Ecoscore,
    });
  }

  const BATCH_SIZE = 500;
  for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
    const batch = toCreate.slice(i, i + BATCH_SIZE);
    await prisma.carType.createMany({ data: batch });
    console.log(`  Created car types ${i + 1}-${i + batch.length} of ${toCreate.length}`);
  }

  if (skipped > 0) {
    console.log(`  Skipped ${skipped} rows (unknown brand or fuel type).`);
  }

  console.log('Car type seeding complete.');
}
