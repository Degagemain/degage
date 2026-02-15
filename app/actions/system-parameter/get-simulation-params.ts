import { getSystemParameterByCode } from './read';

const DEFAULT_MAX_AGE_YEARS = 15;
const DEFAULT_MAX_KM = 250_000;

export interface SimulationParams {
  maxAgeYears: number;
  maxKm: number;
}

export const getSimulationParams = async (): Promise<SimulationParams> => {
  const [maxAgeParam, maxKmParam] = await Promise.all([getSystemParameterByCode('maxAgeYears'), getSystemParameterByCode('maxKm')]);

  return {
    maxAgeYears: maxAgeParam?.valueNumber != null ? Number(maxAgeParam.valueNumber) : DEFAULT_MAX_AGE_YEARS,
    maxKm: maxKmParam?.valueNumber != null ? Number(maxKmParam.valueNumber) : DEFAULT_MAX_KM,
  };
};
