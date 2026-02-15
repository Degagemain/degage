'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RowSelectionState, SortingState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Check, X } from 'lucide-react';

import { Town } from '@/domain/town.model';
import { Page } from '@/domain/page.model';
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

interface TownsState {
  data: Town[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const SORT_COLUMN_MAP: Record<string, string> = {
  zip: 'zip',
  name: 'name',
  municipality: 'municipality',
  highDemand: 'highDemand',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export default function TownsPage() {
  const t = useTranslations('admin.towns');
  const [state, setState] = useState<TownsState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
  const [provinceIds, setProvinceIds] = useState<string[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<SearchableOption[]>([]);
  const [simulationRegionIds, setSimulationRegionIds] = useState<string[]>([]);
  const [simulationRegionOptions, setSimulationRegionOptions] = useState<SearchableOption[]>([]);
  const [highDemandFilter, setHighDemandFilter] = useState<string[]>([]);
  const [hasActiveMembersFilter, setHasActiveMembersFilter] = useState<string[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdAt: false,
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

  const handleProvinceChange = useCallback((values: string[], options: SearchableOption[]) => {
    setProvinceIds(values);
    setProvinceOptions(options);
    setPageIndex(0);
  }, []);

  const handleSimulationRegionChange = useCallback((values: string[], options: SearchableOption[]) => {
    setSimulationRegionIds(values);
    setSimulationRegionOptions(options);
    setPageIndex(0);
  }, []);

  const handleHighDemandChange = useCallback((values: string[]) => {
    setHighDemandFilter(values);
    setPageIndex(0);
  }, []);

  const handleHasActiveMembersChange = useCallback((values: string[]) => {
    setHasActiveMembersFilter(values);
    setPageIndex(0);
  }, []);

  const columns = useMemo(() => createColumns({ onSort: handleSort, t }), [handleSort, t]);

  const highDemandOptions: FacetedFilterOption[] = useMemo(
    () => [
      { value: 'true', label: t('highDemand'), icon: Check },
      { value: 'false', label: t('notHighDemand'), icon: X },
    ],
    [t],
  );

  const hasActiveMembersOptions: FacetedFilterOption[] = useMemo(
    () => [
      { value: 'true', label: t('hasActiveMembers'), icon: Check },
      { value: 'false', label: t('notHasActiveMembers'), icon: X },
    ],
    [t],
  );

  const columnLabels = useMemo(
    () => ({
      zip: t('columns.zip'),
      name: t('columns.name'),
      municipality: t('columns.municipality'),
      province: t('columns.province'),
      simulationRegion: t('columns.simulationRegion'),
      highDemand: t('columns.highDemand'),
      hasActiveMembers: t('columns.hasActiveMembers'),
      createdAt: t('columns.created'),
      updatedAt: t('columns.updated'),
    }),
    [t],
  );

  const fetchTowns = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('query', debouncedQuery);
      if (provinceIds.length > 0) params.set('provinceId', provinceIds[0]);
      if (simulationRegionIds.length > 0) params.set('simulationRegionId', simulationRegionIds[0]);
      if (highDemandFilter.length === 1) params.set('highDemand', highDemandFilter[0]);
      if (hasActiveMembersFilter.length === 1) params.set('hasActiveMembers', hasActiveMembersFilter[0]);
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

      if (sorting.length > 0) {
        const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
        if (sortColumn) {
          params.set('sortBy', sortColumn);
          params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
        }
      }

      const response = await fetch(`/api/towns?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication required');
        if (response.status === 403) throw new Error('Access denied');
        throw new Error('Failed to fetch towns');
      }

      const result: Page<Town> = await response.json();
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
  }, [debouncedQuery, provinceIds, simulationRegionIds, highDemandFilter, hasActiveMembersFilter, pageIndex, pageSize, sorting]);

  useEffect(() => {
    fetchTowns();
  }, [fetchTowns]);

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
          <button onClick={fetchTowns} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const filterSlot = (
    <>
      <DataTableSearchableMultiselect
        title={t('filters.province')}
        apiPath="provinces"
        selectedValues={provinceIds}
        selectedOptions={provinceOptions}
        onSelectedChange={handleProvinceChange}
        placeholder={t('filters.provincePlaceholder')}
      />
      <DataTableSearchableMultiselect
        title={t('filters.simulationRegion')}
        apiPath="simulation-regions"
        selectedValues={simulationRegionIds}
        selectedOptions={simulationRegionOptions}
        onSelectedChange={handleSimulationRegionChange}
        placeholder={t('filters.simulationRegionPlaceholder')}
      />
      <DataTableFacetedFilter
        title={t('filters.highDemand')}
        options={highDemandOptions}
        selectedValues={highDemandFilter}
        onSelectedChange={handleHighDemandChange}
      />
      <DataTableFacetedFilter
        title={t('filters.hasActiveMembers')}
        options={hasActiveMembersOptions}
        selectedValues={hasActiveMembersFilter}
        onSelectedChange={handleHasActiveMembersChange}
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
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-14 rounded-full" />
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
