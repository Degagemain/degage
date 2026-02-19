'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { HubBenchmark } from '@/domain/hub-benchmark.model';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
}

function formatDate(value: Date | string | null): string {
  if (value == null) return '—';
  return new Date(value).toLocaleDateString();
}

export const createColumns = (options: ColumnOptions): ColumnDef<HubBenchmark>[] => {
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
      accessorKey: 'hub',
      accessorFn: (row) => row.hub?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.hub')} onSort={onSort} />,
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.hub?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'ownerKm',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.ownerKm')} onSort={onSort} />,
      cell: ({ row }) => {
        const val = row.getValue('ownerKm') as number;
        return <span className="font-mono text-sm">{val.toLocaleString()}</span>;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'sharedAvgKm',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.sharedAvgKm')} onSort={onSort} />,
      cell: ({ row }) => {
        const val = row.getValue('sharedAvgKm') as number;
        return <span className="font-mono text-sm">{val.toLocaleString()}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'sharedMinKm',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.sharedMinKm')} onSort={onSort} />,
      cell: ({ row }) => {
        const val = row.getValue('sharedMinKm') as number;
        return <span className="font-mono text-sm">{val.toLocaleString()}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'sharedMaxKm',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.sharedMaxKm')} onSort={onSort} />,
      cell: ({ row }) => {
        const val = row.getValue('sharedMaxKm') as number;
        return <span className="font-mono text-sm">{val.toLocaleString()}</span>;
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
