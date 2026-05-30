import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PrismaClient } from '@/storage/client/client';

const CSV_PATH = join(process.cwd(), 'seeding', 'seed-towns-2.csv');

type TownCsvRow = {
  zip: string;
  name: string;
  municipality: string;
  provinceName: string;
};

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let i = 0;
  let inQuotes = false;

  while (i < text.length) {
    const c = text[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (c === '\r') {
      i++;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      field = '';
      if (row.length > 1 || row[0] !== '') {
        rows.push(row);
      }
      row = [];
      i++;
      continue;
    }
    field += c;
    i++;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0] !== '') {
      rows.push(row);
    }
  }

  return rows;
};

const loadTownRows = (): TownCsvRow[] => {
  const table = parseCsv(readFileSync(CSV_PATH, 'utf-8'));
  const header = table[0];
  if (!header || header[0] !== 'zip') {
    throw new Error('seed-towns-2.csv must have header: zip,name,municipality,province');
  }

  return table.slice(1).map((cells) => {
    const [zip, name, municipality, provinceName] = cells;
    if (!zip || !name || !municipality || !provinceName) {
      throw new Error(`Invalid row in seed-towns-2.csv: ${cells.join(',')}`);
    }
    return { zip, name, municipality, provinceName };
  });
};

export async function migrateTowns2(prisma: PrismaClient): Promise<void> {
  const rows = loadTownRows();

  const provinces = await prisma.province.findMany({ select: { id: true, name: true } });
  const provinceByName = new Map(provinces.map((p) => [p.name, p.id]));

  const defaultHub = await prisma.hub.findFirst({
    where: { isDefault: true },
    select: { id: true },
  });
  if (!defaultHub) {
    throw new Error('No default hub found.');
  }

  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const provinceId = provinceByName.get(row.provinceName);
    if (!provinceId) {
      throw new Error(`Unmatched province "${row.provinceName}" for town ${row.name} (zip ${row.zip}). Aborting town migration.`);
    }

    const existing = await prisma.town.findFirst({
      where: {
        zip: row.zip,
        name: row.name,
        municipality: row.municipality,
      },
      select: { id: true },
    });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.town.create({
      data: {
        zip: row.zip,
        name: row.name,
        municipality: row.municipality,
        provinceId,
        hubId: defaultHub.id,
        highDemand: false,
        hasActiveMembers: false,
      },
    });
    inserted++;
  }

  console.log(`Town migration complete (${inserted} inserted, ${skipped} already present).`);
}
