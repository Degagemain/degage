'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { CarPriceEstimate } from '@/domain/car-price-estimate.model';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
}

function formatDate(value: Date | string | null): string {
  if (value == null) return '—';
  return new Date(value).toLocaleDateString();
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const createColumns = (options: ColumnOptions): ColumnDef<CarPriceEstimate>[] => {
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
      accessorKey: 'price',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.price')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.getValue('price') as number)}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'rangeMin',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.rangeMin')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.getValue('rangeMin') as number)}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'rangeMax',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.rangeMax')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.getValue('rangeMax') as number)}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'remarks',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.remarks')} onSort={onSort} />,
      cell: ({ row }) => {
        const value = row.getValue('remarks') as string | null;
        return <span className="text-muted-foreground text-sm">{value ?? '—'}</span>;
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
