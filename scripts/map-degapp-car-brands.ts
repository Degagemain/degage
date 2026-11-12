import { readFileSync } from 'node:fs';

import { defaultContentLocale } from '@/i18n/locales';
import { type CatalogCarBrand, type CatalogCarType, buildDegappFleetReport } from '@/play-connector/match-car-brand';
import { parseReserveFleet } from '@/play-connector/parsers/reserve-fleet.parser';
import { dbCarBrandToDomain } from '@/storage/car-brand/car-brand.mappers';
import { getPrismaClient } from '@/storage/utils';

const main = async (): Promise<void> => {
  const filePath = process.argv.slice(2).find((arg) => arg !== '--');
  if (!filePath) {
    throw new Error('Pass the path to a downloaded https://degapp.be/calendar/cars HTML file');
  }

  const prisma = getPrismaClient();
  const fleet = parseReserveFleet(readFileSync(filePath, 'utf8'));
  const [dbBrands, dbTypes] = await Promise.all([
    prisma.carBrand.findMany({ include: { translations: true } }),
    prisma.carType.findMany({ select: { id: true, name: true, isActive: true, brandId: true, fuelType: { select: { code: true } } } }),
  ]);
  const brands: CatalogCarBrand[] = dbBrands.map((brand) => {
    const domain = dbCarBrandToDomain(brand, defaultContentLocale);
    return {
      id: brand.id,
      code: domain.code,
      name: domain.name,
      isActive: domain.isActive,
    };
  });
  const types: CatalogCarType[] = dbTypes.map((type) => ({
    id: type.id,
    brandId: type.brandId,
    fuelCode: type.fuelType.code,
    name: type.name,
    isActive: type.isActive,
  }));

  console.log(JSON.stringify(buildDegappFleetReport(fleet.cars, brands, types, fleet.skippedBicycles), null, 2));
};

main()
  .catch((error) => {
    console.error('Degapp car brand mapping failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await getPrismaClient().$disconnect();
    } catch {
      // No client if DATABASE_URL was never set.
    }
  });
