'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { EmailTemplate } from '@/domain/email-template.model';
import { formatDateOrDash } from '@/domain/utils';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  onDelete?: (item: EmailTemplate) => void;
  t: (key: string) => string;
}

export const createColumns = (options: ColumnOptions): ColumnDef<EmailTemplate>[] => {
  const { t } = options;
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.code')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const item = row.original;
        const code = row.getValue('code') as string;
        const label = t(`codes.${code}`);
        if (!item.id) {
          return <span className="font-medium">{label}</span>;
        }
        return (
          <Link href={`/app/admin/email-templates/${item.id}`} className="font-medium hover:underline">
            {label}
          </Link>
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: 'designId',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.design')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="font-mono text-sm">{row.getValue('designId')}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.created')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDateOrDash(row.getValue('createdAt'))}</span>,
      enableHiding: true,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.updated')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDateOrDash(row.getValue('updatedAt'))}</span>,
      enableHiding: true,
    },
    {
      id: 'actions',
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs">
                <span className="sr-only">{t('actions.openMenu')}</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {item.id && (
                <DropdownMenuItem asChild>
                  <Link href={`/app/admin/email-templates/${item.id}`}>
                    <Pencil />
                    {t('actions.edit')}
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem variant="destructive" onClick={() => options.onDelete?.(item)}>
                <Trash2 />
                {t('actions.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
