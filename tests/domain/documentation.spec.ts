import { describe, expect, it } from 'vitest';

import { documentationFilterSchema } from '@/domain/documentation.filter';
import { documentationSchema } from '@/domain/documentation.model';
import { documentation } from '../builders/documentation.builder';

describe('documentationSchema', () => {
  it('accepts a valid manual document', () => {
    const doc = documentation({ source: 'manual' });
    const parsed = documentationSchema.parse(doc);
    expect(parsed.externalId).toBe(doc.externalId);
  });

  it('rejects unknown keys', () => {
    const doc = documentation();
    const result = documentationSchema.safeParse({ ...doc, extra: 1 });
    expect(result.success).toBe(false);
  });
});

describe('documentationFilterSchema', () => {
  it('parses tags array from repeated-style object', () => {
    const r = documentationFilterSchema.safeParse({
      tags: ['simulation_step_1', 'simulation_step_2_approved'],
      isFaq: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.isFaq).toBe(true);
      expect(r.data.tags).toEqual(['simulation_step_1', 'simulation_step_2_approved']);
    }
  });

  it('parses formats array', () => {
    const r = documentationFilterSchema.safeParse({ formats: ['markdown', 'text'] });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.formats).toEqual(['markdown', 'text']);
    }
  });
});
