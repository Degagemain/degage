'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RowSelectionState, SortingState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';

import { InsurancePriceBenchmark } from '@/domain/insurance-price-benchmark.model';
import { Page } from '@/domain/page.model';
import { Skeleton } from '@/app/components/ui/skeleton';
import { DataTable, DataTableFacetedFilter, DataTablePagination, DataTableToolbar } from '@/app/components/ui/data-table';
import { createColumns } from './columns';

const DEFAULT_PAGE_SIZE = 20;

interface InsurancePriceBenchmarksState {
  data: InsurancePriceBenchmark[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const SORT_COLUMN_MAP: Record<string, string> = {
  year: 'year',
  maxCarPrice: 'maxCarPrice',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

const YEAR_VALUES = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

const YEAR_FACET_OPTIONS = YEAR_VALUES.map((y) => ({ label: String(y), value: String(y) }));

export default function InsurancePriceBenchmarksPage() {
  const t = useTranslations('admin.insurancePriceBenchmarks');
  const [state, setState] = useState<InsurancePriceBenchmarksState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdAt: false,
    updatedAt: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const handleSort = useCallback((columnId: string, desc: boolean) => {
    setSorting([{ id: columnId, desc }]);
    setPageIndex(0);
  }, []);

  const handleYearChange = useCallback((values: string[]) => {
    setYearFilter(values.length ? parseInt(values[values.length - 1], 10) : null);
    setPageIndex(0);
  }, []);

  const columns = useMemo(() => createColumns({ onSort: handleSort, t }), [handleSort, t]);

  const columnLabels = useMemo(
    () => ({
      year: t('columns.year'),
      maxCarPrice: t('columns.maxCarPrice'),
      baseRate: t('columns.baseRate'),
      rate: t('columns.rate'),
      createdAt: t('columns.created'),
      updatedAt: t('columns.updated'),
    }),
    [t],
  );

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (yearFilter != null) params.set('year', String(yearFilter));
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

      if (sorting.length > 0) {
        const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
        if (sortColumn) {
          params.set('sortBy', sortColumn);
          params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
        }
      }

      const response = await fetch(`/api/insurance-price-benchmarks?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication required');
        if (response.status === 403) throw new Error('Access denied');
        throw new Error('Failed to fetch insurance price benchmarks');
      }

      const result: Page<InsurancePriceBenchmark> = await response.json();
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
  }, [yearFilter, pageIndex, pageSize, sorting]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pageCount = Math.ceil(state.total / pageSize);

  const table = useReactTable({
    data: state.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
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

  const handlePageChange = (page: number) => setPageIndex(page);
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(0);
  };

  if (state.error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{state.error}</p>
          <button onClick={fetchData} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const filterSlot = (
    <DataTableFacetedFilter
      title={t('filters.year')}
      options={YEAR_FACET_OPTIONS}
      selectedValues={yearFilter != null ? [String(yearFilter)] : []}
      onSelectedChange={handleYearChange}
    />
  );

  return (
    <div className="flex flex-col gap-3 pt-2 pb-3 md:pt-3 md:pb-4">
      <div className="px-3 md:px-4">
        <DataTableToolbar table={table} searchValue="" onSearchChange={() => {}} filterSlot={filterSlot} columnLabels={columnLabels} />
      </div>

      {state.isLoading ? (
        <div className="border-y">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <DataTable table={table} columns={columns} />
          <div className="px-3 md:px-4">
            <DataTablePagination
              pageIndex={pageIndex}
              pageSize={pageSize}
              pageCount={pageCount}
              totalItems={state.total}
              selectedCount={Object.keys(rowSelection).length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
