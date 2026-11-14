import { type PlayFleetCar } from '@/play-connector/parsers/reserve-fleet.parser';

export type CatalogCarBrand = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

export type CatalogCarType = {
  id: string;
  brandId: string;
  fuelCode: string;
  name: string;
  isActive: boolean;
};

type BrandMatch =
  | { status: 'confident'; brand: CatalogCarBrand }
  | { status: 'missing' }
  | { status: 'conflict'; candidates: CatalogCarBrand[] };

type TypeMatch = { status: 'confident'; type: CatalogCarType } | { status: 'suggested' } | { status: 'conflict'; candidates: CatalogCarType[] };

const FLEET_FUEL_TO_CODE: Record<string, string> = {
  Benzine: 'gasoline',
  Diesel: 'diesel',
  Elektrisch: 'electric',
  Hybride: 'hybrid',
  'Plugin Hybride': 'plugin-hybrid',
  LPG: 'lpg',
  CNG: 'cng',
};

// Spellings from the saved Degapp fleet that are not a catalog brand prefix.
const FLEET_BRAND_SPELLINGS: Record<string, string> = {
  huyndai: 'Hyundai',
  mercedes: 'Mercedes-Benz',
  peugot: 'Peugeot',
  toyoya: 'Toyota',
};

export type DegappFleetReport = {
  cars: {
    id: number;
    name: string;
    brandModel: string;
    model: string;
    fuel: string | null;
    brand:
      | { status: 'confident'; brandId: string; brandName: string; brandCode: string; isActive: boolean }
      | { status: 'missing' }
      | { status: 'conflict'; candidates: { brandId: string; brandName: string; brandCode: string; isActive: boolean }[] };
    type:
      | { status: 'confident'; typeId: string; typeName: string; isActive: boolean }
      | { status: 'suggested' }
      | { status: 'conflict'; candidates: { typeId: string; typeName: string; isActive: boolean }[] }
      | null;
  }[];
  missingBrands: { brandModel: string; count: number }[];
  missingTypes: { brandName: string; brandCode: string; fuel: string | null; model: string; count: number }[];
  skippedBicycles: number;
};

const catalogTokens = (value: string): string[] =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/(\w)\.(\w)/g, '$1$2')
    .split(/[\s-]+/)
    .filter(Boolean);

const toReportBrand = (brand: CatalogCarBrand) => ({
  brandId: brand.id,
  brandName: brand.name,
  brandCode: brand.code,
  isActive: brand.isActive,
});

const toReportType = (type: CatalogCarType) => ({
  typeId: type.id,
  typeName: type.name,
  isActive: type.isActive,
});

const matchLongestBrandPrefix = (brandModel: string, brands: CatalogCarBrand[]): { model: string; match: BrandMatch } => {
  const tokens = catalogTokens(brandModel);
  const words = brandModel
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean);
  if (tokens.length === 0) return { model: '', match: { status: 'missing' } };

  const hits: { brand: CatalogCarBrand; length: number }[] = [];
  for (const brand of brands) {
    for (const prefix of [catalogTokens(brand.name), catalogTokens(brand.code)]) {
      if (prefix.length > 0 && prefix.every((token, index) => tokens[index] === token)) {
        hits.push({ brand, length: prefix.length });
      }
    }
  }

  const bestLength = hits.reduce((best, hit) => Math.max(best, hit.length), 0);
  const winners = [...new Map(hits.filter((hit) => hit.length === bestLength).map((hit) => [hit.brand.id, hit.brand])).values()].sort(
    (left, right) => left.code.localeCompare(right.code),
  );
  if (winners.length === 0) return { model: words.join(' '), match: { status: 'missing' } };

  const model = words.slice(bestLength).join(' ');
  if (winners.length === 1) return { model, match: { status: 'confident', brand: winners[0] } };
  return { model, match: { status: 'conflict', candidates: winners } };
};

const explicitBrandModel = (brandModel: string): string | null => {
  const tokens = catalogTokens(brandModel);
  const words = brandModel
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean);
  const first = tokens[0];
  if (!first || words.length === 0) return null;

  const spelling = FLEET_BRAND_SPELLINGS[first];
  if (spelling) return [spelling, ...words.slice(1)].join(' ');
  if (first === 'fiat500') return ['Fiat', '500', ...words.slice(1)].join(' ');
  if (first === 'zoe') return ['Renault', ...words].join(' ');
  return null;
};

