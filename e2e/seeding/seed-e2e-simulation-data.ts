import { getPrismaClient } from '@/storage/utils';

import { E2E_SIMULATION } from '../simulation-fixtures';

export async function seedE2eSimulationData() {
  const prisma = getPrismaClient();

  const brand = await prisma.carBrand.findFirst({ where: { code: E2E_SIMULATION.brandCode } });
  const fuelType = await prisma.fuelType.findFirst({ where: { code: E2E_SIMULATION.fuelTypeCode } });
  if (!brand || !fuelType) {
    throw new Error('E2E simulation seed: Volkswagen brand or gasoline fuel type not found');
  }

  const carType = await prisma.carType.findFirst({
    where: {
      brandId: brand.id,
      fuelTypeId: fuelType.id,
      name: E2E_SIMULATION.carTypeName,
    },
  });
  if (!carType) {
    throw new Error('E2E simulation seed: Volkswagen GOLF (gasoline) car type not found');
  }

  const euroNorm = await prisma.euroNorm.findFirst({ where: { code: E2E_SIMULATION.carInfo.euroNormCode } });
  const estimateYear = new Date().getFullYear();

  await prisma.carInfo.upsert({
    where: {
      carTypeId_year: {
        carTypeId: carType.id,
        year: E2E_SIMULATION.registrationYear,
      },
    },
    create: {
      carTypeId: carType.id,
      year: E2E_SIMULATION.registrationYear,
      cylinderCc: E2E_SIMULATION.carInfo.cylinderCc,
      co2Emission: E2E_SIMULATION.carInfo.co2Emission,
      ecoscore: E2E_SIMULATION.carInfo.ecoscore,
      euroNormId: euroNorm?.id ?? null,
      consumption: E2E_SIMULATION.carInfo.consumption,
    },
    update: {},
  });

  await prisma.carPriceEstimate.upsert({
    where: {
      carTypeId_year_estimateYear: {
        carTypeId: carType.id,
        year: E2E_SIMULATION.registrationYear,
        estimateYear,
      },
    },
    create: {
      carTypeId: carType.id,
      year: E2E_SIMULATION.registrationYear,
      estimateYear,
      price: E2E_SIMULATION.price,
      rangeMin: E2E_SIMULATION.rangeMin,
      rangeMax: E2E_SIMULATION.rangeMax,
      articleRefs: [],
    },
    update: {},
  });

  console.log(`E2E simulation cache seeded for ${E2E_SIMULATION.brandName} ${E2E_SIMULATION.carTypeName} (${estimateYear})`);
}
