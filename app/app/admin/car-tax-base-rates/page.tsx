'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RowSelectionState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';

import { CarTaxBaseRate } from '@/domain/car-tax-base-rate.model';
import { Page } from '@/domain/page.model';
import { useAdminListUrlSync } from '@/app/admin/admin-list-url-sync';
import { Skeleton } from '@/app/components/ui/skeleton';
import { AdminTablePage, DataTable, DataTablePagination, DataTableToolbar } from '@/app/components/ui/data-table';
import { createColumns } from './columns';

const DEFAULT_PAGE_SIZE = 20;

interface CarTaxBaseRatesState {
  data: CarTaxBaseRate[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const SORT_COLUMN_MAP: Record<string, string> = {
  maxCc: 'maxCc',
  fiscalPk: 'fiscalPk',
  start: 'start',
  rate: 'rate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export default function CarTaxBaseRatesPage() {
  const t = useTranslations('admin.carTaxBaseRates');
  const [state, setState] = useState<CarTaxBaseRatesState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const { queryInput, setQueryInput, debouncedQuery, pageIndex, pageSize, sorting, setPageIndex, setPageSize, setSort } = useAdminListUrlSync({
    defaultPageSize: DEFAULT_PAGE_SIZE,
    defaultSort: { id: 'maxCc', desc: false },
    validSortIds: Object.keys(SORT_COLUMN_MAP),
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdAt: false,
    updatedAt: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const handleSort = useCallback(
    (columnId: string, desc: boolean) => {
      setSort(columnId, desc);
    },
    [setSort],
  );

  const columns = useMemo(() => createColumns({ onSort: handleSort, t }), [handleSort, t]);

  const columnLabels = useMemo(
    () => ({
      fiscalRegion: t('columns.fiscalRegion'),
      maxCc: t('columns.maxCc'),
      fiscalPk: t('columns.fiscalPk'),
      start: t('columns.start'),
      end: t('columns.end'),
      rate: t('columns.rate'),
      createdAt: t('columns.created'),
      updatedAt: t('columns.updated'),
    }),
    [t],
  );

  const fetchRates = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('query', debouncedQuery);
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

      if (sorting.length > 0) {
        const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
        if (sortColumn) {
          params.set('sortBy', sortColumn);
          params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
        }
      }

      const response = await fetch(`/api/car-tax-base-rates?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication required');
        if (response.status === 403) throw new Error('Access denied');
        throw new Error('Failed to fetch car tax base rates');
      }

      const result: Page<CarTaxBaseRate> = await response.json();
      setState({
        data: result.records,
        total: result.total,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [debouncedQuery, pageIndex, pageSize, sorting]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const pageCount = Math.ceil(state.total / pageSize);

  const table = useReactTable({
    data: state.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: () => {},
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    manualSorting: true,
    pageCount,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  if (state.error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{state.error}</p>
          <button onClick={fetchRates} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
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
          exportEndpoint="/api/car-tax-base-rates/export"
          columnLabels={columnLabels}
        />
      }
      tableArea={
        state.isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
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
          selectedCount={Object.keys(rowSelection).length}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
        />
      }
    />
  );
}
