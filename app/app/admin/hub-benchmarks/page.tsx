'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RowSelectionState, SortingState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { HubBenchmark } from '@/domain/hub-benchmark.model';
import { Page } from '@/domain/page.model';
import { Skeleton } from '@/app/components/ui/skeleton';
import { DropdownMenuItem } from '@/app/components/ui/dropdown-menu';
import {
  DataTable,
  DataTablePagination,
  DataTableSearchableMultiselect,
  DataTableToolbar,
  SearchableOption,
} from '@/app/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { BulkActionsButton } from '@/app/components/bulk-actions-button';
import { BulkDeleteDialog, type BulkDeleteItem } from '@/app/components/bulk-delete-dialog';
import { createColumns } from './columns';

const DEFAULT_PAGE_SIZE = 20;

interface HubBenchmarksState {
  data: HubBenchmark[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const SORT_COLUMN_MAP: Record<string, string> = {
  ownerKm: 'ownerKm',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export default function HubBenchmarksPage() {
  const t = useTranslations('admin.hubBenchmarks');
  const [state, setState] = useState<HubBenchmarksState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [hubIds, setHubIds] = useState<string[]>([]);
  const [hubOptions, setHubOptions] = useState<SearchableOption[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdAt: false,
    updatedAt: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [itemToDelete, setItemToDelete] = useState<HubBenchmark | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const handleSort = useCallback((columnId: string, desc: boolean) => {
    setSorting([{ id: columnId, desc }]);
    setPageIndex(0);
  }, []);

  const handleHubChange = useCallback((values: string[], options: SearchableOption[]) => {
    setHubIds(values);
    setHubOptions(options);
    setPageIndex(0);
  }, []);

  const handleDeleteRequest = useCallback((item: HubBenchmark) => {
    setItemToDelete(item);
  }, []);

  const columns = useMemo(() => createColumns({ onSort: handleSort, onDelete: handleDeleteRequest, t }), [handleSort, handleDeleteRequest, t]);

  const columnLabels = useMemo(
    () => ({
      hub: t('columns.hub'),
      ownerKm: t('columns.ownerKm'),
      sharedAvgKm: t('columns.sharedAvgKm'),
      sharedMinKm: t('columns.sharedMinKm'),
      sharedMaxKm: t('columns.sharedMaxKm'),
      createdAt: t('columns.created'),
      updatedAt: t('columns.updated'),
    }),
    [t],
  );

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (hubIds.length > 0) params.set('hubId', hubIds[0]);
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

      if (sorting.length > 0) {
        const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
        if (sortColumn) {
          params.set('sortBy', sortColumn);
          params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
        }
      }

      const response = await fetch(`/api/hub-benchmarks?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication required');
        if (response.status === 403) throw new Error('Access denied');
        throw new Error('Failed to fetch hub benchmarks');
      }

      const result: Page<HubBenchmark> = await response.json();
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
  }, [hubIds, pageIndex, pageSize, sorting]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete?.id) return;

    const response = await fetch(`/api/hub-benchmarks/${itemToDelete.id}`, { method: 'DELETE' });

    if (response.ok) {
      toast.success(t('delete.success'));
      setItemToDelete(null);
      fetchData();
    } else if (response.status === 409) {
      toast.error(t('delete.conflict'));
    } else {
      toast.error(t('delete.error'));
    }
  }, [itemToDelete, fetchData, t]);

  const selectedItems: BulkDeleteItem[] = useMemo(
    () =>
      Object.keys(rowSelection)
        .map((index) => state.data[parseInt(index)])
        .filter(Boolean)
        .map((item) => ({ id: item.id!, label: item.hub?.name ?? item.id! })),
    [rowSelection, state.data],
  );

  const handleBulkDeleteItem = useCallback((id: string) => fetch(`/api/hub-benchmarks/${id}`, { method: 'DELETE' }), []);

  const handleBulkDeleteComplete = useCallback(() => {
    setRowSelection({});
    fetchData();
  }, [fetchData]);

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
    <DataTableSearchableMultiselect
      title={t('filters.hub')}
      apiPath="hubs"
      selectedValues={hubIds}
      selectedOptions={hubOptions}
      onSelectedChange={handleHubChange}
      placeholder={t('filters.hubPlaceholder')}
    />
  );

  return (
    <div className="flex flex-col gap-3 pt-2 pb-3 md:pt-3 md:pb-4">
      <div className="px-3 md:px-4">
        <DataTableToolbar
          table={table}
          searchValue=""
          onSearchChange={() => {}}
          filterSlot={
            <>
              <BulkActionsButton count={selectedItems.length} label={t('bulkActions.label')}>
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
                <Skeleton className="h-4 w-20" />
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

      <DeleteConfirmationDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t('delete.title')}
        description={t('delete.description', { name: itemToDelete?.hub?.name ?? '' })}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
      />

      <BulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        items={selectedItems}
        deleteItem={handleBulkDeleteItem}
        onComplete={handleBulkDeleteComplete}
        labels={{
          title: t('bulkDelete.title'),
          description: t('bulkDelete.description', { count: selectedItems.length }),
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
