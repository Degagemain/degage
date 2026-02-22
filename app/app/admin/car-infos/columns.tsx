'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { CarInfo } from '@/domain/car-info.model';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
}

function formatDate(value: Date | string | null): string {
  if (value == null) return '—';
  return new Date(value).toLocaleDateString();
}

export const createColumns = (options: ColumnOptions): ColumnDef<CarInfo>[] => {
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
      accessorKey: 'brand',
      accessorFn: (row) => row.carType?.brand?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.brand')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.carType?.brand?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'fuelType',
      accessorFn: (row) => row.carType?.fuelType?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.fuelType')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.carType?.fuelType?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'carType',
      accessorFn: (row) => row.carType?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.carType')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.carType?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'year',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.year')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('year')}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'cylinderCc',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.cylinderCc')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('cylinderCc')}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'co2Emission',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.co2Emission')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('co2Emission')}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'ecoscore',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.ecoscore')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('ecoscore')}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'euroNorm',
      accessorFn: (row) => row.euroNorm?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.euroNorm')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.euroNorm?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'consumption',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.consumption')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('consumption')}</span>,
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
