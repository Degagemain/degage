'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { CarTaxBaseRate } from '@/domain/car-tax-base-rate.model';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
}

function formatDate(value: Date | string | null): string {
  if (value == null) return '—';
  return new Date(value).toLocaleDateString();
}

function formatRate(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const createColumns = (options: ColumnOptions): ColumnDef<CarTaxBaseRate>[] => {
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
      accessorKey: 'maxCc',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.maxCc')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('maxCc')}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'fiscalPk',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.fiscalPk')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('fiscalPk')}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'start',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.start')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.getValue('start'))}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'end',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.end')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.getValue('end'))}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'rate',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.rate')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm tabular-nums">{formatRate(row.getValue('rate'))}</span>,
      enableHiding: true,
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
