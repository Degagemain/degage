'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { Check } from 'lucide-react';
import { FuelType } from '@/domain/fuel-type.model';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
}

export const createColumns = (options: ColumnOptions): ColumnDef<FuelType>[] => {
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
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.code')} onSort={options.onSort} />,
      cell: ({ row }) => {
        return <span className="font-mono text-sm">{row.getValue('code')}</span>;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} onSort={options.onSort} />,
      cell: ({ row }) => {
        return <span className="font-medium">{row.getValue('name')}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.active')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return isActive ? <Check className="text-primary size-4" aria-label={t('active')} /> : <span className="text-muted-foreground">—</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'pricePer',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.pricePer')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const val = row.getValue('pricePer') as number;
        return (
          <span className="font-mono text-sm tabular-nums">
            {val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </span>
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: 'co2Contribution',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.co2Contribution')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const val = row.getValue('co2Contribution') as number;
        return <span className="font-mono text-sm tabular-nums">{val}</span>;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date | string;
        return <span className="text-muted-foreground text-sm">{new Date(date).toLocaleDateString()}</span>;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.updated')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const date = row.getValue('updatedAt') as Date | string;
        return <span className="text-muted-foreground text-sm">{new Date(date).toLocaleDateString()}</span>;
      },
      enableHiding: true,
    },
  ];
};