export const splitBrandAndModel = (brandModel: string, brands: CatalogCarBrand[]): { model: string; match: BrandMatch } => {
  const prefix = matchLongestBrandPrefix(brandModel, brands);
  if (prefix.match.status !== 'missing') return prefix;

  const rewritten = explicitBrandModel(brandModel);
  if (!rewritten) return prefix;
  return matchLongestBrandPrefix(rewritten, brands);
};

const matchModel = (model: string, brandId: string, fuel: string | null, types: CatalogCarType[]): TypeMatch => {
  const fuelCode = fuel ? FLEET_FUEL_TO_CODE[fuel] : undefined;
  const modelTokens = catalogTokens(model);
  if (!fuelCode || modelTokens.length === 0) return { status: 'suggested' };

  const hits: { type: CatalogCarType; length: number }[] = [];
  for (const type of types) {
    if (type.brandId !== brandId || type.fuelCode !== fuelCode) continue;
    const typeTokens = catalogTokens(type.name);
    if (typeTokens.length === 0 || typeTokens.length > modelTokens.length) continue;
    if (typeTokens.every((token, index) => modelTokens[index] === token)) {
      hits.push({ type, length: typeTokens.length });
    }
  }

  return chooseType(hits);
};

const chooseType = (hits: { type: CatalogCarType; length: number }[]): TypeMatch => {
  const bestLength = hits.reduce((best, hit) => Math.max(best, hit.length), 0);
  const winners = [...new Map(hits.filter((hit) => hit.length === bestLength).map((hit) => [hit.type.id, hit.type])).values()];
  const distinctNames = [...new Set(winners.map((type) => catalogTokens(type.name).join(' ')))];
  if (winners.length === 0 || distinctNames.length === 0) return { status: 'suggested' };
  if (distinctNames.length === 1) {
    const type = [...winners].sort((left, right) => left.id.localeCompare(right.id))[0];
    return { status: 'confident', type };
  }
  return {
    status: 'conflict',
    candidates: [...winners].sort((left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id)),
  };
};

const toReportBrandMatch = (match: BrandMatch): DegappFleetReport['cars'][number]['brand'] => {
  if (match.status === 'confident') return { status: 'confident', ...toReportBrand(match.brand) };
  if (match.status === 'missing') return { status: 'missing' };
  return { status: 'conflict', candidates: match.candidates.map(toReportBrand) };
};

const toReportTypeMatch = (match: TypeMatch): DegappFleetReport['cars'][number]['type'] => {
  if (match.status === 'confident') return { status: 'confident', ...toReportType(match.type) };
  if (match.status === 'suggested') return { status: 'suggested' };
  return { status: 'conflict', candidates: match.candidates.map(toReportType) };
};

export const buildDegappFleetReport = (
  fleetCars: PlayFleetCar[],
  brands: CatalogCarBrand[],
  types: CatalogCarType[],
  skippedBicycles: number,
): DegappFleetReport => {
  const cars = fleetCars.map((car) => {
    const split = splitBrandAndModel(car.brandModel, brands);
    const type = split.match.status === 'confident' ? matchModel(split.model, split.match.brand.id, car.fuel, types) : null;
    return {
      id: car.id,
      name: car.name,
      brandModel: car.brandModel,
      model: split.model,
      fuel: car.fuel,
      brand: toReportBrandMatch(split.match),
      type: type ? toReportTypeMatch(type) : null,
    };
  });

  const missingBrandCounts = new Map<string, number>();
  const missingTypeCounts = new Map<string, DegappFleetReport['missingTypes'][number]>();
  for (const car of cars) {
    if (car.brand.status === 'missing') {
      missingBrandCounts.set(car.brandModel, (missingBrandCounts.get(car.brandModel) ?? 0) + 1);
    }
    if (car.brand.status !== 'confident' || car.type?.status !== 'suggested') continue;
    const key = `${car.brand.brandCode}\u0000${car.fuel ?? ''}\u0000${car.model}`;
    const current = missingTypeCounts.get(key);
    if (current) current.count += 1;
    else {
      missingTypeCounts.set(key, {
        brandName: car.brand.brandName,
        brandCode: car.brand.brandCode,
        fuel: car.fuel,
        model: car.model,
        count: 1,
      });
    }
  }

  return {
    cars,
    missingBrands: [...missingBrandCounts.entries()]
      .map(([brandModel, count]) => ({ brandModel, count }))
      .sort((left, right) => left.brandModel.localeCompare(right.brandModel)),
    missingTypes: [...missingTypeCounts.values()].sort((left, right) =>
      `${left.brandName}\u0000${left.fuel}\u0000${left.model}`.localeCompare(`${right.brandName}\u0000${right.fuel}\u0000${right.model}`),
    ),
    skippedBicycles,
  };
};
