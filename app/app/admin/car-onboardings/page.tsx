'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { RowSelectionState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { CarOnboarding } from '@/domain/car-onboarding.model';
import { Page } from '@/domain/page.model';
import { useAdminListUrlSync } from '@/app/admin/admin-list-url-sync';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { AdminTablePage, DataTable, DataTablePagination, DataTableToolbar } from '@/app/components/ui/data-table';
import { DeleteConfirmationDialog } from '@/app/components/delete-confirmation-dialog';
import { BulkActionsButton } from '@/app/components/bulk-actions-button';
import { BulkDeleteDialog, type BulkDeleteItem } from '@/app/components/bulk-delete-dialog';
import { apiDelete, apiPost } from '@/app/lib/api-client';
import { parseApiErrorMessage } from '@/app/lib/parse-api-error-message';
import { createColumns } from './columns';

const DEFAULT_PAGE_SIZE = 20;

type CreateCarOnboardingType = 'existing' | 'purchased' | 'purchasedNew';

const CREATE_CAR_ONBOARDING_PAYLOAD: Record<CreateCarOnboardingType, { isPurchased: boolean; isNewCar: boolean }> = {
  existing: { isPurchased: false, isNewCar: false },
  purchased: { isPurchased: true, isNewCar: false },
  purchasedNew: { isPurchased: true, isNewCar: true },
};

