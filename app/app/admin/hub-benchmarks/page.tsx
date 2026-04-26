'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RowSelectionState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { HubBenchmark } from '@/domain/hub-benchmark.model';
import { Page } from '@/domain/page.model';
import { useAdminListUrlSync } from '@/app/admin/admin-list-url-sync';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { DropdownMenuItem } from '@/app/components/ui/dropdown-menu';
import {
  AdminTablePage,
  DataTable,
  DataTablePagination,
  DataTableSearchableMultiselect,
  DataTableToolbar,
  SearchableOption,
} from '@/app/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { BulkActionsButton } from '@/app/components/bulk-actions-button';
import { BulkDeleteDialog, type BulkDeleteItem } from '@/app/components/bulk-delete-dialog';
import { BulkImportDialog } from '@/app/components/bulk-import-dialog';
import { apiDelete, apiPost, apiPut } from '@/app/lib/api-client';
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
  const tCommon = useTranslations('admin.common');
  const [state, setState] = useState<HubBenchmarksState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const { pageIndex, pageSize, sorting, csv, setPageIndex, setPageSize, setSort, setCsvParam } = useAdminListUrlSync({
    defaultPageSize: DEFAULT_PAGE_SIZE,
    defaultSort: null,
    validSortIds: Object.keys(SORT_COLUMN_MAP),
    csvParamNames: ['hubIds'],
  });

  const hubIds = csv.hubIds;
  const [hubOptions, setHubOptions] = useState<SearchableOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (hubIds.length === 0) {
      setHubOptions([]);
      return;
    }
    (async () => {
      const resolved = await Promise.all(
        hubIds.map(async (id) => {
          const res = await fetch(`/api/hubs/${encodeURIComponent(id)}`);
          if (!res.ok) return { id, name: id };
          const h = await res.json();
          return { id: h.id, name: h.name };
        }),
      );
      if (!cancelled) setHubOptions(resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, [hubIds]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdAt: false,
    updatedAt: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [itemToDelete, setItemToDelete] = useState<HubBenchmark | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const handleSort = useCallback(
    (columnId: string, desc: boolean) => {
      setSort(columnId, desc);
    },
    [setSort],
  );

  const handleHubChange = useCallback(
    (values: string[], options: SearchableOption[]) => {
      setCsvParam('hubIds', values);
      setHubOptions(options);
    },
    [setCsvParam],
  );

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

  const buildApiParams = useCallback(() => {
    const params = new URLSearchParams();
    if (hubIds.length > 0) params.set('hubId', hubIds[0]!);

    if (sorting.length > 0) {
      const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
      if (sortColumn) {
        params.set('sortBy', sortColumn);
        params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
      }
    }

    return params;
  }, [hubIds, sorting]);

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = buildApiParams();
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

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
  }, [buildApiParams, pageIndex, pageSize]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete?.id) return;

    const response = await apiDelete(`/api/hub-benchmarks/${itemToDelete.id}`);

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

  const handleBulkDeleteItem = useCallback((id: string) => apiDelete(`/api/hub-benchmarks/${id}`), []);

  const handleBulkDeleteComplete = useCallback(() => {
    setRowSelection({});
    fetchData();
  }, [fetchData]);

  const handleUpsertHubBenchmark = useCallback(async (record: HubBenchmark): Promise<Response> => {
    if (record.id) {
      return apiPut(`/api/hub-benchmarks/${record.id}`, record);
    }
    return apiPost('/api/hub-benchmarks', { ...record, id: null });
  }, []);

  const handleBulkImportComplete = useCallback(() => {
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
    <>
      <AdminTablePage
        toolbar={
          <DataTableToolbar
            table={table}
            searchValue=""
            onSearchChange={() => {}}
            showSearch={false}
            leadingSlot={
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/admin/hub-benchmarks/new">
                  <Plus className="mr-1.5 size-4" />
                  {tCommon('actions.new')}
                </Link>
              </Button>
            }
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
            exportEndpoint="/api/hub-benchmarks/export"
            buildExportParams={buildApiParams}
            onImportClick={() => setBulkImportOpen(true)}
            columnLabels={columnLabels}
          />
        }
        tableArea={
          state.isLoading ? (
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

      <BulkImportDialog<HubBenchmark>
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        getRecordLabel={(record) => record.hub?.name ?? record.hub.id}
        upsertRecord={handleUpsertHubBenchmark}
        onComplete={handleBulkImportComplete}
        labels={{
          title: t('bulkImport.title'),
          description: t('bulkImport.description'),
          columnName: t('bulkImport.columnName'),
        }}
      />
    </>
  );
}
