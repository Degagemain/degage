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

const MERCEDES_BENZ_CODE = 'mercedes-benz';
const MIN_BRAND_TYPO_LENGTH = 5;

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

const editDistance = (left: string, right: string): number => {
  if (Math.abs(left.length - right.length) > 1) return 2;
  const rows = left.length + 1;
  const cols = right.length + 1;
  const distances = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
  for (let row = 0; row < rows; row += 1) distances[row][0] = row;
  for (let col = 0; col < cols; col += 1) distances[0][col] = col;

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      const cost = left[row - 1] === right[col - 1] ? 0 : 1;
      distances[row][col] = Math.min(distances[row - 1][col] + 1, distances[row][col - 1] + 1, distances[row - 1][col - 1] + cost);
      if (row > 1 && col > 1 && left[row - 1] === right[col - 2] && left[row - 2] === right[col - 1]) {
        distances[row][col] = Math.min(distances[row][col], distances[row - 2][col - 2] + 1);
      }
    }
  }

  return distances[left.length][right.length];
};

const singleBrandToken = (brand: CatalogCarBrand): string | null => {
  const nameTokens = catalogTokens(brand.name);
  return nameTokens.length === 1 ? nameTokens[0] : null;
};

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

export const splitBrandAndModel = (brandModel: string, brands: CatalogCarBrand[]): { model: string; match: BrandMatch } => {
  const tokens = catalogTokens(brandModel);
  const originalTokens = brandModel
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
    if (brand.code === MERCEDES_BENZ_CODE && tokens[0] === 'mercedes' && tokens[1] !== 'benz') {
      hits.push({ brand, length: 1 });
    }
  }

  if (hits.length === 0 && tokens[0] && tokens[0].length >= MIN_BRAND_TYPO_LENGTH) {
    for (const brand of brands) {
      const token = singleBrandToken(brand);
      if (token && token.length >= MIN_BRAND_TYPO_LENGTH && editDistance(tokens[0], token) === 1) hits.push({ brand, length: 1 });
    }
  }

  if (hits.length === 0 && tokens[0]) {
    for (const brand of brands) {
      const token = singleBrandToken(brand);
      if (!token || !tokens[0].startsWith(token)) continue;
      const remainder = tokens[0].slice(token.length);
      if (/^\d+$/.test(remainder)) hits.push({ brand, length: 1 });
    }
    if (hits.length === 1) {
      const token = singleBrandToken(hits[0].brand);
      if (token) {
        originalTokens.splice(0, 1, originalTokens[0].slice(0, token.length), originalTokens[0].slice(token.length));
      }
    }
  }

  const bestLength = hits.reduce((best, hit) => Math.max(best, hit.length), 0);
  const winners = [...new Map(hits.filter((hit) => hit.length === bestLength).map((hit) => [hit.brand.id, hit.brand])).values()].sort(
    (left, right) => left.code.localeCompare(right.code),
  );
  if (winners.length === 0) return { model: originalTokens.join(' '), match: { status: 'missing' } };

  const model = originalTokens.slice(bestLength).join(' ');
  if (winners.length === 1) return { model, match: { status: 'confident', brand: winners[0] } };
  return { model, match: { status: 'conflict', candidates: winners } };
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

const matchLeadingType = (
  brandModel: string,
  fuel: string | null,
  brands: CatalogCarBrand[],
  types: CatalogCarType[],
): { model: string; brand: CatalogCarBrand; type: CatalogCarType } | null => {
  const fuelCode = fuel ? FLEET_FUEL_TO_CODE[fuel] : undefined;
  const tokens = catalogTokens(brandModel);
  const originalTokens = brandModel
    .trim()
    .split(/[\s-]+/)
    .filter(Boolean);
  if (!fuelCode || tokens.length === 0) return null;

  const hits: { type: CatalogCarType; length: number }[] = [];
  for (const type of types) {
    if (type.fuelCode !== fuelCode) continue;
    const typeTokens = catalogTokens(type.name);
    if (typeTokens.length === 0 || typeTokens.length > tokens.length) continue;
    if (typeTokens.every((token, index) => tokens[index] === token)) hits.push({ type, length: typeTokens.length });
  }

  const bestLength = hits.reduce((best, hit) => Math.max(best, hit.length), 0);
  const winners = hits.filter((hit) => hit.length === bestLength).map((hit) => hit.type);
  const brandIds = [...new Set(winners.map((type) => type.brandId))];
  if (brandIds.length !== 1) return null;
  const chosen = chooseType(hits);
  if (chosen.status !== 'confident') return null;
  const brand = brands.find((candidate) => candidate.id === brandIds[0]);
  if (!brand) return null;
  return { model: originalTokens.slice(bestLength).join(' '), brand, type: chosen.type };
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
    if (split.match.status === 'missing') {
      const leading = matchLeadingType(car.brandModel, car.fuel, brands, types);
      if (leading) {
        return {
          id: car.id,
          name: car.name,
          brandModel: car.brandModel,
          model: leading.model,
          fuel: car.fuel,
          brand: toReportBrandMatch({ status: 'confident', brand: leading.brand }),
          type: toReportTypeMatch({ status: 'confident', type: leading.type }),
        };
      }
    }
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
