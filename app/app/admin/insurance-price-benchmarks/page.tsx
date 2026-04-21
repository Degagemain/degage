'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RowSelectionState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { InsurancePriceBenchmark } from '@/domain/insurance-price-benchmark.model';
import { Page } from '@/domain/page.model';
import { useAdminListUrlSync } from '@/app/admin/admin-list-url-sync';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { DropdownMenuItem } from '@/app/components/ui/dropdown-menu';
import { AdminTablePage, DataTable, DataTableFacetedFilter, DataTablePagination, DataTableToolbar } from '@/app/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { BulkActionsButton } from '@/app/components/bulk-actions-button';
import { BulkDeleteDialog, type BulkDeleteItem } from '@/app/components/bulk-delete-dialog';
import { BulkImportDialog } from '@/app/components/bulk-import-dialog';
import { apiDelete, apiPost, apiPut } from '@/app/lib/api-client';
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
  const tCommon = useTranslations('admin.common');
  const [state, setState] = useState<InsurancePriceBenchmarksState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const { pageIndex, pageSize, sorting, strings, setPageIndex, setPageSize, setSort, setStringParam } = useAdminListUrlSync({
    defaultPageSize: DEFAULT_PAGE_SIZE,
    defaultSort: null,
    validSortIds: Object.keys(SORT_COLUMN_MAP),
    stringParamNames: ['year'],
  });

  const yearFilter = useMemo(() => {
    const raw = strings.year;
    if (raw == null) return null;
    const n = parseInt(raw, 10);
    return YEAR_VALUES.includes(n) ? n : null;
  }, [strings.year]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdAt: false,
    updatedAt: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [itemToDelete, setItemToDelete] = useState<InsurancePriceBenchmark | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const handleSort = useCallback(
    (columnId: string, desc: boolean) => {
      setSort(columnId, desc);
    },
    [setSort],
  );

  const handleYearChange = useCallback(
    (values: string[]) => {
      const last = values.length ? values[values.length - 1]! : null;
      setStringParam('year', last);
    },
    [setStringParam],
  );

  const handleDeleteRequest = useCallback((item: InsurancePriceBenchmark) => {
    setItemToDelete(item);
  }, []);

  const columns = useMemo(() => createColumns({ onSort: handleSort, onDelete: handleDeleteRequest, t }), [handleSort, handleDeleteRequest, t]);

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

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete?.id) return;

    const response = await apiDelete(`/api/insurance-price-benchmarks/${itemToDelete.id}`);

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
        .map((item) => ({ id: item.id!, label: `${item.year}` })),
    [rowSelection, state.data],
  );

  const handleBulkDeleteItem = useCallback((id: string) => apiDelete(`/api/insurance-price-benchmarks/${id}`), []);

  const handleUpsertInsurancePriceBenchmark = useCallback(async (record: InsurancePriceBenchmark): Promise<Response> => {
    if (record.id) {
      return apiPut(`/api/insurance-price-benchmarks/${record.id}`, record);
    }
    return apiPost('/api/insurance-price-benchmarks', { ...record, id: null });
  }, []);

  const handleBulkDeleteComplete = useCallback(() => {
    setRowSelection({});
    fetchData();
  }, [fetchData]);

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
    <DataTableFacetedFilter
      title={t('filters.year')}
      options={YEAR_FACET_OPTIONS}
      selectedValues={yearFilter != null ? [String(yearFilter)] : []}
      onSelectedChange={handleYearChange}
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
                <Link href="/app/admin/insurance-price-benchmarks/new">
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
            exportEndpoint="/api/insurance-price-benchmarks/export"
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
        description={t('delete.description', { name: `${itemToDelete?.year ?? ''}` })}
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

      <BulkImportDialog<InsurancePriceBenchmark>
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        getRecordLabel={(record) => `${record.year}`}
        upsertRecord={handleUpsertInsurancePriceBenchmark}
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
