import { describe, expect, it } from 'vitest';
import { carTypeFilterSchema } from '@/domain/car-type.filter';
import { carTypeMcpFilterSchema } from '@/mcp/tools/car-type-input-schemas';

describe('car type MCP input schemas', () => {
  const brandId = '550e8400-e29b-41d4-a716-446655440001';
  const fuelTypeId = '550e8400-e29b-41d4-a716-446655440002';

  it('maps required brand and fuel type to filter arrays', () => {
    const parsed = carTypeMcpFilterSchema.safeParse({ brandId, fuelTypeId });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.brandIds).toEqual([brandId]);
      expect(parsed.data.fuelTypeIds).toEqual([fuelTypeId]);
      expect(parsed.data.skip).toBe(0);
    }
  });

  it('rejects input without brandId or fuelTypeId', () => {
    expect(carTypeMcpFilterSchema.safeParse({ brandId }).success).toBe(false);
    expect(carTypeMcpFilterSchema.safeParse({ fuelTypeId }).success).toBe(false);
  });

  it('parses optional search filters from MCP input', () => {
    const mcpFilter = carTypeMcpFilterSchema.parse({
      brandId,
      fuelTypeId,
      query: 'model 3',
      isActive: true,
      take: 10,
      sortBy: 'ecoscore',
      sortOrder: 'desc',
    });
    const parsed = carTypeFilterSchema.safeParse(mcpFilter);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.query).toBe('model 3');
      expect(parsed.data.isActive).toBe(true);
      expect(parsed.data.take).toBe(10);
      expect(parsed.data.sortBy).toBe('ecoscore');
      expect(parsed.data.sortOrder).toBe('desc');
    }
  });
});
