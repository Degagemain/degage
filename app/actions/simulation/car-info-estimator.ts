import type { Schema } from '@google/genai';
import { Type } from '@google/genai';

import { dbCarTypeRead } from '@/storage/car-type/car-type.read';
import { dbCarBrandRead } from '@/storage/car-brand/car-brand.read';
import { dbFuelTypeRead } from '@/storage/fuel-type/fuel-type.read';
import { dbEuroNormSearch } from '@/storage/euro-norm/euro-norm.search';
import { generateStructuredJson } from '@/integrations/gemini';

export interface CarInfo {
  cylinderCc: number;
  co2Emission: number;
  ecoscore: number;
  euroNormCode: string | null;
}

function buildResponseSchema(euroNormCodes: string[]): Schema {
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
    },
    required: ['cylinderCc', 'co2Emission', 'ecoscore'],
  };
}

function buildPrompt(brandName: string, carTypeName: string, fuelTypeName: string, year: number, euroNormCodes: string[]): string {
  return [
    `For a ${brandName} ${carTypeName} (${fuelTypeName}) from ${year}, provide the following technical specifications:`,
    '1. Engine displacement in cubic centimeters (cc).',
    '2. Official CO2 emissions in g/km.',
    '3. Ecoscore rating (0–100), reflecting the overall environmental impact of the vehicle.',
    `4. The applicable Euro emission norm code from this list: ${euroNormCodes.join(', ')}.`,
    'If the car type has multiple engine variants, return the most common one.',
    'If you cannot determine the Euro norm, return null for euroNormCode.',
  ].join(' ');
}

/**
 * Retrieves technical car specifications (cylinder cc, CO2 emission, euro norm)
 * using Gemini structured JSON generation (no grounding needed).
 * In unit tests, mock this module, not Gemini.
 */
export async function carInfoEstimator(
  brandId: string,
  fuelTypeId: string,
  carTypeId: string | null,
  carTypeOther: string | null,
  year: number,
): Promise<CarInfo> {
  const brand = await dbCarBrandRead(brandId);
  const fuelType = await dbFuelTypeRead(fuelTypeId);
  const carType = carTypeId ? await dbCarTypeRead(carTypeId) : null;
  const carTypeName = carType?.name ?? carTypeOther ?? 'unknown model';

  const euroNorms = await dbEuroNormSearch({ query: null, isActive: null, skip: 0, take: 100, sortBy: 'name', sortOrder: 'asc' });
  const euroNormCodes = euroNorms.records.map((en) => en.code);

  const prompt = buildPrompt(brand.name, carTypeName, fuelType.name, year, euroNormCodes);
  const responseSchema = buildResponseSchema(euroNormCodes);

  return generateStructuredJson<CarInfo>(prompt, responseSchema);
}
