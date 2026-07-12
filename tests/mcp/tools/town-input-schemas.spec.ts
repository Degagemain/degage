import { describe, expect, it } from 'vitest';
import { townFilterSchema } from '@/domain/town.filter';

describe('town MCP input schemas', () => {
  it('parses search MCP input through townFilterSchema with defaults', () => {
    const parsed = townFilterSchema.safeParse({ query: '9000', take: 10 });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.query).toBe('9000');
      expect(parsed.data.take).toBe(10);
      expect(parsed.data.skip).toBe(0);
    }
  });

  it('parses optional search filters from MCP input', () => {
    const parsed = townFilterSchema.safeParse({
      query: 'Gent',
      provinceId: '550e8400-e29b-41d4-a716-446655440001',
      hubId: '550e8400-e29b-41d4-a716-446655440002',
      highDemand: true,
      hasActiveMembers: false,
      sortBy: 'name',
      sortOrder: 'asc',
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.provinceId).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(parsed.data.hubId).toBe('550e8400-e29b-41d4-a716-446655440002');
      expect(parsed.data.highDemand).toBe(true);
      expect(parsed.data.hasActiveMembers).toBe(false);
      expect(parsed.data.sortBy).toBe('name');
    }
  });
});
