'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { User } from '@/domain/user.model';
import { type UILocale, localeDisplayNames } from '@/i18n/locales';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const createColumns = (options: ColumnOptions): ColumnDef<User>[] => {
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
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              {user.image && <AvatarImage src={user.image} alt={user.name ?? ''} />}
              <AvatarFallback className="text-[10px]">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{user.name ?? <span className="text-muted-foreground">—</span>}</span>
          </div>
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.email')} onSort={options.onSort} />,
      cell: ({ row }) => {
        return <span className="text-muted-foreground">{row.getValue('email')}</span>;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.role')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const role = row.getValue('role') as string | null;
        if (!role) return <span className="text-muted-foreground">—</span>;
        return (
          <Badge variant={role === 'admin' ? 'default' : 'outline'} className="font-normal">
            {role === 'admin' ? t('roleAdmin') : t('roleUser')}
          </Badge>
        );
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
        return <span className="text-sm">{localeDisplayNames[locale as UILocale] ?? locale}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'emailVerified',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.verified')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const verified = row.getValue('emailVerified') as boolean;
        return (
          <Badge variant={verified ? 'default' : 'outline'} className="font-normal">
            {verified ? t('yes') : t('no')}
          </Badge>
        );
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'banned',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const banned = row.getValue('banned') as boolean | null;
        if (banned) {
          return (
            <Badge variant="destructive" className="font-normal">
              {t('statusBanned')}
            </Badge>
          );
        }
        return <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{t('statusActive')}</span>;
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
