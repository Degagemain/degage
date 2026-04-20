'use client';

import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';

import { Check, Eye, MoreHorizontal } from 'lucide-react';

import type { Documentation, DocumentationAudienceRole } from '@/domain/documentation.model';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { DataTableColumnHeader } from '@/app/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';

export type DocumentationColumnsCtx = {
  t: (key: string) => string;
  getTitle: (doc: Documentation) => string;
  onSort: (columnId: string, desc: boolean) => void;
};

export const createColumns = (ctx: DocumentationColumnsCtx): ColumnDef<Documentation>[] => {
  const { t, getTitle, onSort } = ctx;

  return [
    {
      accessorKey: 'externalId',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.externalId')} onSort={onSort} />,
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.externalId}</span>,
    },
    {
      id: 'title',
      accessorFn: (row) => getTitle(row),
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.title')} />,
      cell: ({ row }) => (
        <Link
          href={`/app/docs/${encodeURIComponent(row.original.externalId)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary block max-w-[200px] truncate hover:underline"
        >
          {getTitle(row.original)}
        </Link>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'source',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.source')} onSort={onSort} />,
    },
    {
      accessorKey: 'isFaq',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.isFaq')} onSort={onSort} />,
      cell: ({ row }) =>
        row.original.isFaq ? <Check className="text-primary size-4" aria-label={t('yes')} /> : <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: 'tags',
      header: t('columns.tags'),
      cell: ({ row }) => (
        <div className="flex max-w-[180px] flex-wrap gap-1">
          {row.original.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] font-normal">
              {tag}
            </Badge>
          ))}
          {row.original.tags.length > 3 ? <span className="text-muted-foreground text-xs">+{row.original.tags.length - 3}</span> : null}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'audienceRoles',
      header: t('columns.roles'),
      cell: ({ row }) => {
        const roles = row.original.audienceRoles;
        if (roles.length === 0) {
          return <span className="text-muted-foreground">—</span>;
        }
        return (
          <div className="flex max-w-[220px] flex-wrap gap-1">
            {roles.map((role: DocumentationAudienceRole) => (
              <Badge key={role} variant="outline" className="text-[10px] font-normal">
                {t(`columns.audienceRole.${role}`)}
              </Badge>
            ))}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'format',
      header: t('columns.format'),
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.updated')} onSort={onSort} />,
      cell: ({ row }) => {
        const d = row.original.updatedAt;
        if (!d) return '—';
        const date = typeof d === 'string' ? new Date(d) : d;
        return date.toLocaleDateString();
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const doc = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs">
                <span className="sr-only">{t('actions.openMenu')}</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem asChild>
                <Link href={`/app/docs/${encodeURIComponent(doc.externalId)}`} target="_blank" rel="noopener noreferrer">
                  <Eye />
                  {t('actions.view')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
