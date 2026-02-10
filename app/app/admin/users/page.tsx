'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { RowSelectionState, SortingState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { Ban, Shield, UserCheck, UserIcon } from 'lucide-react';

import { User } from '@/domain/user.model';
import { Page } from '@/domain/page.model';
import { Role } from '@/domain/role.model';
import { ALL_USER_ROLES, ALL_USER_STATUSES, UserStatus } from '@/domain/user.filter';
import { useIsMobile } from '@/app/hooks/use-mobile';
import { Skeleton } from '@/app/components/ui/skeleton';
import { DataTable, DataTableFacetedFilter, DataTablePagination, DataTableToolbar, FacetedFilterOption } from '@/app/components/ui/data-table';
import { createColumns } from './columns';

const DEFAULT_PAGE_SIZE = 10;

interface UsersState {
  data: User[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

// Map column IDs to backend sort columns
const SORT_COLUMN_MAP: Record<string, string> = {
  name: 'name',
  email: 'email',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export default function UsersPage() {
  const t = useTranslations('admin.users');
  const isMobile = useIsMobile();
  const [state, setState] = useState<UsersState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updatedAt', desc: true }]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    updatedAt: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Adjust default column visibility based on screen size
  useEffect(() => {
    if (isMobile) {
      setColumnVisibility((prev) => ({
        ...prev,
        locale: false,
        emailVerified: false,
        createdAt: false,
        updatedAt: false,
      }));
    }
  }, [isMobile]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPageIndex(0); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset to first page when filters change
  const handleStatusChange = (values: string[]) => {
    setStatuses(values);
    setPageIndex(0);
  };

  const handleRoleChange = (values: string[]) => {
    setRoles(values);
    setPageIndex(0);
  };

  // Handle server-side sort
  const handleSort = useCallback((columnId: string, desc: boolean) => {
    setSorting([{ id: columnId, desc }]);
    setPageIndex(0); // Reset to first page on sort change
  }, []);

  // Create columns with sort handler and translations
  const columns = useMemo(() => createColumns({ onSort: handleSort, t }), [handleSort, t]);

  const statusOptions: FacetedFilterOption[] = useMemo(
    () =>
      ALL_USER_STATUSES.map((status) => ({
        value: status,
        label: status === UserStatus.ACTIVE ? t('statusActive') : t('statusBanned'),
        icon: status === UserStatus.ACTIVE ? UserCheck : Ban,
      })),
    [t],
  );

  const roleOptions: FacetedFilterOption[] = useMemo(
    () =>
      ALL_USER_ROLES.map((role) => ({
        value: role,
        label: role === Role.ADMIN ? t('roleAdmin') : t('roleUser'),
        icon: role === Role.ADMIN ? Shield : UserIcon,
      })),
    [t],
  );

  const columnLabels = useMemo(
    () => ({
      name: t('columns.name'),
      email: t('columns.email'),
      role: t('columns.role'),
      locale: t('columns.language'),
      emailVerified: t('columns.verified'),
      banned: t('columns.status'),
      createdAt: t('columns.created'),
      updatedAt: t('columns.updated'),
    }),
    [t],
  );

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('query', debouncedQuery);
      if (statuses.length > 0) params.set('statuses', statuses.join(','));
      if (roles.length > 0) params.set('roles', roles.join(','));
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

      // Add sorting params
      if (sorting.length > 0) {
        const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
        if (sortColumn) {
          params.set('sortBy', sortColumn);
          params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
        }
      }

      const response = await fetch(`/api/users?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required');
        }
        if (response.status === 403) {
          throw new Error('Access denied');
        }
        throw new Error('Failed to fetch users');
      }

      const result: Page<User> = await response.json();
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
  }, [debouncedQuery, statuses, roles, pageIndex, pageSize, sorting]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const handlePageChange = (page: number) => {
    setPageIndex(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(0);
  };

  if (state.error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{state.error}</p>
          <button onClick={fetchUsers} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const filterSlot = (
    <>
      <DataTableFacetedFilter
        title={t('filters.status')}
        options={statusOptions}
        selectedValues={statuses}
        onSelectedChange={handleStatusChange}
      />
      <DataTableFacetedFilter title={t('filters.role')} options={roleOptions} selectedValues={roles} onSelectedChange={handleRoleChange} />
    </>
  );

  return (
    <div className="flex flex-col gap-3 pt-2 pb-3 md:pt-3 md:pb-4">
      <div className="px-3 md:px-4">
        <DataTableToolbar
          table={table}
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder={t('searchPlaceholder')}
          filterSlot={filterSlot}
          columnLabels={columnLabels}
        />
      </div>

      {state.isLoading ? (
        <div className="border-y">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-5 w-14 rounded-full" />
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
    </div>
  );
}
