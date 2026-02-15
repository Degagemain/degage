'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/app/components/ui/button';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { Pencil } from 'lucide-react';
import { SystemParameter, SystemParameterType } from '@/domain/system-parameter.model';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  onEdit?: (param: SystemParameter) => void;
  t: (key: string) => string;
}

function formatDate(value: Date | string | null): string {
  if (value == null) return '—';
  return new Date(value).toLocaleDateString();
}

function formatValue(param: SystemParameter): string {
  switch (param.type) {
    case SystemParameterType.NUMBER:
      return param.valueNumber != null ? String(param.valueNumber) : '—';
    case SystemParameterType.NUMBER_RANGE:
      if (param.valueNumberMin != null && param.valueNumberMax != null) {
        return `${param.valueNumberMin} – ${param.valueNumberMax}`;
      }
      return '—';
    case SystemParameterType.EURONORM:
      return param.valueEuronormId ?? '—';
    default:
      return '—';
  }
}

export const createColumns = (options: ColumnOptions): ColumnDef<SystemParameter>[] => {
  const { t, onEdit } = options;
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.code')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('code')}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'category',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.category')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const category = row.getValue('category') as string;
        return <span className="text-muted-foreground text-sm">{t(`categories.${category}`)}</span>;
      },
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
      accessorKey: 'type',
      header: () => t('columns.type'),
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return <span className="text-muted-foreground text-sm">{t(`types.${type}`)}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      id: 'value',
      header: () => t('columns.value'),
      cell: ({ row }) => <span className="text-muted-foreground font-mono text-sm">{formatValue(row.original)}</span>,
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
    ...(onEdit
      ? [
          {
            id: 'actions',
            header: () => null,
            cell: ({ row }: { row: { original: SystemParameter } }) => (
              <Button variant="ghost" size="icon" className="size-8" onClick={() => onEdit(row.original)} aria-label={t('editTitle')}>
                <Pencil className="size-4" />
              </Button>
            ),
            enableHiding: false,
            enableSorting: false,
          } as ColumnDef<SystemParameter>,
        ]
      : []),
  ];
};
