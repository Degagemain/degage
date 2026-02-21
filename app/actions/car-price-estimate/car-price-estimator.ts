import type { Schema } from '@google/genai';
import { Type } from '@google/genai';

import type { PriceRange } from '@/domain/simulation.model';
import type { CarPriceEstimate } from '@/domain/car-price-estimate.model';
import { dbCarPriceEstimateFindByCarTypeAndYear } from '@/storage/car-price-estimate/car-price-estimate.find-by-car-type-year';
import { dbCarPriceEstimateCreate } from '@/storage/car-price-estimate/car-price-estimate.create';
import { dbCarTypeRead } from '@/storage/car-type/car-type.read';
import { dbCarBrandRead } from '@/storage/car-brand/car-brand.read';
import { dbFuelTypeRead } from '@/storage/fuel-type/fuel-type.read';
import { generateGroundedJson } from '@/integrations/gemini';

interface GeminiPriceEstimate {
  price: number;
  rangeMin: number;
  rangeMax: number;
  remarks: string | null;
  articleRefs: string[];
}

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    price: { type: Type.NUMBER, description: 'Estimated average market price in EUR' },
    rangeMin: { type: Type.NUMBER, description: 'Lower bound of the price range in EUR' },
    rangeMax: { type: Type.NUMBER, description: 'Upper bound of the price range in EUR' },
    remarks: { type: Type.STRING, nullable: true, description: 'Any notable observations about pricing, market trends, or caveats' },
    articleRefs: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'URLs of relevant second-hand car listing pages used as sources',
    },
  },
  required: ['price', 'rangeMin', 'rangeMax', 'articleRefs'],
};

function buildPrompt(brandName: string, carTypeName: string, fuelTypeName: string, year: number): string {
  return [
    `Estimate the current second-hand market price range for a ${brandName} ${carTypeName} (${fuelTypeName}) from ${year} in Belgium.`,
    'Base your estimate on listings from popular Belgian and European second-hand car websites (e.g. AutoScout24, 2dehands, CarDNA).',
    'Return the average expected price, a realistic minimum and maximum price range, and any relevant source URL links in the articles array.',
    'If there are noteworthy observations — such as limited availability, high demand,',
    'known reliability issues, or market trends — include them in the remarks field.',
    'All prices should be in EUR.',
  ].join(' ');
}

/**
 * Estimates the current value range of a car (in EUR).
 * Checks for a cached CarPriceEstimate first; if none exists, queries Gemini
 * with grounded search and persists the result for future lookups.
 * In unit tests, mock this module (carValueEstimator), not Gemini.
 */
export async function carValueEstimator(
  brandId: string,
  fuelTypeId: string,
  carTypeId: string | null,
  carTypeOther: string | null,
  firstRegistrationDate: Date,
): Promise<PriceRange> {
  const year = firstRegistrationDate.getFullYear();

  if (carTypeId) {
    const cached = await dbCarPriceEstimateFindByCarTypeAndYear(carTypeId, year);
    if (cached) {
      return { price: cached.price, min: cached.rangeMin, max: cached.rangeMax };
    }
  }

  const brand = await dbCarBrandRead(brandId);
  const fuelType = await dbFuelTypeRead(fuelTypeId);
  const carType = carTypeId ? await dbCarTypeRead(carTypeId) : null;
  const carTypeName = carType?.name ?? carTypeOther ?? 'unknown model';

  const prompt = buildPrompt(brand.name, carTypeName, fuelType.name, year);
  const result = await generateGroundedJson<GeminiPriceEstimate>(prompt, responseSchema);

  if (carTypeId && result.price > 0) {
    const estimate: CarPriceEstimate = {
      id: null,
      carType: { id: carTypeId },
      year,
      price: result.price,
      rangeMin: result.rangeMin,
      rangeMax: result.rangeMax,
      prompt,
      remarks: result.remarks ?? null,
      articleRefs: result.articleRefs ?? [],
      createdAt: null,
      updatedAt: null,
    };
    await dbCarPriceEstimateCreate(estimate);
  }

  return { price: result.price, min: result.rangeMin, max: result.rangeMax };
}
