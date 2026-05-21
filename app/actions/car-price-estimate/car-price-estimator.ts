import type { Schema } from '@google/genai';
import { Type } from '@google/genai';

import type { FuelType } from '@/domain/fuel-type.model';
import type { PriceRange } from '@/domain/simulation.model';
import type { CarPriceEstimate } from '@/domain/car-price-estimate.model';
import { dbCarPriceEstimateFindByCarTypeAndYear } from '@/storage/car-price-estimate/car-price-estimate.find-by-car-type-year';
import { dbCarPriceEstimateCreate } from '@/storage/car-price-estimate/car-price-estimate.create';
import { dbCarTypeRead } from '@/storage/car-type/car-type.read';
import { dbCarBrandRead } from '@/storage/car-brand/car-brand.read';
import { InvalidCarPriceEstimateError } from '@/actions/car-price-estimate/invalid-car-price-estimate.error';
import { generateGroundedJson } from '@/integrations/gemini';
import { logger } from '@/lib/logger';

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
    price: { type: Type.NUMBER, description: 'Estimated average market price in EUR at low mileage' },
    rangeMin: {
      type: Type.NUMBER,
      description: 'Expected market value in EUR when the car has reached the depreciation km threshold (not zero)',
    },
    rangeMax: { type: Type.NUMBER, description: 'Upper bound of the market price range in EUR' },
    remarks: { type: Type.STRING, nullable: true, description: 'Any notable observations about pricing, market trends, or caveats' },
    articleRefs: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'URLs of relevant second-hand car listing pages used as sources',
    },
  },
  required: ['price', 'rangeMin', 'rangeMax', 'articleRefs'],
};

function buildPrompt(
  brandName: string,
  carTypeName: string,
  fuelTypeName: string,
  year: number,
  depreciationKm: number,
  backtestYear: number | null,
): string {
  const timeContext = backtestYear
    ? `Pretend we are in ${backtestYear}. Estimate the second-hand market price range as it would have been in ${backtestYear}`
    : 'Estimate the current second-hand market price range';

  return [
    `${timeContext} for a ${brandName} ${carTypeName} (${fuelTypeName}) from ${year} in Belgium.`,
    'Base your estimate on listings from popular Belgian and European second-hand car websites (e.g. AutoScout24, 2dehands, CarDNA).',
    'Return the average expected price, a realistic minimum and maximum price range, and any relevant source URL links in the articles array.',
    `The minimum price (rangeMin) should reflect the expected value of this car at ${depreciationKm.toLocaleString('en')} km on the odometer.`,
    'If there are noteworthy observations — such as limited availability, high demand,',
    'known reliability issues, or market trends — include them in the remarks field.',
    'All prices should be in EUR.',
  ].join(' ');
}

function toPriceRange(result: GeminiPriceEstimate): PriceRange {
  return { price: result.price, min: result.rangeMin, max: result.rangeMax };
}

export function assertValidPriceEstimate(result: GeminiPriceEstimate): void {
  const { price, rangeMin, rangeMax } = result;
  if (!Number.isFinite(price) || price <= 0) {
    throw new InvalidCarPriceEstimateError(`non-positive price (${price})`);
  }
  if (!Number.isFinite(rangeMin) || rangeMin <= 0) {
    throw new InvalidCarPriceEstimateError(`non-positive rangeMin (${rangeMin})`);
  }
  if (!Number.isFinite(rangeMax) || rangeMax <= 0) {
    throw new InvalidCarPriceEstimateError(`non-positive rangeMax (${rangeMax})`);
  }
  if (rangeMin > price) {
    throw new InvalidCarPriceEstimateError(`rangeMin (${rangeMin}) exceeds price (${price})`);
  }
  if (rangeMax < price) {
    throw new InvalidCarPriceEstimateError(`rangeMax (${rangeMax}) is below price (${price})`);
  }
}

/**
 * Estimates the current value range of a car (in EUR).
 * Checks for a cached CarPriceEstimate first; if none exists, queries Gemini
 * with grounded search and persists the result for future lookups.
 * In unit tests, mock this module (carValueEstimator), not Gemini.
 */
export async function carValueEstimator(
  brandId: string,
  fuelType: FuelType,
  carTypeId: string | null,
  carTypeOther: string | null,
  firstRegistrationDate: Date,
  depreciationKm: number,
  backtestYear: number | null = null,
): Promise<PriceRange> {
  const year = firstRegistrationDate.getFullYear();
  const estimateYear = backtestYear ?? new Date().getFullYear();

  if (carTypeId) {
    const cached = await dbCarPriceEstimateFindByCarTypeAndYear(carTypeId, year, estimateYear);
    if (cached) {
      const cachedEstimate: GeminiPriceEstimate = {
        price: cached.price,
        rangeMin: cached.rangeMin,
        rangeMax: cached.rangeMax,
        remarks: null,
        articleRefs: [],
      };
      assertValidPriceEstimate(cachedEstimate);
      return toPriceRange(cachedEstimate);
    }
  }

  const brand = await dbCarBrandRead(brandId);
  const carType = carTypeId ? await dbCarTypeRead(carTypeId) : null;
  const carTypeName = carType?.name ?? carTypeOther ?? 'unknown model';

  const prompt = buildPrompt(brand.name, carTypeName, fuelType.name, year, depreciationKm, backtestYear);
  const result = await generateGroundedJson<GeminiPriceEstimate>(prompt, responseSchema);

  try {
    assertValidPriceEstimate(result);
  } catch (err) {
    logger.warn('carValueEstimator: invalid Gemini price estimate', {
      brandId,
      carTypeId,
      year,
      estimateYear,
      prompt,
      price: result.price,
      rangeMin: result.rangeMin,
      rangeMax: result.rangeMax,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }

  if (carTypeId && result.price > 0) {
    const estimate: CarPriceEstimate = {
      id: null,
      carType: { id: carTypeId },
      year,
      estimateYear,
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

  return toPriceRange(result);
}
