'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { InsurancePriceBenchmark } from '@/domain/insurance-price-benchmark.model';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
}

function formatDate(value: Date | string | null): string {
  if (value == null) return '—';
  return new Date(value).toLocaleDateString();
}

function formatPriceCap(value: number): string {
  if (value >= 999_999_999) return '∞';
  return value.toLocaleString();
}

export const createColumns = (options: ColumnOptions): ColumnDef<InsurancePriceBenchmark>[] => {
  const { t, onSort } = options;
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
      accessorKey: 'year',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.year')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('year')}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'maxCarPrice',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.maxCarPrice')} onSort={onSort} />,
      cell: ({ row }) => {
        const val = row.getValue('maxCarPrice') as number;
        return <span className="font-mono text-sm">{formatPriceCap(val)}</span>;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'baseRate',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.baseRate')} onSort={onSort} />,
      cell: ({ row }) => {
        const val = row.getValue('baseRate') as number;
        return <span className="font-mono text-sm">{val.toFixed(4)}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'rate',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.rate')} onSort={onSort} />,
      cell: ({ row }) => {
        const val = row.getValue('rate') as number;
        return <span className="font-mono text-sm">{val.toFixed(4)}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.getValue('createdAt'))}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.updated')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDate(row.getValue('updatedAt'))}</span>,
      enableHiding: true,
    },
  ];
};
