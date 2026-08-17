import { describe, expect, it } from 'vitest';
import { fuelTypeFilterSchema } from '@/domain/fuel-type.filter';

describe('fuel type MCP input schemas', () => {
  it('parses search MCP input through fuelTypeFilterSchema with defaults', () => {
    const parsed = fuelTypeFilterSchema.safeParse({ query: 'electric', take: 10 });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.query).toBe('electric');
      expect(parsed.data.take).toBe(10);
      expect(parsed.data.skip).toBe(0);
      expect(parsed.data.sortBy).toBe('order');
      expect(parsed.data.sortOrder).toBe('asc');
    }
  });

  it('parses optional search filters from MCP input', () => {
    const parsed = fuelTypeFilterSchema.safeParse({
      query: 'diesel',
      isActive: true,
      sortBy: 'pricePer',
      sortOrder: 'desc',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.isActive).toBe(true);
      expect(parsed.data.sortBy).toBe('pricePer');
      expect(parsed.data.sortOrder).toBe('desc');
    }
  });
});
