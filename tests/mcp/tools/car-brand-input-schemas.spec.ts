import { describe, expect, it } from 'vitest';
import { carBrandFilterSchema } from '@/domain/car-brand.filter';

describe('car brand MCP input schemas', () => {
  it('parses search MCP input through carBrandFilterSchema with defaults', () => {
    const parsed = carBrandFilterSchema.safeParse({ query: 'tesla', take: 10 });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.query).toBe('tesla');
      expect(parsed.data.take).toBe(10);
      expect(parsed.data.skip).toBe(0);
    }
  });

  it('parses optional search filters from MCP input', () => {
    const parsed = carBrandFilterSchema.safeParse({
      query: 'audi',
      isActive: true,
      sortBy: 'code',
      sortOrder: 'asc',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.isActive).toBe(true);
      expect(parsed.data.sortBy).toBe('code');
      expect(parsed.data.sortOrder).toBe('asc');
    }
  });
});
