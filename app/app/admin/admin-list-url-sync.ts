import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { SortingState } from '@tanstack/react-table';

export const ADMIN_LIST_ALLOWED_PAGE_SIZES = [20, 30, 50, 100] as const;

export type AdminListUrlDefaultSort = { id: string; desc: boolean } | null;

export type ParseAdminListUrlParamsInput = {
  searchParams: URLSearchParams;
  defaultPageSize: number;
  defaultSort: AdminListUrlDefaultSort;
  validSortIds: ReadonlySet<string>;
  csvParamNames: readonly string[];
  stringParamNames: readonly string[];
};

export type ParsedAdminListUrlParams = {
  q: string;
  pageIndex: number;
  pageSize: number;
  sorting: SortingState;
  csv: Record<string, string[]>;
  strings: Record<string, string | null>;
};

function parsePositivePage(value: string | null): number {
  const n = parseInt(value ?? '', 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

const EMPTY_STRING_ARRAY: string[] = [];

export function parseListFromCsv(value: string | null): string[] {
  if (!value) return EMPTY_STRING_ARRAY;
  const parts = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : EMPTY_STRING_ARRAY;
}

export function parseAdminListUrlParams({
  searchParams,
  defaultPageSize,
  defaultSort,
  validSortIds,
  csvParamNames,
  stringParamNames,
}: ParseAdminListUrlParamsInput): ParsedAdminListUrlParams {
  const q = searchParams.get('q') ?? '';
  const pageIndex = parsePositivePage(searchParams.get('page')) - 1;
  const sizeRaw = parseInt(searchParams.get('size') ?? '', 10);
  const pageSize = ADMIN_LIST_ALLOWED_PAGE_SIZES.includes(sizeRaw as (typeof ADMIN_LIST_ALLOWED_PAGE_SIZES)[number])
    ? sizeRaw
    : defaultPageSize;

  const sortRaw = searchParams.get('sort');
  let sorting: SortingState;
  if (sortRaw && validSortIds.has(sortRaw)) {
    const orderRaw = searchParams.get('order');
    const desc = orderRaw === 'asc' ? false : orderRaw === 'desc' ? true : true;
    sorting = [{ id: sortRaw, desc }];
  } else if (defaultSort) {
    sorting = [{ id: defaultSort.id, desc: defaultSort.desc }];
  } else {
    sorting = [];
  }

  const csv: Record<string, string[]> = {};
  for (const name of csvParamNames) {
    csv[name] = parseListFromCsv(searchParams.get(name));
  }

  const strings: Record<string, string | null> = {};
  for (const name of stringParamNames) {
    const v = searchParams.get(name);
    strings[name] = v === null || v === '' ? null : v;
  }

  return { q, pageIndex, pageSize, sorting, csv, strings };
}

export type UseAdminListUrlSyncOptions = {
  defaultPageSize: number;
  defaultSort: AdminListUrlDefaultSort;
  validSortIds: readonly string[];
  csvParamNames?: readonly string[];
  stringParamNames?: readonly string[];
};

export function useAdminListUrlSync({
  defaultPageSize,
  defaultSort,
  validSortIds,
  csvParamNames = [],
  stringParamNames = [],
}: UseAdminListUrlSyncOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const searchKey = searchParams.toString();
  const defaultSortKey = defaultSort === null ? 'null' : JSON.stringify({ id: defaultSort.id, desc: defaultSort.desc });
  const validSortKey = [...validSortIds].sort().join(',');
  const csvParamNamesKey = csvParamNames.join('\0');
  const stringParamNamesKey = stringParamNames.join('\0');

  const parsed = useMemo(() => {
    const resolvedDefaultSort: AdminListUrlDefaultSort =
      defaultSortKey === 'null' ? null : (JSON.parse(defaultSortKey) as { id: string; desc: boolean });
    const validSortSet = new Set(validSortKey ? validSortKey.split(',') : []);
    const csvNames = csvParamNamesKey.length > 0 ? csvParamNamesKey.split('\0') : [];
    const stringNames = stringParamNamesKey.length > 0 ? stringParamNamesKey.split('\0') : [];
    return parseAdminListUrlParams({
      searchParams: new URLSearchParams(searchKey),
      defaultPageSize,
      defaultSort: resolvedDefaultSort,
      validSortIds: validSortSet,
      csvParamNames: csvNames,
      stringParamNames: stringNames,
    });
  }, [searchKey, defaultPageSize, defaultSortKey, validSortKey, csvParamNamesKey, stringParamNamesKey]);

  const updateParams = useCallback(
    (mutate: (sp: URLSearchParams) => void) => {
      const sp = new URLSearchParams(searchKey);
      mutate(sp);
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchKey],
  );

  const [queryInput, setQueryInput] = useState(parsed.q);
  useEffect(() => {
    setQueryInput(parsed.q);
  }, [parsed.q]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (queryInput === parsed.q) return;
      updateParams((sp) => {
        if (queryInput) sp.set('q', queryInput);
        else sp.delete('q');
        sp.delete('page');
      });
    }, 300);
    return () => window.clearTimeout(id);
  }, [queryInput, parsed.q, updateParams]);

  const setPageIndex = useCallback(
    (idx: number) => {
      updateParams((sp) => {
        if (idx <= 0) sp.delete('page');
        else sp.set('page', String(idx + 1));
      });
    },
    [updateParams],
  );

  const setPageSize = useCallback(
    (size: number) => {
      updateParams((sp) => {
        if (size === defaultPageSize) sp.delete('size');
        else sp.set('size', String(size));
        sp.delete('page');
      });
    },
    [updateParams, defaultPageSize],
  );

  const setSort = useCallback(
    (columnId: string, desc: boolean) => {
      updateParams((sp) => {
        sp.set('sort', columnId);
        sp.set('order', desc ? 'desc' : 'asc');
        sp.delete('page');
      });
    },
    [updateParams],
  );

  const setCsvParam = useCallback(
    (paramName: string, values: string[]) => {
      updateParams((sp) => {
        if (values.length === 0) sp.delete(paramName);
        else sp.set(paramName, values.join(','));
        sp.delete('page');
      });
    },
    [updateParams],
  );

  const setStringParam = useCallback(
    (paramName: string, value: string | null) => {
      updateParams((sp) => {
        if (value === null || value === '') sp.delete(paramName);
        else sp.set(paramName, value);
        sp.delete('page');
      });
    },
    [updateParams],
  );

  return {
    queryInput,
    setQueryInput,
    debouncedQuery: parsed.q,
    pageIndex: parsed.pageIndex,
    pageSize: parsed.pageSize,
    sorting: parsed.sorting,
    csv: parsed.csv,
    strings: parsed.strings,
    setPageIndex,
    setPageSize,
    setSort,
    setCsvParam,
    setStringParam,
  };
}
