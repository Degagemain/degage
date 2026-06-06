'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import type { ChatConversationListItem } from '@/domain/chat.model';
import { CHAT_CONVERSATION_OWNER_TYPE_ANONYMOUS, ChatConversationAdminSortColumns } from '@/domain/chat-conversation-admin.filter';
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
    csvParamNames: ['userIds', 'ownerTypes'],
  });

  const userIds = csv.userIds;
  const ownerTypes = csv.ownerTypes;
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

  const handleOwnerTypeChange = useCallback(
    (values: string[]) => {
      setCsvParam('ownerTypes', values);
    },
    [setCsvParam],
  );

  const columns = useMemo(() => createColumns({ onSort: handleSort, t, anonymousLabel: t('anonymousUser') }), [handleSort, t]);

  const ownerTypeOptions: FacetedFilterOption[] = useMemo(
    () => [{ value: CHAT_CONVERSATION_OWNER_TYPE_ANONYMOUS, label: t('filters.anonymous') }],
    [t],
  );

  const fetchConversations = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (userIds.length > 0) params.set('userIds', userIds.join(','));
      if (ownerTypes.length > 0) params.set('ownerTypes', ownerTypes.join(','));
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
  }, [userIds, ownerTypes, pageIndex, pageSize, sorting]);

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
                title={t('filters.ownerType')}
                options={ownerTypeOptions}
                selectedValues={ownerTypes}
                onSelectedChange={handleOwnerTypeChange}
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
