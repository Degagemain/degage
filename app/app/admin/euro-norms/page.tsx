'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RowSelectionState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { EuroNorm } from '@/domain/euro-norm.model';
import { Page } from '@/domain/page.model';
import { useAdminListUrlSync } from '@/app/admin/admin-list-url-sync';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { DropdownMenuItem } from '@/app/components/ui/dropdown-menu';
import {
  AdminTablePage,
  DataTable,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
  FacetedFilterOption,
} from '@/app/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { BulkActionsButton } from '@/app/components/bulk-actions-button';
import { BulkDeleteDialog, type BulkDeleteItem } from '@/app/components/bulk-delete-dialog';
import { BulkImportDialog } from '@/app/components/bulk-import-dialog';
import { apiDelete, apiPost, apiPut } from '@/app/lib/api-client';
import { createColumns } from './columns';

const DEFAULT_PAGE_SIZE = 20;

interface EuroNormsState {
  data: EuroNorm[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const SORT_COLUMN_MAP: Record<string, string> = {
  code: 'code',
  start: 'start',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export default function EuroNormsPage() {
  const t = useTranslations('admin.euroNorms');
  const tCommon = useTranslations('admin.common');
  const [state, setState] = useState<EuroNormsState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const { queryInput, setQueryInput, debouncedQuery, pageIndex, pageSize, sorting, csv, setPageIndex, setPageSize, setSort, setCsvParam } =
    useAdminListUrlSync({
      defaultPageSize: DEFAULT_PAGE_SIZE,
      defaultSort: { id: 'start', desc: false },
      validSortIds: Object.keys(SORT_COLUMN_MAP),
      csvParamNames: ['isActive'],
    });

  const isActiveFilter = csv.isActive;

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    code: false,
    createdAt: false,
    updatedAt: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [itemToDelete, setItemToDelete] = useState<EuroNorm | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const handleSort = useCallback(
    (columnId: string, desc: boolean) => {
      setSort(columnId, desc);
    },
    [setSort],
  );

  const handleIsActiveChange = useCallback(
    (values: string[]) => {
      setCsvParam('isActive', values);
    },
    [setCsvParam],
  );

  const handleDeleteRequest = useCallback((item: EuroNorm) => {
    setItemToDelete(item);
  }, []);

  const columns = useMemo(() => createColumns({ onSort: handleSort, onDelete: handleDeleteRequest, t }), [handleSort, handleDeleteRequest, t]);

  const isActiveOptions: FacetedFilterOption[] = useMemo(
    () => [
      { value: 'true', label: t('active'), icon: Check },
      { value: 'false', label: t('inactive'), icon: X },
    ],
    [t],
  );

  const columnLabels = useMemo(
    () => ({
      code: t('columns.code'),
      name: t('columns.name'),
      group: t('columns.group'),
      isActive: t('columns.active'),
      start: t('columns.start'),
      end: t('columns.end'),
      createdAt: t('columns.created'),
      updatedAt: t('columns.updated'),
    }),
    [t],
  );

  const buildApiParams = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('query', debouncedQuery);
    if (isActiveFilter.length === 1) params.set('isActive', isActiveFilter[0]!);

    if (sorting.length > 0) {
      const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
      if (sortColumn) {
        params.set('sortBy', sortColumn);
        params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
      }
    }

    return params;
  }, [debouncedQuery, isActiveFilter, sorting]);

  const fetchEuroNorms = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = buildApiParams();
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

      const response = await fetch(`/api/euro-norms?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication required');
        if (response.status === 403) throw new Error('Access denied');
        throw new Error('Failed to fetch euro norms');
      }

      const result: Page<EuroNorm> = await response.json();
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
    const response = await apiDelete(`/api/euro-norms/${itemToDelete.id}`);
    if (response.ok) {
      toast.success(t('delete.success'));
      setItemToDelete(null);
      fetchEuroNorms();
    } else if (response.status === 409) {
      toast.error(t('delete.conflict'));
    } else {
      toast.error(t('delete.error'));
    }
  }, [itemToDelete, fetchEuroNorms, t]);

  const selectedItems: BulkDeleteItem[] = useMemo(
    () =>
      Object.keys(rowSelection)
        .map((index) => state.data[parseInt(index)])
        .filter(Boolean)
        .map((item) => ({ id: item.id!, label: item.name })),
    [rowSelection, state.data],
  );

  const handleBulkDeleteItem = useCallback((id: string) => apiDelete(`/api/euro-norms/${id}`), []);

  const handleBulkDeleteComplete = useCallback(() => {
    setRowSelection({});
    fetchEuroNorms();
  }, [fetchEuroNorms]);

  const handleUpsertEuroNorm = useCallback(async (record: EuroNorm): Promise<Response> => {
    if (record.id) {
      return apiPut(`/api/euro-norms/${record.id}`, record);
    }
    return apiPost('/api/euro-norms', { ...record, id: null });
  }, []);

  const handleBulkImportComplete = useCallback(() => {
    fetchEuroNorms();
  }, [fetchEuroNorms]);

  useEffect(() => {
    fetchEuroNorms();
  }, [fetchEuroNorms]);

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
          <button onClick={fetchEuroNorms} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const filterSlot = (
    <DataTableFacetedFilter
      title={t('filters.active')}
      options={isActiveOptions}
      selectedValues={isActiveFilter}
      onSelectedChange={handleIsActiveChange}
    />
  );

  return (
    <>
      <AdminTablePage
        toolbar={
          <DataTableToolbar
            table={table}
            searchValue={queryInput}
            onSearchChange={setQueryInput}
            searchPlaceholder={t('searchPlaceholder')}
            leadingSlot={
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/admin/euro-norms/new">
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
            exportEndpoint="/api/euro-norms/export"
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
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-14 rounded-full" />
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
        description={t('delete.description', { name: itemToDelete?.name ?? '' })}
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

      <BulkImportDialog<EuroNorm>
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        getRecordLabel={(record) => record.name}
        upsertRecord={handleUpsertEuroNorm}
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
