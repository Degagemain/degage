'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Simulation } from '@/domain/simulation.model';
import { formatDateOrDash } from '@/domain/utils';
import { useTranslations } from 'next-intl';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  onDelete?: (item: Simulation) => void;
  t: (key: string) => string;
  tShared: (key: string) => string;
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(value);
}

function formatCurrencyPerKm(value: number | null | undefined): string {
  if (value == null) return '—';
  return `${new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(value)}/km`;
}

export const createColumns = (options: ColumnOptions): ColumnDef<Simulation>[] => {
  const { t, tShared, onSort } = options;
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
      accessorFn: (row) => {
        const parts = [
          row.town?.name,
          row.brand?.name,
          row.fuelType?.name,
          row.carType?.name ?? (row.carTypeOther ? row.carTypeOther : undefined),
        ].filter(Boolean);
        return parts.join(' · ') || '—';
      },
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.description')} onSort={onSort} />,
      cell: ({ row }) => {
        const parts = [
          row.original.town?.name,
          row.original.brand?.name,
          row.original.fuelType?.name,
          row.original.carType?.name ?? (row.original.carTypeOther ? row.original.carTypeOther : undefined),
        ].filter(Boolean);
        const label = parts.join(' · ') || '—';
        const id = row.original.id;
        if (id) {
          return (
            <Link href={`/app/admin/simulations/${id}`} className="text-primary text-sm hover:underline focus-visible:underline">
              {label}
            </Link>
          );
        }
        return <span className="text-sm">{label}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'town',
      accessorFn: (row) => row.town?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.town')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.town?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultCode',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultCode')} onSort={onSort} />,
      cell: ({ row }) => {
        const code = row.getValue('resultCode') as string;
        const id = row.original.id;
        if (id) {
          return (
            <Link href={`/app/admin/simulations/${id}`} className="text-primary hover:underline focus-visible:underline">
              <ResultCodeCell code={code} />
            </Link>
          );
        }
        return <ResultCodeCell code={code} />;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'brand',
      accessorFn: (row) => row.brand?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.brand')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.brand?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'fuelType',
      accessorFn: (row) => row.fuelType?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.fuelType')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.fuelType?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'carType',
      accessorFn: (row) => row.carType?.name ?? (row.carTypeOther ? `Other: ${row.carTypeOther}` : '—'),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.carType')} onSort={onSort} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.carType?.name ?? (row.original.carTypeOther ? `Other: ${row.original.carTypeOther}` : '—')}
        </span>
      ),
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'mileage',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.mileage')} onSort={onSort} />,
      cell: ({ row }) => {
        const mileage = row.getValue('mileage') as number;
        return <span className="font-mono text-sm">{mileage.toLocaleString()}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'ownerKmPerYear',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.ownerKmPerYear')} onSort={onSort} />,
      cell: ({ row }) => {
        const v = row.original.ownerKmPerYear;
        return <span className="font-mono text-sm">{v != null ? v.toLocaleString() : '—'}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'seats',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.seats')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-sm">{row.getValue('seats')}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'firstRegisteredAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.firstRegisteredAt')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDateOrDash(row.getValue('firstRegisteredAt'))}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'purchasePrice',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.purchasePrice')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.original.purchasePrice)}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'isPurchased',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.isPurchased')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-sm">{row.original.isPurchased ? tShared('yes') : tShared('no')}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'isNewCar',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.isNewCar')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-sm">{row.original.isNewCar ? t('yes') : t('no')}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'isVan',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.isVan')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-sm">{row.original.isVan ? tShared('yes') : tShared('no')}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultEstimatedCarValue',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultEstimatedCarValue')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.original.resultEstimatedCarValue)}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultDepreciationCostKm',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultDepreciationCostKm')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrencyPerKm(row.original.resultDepreciationCostKm)}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultInsuranceCostPerYear',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultInsuranceCostPerYear')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.original.resultInsuranceCostPerYear)}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultTaxCostPerYear',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultTaxCostPerYear')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.original.resultTaxCostPerYear)}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultInspectionCostPerYear',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultInspectionCostPerYear')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.original.resultInspectionCostPerYear)}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultMaintenanceCostPerYear',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultMaintenanceCostPerYear')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.original.resultMaintenanceCostPerYear)}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultRoundedKmCost',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultRoundedKmCost')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrencyPerKm(row.original.resultRoundedKmCost)}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultMinSharedKm',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultMinSharedKm')} onSort={onSort} />,
      cell: ({ row }) => {
        const v = row.original.resultMinSharedKm;
        return <span className="font-mono text-sm">{v != null ? v.toLocaleString() : '—'}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultAvgSharedKm',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultAvgSharedKm')} onSort={onSort} />,
      cell: ({ row }) => {
        const v = row.original.resultAvgSharedKm;
        return <span className="font-mono text-sm">{v != null ? v.toLocaleString() : '—'}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultMaxSharedKm',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultMaxSharedKm')} onSort={onSort} />,
      cell: ({ row }) => {
        const v = row.original.resultMaxSharedKm;
        return <span className="font-mono text-sm">{v != null ? v.toLocaleString() : '—'}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultEuroNorm',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultEuroNorm')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.resultEuroNorm ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultEcoScore',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultEcoScore')} onSort={onSort} />,
      cell: ({ row }) => {
        const v = row.original.resultEcoScore;
        return <span className="font-mono text-sm">{v != null ? v : '—'}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultConsumption',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultConsumption')} onSort={onSort} />,
      cell: ({ row }) => {
        const v = row.original.resultConsumption;
        return <span className="font-mono text-sm">{v != null ? v.toFixed(2) : '—'}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultCc',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultCc')} onSort={onSort} />,
      cell: ({ row }) => {
        const v = row.original.resultCc;
        return <span className="font-mono text-sm">{v != null ? v.toLocaleString() : '—'}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'resultCo2',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultCo2')} onSort={onSort} />,
      cell: ({ row }) => {
        const v = row.original.resultCo2;
        return <span className="font-mono text-sm">{v != null ? v : '—'}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'rejectionReason',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.rejectionReason')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.rejectionReason ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'carTypeOther',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.carTypeOther')} onSort={onSort} />,
      cell: ({ row }) => {
        const value = row.getValue('carTypeOther') as string | null;
        return <span className="text-muted-foreground text-sm">{value ?? '—'}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'duration',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.duration')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('duration')}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.email')} onSort={onSort} />,
      cell: ({ row }) => {
        const v = row.original.email;
        return <span className="text-muted-foreground text-sm">{v ?? '—'}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDateOrDash(row.getValue('createdAt'))}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.updated')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDateOrDash(row.original.updatedAt)}</span>,
      enableHiding: true,
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
            <DropdownMenuContent align="end" className="w-40">
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

function ResultCodeCell({ code }: { code: string }) {
  const t = useTranslations('simulation.resultCode');
  return <span className="text-sm">{t(code)}</span>;
}