interface CarOnboardingsState {
  data: CarOnboarding[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const SORT_COLUMN_MAP: Record<string, string> = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

export default function CarOnboardingsPage() {
  const t = useTranslations('admin.carOnboardings');
  const tCommon = useTranslations('admin.common');
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [state, setState] = useState<CarOnboardingsState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const { queryInput, setQueryInput, debouncedQuery, pageIndex, pageSize, sorting, setPageIndex, setPageSize, setSort } = useAdminListUrlSync({
    defaultPageSize: DEFAULT_PAGE_SIZE,
    defaultSort: { id: 'createdAt', desc: true },
    validSortIds: Object.keys(SORT_COLUMN_MAP),
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    updatedAt: false,
    street: false,
    town: false,
    phone: false,
    brand: false,
    fuelType: false,
    carType: false,
    carTypeOther: false,
    mileage: false,
    seats: false,
    firstRegisteredAt: false,
    isPurchased: false,
    isNewCar: false,
    isVan: false,
    purchasePrice: false,
    depreciationCostKm: false,
    carValue: false,
    carValueCounterProposal: false,
    carValueCounterProposalMessage: false,
    insurer: false,
    insurerContractStartedAt: false,
    simulation: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [itemToDelete, setItemToDelete] = useState<CarOnboarding | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const handleSort = useCallback(
    (columnId: string, desc: boolean) => {
      setSort(columnId, desc);
    },
    [setSort],
  );

  const handleDeleteRequest = useCallback((item: CarOnboarding) => {
    setItemToDelete(item);
  }, []);

  const columns = useMemo(() => createColumns({ onSort: handleSort, onDelete: handleDeleteRequest, t }), [handleSort, handleDeleteRequest, t]);

  const columnLabels = useMemo(
    () => ({
      description: t('columns.description'),
      owner: t('columns.owner'),
      ownerHasPlayConnector: t('columns.ownerHasPlayConnector'),
      infoSessionStatus: t('columns.infoSessionStatus'),
      street: t('columns.street'),
      town: t('columns.town'),
      phone: t('columns.phone'),
      brand: t('columns.brand'),
      fuelType: t('columns.fuelType'),
      carType: t('columns.carType'),
      carTypeOther: t('columns.carTypeOther'),
      mileage: t('columns.mileage'),
      seats: t('columns.seats'),
      firstRegisteredAt: t('columns.firstRegisteredAt'),
      isPurchased: t('columns.isPurchased'),
      isNewCar: t('columns.isNewCar'),
      isVan: t('columns.isVan'),
      purchasePrice: t('columns.purchasePrice'),
      depreciationCostKm: t('columns.depreciationCostKm'),
      carValue: t('columns.carValue'),
      carValueCounterProposal: t('columns.carValueCounterProposal'),
      carValueCounterProposalMessage: t('columns.carValueCounterProposalMessage'),
      carValueStatus: t('columns.carValueStatus'),
      insurer: t('columns.insurer'),
      insurerContractStartedAt: t('columns.insurerContractStartedAt'),
      insurerStatus: t('columns.insurerStatus'),
      simulation: t('columns.simulation'),
      statusInPreparation: t('columns.statusInPreparation'),
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

  const fetchCarOnboardings = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = buildApiParams();
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));

      const response = await fetch(`/api/car-onboardings?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication required');
        if (response.status === 403) throw new Error('Access denied');
        throw new Error('Failed to fetch car onboardings');
      }

      const result: Page<CarOnboarding> = await response.json();
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
    const response = await apiDelete(`/api/car-onboardings/${itemToDelete.id}`);
    if (response.ok) {
      toast.success(t('delete.success'));
      setItemToDelete(null);
      fetchCarOnboardings();
    } else if (response.status === 409) {
      toast.error(t('delete.conflict'));
    } else {
      toast.error(t('delete.error'));
    }
  }, [itemToDelete, fetchCarOnboardings, t]);

  const handleCreate = useCallback(
    async (type: CreateCarOnboardingType) => {
      setIsCreating(true);
      try {
        const response = await apiPost('/api/car-onboardings', CREATE_CAR_ONBOARDING_PAYLOAD[type]);

        if (!response.ok) {
          const message = await parseApiErrorMessage(response, tCommon('feedback.saveError'));
          toast.error(message);
          return;
        }

        const created: CarOnboarding = await response.json();
        if (created.id) {
          router.push(`/app/admin/car-onboardings/${created.id}`);
          return;
        }

        toast.error(tCommon('feedback.saveError'));
      } catch {
        toast.error(tCommon('feedback.saveError'));
      } finally {
        setIsCreating(false);
      }
    },
    [router, tCommon],
  );

  const selectedItems: BulkDeleteItem[] = useMemo(
    () =>
      Object.keys(rowSelection)
        .map((index) => state.data[parseInt(index)])
        .filter(Boolean)
        .map((item) => ({
          id: item.id!,
          label: [item.brand?.name, item.town?.name].filter(Boolean).join(' · ') || item.id!,
        })),
    [rowSelection, state.data],
  );

  const handleBulkDeleteItem = useCallback((id: string) => apiDelete(`/api/car-onboardings/${id}`), []);

  const handleBulkDeleteComplete = useCallback(() => {
    setRowSelection({});
    fetchCarOnboardings();
  }, [fetchCarOnboardings]);

  useEffect(() => {
    fetchCarOnboardings();
  }, [fetchCarOnboardings]);

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
          <button type="button" onClick={fetchCarOnboardings} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isCreating}>
                    {isCreating ? tCommon('status.saving') : tCommon('actions.new')}
                    <ChevronDown className="ml-1 size-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => void handleCreate('existing')}>{t('createTypes.existingCar')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void handleCreate('purchased')}>{t('createTypes.purchasedCar')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void handleCreate('purchasedNew')}>{t('createTypes.purchasedNewCar')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
            filterSlot={
              <BulkActionsButton count={selectedItems.length} label={t('bulkActions.label')}>
                <DropdownMenuItem variant="destructive" onClick={() => setBulkDeleteOpen(true)}>
                  <Trash2 />
                  {t('bulkActions.delete')}
                </DropdownMenuItem>
              </BulkActionsButton>
            }
            columnLabels={columnLabels}
          />
        }
        tableArea={
          state.isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
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
        description={t('delete.description', {
          name: itemToDelete ? [itemToDelete.brand?.name, itemToDelete.town?.name].filter(Boolean).join(' · ') || itemToDelete.id || '' : '',
        })}
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
