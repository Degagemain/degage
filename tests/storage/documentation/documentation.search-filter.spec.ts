import { describe, expect, it } from 'vitest';

import { documentationFilterSchema } from '@/domain/documentation.filter';
import { filterToQuery } from '@/storage/documentation/documentation.search';

describe('documentation search filterToQuery (audience / roles)', () => {
  const defaultFilter = documentationFilterSchema.parse({});

  it('adds hasSome when audiences are provided', () => {
    const where = filterToQuery(documentationFilterSchema.parse({ audiences: ['public', 'user'] }));
    expect(where).toMatchObject({
      audienceRoles: { hasSome: ['public', 'user'] },
    });
  });

  it('omits audience clause when audiences are absent', () => {
    const where = filterToQuery(defaultFilter);
    expect(where.audienceRoles).toBeUndefined();
    expect(where.AND).toBeUndefined();
  });

  it('combines audiences with isFaq via AND', () => {
    const filter = documentationFilterSchema.parse({ isFaq: true, audiences: ['public'] });
    const where = filterToQuery(filter);
    expect(where).toEqual({
      AND: [{ audienceRoles: { hasSome: ['public'] } }, { isFaq: true }],
    });
  });

  it('filters by isPublic', () => {
    const where = filterToQuery(documentationFilterSchema.parse({ isPublic: true }));
    expect(where).toEqual({ isPublic: true });
  });

  it('combines isPublic with isFaq on the same clause', () => {
    const filter = documentationFilterSchema.parse({ isPublic: true, isFaq: true });
    const where = filterToQuery(filter);
    expect(where).toEqual({ isFaq: true, isPublic: true });
  });

  it('filters by single source', () => {
    const filter = documentationFilterSchema.parse({ sources: ['repository'] });
    const where = filterToQuery(filter);
    expect(where).toEqual({ source: 'repository' });
  });

  it('filters by multiple sources with IN', () => {
    const filter = documentationFilterSchema.parse({ sources: ['repository', 'notion'] });
    const where = filterToQuery(filter);
    expect(where).toEqual({ source: { in: ['repository', 'notion'] } });
  });

  it('filters by single format', () => {
    const filter = documentationFilterSchema.parse({ formats: ['markdown'] });
    const where = filterToQuery(filter);
    expect(where).toEqual({ format: 'markdown' });
  });

  it('filters by multiple formats with IN', () => {
    const filter = documentationFilterSchema.parse({ formats: ['markdown', 'text'] });
    const where = filterToQuery(filter);
    expect(where).toEqual({ format: { in: ['markdown', 'text'] } });
  });
});
