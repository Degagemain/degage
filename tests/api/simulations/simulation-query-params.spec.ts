import { describe, expect, it } from 'vitest';
import { parseSimulationExportRequestFromSearchParams, parseSimulationFilterFromSearchParams } from '@/api/simulations/simulation-query-params';
import { SimulationSortColumns } from '@/domain/simulation.filter';
import { SortOrder } from '@/domain/utils';

describe('simulation query params parser', () => {
  describe('parseSimulationFilterFromSearchParams', () => {
    it('parses valid filter params and applies coercion/defaults', async () => {
      const sp = new URLSearchParams();
      sp.set('query', 'test');
      sp.append('brandId', '550e8400-e29b-41d4-a716-446655440001');
      sp.append('fuelTypeId', '550e8400-e29b-41d4-a716-446655440002');
      sp.append('carTypeId', '550e8400-e29b-41d4-a716-446655440003');
      sp.append('resultCode', 'manualReview');
      sp.set('skip', '10');
      sp.set('take', '20');
      sp.set('sortBy', SimulationSortColumns.RESULT_CODE);
      sp.set('sortOrder', SortOrder.ASC);

      const result = parseSimulationFilterFromSearchParams(sp);

      expect(result.errorResponse).toBeNull();
      expect(result.data).toEqual({
        query: 'test',
        brandIds: ['550e8400-e29b-41d4-a716-446655440001'],
        fuelTypeIds: ['550e8400-e29b-41d4-a716-446655440002'],
        carTypeIds: ['550e8400-e29b-41d4-a716-446655440003'],
        resultCodes: ['manualReview'],
        skip: 10,
        take: 20,
        sortBy: SimulationSortColumns.RESULT_CODE,
        sortOrder: SortOrder.ASC,
      });
    });

    it('returns 400 response when filter params are invalid', async () => {
      const sp = new URLSearchParams();
      sp.append('brandId', 'not-a-uuid');

      const result = parseSimulationFilterFromSearchParams(sp);

      expect(result.data).toBeNull();
      expect(result.errorResponse).not.toBeNull();
      expect(result.errorResponse?.status).toBe(400);
    });
  });

  describe('parseSimulationExportRequestFromSearchParams', () => {
    it('parses valid export params and excludes pagination fields', async () => {
      const sp = new URLSearchParams();
      sp.append('brandId', '550e8400-e29b-41d4-a716-446655440001');
      sp.set('skip', '999');
      sp.set('take', '999');
      sp.set('format', 'csv');

      const result = parseSimulationExportRequestFromSearchParams(sp);

      expect(result.errorResponse).toBeNull();
      expect(result.data).toEqual({
        query: null,
        brandIds: ['550e8400-e29b-41d4-a716-446655440001'],
        fuelTypeIds: [],
        carTypeIds: [],
        resultCodes: [],
        sortBy: SimulationSortColumns.CREATED_AT,
        sortOrder: SortOrder.DESC,
        format: 'csv',
      });
    });

    it('returns 400 response when format is missing', async () => {
      const sp = new URLSearchParams();

      const result = parseSimulationExportRequestFromSearchParams(sp);

      expect(result.data).toBeNull();
      expect(result.errorResponse).not.toBeNull();
      expect(result.errorResponse?.status).toBe(400);
    });
  });
});
