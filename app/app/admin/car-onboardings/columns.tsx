'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import {
  CarOnboarding,
  CarOnboardingCarValueStatus,
  CarOnboardingInPreparationStatus,
  CarOnboardingInsurerStatus,
} from '@/domain/car-onboarding.model';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { cn } from '@/app/lib/utils';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  onDelete?: (item: CarOnboarding) => void;
  t: (key: string) => string;
}

const formatDescription = (item: CarOnboarding): string => {
  const brand = item.brand?.name;
  const town = item.town?.name;
  if (brand && town) return `${brand} · ${town}`;
  return brand ?? town ?? item.id ?? '—';
};

const formatDate = (value: Date | string | null | undefined): string => {
  if (value == null) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString();
};

const formatCurrency = (value: number | null | undefined): string => {
  if (value == null || value <= 0) return '—';
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(value);
};

const formatCurrencyPerKm = (value: number | null | undefined): string => {
  if (value == null || value <= 0) return '—';
  return `${new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(value)}/km`;
};

function ColoredStatusBadge({ label, className }: { label: string; className: string }) {
  return (
    <Badge variant="outline" className={cn('border-transparent font-normal', className)}>
      {label}
    </Badge>
  );
}

const preparationStatusClass: Record<CarOnboardingInPreparationStatus, string> = {
  [CarOnboardingInPreparationStatus.OPEN]: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  [CarOnboardingInPreparationStatus.READY]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  [CarOnboardingInPreparationStatus.LOCKED]: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
};

const carValueStatusClass: Record<CarOnboardingCarValueStatus, string> = {
  [CarOnboardingCarValueStatus.TODO]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  [CarOnboardingCarValueStatus.PROPOSAL]: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  [CarOnboardingCarValueStatus.COUNTER]: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
  [CarOnboardingCarValueStatus.RESOLVED]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
};

const insurerStatusClass: Record<CarOnboardingInsurerStatus, string> = {
  [CarOnboardingInsurerStatus.NOT_APPLICABLE]: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  [CarOnboardingInsurerStatus.TODO]: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  [CarOnboardingInsurerStatus.READY]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
};

