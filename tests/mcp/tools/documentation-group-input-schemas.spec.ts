import { describe, expect, it } from 'vitest';
import { documentationGroupFilterSchema } from '@/domain/documentation-group.filter';
import { documentationGroupCreateBodySchema, documentationGroupUpdateBodySchema } from '@/mcp/tools/documentation-group-input-schemas';
import { documentationGroup } from '../../builders/documentation-group.builder';

describe('documentation group MCP input schemas', () => {
  it('accepts a create body aligned with POST', () => {
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...body } = documentationGroup({ id: null });
    const parsed = documentationGroupCreateBodySchema.safeParse(body);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.id).toBeNull();
    }
  });

  it('accepts a full update body aligned with PUT', () => {
    const group = documentationGroup({ id: '550e8400-e29b-41d4-a716-446655440000' });
    const parsed = documentationGroupUpdateBodySchema.safeParse(group);
    expect(parsed.success).toBe(true);
  });

  it('rejects update body without id', () => {
    const group = documentationGroup({ id: null });
    const parsed = documentationGroupUpdateBodySchema.safeParse(group);
    expect(parsed.success).toBe(false);
  });

  it('accepts update input without read-only timestamps', () => {
    const {
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...mcpInput
    } = documentationGroup({
      id: '550e8400-e29b-41d4-a716-446655440000',
    });
    const parsed = documentationGroupUpdateBodySchema.safeParse(mcpInput);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.createdAt).toBeNull();
      expect(parsed.data.updatedAt).toBeNull();
    }
  });

  it('parses search MCP input through documentationGroupFilterSchema with defaults', () => {
    const parsed = documentationGroupFilterSchema.safeParse({ query: 'faq', take: 10 });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.query).toBe('faq');
      expect(parsed.data.take).toBe(10);
      expect(parsed.data.skip).toBe(0);
    }
  });
});
