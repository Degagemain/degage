'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { Switch } from '@/app/components/ui/switch';
import { FeatureFlag } from '@/domain/feature-flag.model';
import { formatDateOrDash } from '@/domain/utils';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  onToggleEnabled?: (flag: FeatureFlag, enabled: boolean) => void;
  togglingId?: string | null;
  t: (key: string) => string;
}

export const createColumns = (options: ColumnOptions): ColumnDef<FeatureFlag>[] => {
  const { t, onToggleEnabled, togglingId } = options;
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.code')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('code')}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.description')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const description = row.getValue('description') as string;
        return <span className="text-muted-foreground text-sm">{description || '—'}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'enabled',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.enabled')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const flag = row.original;
        const enabled = row.getValue('enabled') as boolean;
        if (!onToggleEnabled || !flag.id) {
          return <span className="text-muted-foreground text-sm">{enabled ? t('enabled') : t('disabled')}</span>;
        }
        return (
          <Switch
            checked={enabled}
            disabled={togglingId === flag.id}
            onCheckedChange={(value) => onToggleEnabled(flag, value === true)}
            aria-label={t('columns.enabled')}
          />
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.updated')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDateOrDash(row.getValue('updatedAt'))}</span>,
      enableHiding: true,
    },
  ];
};
