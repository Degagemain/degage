'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RowSelectionState, SortingState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Simulation } from '@/domain/simulation.model';
import { Page } from '@/domain/page.model';
import { SimulationSortColumns } from '@/domain/simulation.filter';
import { Skeleton } from '@/app/components/ui/skeleton';
import {
  DataTable,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableSearchableMultiselect,
  DataTableToolbar,
  FacetedFilterOption,
  type SearchableOption,
} from '@/app/components/ui/data-table';
import { createColumns } from './columns';

const DEFAULT_PAGE_SIZE = 20;

interface SimulationsState {
  data: Simulation[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const SORT_COLUMN_MAP: Record<string, string> = {
  resultCode: SimulationSortColumns.RESULT_CODE,
  firstRegisteredAt: SimulationSortColumns.FIRST_REGISTERED_AT,
  createdAt: SimulationSortColumns.CREATED_AT,
  updatedAt: SimulationSortColumns.UPDATED_AT,
};

export default function SimulationsPage() {
  const t = useTranslations('admin.simulations');
  const [state, setState] = useState<SimulationsState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [brandIds, setBrandIds] = useState<string[]>([]);
  const [brandOptions, setBrandOptions] = useState<SearchableOption[]>([]);
  const [fuelTypeIds, setFuelTypeIds] = useState<string[]>([]);
  const [fuelTypeOptions, setFuelTypeOptions] = useState<SearchableOption[]>([]);
  const [resultCodeFilter, setResultCodeFilter] = useState<string[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    carTypeOther: false,
    updatedAt: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPageIndex(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSort = useCallback((columnId: string, desc: boolean) => {
    setSorting([{ id: columnId, desc }]);
    setPageIndex(0);
  }, []);

  const handleBrandChange = useCallback((values: string[], options: SearchableOption[]) => {
    setBrandIds(values);
    setBrandOptions(options);
    setPageIndex(0);
  }, []);

  const handleFuelTypeChange = useCallback((values: string[], options: SearchableOption[]) => {
    setFuelTypeIds(values);
    setFuelTypeOptions(options);
    setPageIndex(0);
  }, []);

  const handleResultCodeFilterChange = useCallback((values: string[]) => {
    setResultCodeFilter(values);
    setPageIndex(0);
  }, []);

  const columns = useMemo(() => createColumns({ onSort: handleSort, t }), [handleSort, t]);

  const resultCodeOptions: FacetedFilterOption[] = useMemo(
    () => [
      { value: 'notOk', label: t('resultCodes.notOk') },
      { value: 'manualReview', label: t('resultCodes.manualReview') },
      { value: 'categoryA', label: t('resultCodes.categoryA') },
      { value: 'categoryB', label: t('resultCodes.categoryB') },
      { value: 'higherRate', label: t('resultCodes.higherRate') },
    ],
    [t],
  );

  const columnLabels = useMemo(
    () => ({
      resultCode: t('columns.resultCode'),
      brand: t('columns.brand'),
      fuelType: t('columns.fuelType'),
      carType: t('columns.carType'),
      km: t('columns.km'),
      seats: t('columns.seats'),
      firstRegisteredAt: t('columns.firstRegisteredAt'),
      carTypeOther: t('columns.carTypeOther'),
      createdAt: t('columns.created'),
      updatedAt: t('columns.updated'),
    }),
    [t],
  );

  const fetchSimulations = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (debouncedQuery.trim()) params.set('query', debouncedQuery.trim());
      brandIds.forEach((id) => params.append('brandId', id));
      fuelTypeIds.forEach((id) => params.append('fuelTypeId', id));
      resultCodeFilter.forEach((code) => params.append('resultCode', code));
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

      if (sorting.length > 0) {
        const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
        if (sortColumn) {
          params.set('sortBy', sortColumn);
          params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
        }
      }

      const response = await fetch(`/api/simulations?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication required');
        if (response.status === 403) throw new Error('Access denied');
        throw new Error('Failed to fetch simulations');
      }

      const result: Page<Simulation> = await response.json();
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
  }, [debouncedQuery, brandIds, fuelTypeIds, resultCodeFilter, pageIndex, pageSize, sorting]);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

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

  const handlePageChange = (page: number) => {
    setPageIndex(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(0);
  };

  if (state.error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{state.error}</p>
          <button onClick={fetchSimulations} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const filterSlot = (
    <>
      <DataTableSearchableMultiselect
        title={t('filters.brand')}
        apiPath="car-brands"
        selectedValues={brandIds}
        selectedOptions={brandOptions}
        onSelectedChange={handleBrandChange}
        placeholder={t('filters.brandPlaceholder')}
      />
      <DataTableSearchableMultiselect
        title={t('filters.fuelType')}
        apiPath="fuel-types"
        selectedValues={fuelTypeIds}
        selectedOptions={fuelTypeOptions}
        onSelectedChange={handleFuelTypeChange}
        placeholder={t('filters.fuelTypePlaceholder')}
      />
      <DataTableFacetedFilter
        title={t('filters.resultCode')}
        options={resultCodeOptions}
        selectedValues={resultCodeFilter}
        onSelectedChange={handleResultCodeFilterChange}
      />
    </>
  );

  return (
    <div className="flex flex-col gap-3 pt-2 pb-3 md:pt-3 md:pb-4">
      <div className="px-3 md:px-4">
        <DataTableToolbar
          table={table}
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder={t('searchPlaceholder')}
          filterSlot={filterSlot}
          columnLabels={columnLabels}
        />
      </div>

      {state.isLoading ? (
        <div className="border-y">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
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
