'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { Check } from 'lucide-react';
import { Hub } from '@/domain/hub.model';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
}

function formatDate(value: Date | string | null): string {
  if (value == null) return '—';
  return new Date(value).toLocaleDateString();
}

export const createColumns = (options: ColumnOptions): ColumnDef<Hub>[] => {
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
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'isDefault',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.default')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const isDefault = row.getValue('isDefault') as boolean;
        return isDefault ? (
          <Check className="text-primary size-4" aria-label={t('default')} />
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'simMaxAge',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.simMaxAge')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-sm">{row.getValue('simMaxAge')}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'simMaxKm',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.simMaxKm')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const val = row.getValue('simMaxKm') as number;
        return <span className="font-mono text-sm">{val.toLocaleString()}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'simMinEuroNormGroupDiesel',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.simMinEuroNormGroupDiesel')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-sm">{row.getValue('simMinEuroNormGroupDiesel')}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'simMinEcoScoreForBonus',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.simMinEcoScoreForBonus')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-sm">{row.getValue('simMinEcoScoreForBonus')}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'simMaxKmForBonus',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.simMaxKmForBonus')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const val = row.getValue('simMaxKmForBonus') as number;
        return <span className="font-mono text-sm">{val.toLocaleString()}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'simMaxAgeForBonus',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.simMaxAgeForBonus')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-sm">{row.getValue('simMaxAgeForBonus')}</span>,
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
