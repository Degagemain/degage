import type { PriceRange } from '@/domain/simulation.model';

/**
 * Estimates the current value range of a car (e.g. in euros).
 * Called by the simulation engine. Stub implementation — replace with LLM when ready.
 * In unit tests, mock this module (carValueEstimator), not Gemini.
 */
export async function carValueEstimator(
  _brandId: string,
  _carTypeId: string | null,
  _carTypeOther: string | null,
  firstRegistrationDate: Date,
): Promise<PriceRange> {
  // Stub: return a range based on age heuristic until real implementation
  const ageYears = (Date.now() - firstRegistrationDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const base = Math.max(1000, 20000 - ageYears * 1500);
  return {
    min: Math.round(base * 0.8),
    max: Math.round(base * 1.2),
  };
}
