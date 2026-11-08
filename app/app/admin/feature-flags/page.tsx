'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { toast } from 'sonner';
import { FeatureFlag } from '@/domain/feature-flag.model';
import { Page } from '@/domain/page.model';
import { useAdminListUrlSync } from '@/app/admin/admin-list-url-sync';
import { apiPatch } from '@/app/lib/api-client';
import { Skeleton } from '@/app/components/ui/skeleton';
import { AdminTablePage, DataTable, DataTablePagination, DataTableToolbar } from '@/app/components/ui/data-table';
import { createColumns } from './columns';

const DEFAULT_PAGE_SIZE = 20;

interface FeatureFlagsState {
  data: FeatureFlag[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const SORT_COLUMN_MAP: Record<string, string> = {
  code: 'code',
  enabled: 'enabled',
  updatedAt: 'updatedAt',
};

export default function FeatureFlagsPage() {
  const t = useTranslations('admin.featureFlags');
  const [state, setState] = useState<FeatureFlagsState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { queryInput, setQueryInput, debouncedQuery, pageIndex, pageSize, sorting, setPageIndex, setPageSize, setSort } = useAdminListUrlSync({
    defaultPageSize: DEFAULT_PAGE_SIZE,
    defaultSort: { id: 'code', desc: false },
    validSortIds: Object.keys(SORT_COLUMN_MAP),
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const handleSort = useCallback(
    (columnId: string, desc: boolean) => {
      setSort(columnId, desc);
    },
    [setSort],
  );

  const buildApiParams = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('query', debouncedQuery);

    if (sorting.length > 0) {
      const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
      if (sortColumn) {
        params.set('sortBy', sortColumn);
        params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
      }
    }

    return params;
  }, [debouncedQuery, sorting]);

  const fetchFeatureFlags = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = buildApiParams();
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

      const response = await fetch(`/api/feature-flags?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch feature flags');
      }

      const result: Page<FeatureFlag> = await response.json();
      setState({
        data: result.records,
        total: result.total,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'An error occurred',
      }));
    }
  }, [buildApiParams, pageIndex, pageSize]);

  const handleToggleEnabled = useCallback(
    async (flag: FeatureFlag, enabled: boolean) => {
      if (!flag.id) return;
      setTogglingId(flag.id);
      try {
        const res = await apiPatch(`/api/feature-flags/${flag.id}`, { enabled });
        if (!res.ok) {
          throw new Error(t('toggleFailed'));
        }
        const updated: FeatureFlag = await res.json();
        setState((prev) => ({
          ...prev,
          data: prev.data.map((item) => (item.id === updated.id ? updated : item)),
        }));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : t('toggleFailed'));
      } finally {
        setTogglingId(null);
      }
    },
    [t],
  );

  useEffect(() => {
    fetchFeatureFlags();
  }, [fetchFeatureFlags]);

  const columns = useMemo(
    () => createColumns({ onSort: handleSort, onToggleEnabled: handleToggleEnabled, togglingId, t }),
    [handleSort, handleToggleEnabled, togglingId, t],
  );

  const columnLabels = useMemo(
    () => ({
      code: t('columns.code'),
      description: t('columns.description'),
      enabled: t('columns.enabled'),
      updatedAt: t('columns.updated'),
    }),
    [t],
  );

  const pageCount = Math.ceil(state.total / pageSize);

  const table = useReactTable({
    data: state.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: () => {},
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualSorting: true,
    pageCount,
    state: {
      sorting,
      columnVisibility,
    },
  });

  if (state.error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{state.error}</p>
          <button onClick={fetchFeatureFlags} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminTablePage
      toolbar={
        <DataTableToolbar
          table={table}
          searchValue={queryInput}
          onSearchChange={setQueryInput}
          searchPlaceholder={t('searchPlaceholder')}
          columnLabels={columnLabels}
        />
      }
      tableArea={
        state.isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <DataTable table={table} columns={columns} />
        )
      }
      pagination={
        <DataTablePagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          totalItems={state.total}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
        />
      }
    />
  );
}
