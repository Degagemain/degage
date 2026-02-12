'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { Check } from 'lucide-react';
import { CarType } from '@/domain/car-type.model';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
}

export const createColumns = (options: ColumnOptions): ColumnDef<CarType>[] => {
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
      accessorKey: 'brand',
      accessorFn: (row) => row.brand?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.brand')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.brand?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'fuelType',
      accessorFn: (row) => row.fuelType?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.fuelType')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.fuelType?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'ecoscore',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.ecoscore')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('ecoscore')}</span>,
      enableHiding: true,
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
