import { PrismaClient } from '@/storage/client/client';
import * as fs from 'fs';
import * as path from 'path';

type CsvRow = {
  defaultHub: string;
  ownerKm: string;
  sharedAvgKm: string;
  sharedMinKm: string;
  sharedMaxKm: string;
};

const CSV_PATH = path.join(process.cwd(), 'seeding', 'hub-benchmark.csv');

function parseCsv(raw: string): CsvRow[] {
  const lines = raw.trim().split('\n');
  const header = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    header.forEach((key, i) => {
      row[key.trim()] = values[i].trim();
    });
    return row as unknown as CsvRow;
  });
}

export async function seedHubBenchmarks(prisma: PrismaClient) {
  const count = await prisma.hubBenchmark.count();
  if (count > 0) {
    console.log('Hub benchmarks already seeded, skipping.');
    return;
  }

  console.log('Seeding hub benchmarks...');

  const hubs = await prisma.hub.findMany({ select: { id: true, isDefault: true } });
  const defaultHub = hubs.find((h) => h.isDefault);
  const nonDefaultHub = hubs.find((h) => !h.isDefault);

  if (!defaultHub) {
    throw new Error('No default hub found. Seed hubs first.');
  }
  if (!nonDefaultHub) {
    throw new Error('No non-default hub found. Seed hubs first.');
  }

  const raw = fs.readFileSync(CSV_PATH, 'utf-8');
  const rows = parseCsv(raw);

  const toInsert = rows.map((row) => ({
    hubId: row.defaultHub === 'true' ? defaultHub.id : nonDefaultHub.id,
    ownerKm: parseInt(row.ownerKm, 10),
    sharedAvgKm: parseInt(row.sharedAvgKm, 10),
    sharedMinKm: parseInt(row.sharedMinKm, 10),
    sharedMaxKm: parseInt(row.sharedMaxKm, 10),
  }));

  await prisma.hubBenchmark.createMany({ data: toInsert });

  console.log(`Hub benchmark seeding complete (${toInsert.length} benchmarks).`);
}
