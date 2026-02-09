'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/app/components/ui/badge';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { User } from '@/domain/user.model';
import { type UILocale, localeDisplayNames } from '@/i18n/locales';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
}

export const createColumns = (options: ColumnOptions): ColumnDef<User>[] => {
  const { t } = options;
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.name')} onSort={options.onSort} />,
      enableHiding: true,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.email')} onSort={options.onSort} />,
      enableHiding: true,
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.role')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const role = row.getValue('role') as string | null;
        if (!role) return <span className="text-muted-foreground">—</span>;
        return <Badge variant={role === 'admin' ? 'default' : 'secondary'}>{role === 'admin' ? t('roleAdmin') : t('roleUser')}</Badge>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'locale',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.language')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const locale = row.getValue('locale') as string | null;
        if (!locale) return <span className="text-muted-foreground">—</span>;
        return localeDisplayNames[locale as UILocale] ?? locale;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'emailVerified',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.verified')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const verified = row.getValue('emailVerified') as boolean;
        return <Badge variant={verified ? 'default' : 'outline'}>{verified ? t('yes') : t('no')}</Badge>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'banned',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const banned = row.getValue('banned') as boolean | null;
        return <Badge variant={banned ? 'destructive' : 'default'}>{banned ? t('statusBanned') : t('statusActive')}</Badge>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date | string;
        return new Date(date).toLocaleDateString();
      },
      enableHiding: true,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.updated')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const date = row.getValue('updatedAt') as Date | string;
        return new Date(date).toLocaleDateString();
      },
      enableHiding: true,
    },
  ];
};
