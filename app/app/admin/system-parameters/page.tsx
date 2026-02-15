'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RowSelectionState, SortingState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { SystemParameter } from '@/domain/system-parameter.model';
import { Page } from '@/domain/page.model';
import { Skeleton } from '@/app/components/ui/skeleton';
import { DataTable, DataTableFacetedFilter, DataTablePagination, DataTableToolbar, FacetedFilterOption } from '@/app/components/ui/data-table';
import { createColumns } from './columns';
import { EditParameterDialog } from './edit-parameter-dialog';

const DEFAULT_PAGE_SIZE = 20;

interface SystemParametersState {
  data: SystemParameter[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const SORT_COLUMN_MAP: Record<string, string> = {
  code: 'code',
  category: 'category',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export default function SystemParametersPage() {
  const t = useTranslations('admin.systemParameters');
  const [state, setState] = useState<SystemParametersState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'code', desc: false }]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ code: false });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [editParameter, setEditParameter] = useState<SystemParameter | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleCategoryChange = useCallback((values: string[]) => {
    setCategoryFilter(values);
    setPageIndex(0);
  }, []);

  const handleEdit = useCallback((param: SystemParameter) => {
    setEditParameter(param);
    setDialogOpen(true);
  }, []);

  const fetchSystemParameters = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('query', debouncedQuery);
      if (categoryFilter.length === 1) params.set('category', categoryFilter[0]);
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

      if (sorting.length > 0) {
        const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
        if (sortColumn) {
          params.set('sortBy', sortColumn);
          params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
        }
      }

      const response = await fetch(`/api/system-parameters?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication required');
        if (response.status === 403) throw new Error('Access denied');
        throw new Error('Failed to fetch system parameters');
      }

      const result: Page<SystemParameter> = await response.json();
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
  }, [debouncedQuery, categoryFilter, pageIndex, pageSize, sorting]);

  const handleSave = useCallback(
    async (id: string, payload: Record<string, unknown>) => {
      const res = await fetch(`/api/system-parameters/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.errors?.[0]?.message ?? 'Failed to update parameter');
      }
      setDialogOpen(false);
      setEditParameter(null);
      fetchSystemParameters();
    },
    [fetchSystemParameters],
  );

  useEffect(() => {
    fetchSystemParameters();
  }, [fetchSystemParameters]);

  const columns = useMemo(() => createColumns({ onSort: handleSort, onEdit: handleEdit, t }), [handleSort, handleEdit, t]);

  const categoryFilterOptions: FacetedFilterOption[] = useMemo(() => [{ value: 'simulation', label: t('categories.simulation') }], [t]);

  const columnLabels = useMemo(
    () => ({
      code: t('columns.code'),
      category: t('columns.category'),
      name: t('columns.name'),
      description: t('columns.description'),
      type: t('columns.type'),
      value: t('columns.value'),
      createdAt: t('columns.created'),
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
          <button onClick={fetchSystemParameters} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const filterSlot = (
    <DataTableFacetedFilter
      title={t('filters.category')}
      options={categoryFilterOptions}
      selectedValues={categoryFilter}
      onSelectedChange={handleCategoryChange}
    />
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
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
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

      <EditParameterDialog parameter={editParameter} open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleSave} t={t} />
    </div>
  );
}
