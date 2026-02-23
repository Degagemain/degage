'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RowSelectionState, SortingState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Check, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { FiscalRegion } from '@/domain/fiscal-region.model';
import { Page } from '@/domain/page.model';
import { Skeleton } from '@/app/components/ui/skeleton';
import { DropdownMenuItem } from '@/app/components/ui/dropdown-menu';
import { DataTable, DataTableFacetedFilter, DataTablePagination, DataTableToolbar, FacetedFilterOption } from '@/app/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { BulkActionsButton } from '@/app/components/bulk-actions-button';
import { BulkDeleteDialog, type BulkDeleteItem } from '@/app/components/bulk-delete-dialog';
import { createColumns } from './columns';

const DEFAULT_PAGE_SIZE = 20;

interface FiscalRegionsState {
  data: FiscalRegion[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const SORT_COLUMN_MAP: Record<string, string> = {
  code: 'code',
  isDefault: 'isDefault',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export default function FiscalRegionsPage() {
  const t = useTranslations('admin.fiscalRegions');
  const [state, setState] = useState<FiscalRegionsState>({
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
  const [isDefaultFilter, setIsDefaultFilter] = useState<string[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdAt: false,
    updatedAt: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [fiscalRegionToDelete, setFiscalRegionToDelete] = useState<FiscalRegion | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

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

  const handleIsDefaultChange = useCallback((values: string[]) => {
    setIsDefaultFilter(values);
    setPageIndex(0);
  }, []);

  const handleDeleteRequest = useCallback((fiscalRegion: FiscalRegion) => {
    setFiscalRegionToDelete(fiscalRegion);
  }, []);

  const columns = useMemo(() => createColumns({ onSort: handleSort, onDelete: handleDeleteRequest, t }), [handleSort, handleDeleteRequest, t]);

  const isDefaultOptions: FacetedFilterOption[] = useMemo(
    () => [
      { value: 'true', label: t('default'), icon: Check },
      { value: 'false', label: t('notDefault'), icon: X },
    ],
    [t],
  );

  const columnLabels = useMemo(
    () => ({
      code: t('columns.code'),
      name: t('columns.name'),
      isDefault: t('columns.default'),
      createdAt: t('columns.created'),
      updatedAt: t('columns.updated'),
    }),
    [t],
  );

  const fetchFiscalRegions = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('query', debouncedQuery);
      if (isDefaultFilter.length === 1) params.set('isDefault', isDefaultFilter[0]);
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

      if (sorting.length > 0) {
        const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
        if (sortColumn) {
          params.set('sortBy', sortColumn);
          params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
        }
      }

      const response = await fetch(`/api/fiscal-regions?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication required');
        if (response.status === 403) throw new Error('Access denied');
        throw new Error('Failed to fetch fiscal regions');
      }

      const result: Page<FiscalRegion> = await response.json();
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
  }, [debouncedQuery, isDefaultFilter, pageIndex, pageSize, sorting]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!fiscalRegionToDelete?.id) return;

    const response = await fetch(`/api/fiscal-regions/${fiscalRegionToDelete.id}`, { method: 'DELETE' });

    if (response.ok) {
      toast.success(t('delete.success'));
      setFiscalRegionToDelete(null);
      fetchFiscalRegions();
    } else if (response.status === 409) {
      toast.error(t('delete.conflict'));
    } else {
      toast.error(t('delete.error'));
    }
  }, [fiscalRegionToDelete, fetchFiscalRegions, t]);

  const selectedFiscalRegions: BulkDeleteItem[] = useMemo(
    () =>
      Object.keys(rowSelection)
        .map((index) => state.data[parseInt(index)])
        .filter(Boolean)
        .map((item) => ({ id: item.id!, label: item.name })),
    [rowSelection, state.data],
  );

  const handleBulkDeleteItem = useCallback((id: string) => fetch(`/api/fiscal-regions/${id}`, { method: 'DELETE' }), []);

  const handleBulkDeleteComplete = useCallback(() => {
    setRowSelection({});
    fetchFiscalRegions();
  }, [fetchFiscalRegions]);

  useEffect(() => {
    fetchFiscalRegions();
  }, [fetchFiscalRegions]);

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
          <button onClick={fetchFiscalRegions} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const filterSlot = (
    <DataTableFacetedFilter
      title={t('filters.default')}
      options={isDefaultOptions}
      selectedValues={isDefaultFilter}
      onSelectedChange={handleIsDefaultChange}
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
          filterSlot={
            <>
              <BulkActionsButton count={selectedFiscalRegions.length} label={t('bulkActions.label')}>
                <DropdownMenuItem variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
                  <Trash2 />
                  {t('bulkActions.delete')}
                </DropdownMenuItem>
              </BulkActionsButton>
              {filterSlot}
            </>
          }
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

      <DeleteConfirmationDialog
        open={fiscalRegionToDelete !== null}
        onOpenChange={(open) => !open && setFiscalRegionToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t('delete.title')}
        description={t('delete.description', { name: fiscalRegionToDelete?.name ?? '' })}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
      />

      <BulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        items={selectedFiscalRegions}
        deleteItem={handleBulkDeleteItem}
        onComplete={handleBulkDeleteComplete}
        labels={{
          title: t('bulkDelete.title'),
          description: t('bulkDelete.description', { count: selectedFiscalRegions.length }),
          columnName: t('bulkDelete.columnName'),
          columnStatus: t('bulkDelete.columnStatus'),
          confirm: t('bulkDelete.confirm'),
          cancel: t('bulkDelete.cancel'),
          close: t('bulkDelete.close'),
          statusPending: t('bulkDelete.statusPending'),
          statusDeleting: t('bulkDelete.statusDeleting'),
          statusSuccess: t('bulkDelete.statusSuccess'),
          statusError: t('bulkDelete.statusError'),
          statusConflict: t('bulkDelete.statusConflict'),
        }}
      />
    </div>
  );
}
