import { PrismaClient } from '@/storage/client/client';
import * as fs from 'fs';
import * as path from 'path';

type TownJsonRow = {
  zip: number;
  name: string;
  municipality: string;
  provinceName: string;
  highDemand: boolean;
  hasActiveMembers: boolean;
  isNonDefaultSimulationRegion: boolean;
};

const TOWNS_JSON_PATH = path.join(process.cwd(), 'seeding', 'towns.json');

const BATCH_SIZE = 1000;

export async function seedTowns(prisma: PrismaClient) {
  const count = await prisma.town.count();
  if (count > 0) {
    console.log('Towns already seeded, skipping.');
    return;
  }

  console.log('Seeding towns...');

  const provinces = await prisma.province.findMany({ select: { id: true, name: true } });
  const provinceByIdName = new Map(provinces.map((p) => [p.name, p.id]));

  const simulationRegions = await prisma.simulationRegion.findMany({
    select: { id: true, isDefault: true },
  });
  const defaultRegion = simulationRegions.find((r) => r.isDefault);
  const nonDefaultRegion = simulationRegions.find((r) => !r.isDefault);

  if (!defaultRegion) {
    throw new Error('No default simulation region found. Seed simulation regions first.');
  }
  if (!nonDefaultRegion) {
    throw new Error('No non-default simulation region found. Seed simulation regions first.');
  }

  const raw = fs.readFileSync(TOWNS_JSON_PATH, 'utf-8');
  const rows: TownJsonRow[] = JSON.parse(raw);

  const toInsert: {
    zip: string;
    name: string;
    municipality: string;
    provinceId: string;
    simulationRegionId: string;
    highDemand: boolean;
    hasActiveMembers: boolean;
  }[] = [];

  for (const row of rows) {
    const provinceId = provinceByIdName.get(row.provinceName);
    if (!provinceId) {
      throw new Error(`Unmatched province "${row.provinceName}" for town ${row.name} (zip ${row.zip}). Aborting town seed.`);
    }
    const simulationRegionId = row.isNonDefaultSimulationRegion ? nonDefaultRegion.id : defaultRegion.id;
    toInsert.push({
      zip: String(row.zip),
      name: row.name,
      municipality: row.municipality,
      provinceId,
      simulationRegionId,
      highDemand: row.highDemand,
      hasActiveMembers: row.hasActiveMembers,
    });
  }

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    await prisma.town.createMany({ data: batch });
    console.log(`  Seeded batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(toInsert.length / BATCH_SIZE)} (${batch.length} towns)`);
  }

  console.log(`Town seeding complete (${toInsert.length} towns).`);
}
