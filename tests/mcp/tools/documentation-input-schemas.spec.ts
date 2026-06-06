import { describe, expect, it } from 'vitest';
import { documentationFilterSchema } from '@/domain/documentation.filter';
import { documentationUpdateBodySchema } from '@/mcp/tools/documentation-input-schemas';
import { documentation } from '../../builders/documentation.builder';

describe('documentation MCP input schemas', () => {
  it('accepts a full documentation body aligned with PUT', () => {
    const doc = documentation({ id: '550e8400-e29b-41d4-a716-446655440000' });
    const parsed = documentationUpdateBodySchema.safeParse(doc);
    expect(parsed.success).toBe(true);
  });

  it('rejects update body without id', () => {
    const doc = documentation({ id: null });
    const parsed = documentationUpdateBodySchema.safeParse(doc);
    expect(parsed.success).toBe(false);
  });

  it('parses search MCP input through documentationFilterSchema with defaults', () => {
    const parsed = documentationFilterSchema.safeParse({ query: 'battery', take: 10 });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.query).toBe('battery');
      expect(parsed.data.take).toBe(10);
      expect(parsed.data.skip).toBe(0);
    }
  });

  it('parses optional search filters from MCP input', () => {
    const parsed = documentationFilterSchema.safeParse({
      query: 'tax',
      isFaq: true,
      sources: ['manual'],
      tags: ['simulation_step_1'],
      formats: ['markdown'],
      groupIds: ['550e8400-e29b-41d4-a716-446655440001'],
      audiences: ['user'],
      sortBy: 'createdAt',
      sortOrder: 'asc',
    });
    expect(parsed.success).toBe(true);
  });
});
