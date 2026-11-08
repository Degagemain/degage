'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { ContractType } from '@/domain/contract-type.model';
import { formatDateOrDash } from '@/domain/utils';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  onDelete?: (item: ContractType) => void;
  t: (key: string) => string;
}

export const createColumns = (options: ColumnOptions): ColumnDef<ContractType>[] => {
  const { t } = options;
  return [
    {
      accessorKey: 'code',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.code')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const item = row.original;
        const code = row.getValue('code') as string;
        if (!item.id) {
          return <span className="font-medium">{code}</span>;
        }
        return (
          <Link href={`/app/admin/contract-types/${item.id}`} className="font-medium hover:underline">
            {code}
          </Link>
        );
      },
      enableHiding: true,
    },
    {
      id: 'defaultSignee',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.defaultSignee')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.defaultSignee?.name ?? '—'}</span>,
      enableHiding: true,
      enableSorting: false,
    },
    {
      id: 'template',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.template')} onSort={options.onSort} />,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original.documensoTemplateEnvelopeId ? t('template.ready') : t('template.missing')}
        </span>
      ),
      enableHiding: true,
      enableSorting: false,
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
                  <Link href={`/app/admin/contract-types/${item.id}`}>
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
