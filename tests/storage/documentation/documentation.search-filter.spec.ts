import { describe, expect, it } from 'vitest';

import { documentationFilterSchema } from '@/domain/documentation.filter';
import { filterToQuery } from '@/storage/documentation/documentation.search';

describe('documentation search filterToQuery (audience / roles)', () => {
  const defaultFilter = documentationFilterSchema.parse({});

  it('adds NOT hasSome admin/technical when restricting to public audiences', () => {
    const where = filterToQuery(defaultFilter, { restrictToPublicAudiences: true });
    expect(where).toMatchObject({
      NOT: {
        audienceRoles: { hasSome: ['admin', 'technical'] },
      },
    });
  });

  it('omits audience restriction when not restricting to public audiences', () => {
    const where = filterToQuery(defaultFilter, { restrictToPublicAudiences: false });
    expect(where.NOT).toBeUndefined();
    expect(where.AND).toBeUndefined();
  });

  it('combines audience restriction with isFaq via AND', () => {
    const filter = documentationFilterSchema.parse({ isFaq: true });
    const where = filterToQuery(filter, { restrictToPublicAudiences: true });
    expect(where).toEqual({
      AND: [
        {
          NOT: {
            audienceRoles: { hasSome: ['admin', 'technical'] },
          },
        },
        { isFaq: true },
      ],
    });
  });

  it('filters by single source', () => {
    const filter = documentationFilterSchema.parse({ sources: ['repository'] });
    const where = filterToQuery(filter, { restrictToPublicAudiences: false });
    expect(where).toEqual({ source: 'repository' });
  });

  it('filters by multiple sources with IN', () => {
    const filter = documentationFilterSchema.parse({ sources: ['repository', 'notion'] });
    const where = filterToQuery(filter, { restrictToPublicAudiences: false });
    expect(where).toEqual({ source: { in: ['repository', 'notion'] } });
  });

  it('filters by single format', () => {
    const filter = documentationFilterSchema.parse({ formats: ['markdown'] });
    const where = filterToQuery(filter, { restrictToPublicAudiences: false });
    expect(where).toEqual({ format: 'markdown' });
  });

  it('filters by multiple formats with IN', () => {
    const filter = documentationFilterSchema.parse({ formats: ['markdown', 'text'] });
    const where = filterToQuery(filter, { restrictToPublicAudiences: false });
    expect(where).toEqual({ format: { in: ['markdown', 'text'] } });
  });
});
