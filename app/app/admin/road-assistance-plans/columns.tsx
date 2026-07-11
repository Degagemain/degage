'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/app/components/ui/checkbox';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { Check, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { RoadAssistancePlan } from '@/domain/road-assistance-plan.model';

interface ColumnOptions {
  onSort?: (columnId: string, desc: boolean) => void;
  onDelete?: (item: RoadAssistancePlan) => void;
  t: (key: string) => string;
}

export const createColumns = (options: ColumnOptions): ColumnDef<RoadAssistancePlan>[] => {
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
        const item = row.original;
        if (!item.id) {
          return <span className="font-medium">{row.getValue('name')}</span>;
        }
        return (
          <Link href={`/app/admin/road-assistance-plans/${item.id}`} className="font-medium hover:underline">
            {row.getValue('name')}
          </Link>
        );
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.description')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const description = row.getValue('description') as string;
        return <span className="text-muted-foreground line-clamp-2 text-sm">{description || '—'}</span>;
      },
      enableHiding: true,
      enableSorting: false,
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.active')} onSort={options.onSort} />,
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return isActive ? <Check className="text-primary size-4" aria-label={t('active')} /> : <span className="text-muted-foreground">—</span>;
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
                  <Link href={`/app/admin/road-assistance-plans/${item.id}`}>
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
