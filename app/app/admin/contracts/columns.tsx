'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { FileText, MoreHorizontal, Pencil, Send, Trash2 } from 'lucide-react';
import type { Contract } from '@/domain/contract.model';
import { ContractStatus } from '@/domain/contract.model';
import { formatDateOrDash } from '@/domain/utils';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  onDelete?: (item: Contract) => void;
  onSend?: (item: Contract) => void;
  onOpenDocument?: (item: Contract) => void;
  t: (key: string) => string;
}

export const createColumns = (options: ColumnOptions): ColumnDef<Contract>[] => {
  const { t } = options;
  return [
    {
      id: 'user',
      accessorFn: (row) => row.user.name ?? row.user.id,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.user')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const item = row.original;
        const label = item.user.name ?? item.user.id;
        if (!item.id) return <span className="font-medium">{label}</span>;
        return (
          <Link href={`/app/admin/contracts/${item.id}`} className="font-medium hover:underline">
            {label}
          </Link>
        );
      },
      enableSorting: false,
    },
    {
      id: 'type',
      accessorFn: (row) => row.type.name,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.type')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-sm">{row.original.type.name}</span>,
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.status')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-sm">{t(`statuses.${row.getValue('status')}`)}</span>,
    },
    {
      accessorKey: 'startDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.startDate')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDateOrDash(row.getValue('startDate'))}</span>,
    },
    {
      accessorKey: 'endDate',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.endDate')} onSort={options.onSort} />,
      cell: ({ row }) => <span className="text-muted-foreground text-sm">{formatDateOrDash(row.getValue('endDate'))}</span>,
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
            <DropdownMenuContent align="end" className="w-44">
              {item.id && item.status === ContractStatus.Draft && (
                <DropdownMenuItem asChild>
                  <Link href={`/app/admin/contracts/${item.id}`}>
                    <Pencil />
                    {t('actions.edit')}
                  </Link>
                </DropdownMenuItem>
              )}
              {item.id && item.status !== ContractStatus.Draft && (
                <DropdownMenuItem asChild>
                  <Link href={`/app/admin/contracts/${item.id}`}>
                    <Pencil />
                    {t('actions.view')}
                  </Link>
                </DropdownMenuItem>
              )}
              {item.status === ContractStatus.Draft && (
                <DropdownMenuItem onClick={() => options.onSend?.(item)}>
                  <Send />
                  {t('actions.send')}
                </DropdownMenuItem>
              )}
              {item.status === ContractStatus.Signed && (
                <DropdownMenuItem onClick={() => options.onOpenDocument?.(item)}>
                  <FileText />
                  {t('actions.openDocument')}
                </DropdownMenuItem>
              )}
              {item.status === ContractStatus.Draft && (
                <DropdownMenuItem variant="destructive" onClick={() => options.onDelete?.(item)}>
                  <Trash2 />
                  {t('actions.delete')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
