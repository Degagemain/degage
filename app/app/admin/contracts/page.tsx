'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import type { Contract } from '@/domain/contract.model';
import { Page } from '@/domain/page.model';
import { useAdminListUrlSync } from '@/app/admin/admin-list-url-sync';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { AdminTablePage, DataTable, DataTablePagination, DataTableToolbar } from '@/app/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { apiDelete, apiPost } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { createColumns } from './columns';

const DEFAULT_PAGE_SIZE = 20;

interface ContractsState {
  data: Contract[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const SORT_COLUMN_MAP: Record<string, string> = {
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  updatedAt: 'updatedAt',
};

export default function ContractsPage() {
  const t = useTranslations('admin.contracts');
  const tCommon = useTranslations('admin.common');
  const [state, setState] = useState<ContractsState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const { queryInput, setQueryInput, debouncedQuery, pageIndex, pageSize, sorting, setPageIndex, setPageSize, setSort } = useAdminListUrlSync({
    defaultPageSize: DEFAULT_PAGE_SIZE,
    defaultSort: { id: 'updatedAt', desc: true },
    validSortIds: Object.keys(SORT_COLUMN_MAP),
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [itemToDelete, setItemToDelete] = useState<Contract | null>(null);

  const handleSort = useCallback(
    (columnId: string, desc: boolean) => {
      setSort(columnId, desc);
    },
    [setSort],
  );

  const fetchContracts = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('query', debouncedQuery);
      if (sorting.length > 0) {
        const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
        if (sortColumn) {
          params.set('sortBy', sortColumn);
          params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
        }
      }
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));
      const response = await fetch(`/api/contracts?${params.toString()}`);
      if (!response.ok) throw new Error(t('tryAgain'));
      const result: Page<Contract> = await response.json();
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
        error: error instanceof Error ? error.message : t('tryAgain'),
      }));
    }
  }, [debouncedQuery, pageIndex, pageSize, sorting, t]);

  const handleSend = useCallback(
    async (item: Contract) => {
      if (!item.id) return;
      const response = await apiPost(`/api/contracts/${item.id}/send`, {});
      if (!response.ok) {
        const message = await parseApiErrorMessage(response, t('send.error'));
        toast.error(message);
        return;
      }
      toast.success(t('send.success'));
      fetchContracts();
    },
    [fetchContracts, t],
  );

  const handleOpenDocument = useCallback(
    async (item: Contract) => {
      if (!item.id) return;
      const response = await fetch(`/api/contracts/${item.id}/document`);
      if (!response.ok) {
        const message = await parseApiErrorMessage(response, t('document.error'));
        toast.error(message);
        return;
      }
      const data = (await response.json()) as { url: string };
      window.open(data.url, '_blank', 'noopener,noreferrer');
    },
    [t],
  );

  const columns = useMemo(
    () =>
      createColumns({
        onSort: handleSort,
        onDelete: setItemToDelete,
        onSend: handleSend,
        onOpenDocument: handleOpenDocument,
        t,
      }),
    [handleOpenDocument, handleSend, handleSort, t],
  );

  const columnLabels = useMemo(
    () => ({
      user: t('columns.user'),
      type: t('columns.type'),
      status: t('columns.status'),
      startDate: t('columns.startDate'),
      endDate: t('columns.endDate'),
      updatedAt: t('columns.updated'),
    }),
    [t],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete?.id) return;
    const response = await apiDelete(`/api/contracts/${itemToDelete.id}`);
    if (response.ok) {
      toast.success(t('delete.success'));
      setItemToDelete(null);
      fetchContracts();
    } else {
      toast.error(t('delete.error'));
    }
  }, [itemToDelete, fetchContracts, t]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const pageCount = Math.ceil(state.total / pageSize);
  const table = useReactTable({
    data: state.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: () => {},
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualSorting: true,
    pageCount,
    state: { sorting, columnVisibility },
  });

  if (state.error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{state.error}</p>
          <button onClick={fetchContracts} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

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
                <Link href="/app/admin/contracts/new">
                  <Plus className="mr-1.5 size-4" />
                  {tCommon('actions.new')}
                </Link>
              </Button>
            }
            columnLabels={columnLabels}
          />
        }
        tableArea={
          state.isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
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
            selectedCount={0}
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
        description={t('delete.description', { name: itemToDelete?.user.name ?? itemToDelete?.user.id ?? '' })}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
      />
    </>
  );
}
