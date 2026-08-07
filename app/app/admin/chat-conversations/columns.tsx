'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import type { ChatConversationListItem } from '@/domain/chat.model';
import { DashPlaceholder, formatDateOrDash } from '@/domain/utils';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  t: (key: string) => string;
  anonymousLabel: string;
  mediumLabel: (medium: ChatConversationListItem['medium']) => string;
}

export const createColumns = ({ onSort, t, anonymousLabel, mediumLabel }: ColumnOptions): ColumnDef<ChatConversationListItem>[] => [
  {
    accessorKey: 'medium',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.medium')} onSort={onSort} />,
    cell: ({ row }) => <span className="text-sm">{mediumLabel(row.original.medium)}</span>,
    enableSorting: false,
  },
  {
    accessorKey: 'user',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.user')} onSort={onSort} />,
    cell: ({ row }) => {
      const user = row.original.user;
      return <span className="text-sm">{user?.name?.trim() || anonymousLabel}</span>;
    },
    enableSorting: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.title')} onSort={onSort} />,
    cell: ({ row }) => {
      const title = row.original.title.trim();
      const label = title.length > 0 ? title : DashPlaceholder;
      return (
        <Link href={`/app/admin/chat-conversations/${row.original.id}`} className="font-medium hover:underline">
          {label}
        </Link>
      );
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.updatedAt')} onSort={onSort} />,
    cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDateOrDash(row.original.updatedAt, true)}</span>,
  },
];
