import { seedFuelTypes } from './seed-fuel-types';
import { seedCarBrands } from './seed-car-brands';
import { seedCarTypes } from './seed-car-types';
import { seedEuroNorms } from './seed-euro-norms';
import { seedFiscalRegions } from './seed-fiscal-regions';
import { seedProvinces } from './seed-provinces';
import { seedCarTaxBaseRates } from './seed-car-tax-base-rates';
import { seedCarTaxEuroNormAdjustments } from './seed-car-tax-euro-norm-adjustments';
import { seedCarTaxFlatRates } from './seed-car-tax-flat-rates';
import { seedHubs } from './seed-hubs';
import { seedHubBenchmarks } from './seed-hub-benchmarks';
import { seedInsurancePriceBenchmarks } from './seed-insurance-price-benchmarks';
import { seedTowns } from './seed-towns';
import { getPrismaClient } from '@/storage/utils';

const prisma = getPrismaClient();

async function seed() {
  await seedFuelTypes(prisma);
  await seedCarBrands(prisma);
  await seedEuroNorms(prisma);
  await seedFiscalRegions(prisma);
  await seedProvinces(prisma);
  await seedCarTaxBaseRates(prisma);
  await seedCarTaxEuroNormAdjustments(prisma);
  await seedCarTaxFlatRates(prisma);
  await seedHubs(prisma);
  await seedHubBenchmarks(prisma);
  await seedInsurancePriceBenchmarks(prisma);
  await seedTowns(prisma);
  await seedCarTypes(prisma);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
