'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { RowSelectionState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Check, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Town } from '@/domain/town.model';
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
  DataTableSearchableMultiselect,
  DataTableToolbar,
  FacetedFilterOption,
  type SearchableOption,
} from '@/app/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { BulkActionsButton } from '@/app/components/bulk-actions-button';
import { BulkDeleteDialog, type BulkDeleteItem } from '@/app/components/bulk-delete-dialog';
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
  const tCommon = useTranslations('admin.common');
  const [state, setState] = useState<TownsState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const { queryInput, setQueryInput, debouncedQuery, pageIndex, pageSize, sorting, csv, setPageIndex, setPageSize, setSort, setCsvParam } =
    useAdminListUrlSync({
      defaultPageSize: DEFAULT_PAGE_SIZE,
      defaultSort: { id: 'name', desc: false },
      validSortIds: Object.keys(SORT_COLUMN_MAP),
      csvParamNames: ['provinceIds', 'hubIds', 'highDemand', 'hasActiveMembers'],
    });

  const provinceIds = csv.provinceIds;
  const hubIds = csv.hubIds;
  const highDemandFilter = csv.highDemand;
  const hasActiveMembersFilter = csv.hasActiveMembers;

  const [provinceOptions, setProvinceOptions] = useState<SearchableOption[]>([]);
  const [hubOptions, setHubOptions] = useState<SearchableOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (provinceIds.length === 0) {
      setProvinceOptions([]);
      return;
    }
    (async () => {
      const resolved = await Promise.all(
        provinceIds.map(async (id) => {
          const res = await fetch(`/api/provinces/${encodeURIComponent(id)}`);
          if (!res.ok) return { id, name: id };
          const p = await res.json();
          return { id: p.id, name: p.name };
        }),
      );
      if (!cancelled) setProvinceOptions(resolved);
    })();
    return () => {
      cancelled = true;
    };
  }, [provinceIds]);

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
  const [townToDelete, setTownToDelete] = useState<Town | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const handleSort = useCallback(
    (columnId: string, desc: boolean) => {
      setSort(columnId, desc);
    },
    [setSort],
  );

  const handleProvinceChange = useCallback(
    (values: string[], options: SearchableOption[]) => {
      setCsvParam('provinceIds', values);
      setProvinceOptions(options);
    },
    [setCsvParam],
  );

  const handleHubChange = useCallback(
    (values: string[], options: SearchableOption[]) => {
      setCsvParam('hubIds', values);
      setHubOptions(options);
    },
    [setCsvParam],
  );

  const handleHighDemandChange = useCallback(
    (values: string[]) => {
      setCsvParam('highDemand', values);
    },
    [setCsvParam],
  );

  const handleHasActiveMembersChange = useCallback(
    (values: string[]) => {
      setCsvParam('hasActiveMembers', values);
    },
    [setCsvParam],
  );

  const handleDeleteRequest = useCallback((town: Town) => {
    setTownToDelete(town);
  }, []);

  const columns = useMemo(() => createColumns({ onSort: handleSort, onDelete: handleDeleteRequest, t }), [handleSort, handleDeleteRequest, t]);

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
      hub: t('columns.hub'),
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
      if (provinceIds.length > 0) params.set('provinceId', provinceIds[0]!);
      if (hubIds.length > 0) params.set('hubId', hubIds[0]!);
      if (highDemandFilter.length === 1) params.set('highDemand', highDemandFilter[0]!);
      if (hasActiveMembersFilter.length === 1) params.set('hasActiveMembers', hasActiveMembersFilter[0]!);
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
  }, [debouncedQuery, provinceIds, hubIds, highDemandFilter, hasActiveMembersFilter, pageIndex, pageSize, sorting]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!townToDelete?.id) return;

    const response = await fetch(`/api/towns/${townToDelete.id}`, { method: 'DELETE' });

    if (response.ok) {
      toast.success(t('delete.success'));
      setTownToDelete(null);
      fetchTowns();
    } else if (response.status === 409) {
      toast.error(t('delete.conflict'));
    } else {
      toast.error(t('delete.error'));
    }
  }, [townToDelete, fetchTowns, t]);

  const selectedTowns: BulkDeleteItem[] = useMemo(
    () =>
      Object.keys(rowSelection)
        .map((index) => state.data[parseInt(index)])
        .filter(Boolean)
        .map((town) => ({ id: town.id!, label: `${town.zip} — ${town.name}` })),
    [rowSelection, state.data],
  );

  const handleBulkDeleteItem = useCallback((id: string) => fetch(`/api/towns/${id}`, { method: 'DELETE' }), []);

  const handleBulkDeleteComplete = useCallback(() => {
    setRowSelection({});
    fetchTowns();
  }, [fetchTowns]);

  useEffect(() => {
    fetchTowns();
  }, [fetchTowns]);

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
        title={t('filters.hub')}
        apiPath="hubs"
        selectedValues={hubIds}
        selectedOptions={hubOptions}
        onSelectedChange={handleHubChange}
        placeholder={t('filters.hubPlaceholder')}
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
                <Link href="/app/admin/towns/new">
                  <Plus className="mr-1.5 size-4" />
                  {tCommon('actions.new')}
                </Link>
              </Button>
            }
            filterSlot={
              <>
                <BulkActionsButton count={selectedTowns.length} label={t('bulkActions.label')}>
                  <DropdownMenuItem variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
                    <Trash2 />
                    {t('bulkActions.delete')}
                  </DropdownMenuItem>
                </BulkActionsButton>
                {filterSlot}
              </>
            }
            exportEndpoint="/api/towns/export"
            columnLabels={columnLabels}
          />
        }
        tableArea={
          state.isLoading ? (
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
        open={townToDelete !== null}
        onOpenChange={(open) => !open && setTownToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t('delete.title')}
        description={t('delete.description', { name: townToDelete?.name ?? '' })}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
      />

      <BulkDeleteDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        items={selectedTowns}
        deleteItem={handleBulkDeleteItem}
        onComplete={handleBulkDeleteComplete}
        labels={{
          title: t('bulkDelete.title'),
          description: t('bulkDelete.description', { count: selectedTowns.length }),
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
