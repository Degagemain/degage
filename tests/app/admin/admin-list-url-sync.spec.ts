import { describe, expect, it } from 'vitest';

import { parseAdminListUrlParams, parseListFromCsv } from '@/app/admin/admin-list-url-sync';

describe('parseListFromCsv', () => {
  it('returns empty for null or empty', () => {
    expect(parseListFromCsv(null)).toEqual([]);
    expect(parseListFromCsv('')).toEqual([]);
  });

  it('splits and trims', () => {
    expect(parseListFromCsv(' a , b ,c')).toEqual(['a', 'b', 'c']);
  });
});

describe('parseAdminListUrlParams', () => {
  const base = {
    defaultPageSize: 20,
    validSortIds: new Set(['name', 'updatedAt']),
    csvParamNames: ['statuses', 'roles'] as const,
    stringParamNames: [] as const,
  };

  it('uses defaults when search is empty', () => {
    const sp = new URLSearchParams();
    const r = parseAdminListUrlParams({
      searchParams: sp,
      defaultSort: { id: 'updatedAt', desc: true },
      ...base,
    });
    expect(r.q).toBe('');
    expect(r.pageIndex).toBe(0);
    expect(r.pageSize).toBe(20);
    expect(r.sorting).toEqual([{ id: 'updatedAt', desc: true }]);
    expect(r.csv.statuses).toEqual([]);
    expect(r.csv.roles).toEqual([]);
  });

  it('parses q, page, size, sort, order, csv', () => {
    const sp = new URLSearchParams('q=hello&page=2&size=50&sort=name&order=asc&statuses=active&roles=admin,user');
    const r = parseAdminListUrlParams({
      searchParams: sp,
      defaultSort: { id: 'updatedAt', desc: true },
      ...base,
    });
    expect(r.q).toBe('hello');
    expect(r.pageIndex).toBe(1);
    expect(r.pageSize).toBe(50);
    expect(r.sorting).toEqual([{ id: 'name', desc: false }]);
    expect(r.csv.statuses).toEqual(['active']);
    expect(r.csv.roles).toEqual(['admin', 'user']);
  });

  it('falls back when sort id is invalid', () => {
    const sp = new URLSearchParams('sort=unknown');
    const r = parseAdminListUrlParams({
      searchParams: sp,
      defaultSort: { id: 'name', desc: false },
      ...base,
    });
    expect(r.sorting).toEqual([{ id: 'name', desc: false }]);
  });

  it('uses empty sorting when defaultSort is null and no valid sort in url', () => {
    const sp = new URLSearchParams();
    const r = parseAdminListUrlParams({
      searchParams: sp,
      defaultSort: null,
      ...base,
    });
    expect(r.sorting).toEqual([]);
  });

  it('parses string params', () => {
    const sp = new URLSearchParams('year=2026');
    const r = parseAdminListUrlParams({
      searchParams: sp,
      defaultSort: null,
      validSortIds: new Set(),
      csvParamNames: [],
      stringParamNames: ['year'],
      defaultPageSize: 20,
    });
    expect(r.strings.year).toBe('2026');
  });
});
