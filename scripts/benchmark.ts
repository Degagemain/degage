import * as fs from 'fs';
import * as path from 'path';

import { withRequestContext } from '@/context/request-context';
import { getPrismaClient } from '@/storage/utils';
import { runSimulationEngine } from '@/actions/simulation/engine';
import type { SimulationEngineResult, SimulationRunInput } from '@/domain/simulation.model';

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = values[i] ?? '';
    });
    return record;
  });
}

/** Parse European date format D-M-YYYY */
function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatResultRow(id: string, result: SimulationEngineResult, purchasePrice: number | null): string {
  const est = result.estimate;
  return [
    id,
    result.resultCode,
    result.resultEuroNorm ?? '',
    result.resultEcoScore ?? '',
    result.resultConsumption ?? '',
    result.resultCc ?? '',
    result.resultCo2 ?? '',
    result.resultInsuranceCostPerYear ?? '',
    result.resultTaxCostPerYear ?? '',
    result.resultInspectionCostPerYear ?? '',
    result.resultMaintenanceCostPerYear ?? '',
    result.resultBenchmarkMinKm ?? '',
    result.resultBenchmarkAvgKm ?? '',
    result.resultBenchmarkMaxKm ?? '',
    result.resultRoundedKmCost ?? '',
    result.resultDepreciationCostKm ?? '',
    result.error ?? '',
    result.resultEstimatedCarValue ?? '',
    est?.price ?? '',
    est?.min ?? '',
    est?.max ?? '',
    result.rejectionReason ?? '',
    purchasePrice ?? '',
  ].join(',');
}

const OUTPUT_HEADER = [
  'id',
  'resultCode',
  'resultEuroNorm',
  'resultEcoScore',
  'resultConsumption',
  'resultCc',
  'resultCo2',
  'resultInsuranceCostPerYear',
  'resultTaxCostPerYear',
  'resultInspectionCostPerYear',
  'resultMaintenanceCostPerYear',
  'resultBenchmarkMinKm',
  'resultBenchmarkAvgKm',
  'resultBenchmarkMaxKm',
  'resultRoundedKmCost',
  'resultDepreciationCostKm',
  'error',
  'resultEstimatedCarValue',
  'estimatePrice',
  'estimateMin',
  'estimateMax',
  'rejectionReason',
  'purchasePrice',
].join(',');

async function main() {
  const args = process.argv.slice(2);
  const sampleIndex = args.indexOf('--sample');
  const sampleValue = sampleIndex !== -1 ? args[sampleIndex + 1] : undefined;
  const sample = sampleValue ? parseInt(sampleValue) : undefined;

  const positional = args.filter((a) => !a.startsWith('--') && a !== args[sampleIndex + 1]);
  const inputPath = positional[0];

  if (!inputPath || !sample || isNaN(sample) || sample <= 0) {
    console.error('Usage: pnpm benchmark <input.csv> --sample <number>');
    console.error('Example: pnpm benchmark tmp/benchmark.csv --sample 100');
    process.exit(1);
  }

  const csvPath = path.resolve(inputPath);
  if (!fs.existsSync(csvPath)) {
    console.error(`Input file not found: ${csvPath}`);
    process.exit(1);
  }

  console.log('Loading benchmark CSV...');
  const allRows = parseCsv(fs.readFileSync(csvPath, 'utf-8'));
  allRows.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
  const rows = allRows.slice(0, sample);
  console.log(`Selected ${rows.length} rows (of ${allRows.length} total)`);

  console.log('Loading reference data from database...');
  const prisma = getPrismaClient();
  const [dbBrands, dbFuelTypes, dbCarTypes, dbTowns] = await Promise.all([
    prisma.carBrand.findMany({ include: { translations: true } }),
    prisma.fuelType.findMany({ include: { translations: true } }),
    prisma.carType.findMany(),
    prisma.town.findMany(),
  ]);

  const brandByName = new Map(
    dbBrands.map((b) => {
      const name = b.translations.find((t) => t.locale === 'nl')?.name ?? b.code;
      return [name, b] as const;
    }),
  );

  const fuelTypeByCode = new Map(dbFuelTypes.map((ft) => [ft.code, ft] as const));

  const carTypeByKey = new Map(dbCarTypes.map((ct) => [`${ct.brandId}|${ct.fuelTypeId}|${ct.name}`, ct] as const));

  const townByZip = new Map<string, (typeof dbTowns)[0]>();
  for (const town of dbTowns) {
    if (!townByZip.has(town.zip)) {
      townByZip.set(town.zip, town);
    }
  }

  console.log(`  Brands: ${dbBrands.length}, Fuel types: ${dbFuelTypes.length}, Car types: ${dbCarTypes.length}, Towns: ${dbTowns.length}`);

  console.log('Validating row mappings...');
  const inputs: Array<{ id: string; input: SimulationRunInput }> = [];

  for (const row of rows) {
    const brand = brandByName.get(row.brand);
    if (!brand) throw new Error(`Brand not found: "${row.brand}" (row ${row.id})`);

    const fuelType = fuelTypeByCode.get(row.fuelType);
    if (!fuelType) throw new Error(`Fuel type not found: "${row.fuelType}" (row ${row.id})`);

    const carType = carTypeByKey.get(`${brand.id}|${fuelType.id}|${row.carType}`);
    if (!carType) {
      throw new Error(`Car type not found: brand="${row.brand}", fuelType="${row.fuelType}", carType="${row.carType}" (row ${row.id})`);
    }

    const town = townByZip.get(row.zip);
    if (!town) {
      console.error(`Town not found for zip: "${row.zip}" (row ${row.id})`);
      continue;
    }

    const firstRegisteredAt = parseDate(row.firstRegisteredAt);
    const simulationDate = parseDate(row.date);
    const nlName = brand.translations.find((t) => t.locale === 'nl')?.name ?? brand.code;
    const isNewCar = row.new === 'TRUE';
    const rawValue = row.value?.trim();
    const purchasePrice = isNewCar && rawValue ? parseFloat(rawValue.replace(',', '.')) || null : null;

    inputs.push({
      id: row.id,
      input: {
        town: { id: town.id, name: town.name },
        brand: { id: brand.id, name: nlName },
        fuelType: { id: fuelType.id, name: fuelType.code },
        carType: { id: carType.id, name: carType.name },
        carTypeOther: null,
        mileage: parseInt(row.mileage),
        ownerKmPerYear: parseInt(row.kmOwner),
        seats: parseInt(row.seats),
        firstRegisteredAt,
        isVan: row.van === 'TRUE',
        isNewCar,
        purchasePrice,
        backtestYear: simulationDate.getFullYear(),
      },
    });
  }

  console.log(`All ${inputs.length} rows validated. Running simulations...`);

  const results: Array<{ id: string; input: SimulationRunInput; result: SimulationEngineResult }> = [];

  await withRequestContext({ locale: 'nl', contentLocale: 'nl' }, async () => {
    for (let i = 0; i < inputs.length; i++) {
      const { id, input } = inputs[i];
      const result = await runSimulationEngine(input);
      results.push({ id, input, result });
      console.log(`  [${i + 1}/${inputs.length}] id=${id} -> ${result.resultCode}`);
    }
  });

  const outputDir = path.resolve('tmp');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputPath = path.join(outputDir, `benchmark-${timestamp}.csv`);
  const csvContent = [OUTPUT_HEADER, ...results.map(({ id, input, result }) => formatResultRow(id, result, input.purchasePrice))].join('\n');
  fs.writeFileSync(outputPath, csvContent);

  console.log(`\nDone! Output written to ${outputPath}`);
}

main().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
