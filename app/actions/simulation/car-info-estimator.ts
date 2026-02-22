import type { Schema } from '@google/genai';
import { Type } from '@google/genai';

import type { FuelType } from '@/domain/fuel-type.model';
import type { SimulationCarInfo } from '@/domain/simulation.model';
import { isElectricFuelType } from '@/domain/fuel-type.model';
import { dbCarTypeRead } from '@/storage/car-type/car-type.read';
import { dbCarBrandRead } from '@/storage/car-brand/car-brand.read';
import { dbEuroNormSearch } from '@/storage/euro-norm/euro-norm.search';
import { dbEuroNormFindByCode, dbEuroNormRead } from '@/storage/euro-norm/euro-norm.read';
import { dbCarInfoFindByCarTypeAndYear } from '@/storage/car-info/car-info.find-by-car-type-year';
import { dbCarInfoCreate } from '@/storage/car-info/car-info.create';
import { generateStructuredJson } from '@/integrations/gemini';

interface GeminiCarInfoResponse {
  cylinderCc: number;
  co2Emission: number;
  ecoscore: number;
  euroNormCode: string | null;
  consumption: number;
}

function buildResponseSchema(euroNormCodes: string[], isElectric: boolean): Schema {
  const consumptionDescription = isElectric ? 'Energy consumption in kWh/100 km' : 'Fuel consumption in L/100 km';
  return {
    type: Type.OBJECT,
    properties: {
      cylinderCc: { type: Type.INTEGER, description: 'Engine displacement in cubic centimeters (cc)' },
      co2Emission: { type: Type.INTEGER, description: 'CO2 emissions in g/km (NEDC or WLTP combined)' },
      ecoscore: { type: Type.INTEGER, minimum: 0, maximum: 100, description: 'Ecoscore rating from 0 to 100' },
      euroNormCode: {
        type: Type.STRING,
        nullable: true,
        enum: euroNormCodes,
        description: 'Euro emission norm code that applies to this car',
      },
      consumption: { type: Type.NUMBER, description: consumptionDescription },
    },
    required: ['cylinderCc', 'co2Emission', 'ecoscore', 'consumption'],
  };
}

function buildPrompt(
  brandName: string,
  carTypeName: string,
  fuelTypeName: string,
  year: number,
  euroNormCodes: string[],
  isElectric: boolean,
): string {
  const consumptionSpec = isElectric ? '5. Energy consumption in kWh/100 km.' : '5. Fuel consumption in L/100 km.';
  return [
    `For a ${brandName} ${carTypeName} (${fuelTypeName}) from ${year}, provide the following technical specifications:`,
    '1. Engine displacement in cubic centimeters (cc).',
    '2. Official CO2 emissions in g/km.',
    '3. Ecoscore rating (0–100), reflecting the overall environmental impact of the vehicle.',
    `4. The applicable Euro emission norm code from this list: ${euroNormCodes.join(', ')}.`,
    consumptionSpec,
    'If the car type has multiple engine variants, return the most common one.',
    'If you cannot determine the Euro norm, return null for euroNormCode.',
  ].join(' ');
}

function toSimulationCarInfo(
  cylinderCc: number,
  co2Emission: number,
  ecoscore: number,
  euroNormCode: string | null,
  consumption: number,
): SimulationCarInfo {
  return { cylinderCc, co2Emission, ecoscore, euroNormCode, consumption };
}

/**
 * Retrieves technical car specifications (cylinder cc, CO2 emission, euro norm).
 * Uses cached CarInfo when carTypeId is set and a record exists; otherwise calls Gemini
 * and persists the result when carTypeId is provided.
 * In unit tests, mock this module, not Gemini.
 */
export async function carInfoEstimator(
  brandId: string,
  fuelType: FuelType,
  carTypeId: string | null,
  carTypeOther: string | null,
  year: number,
): Promise<SimulationCarInfo> {
  if (carTypeId) {
    const cached = await dbCarInfoFindByCarTypeAndYear(carTypeId, year);
    if (cached) {
      const euroNorm = cached.euroNormId ? await dbEuroNormRead(cached.euroNormId) : null;
      const euroNormCode = euroNorm?.code ?? null;
      return toSimulationCarInfo(cached.cylinderCc, cached.co2Emission, cached.ecoscore, euroNormCode, cached.consumption);
    }
  }

  const brand = await dbCarBrandRead(brandId);
  const carType = carTypeId ? await dbCarTypeRead(carTypeId) : null;
  const carTypeName = carType?.name ?? carTypeOther ?? 'unknown model';

  const euroNorms = await dbEuroNormSearch({ query: null, isActive: null, skip: 0, take: 100, sortBy: 'name', sortOrder: 'asc' });
  const euroNormCodes = euroNorms.records.map((en) => en.code);
  const isElectric = isElectricFuelType(fuelType);

  const prompt = buildPrompt(brand.name, carTypeName, fuelType.name, year, euroNormCodes, isElectric);
  const responseSchema = buildResponseSchema(euroNormCodes, isElectric);

  const result = await generateStructuredJson<GeminiCarInfoResponse>(prompt, responseSchema);

  if (carTypeId) {
    const euroNormId = result.euroNormCode ? ((await dbEuroNormFindByCode(result.euroNormCode))?.id ?? null) : null;
    await dbCarInfoCreate({
      id: null,
      carType: { id: carTypeId },
      year,
      cylinderCc: result.cylinderCc,
      co2Emission: result.co2Emission,
      ecoscore: result.ecoscore,
      euroNormId,
      consumption: result.consumption,
      createdAt: null,
      updatedAt: null,
    });
  }

  return toSimulationCarInfo(result.cylinderCc, result.co2Emission, result.ecoscore, result.euroNormCode ?? null, result.consumption);
}
