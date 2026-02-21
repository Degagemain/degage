'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { CarTaxEuroNormAdjustment } from '@/domain/car-tax-euro-norm-adjustment.model';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
}

function formatDate(value: Date | string | null): string {
  if (value == null) return '—';
  return new Date(value).toLocaleDateString();
}

function formatDecimal(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const createColumns = (options: ColumnOptions): ColumnDef<CarTaxEuroNormAdjustment>[] => {
  const { t } = options;
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
      accessorKey: 'fiscalRegion',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.fiscalRegion')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-medium">{row.original.fiscalRegion?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'euroNormGroup',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.euroNormGroup')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('euroNormGroup')}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'defaultAdjustment',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.defaultAdjustment')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm tabular-nums">{formatDecimal(row.getValue('defaultAdjustment'))}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'dieselAdjustment',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.dieselAdjustment')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm tabular-nums">{formatDecimal(row.getValue('dieselAdjustment'))}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.getValue('createdAt'))}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.updated')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.getValue('updatedAt'))}</span>,
      enableHiding: true,
    },
  ];
};
