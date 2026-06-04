'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import type { ChatConversationListItem } from '@/domain/chat.model';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
}

export const createColumns = (options: ColumnOptions): ColumnDef<ChatConversationListItem>[] => {
  const { t } = options;
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.title')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const conversation = row.original;
        const title = conversation.title.trim() || t('emptyTitle');
        return (
          <Link href={`/app/admin/chat-conversations/${conversation.id}`} className="font-medium hover:underline">
            {title}
          </Link>
        );
      },
      enableHiding: false,
    },
    {
      id: 'user',
      accessorFn: (row) => row.user?.name ?? '',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.user')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) return <span className="text-muted-foreground">{t('anonymousUser')}</span>;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-muted-foreground text-xs">{user.email}</span>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as Date | string | null;
        return <span className="text-muted-foreground text-sm">{date ? new Date(date).toLocaleDateString() : '—'}</span>;
      },
      enableHiding: true,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.updated')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const date = row.getValue('updatedAt') as Date | string | null;
        return <span className="text-muted-foreground text-sm">{date ? new Date(date).toLocaleDateString() : '—'}</span>;
      },
      enableHiding: true,
    },
  ];
};
