'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import type { ChatConversationListItem } from '@/domain/chat.model';
import { ChatConversationAdminSortColumns } from '@/domain/chat-conversation-admin.filter';
import type { Page } from '@/domain/page.model';
import { useAdminListUrlSync } from '@/app/admin/admin-list-url-sync';
import { Skeleton } from '@/app/components/ui/skeleton';
import {
  AdminTablePage,
  DataTable,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableSearchableMultiselect,
  DataTableToolbar,
  type FacetedFilterOption,
  type SearchableOption,
} from '@/app/components/ui/data-table';
import { type ChatConversationMedium, chatConversationMediumValues } from '@/domain/chat.model';
import { createColumns } from './columns';

const DEFAULT_PAGE_SIZE = 20;

const SORT_COLUMN_MAP: Record<string, string> = {
  title: ChatConversationAdminSortColumns.TITLE,
  updatedAt: ChatConversationAdminSortColumns.UPDATED_AT,
};

interface ListState {
  data: ChatConversationListItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

export default function ChatConversationsPage() {
  const t = useTranslations('admin.chatConversations');
  const [state, setState] = useState<ListState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const { pageIndex, pageSize, sorting, csv, setPageIndex, setPageSize, setSort, setCsvParam } = useAdminListUrlSync({
    defaultPageSize: DEFAULT_PAGE_SIZE,
    defaultSort: { id: 'updatedAt', desc: true },
    validSortIds: Object.keys(SORT_COLUMN_MAP),
    csvParamNames: ['userIds', 'mediums'],
  });

  const userIds = csv.userIds;
  const mediums = csv.mediums;
  const [userOptions, setUserOptions] = useState<SearchableOption[]>([]);

  const handleSort = useCallback(
    (columnId: string, desc: boolean) => {
      setSort(columnId, desc);
    },
    [setSort],
  );

  const handleUserChange = useCallback(
    (values: string[], options: SearchableOption[]) => {
      setCsvParam('userIds', values);
      setUserOptions(options);
    },
    [setCsvParam],
  );

  const handleMediumChange = useCallback(
    (values: string[]) => {
      setCsvParam('mediums', values);
    },
    [setCsvParam],
  );

  const mediumLabel = useCallback(
    (medium: ChatConversationMedium) => t(`mediums.${medium}`),
    [t],
  );

  const mediumOptions: FacetedFilterOption[] = useMemo(
    () => chatConversationMediumValues.map((value) => ({ value, label: t(`mediums.${value}`) })),
    [t],
  );

  const columns = useMemo(
    () => createColumns({ onSort: handleSort, t, anonymousLabel: t('anonymousUser'), mediumLabel }),
    [handleSort, t, mediumLabel],
  );

  const fetchConversations = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (userIds.length > 0) params.set('userIds', userIds.join(','));
      if (mediums.length > 0) params.set('mediums', mediums.join(','));
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

      if (sorting.length > 0) {
        const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
        if (sortColumn) {
          params.set('sortBy', sortColumn);
          params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
        }
      }

      const response = await fetch(`/api/admin/chat-conversations?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication required');
        if (response.status === 403) throw new Error('Access denied');
        throw new Error('Failed to fetch conversations');
      }

      const result: Page<ChatConversationListItem> = await response.json();
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
  }, [userIds, mediums, pageIndex, pageSize, sorting]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const pageCount = Math.ceil(state.total / pageSize);

  const table = useReactTable({
    data: state.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: () => {},
    manualPagination: true,
    manualSorting: true,
    pageCount,
    state: { sorting },
  });

  if (state.error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{state.error}</p>
          <button onClick={fetchConversations} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminTablePage
      toolbar={
        <DataTableToolbar
          table={table}
          searchValue=""
          onSearchChange={() => {}}
          showSearch={false}
          filterSlot={
            <>
              <DataTableSearchableMultiselect
                title={t('filters.user')}
                apiPath="users"
                selectedValues={userIds}
                selectedOptions={userOptions}
                onSelectedChange={handleUserChange}
                placeholder={t('filters.userPlaceholder')}
              />
              <DataTableFacetedFilter
                title={t('filters.medium')}
                options={mediumOptions}
                selectedValues={mediums}
                onSelectedChange={handleMediumChange}
              />
            </>
          }
        />
      }
      tableArea={
        state.isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-28" />
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
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
        />
      }
    />
  );
}