export const createColumns = (options: ColumnOptions): ColumnDef<CarOnboarding>[] => {
  const { t } = options;

  const boolCell = (value: boolean) => <span className="text-sm">{value ? t('yes') : t('no')}</span>;

  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'description',
      accessorFn: (row) => formatDescription(row),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.description')} />,
      cell: ({ row }) => {
        const item = row.original;
        const label = formatDescription(item);
        if (!item.id) {
          return <span className="font-medium">{label}</span>;
        }
        return (
          <Link href={`/app/admin/car-onboardings/${item.id}`} className="font-medium hover:underline">
            {label}
          </Link>
        );
      },
      enableSorting: false,
    },
    {
      id: 'owner',
      accessorFn: (row) => row.owner?.name ?? '',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.owner')} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.owner?.name ?? '—'}</span>,
      enableSorting: false,
    },
    {
      id: 'ownerHasPlayConnector',
      accessorFn: (row) => row.owner?.hasPlayConnector ?? false,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.ownerHasPlayConnector')} />,
      cell: ({ row }) => boolCell(row.original.owner?.hasPlayConnector ?? false),
      enableSorting: false,
    },
    {
      id: 'street',
      accessorKey: 'street',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.street')} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.street?.trim() || '—'}</span>,
      enableSorting: false,
    },
    {
      id: 'town',
      accessorFn: (row) => row.town?.name ?? '',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.town')} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.town?.name ?? '—'}</span>,
      enableSorting: false,
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.phone')} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.phone?.trim() || '—'}</span>,
      enableSorting: false,
    },
    {
      id: 'brand',
      accessorFn: (row) => row.brand?.name ?? '',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.brand')} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.brand?.name ?? '—'}</span>,
      enableSorting: false,
    },
    {
      id: 'fuelType',
      accessorFn: (row) => row.fuelType?.name ?? '',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.fuelType')} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.fuelType?.name ?? '—'}</span>,
      enableSorting: false,
    },
    {
      id: 'carType',
      accessorFn: (row) => row.carType?.name ?? row.carTypeOther ?? '',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.carType')} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.carType?.name ?? row.original.carTypeOther ?? '—'}</span>
      ),
      enableSorting: false,
    },
    {
      id: 'carTypeOther',
      accessorKey: 'carTypeOther',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.carTypeOther')} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.carTypeOther?.trim() || '—'}</span>,
      enableSorting: false,
    },
    {
      id: 'mileage',
      accessorKey: 'mileage',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.mileage')} />,
      cell: ({ row }) => {
        const mileage = row.original.mileage;
        return <span className="font-mono text-sm">{mileage > 0 ? mileage.toLocaleString() : '—'}</span>;
      },
      enableSorting: false,
    },
    {
      id: 'seats',
      accessorKey: 'seats',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.seats')} />,
      cell: ({ row }) => {
        const seats = row.original.seats;
        return <span className="text-sm">{seats > 0 ? seats : '—'}</span>;
      },
      enableSorting: false,
    },
    {
      id: 'firstRegisteredAt',
      accessorKey: 'firstRegisteredAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.firstRegisteredAt')} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.original.firstRegisteredAt)}</span>,
      enableSorting: false,
    },
    {
      id: 'isPurchased',
      accessorKey: 'isPurchased',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.isPurchased')} />,
      cell: ({ row }) => boolCell(row.original.isPurchased),
      enableSorting: false,
    },
    {
      id: 'isNewCar',
      accessorKey: 'isNewCar',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.isNewCar')} />,
      cell: ({ row }) => boolCell(row.original.isNewCar),
      enableSorting: false,
    },
    {
      id: 'isVan',
      accessorKey: 'isVan',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.isVan')} />,
      cell: ({ row }) => boolCell(row.original.isVan),
      enableSorting: false,
    },
    {
      id: 'purchasePrice',
      accessorKey: 'purchasePrice',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.purchasePrice')} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.original.purchasePrice)}</span>,
      enableSorting: false,
    },
    {
      id: 'depreciationCostKm',
      accessorKey: 'depreciationCostKm',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.depreciationCostKm')} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrencyPerKm(row.original.depreciationCostKm)}</span>,
      enableSorting: false,
    },
    {
      id: 'carValue',
      accessorKey: 'carValue',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.carValue')} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.original.carValue)}</span>,
      enableSorting: false,
    },
    {
      id: 'carValueCounterProposal',
      accessorKey: 'carValueCounterProposal',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.carValueCounterProposal')} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.original.carValueCounterProposal)}</span>,
      enableSorting: false,
    },
    {
      id: 'carValueCounterProposalMessage',
      accessorKey: 'carValueCounterProposalMessage',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.carValueCounterProposalMessage')} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground line-clamp-2 max-w-[240px] text-sm">
          {row.original.carValueCounterProposalMessage?.trim() || '—'}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: 'carValueStatus',
      accessorKey: 'carValueStatus',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.carValueStatus')} />,
      cell: ({ row }) => {
        const status = row.original.carValueStatus;
        return <ColoredStatusBadge label={t(`subprocess.carValue.${status}`)} className={carValueStatusClass[status]} />;
      },
      enableSorting: false,
    },
    {
      id: 'insurer',
      accessorFn: (row) => row.insurer?.name ?? '',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.insurer')} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.insurer?.name ?? '—'}</span>,
      enableSorting: false,
    },
    {
      id: 'insurerContractStartedAt',
      accessorKey: 'insurerContractStartedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.insurerContractStartedAt')} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.original.insurerContractStartedAt)}</span>,
      enableSorting: false,
    },
    {
      id: 'insurerStatus',
      accessorKey: 'insurerStatus',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.insurerStatus')} />,
      cell: ({ row }) => {
        const status = row.original.insurerStatus;
        return <ColoredStatusBadge label={t(`subprocess.insurer.${status}`)} className={insurerStatusClass[status]} />;
      },
      enableSorting: false,
    },
    {
      id: 'simulation',
      accessorFn: (row) => row.simulation?.name ?? row.simulation?.id ?? '',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.simulation')} />,
      cell: ({ row }) => {
        const simulation = row.original.simulation;
        if (!simulation?.id) return <span className="text-muted-foreground">—</span>;
        return (
          <Link href={`/app/admin/simulations/${simulation.id}`} className="text-primary text-sm hover:underline">
            {simulation.name ?? simulation.id}
          </Link>
        );
      },
      enableSorting: false,
    },
    {
      id: 'statusInPreparation',
      accessorKey: 'statusInPreparation',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.statusInPreparation')} />,
      cell: ({ row }) => {
        const status = row.original.statusInPreparation;
        return <ColoredStatusBadge label={t(`preparationStatus.${status}`)} className={preparationStatusClass[status]} />;
      },
      enableSorting: false,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.original.createdAt)}</span>,
    },
    {
      id: 'updatedAt',
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.updated')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.original.updatedAt)}</span>,
    },
    {
      id: 'actions',
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs">
                <span className="sr-only">{t('actions.openMenu')}</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {item.id && (
                <DropdownMenuItem asChild>
                  <Link href={`/app/admin/car-onboardings/${item.id}`}>
                    <Pencil />
                    {t('actions.edit')}
                  </Link>
                </DropdownMenuItem>
              )}
              {item.id && (
                <DropdownMenuItem asChild>
                  <Link href={`/app/car-onboardings/${item.id}`}>
                    <ExternalLink />
                    {t('form.openPublicPage')}
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem variant="destructive" onClick={() => options.onDelete?.(item)}>
                <Trash2 />
                {t('actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
