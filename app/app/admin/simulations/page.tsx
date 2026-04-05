'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { RowSelectionState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { toast } from 'sonner';
import { Simulation } from '@/domain/simulation.model';
import { Page } from '@/domain/page.model';
import { SimulationSortColumns } from '@/domain/simulation.filter';
import { useAdminListUrlSync } from '@/app/admin/admin-list-url-sync';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import {
  AdminTablePage,
  DataTable,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableSearchableMultiselect,
  DataTableToolbar,
  FacetedFilterOption,
  type SearchableOption,
} from '@/app/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { BulkActionsButton } from '@/app/components/bulk-actions-button';
import { BulkDeleteDialog, type BulkDeleteItem } from '@/app/components/bulk-delete-dialog';
import { AdminExportDialog, type AdminExportFormat } from '@/app/admin/components/admin-export-dialog';
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
  const tExport = useTranslations('admin.common.export');
  const [state, setState] = useState<SimulationsState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const { queryInput, setQueryInput, debouncedQuery, pageIndex, pageSize, sorting, csv, setPageIndex, setPageSize, setSort, setCsvParam } =
    useAdminListUrlSync({
      defaultPageSize: DEFAULT_PAGE_SIZE,
      defaultSort: { id: 'createdAt', desc: true },
      validSortIds: Object.keys(SORT_COLUMN_MAP),
      csvParamNames: ['brandIds', 'fuelTypeIds', 'resultCodes'],
    });

  const brandIds = csv.brandIds;
  const fuelTypeIds = csv.fuelTypeIds;
  const resultCodeFilter = csv.resultCodes;

  const [brandOptions, setBrandOptions] = useState<SearchableOption[]>([]);
  const [fuelTypeOptions, setFuelTypeOptions] = useState<SearchableOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (brandIds.length === 0) {
      setBrandOptions([]);
      return;
    }
    (async () => {
      const resolved = await Promise.all(
        brandIds.map(async (id) => {
          const res = await fetch(`/api/car-brands/${encodeURIComponent(id)}`);
          if (!res.ok) return { id, name: id };
          const b = await res.json();
          return { id: b.id, name: b.name };
        }),
      );
      if (!cancelled) setBrandOptions(resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, [brandIds]);

  useEffect(() => {
    let cancelled = false;
    if (fuelTypeIds.length === 0) {
      setFuelTypeOptions([]);
      return;
    }
    (async () => {
      const resolved = await Promise.all(
        fuelTypeIds.map(async (id) => {
          const res = await fetch(`/api/fuel-types/${encodeURIComponent(id)}`);
          if (!res.ok) return { id, name: id };
          const f = await res.json();
          return { id: f.id, name: f.name };
        }),
      );
      if (!cancelled) setFuelTypeOptions(resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, [fuelTypeIds]);

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    carTypeOther: false,
    updatedAt: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [itemToDelete, setItemToDelete] = useState<Simulation | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleSort = useCallback(
    (columnId: string, desc: boolean) => {
      setSort(columnId, desc);
    },
    [setSort],
  );

  const handleBrandChange = useCallback(
    (values: string[], options: SearchableOption[]) => {
      setCsvParam('brandIds', values);
      setBrandOptions(options);
    },
    [setCsvParam],
  );

  const handleFuelTypeChange = useCallback(
    (values: string[], options: SearchableOption[]) => {
      setCsvParam('fuelTypeIds', values);
      setFuelTypeOptions(options);
    },
    [setCsvParam],
  );

  const handleResultCodeFilterChange = useCallback(
    (values: string[]) => {
      setCsvParam('resultCodes', values);
    },
    [setCsvParam],
  );

  const handleDeleteRequest = useCallback((item: Simulation) => {
    setItemToDelete(item);
  }, []);

  const columns = useMemo(() => createColumns({ onSort: handleSort, onDelete: handleDeleteRequest, t }), [handleSort, handleDeleteRequest, t]);

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
      mileage: t('columns.mileage'),
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

  const buildSimulationsExportUrl = useCallback(
    (format: AdminExportFormat) => {
      const params = new URLSearchParams();
      if (debouncedQuery.trim()) params.set('query', debouncedQuery.trim());
      brandIds.forEach((id) => params.append('brandId', id));
      fuelTypeIds.forEach((id) => params.append('fuelTypeId', id));
      resultCodeFilter.forEach((code) => params.append('resultCode', code));
      if (sorting.length > 0) {
        const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
        if (sortColumn) {
          params.set('sortBy', sortColumn);
          params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
        }
      }
      params.set('format', format);
      return `/api/simulations/export?${params.toString()}`;
    },
    [debouncedQuery, brandIds, fuelTypeIds, resultCodeFilter, sorting],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete?.id) return;

    const response = await fetch(`/api/simulations/${itemToDelete.id}`, { method: 'DELETE' });

    if (response.ok) {
      toast.success(t('delete.success'));
      setItemToDelete(null);
      fetchSimulations();
    } else if (response.status === 409) {
      toast.error(t('delete.conflict'));
    } else {
      toast.error(t('delete.error'));
    }
  }, [itemToDelete, fetchSimulations, t]);

  const selectedItems: BulkDeleteItem[] = useMemo(
    () =>
      Object.keys(rowSelection)
        .map((index) => state.data[parseInt(index)])
        .filter(Boolean)
        .map((item) => ({ id: item.id!, label: `${item.town?.name ?? '—'} — ${item.brand?.name ?? '—'}` })),
    [rowSelection, state.data],
  );

  const handleBulkDeleteItem = useCallback((id: string) => fetch(`/api/simulations/${id}`, { method: 'DELETE' }), []);

  const handleBulkDeleteComplete = useCallback(() => {
    setRowSelection({});
    fetchSimulations();
  }, [fetchSimulations]);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

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
                <Link href="/app/admin/simulations/new">
                  <Plus className="mr-1.5 size-4" />
                  {t('new')}
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
            postFilterSlot={
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      {tExport('more')}
                      <ChevronDown className="ml-1 size-4 opacity-70" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onSelect={() => setExportDialogOpen(true)}>{tExport('openExport')}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AdminExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} buildExportUrl={buildSimulationsExportUrl} />
              </>
            }
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
                  <Skeleton className="h-4 w-24" />
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
        description={t('delete.description', { name: `${itemToDelete?.town?.name ?? ''} — ${itemToDelete?.brand?.name ?? ''}` })}
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
    </>
  );
}
