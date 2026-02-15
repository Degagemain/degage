'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { Check } from 'lucide-react';
import { Town } from '@/domain/town.model';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
}

function formatDate(value: Date | string | null): string {
  if (value == null) return '—';
  return new Date(value).toLocaleDateString();
}

export const createColumns = (options: ColumnOptions): ColumnDef<Town>[] => {
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
      accessorKey: 'zip',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.zip')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('zip')}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'municipality',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.municipality')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.getValue('municipality')}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'province',
      accessorFn: (row) => row.province?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.province')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.province?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'simulationRegion',
      accessorFn: (row) => row.simulationRegion?.name ?? '—',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.simulationRegion')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.simulationRegion?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'highDemand',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.highDemand')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const highDemand = row.getValue('highDemand') as boolean;
        return highDemand ? (
          <Check className="text-primary size-4" aria-label={t('highDemand')} />
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'hasActiveMembers',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.hasActiveMembers')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const hasActiveMembers = row.getValue('hasActiveMembers') as boolean;
        return hasActiveMembers ? (
          <Check className="text-primary size-4" aria-label={t('hasActiveMembers')} />
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
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
