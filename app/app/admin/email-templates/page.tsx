'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import type { EmailTemplate } from '@/domain/email-template.model';
import { Page } from '@/domain/page.model';
import { useAdminListUrlSync } from '@/app/admin/admin-list-url-sync';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { AdminTablePage, DataTable, DataTablePagination, DataTableToolbar } from '@/app/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { apiDelete } from '@/app/lib/api-client';
import { createColumns } from './columns';

const DEFAULT_PAGE_SIZE = 20;

interface EmailTemplatesState {
  data: EmailTemplate[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const SORT_COLUMN_MAP: Record<string, string> = {
  code: 'code',
  designId: 'designId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export default function EmailTemplatesPage() {
  const t = useTranslations('admin.emailTemplates');
  const tCommon = useTranslations('admin.common');
  const [state, setState] = useState<EmailTemplatesState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const { queryInput, setQueryInput, debouncedQuery, pageIndex, pageSize, sorting, setPageIndex, setPageSize, setSort } = useAdminListUrlSync({
    defaultPageSize: DEFAULT_PAGE_SIZE,
    defaultSort: { id: 'code', desc: false },
    validSortIds: Object.keys(SORT_COLUMN_MAP),
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdAt: false,
  });
  const [itemToDelete, setItemToDelete] = useState<EmailTemplate | null>(null);

  const handleSort = useCallback(
    (columnId: string, desc: boolean) => {
      setSort(columnId, desc);
    },
    [setSort],
  );

  const handleDeleteRequest = useCallback((item: EmailTemplate) => {
    setItemToDelete(item);
  }, []);

  const columns = useMemo(() => createColumns({ onSort: handleSort, onDelete: handleDeleteRequest, t }), [handleSort, handleDeleteRequest, t]);

  const columnLabels = useMemo(
    () => ({
      code: t('columns.code'),
      designId: t('columns.design'),
      createdAt: t('columns.created'),
      updatedAt: t('columns.updated'),
    }),
    [t],
  );

  const buildApiParams = useCallback(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('query', debouncedQuery);

    if (sorting.length > 0) {
      const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
      if (sortColumn) {
        params.set('sortBy', sortColumn);
        params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
      }
    }

    return params;
  }, [debouncedQuery, sorting]);

  const fetchEmailTemplates = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = buildApiParams();
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

      const response = await fetch(`/api/email-templates?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 403) {
          throw new Error('Access denied');
        }
        throw new Error(t('tryAgain'));
      }

      const result: Page<EmailTemplate> = await response.json();
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
  }, [buildApiParams, pageIndex, pageSize, t]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!itemToDelete?.id) return;
    const response = await apiDelete(`/api/email-templates/${itemToDelete.id}`);
    if (response.ok) {
      toast.success(t('delete.success'));
      setItemToDelete(null);
      fetchEmailTemplates();
    } else {
      toast.error(t('delete.error'));
    }
  }, [itemToDelete, fetchEmailTemplates, t]);

  useEffect(() => {
    fetchEmailTemplates();
  }, [fetchEmailTemplates]);

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
    state: {
      sorting,
      columnVisibility,
    },
  });

  if (state.error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{state.error}</p>
          <button onClick={fetchEmailTemplates} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
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
                <Link href="/app/admin/email-templates/new">
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
        description={t('delete.description', { name: itemToDelete ? t(`codes.${itemToDelete.code}`) : '' })}
        confirmLabel={t('delete.confirm')}
        cancelLabel={t('delete.cancel')}
      />
    </>
  );
}
