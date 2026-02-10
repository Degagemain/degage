'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Table } from '@tanstack/react-table';
import { Search, X } from 'lucide-react';

import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Separator } from '@/app/components/ui/separator';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterSlot?: React.ReactNode;
  /** Optional map of column id -> display label for the column picker */
  columnLabels?: Record<string, string>;
  /** Total number of items (shown as badge next to title) */
  totalItems?: number;
  /** Label for the current sort (e.g. "Last updated") */
  sortingLabel?: string;
  /** Label prefix for sorting indicator */
  sortedByLabel?: string;
  /** Slot for action buttons (shown after view options) */
  actionSlot?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filterSlot,
  columnLabels,
  totalItems,
  sortingLabel,
  sortedByLabel,
  actionSlot,
}: DataTableToolbarProps<TData>) {
  const t = useTranslations('dataTable.toolbar');
  const isFiltered = searchValue.length > 0;
  const placeholder = searchPlaceholder ?? t('searchPlaceholder');

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Title + search + actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {totalItems !== undefined && (
            <Badge variant="secondary" className="rounded-md px-2 font-normal tabular-nums">
              {totalItems}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input placeholder={placeholder} value={searchValue} onChange={(e) => onSearchChange(e.target.value)} className="h-9 pr-9 pl-9" />
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
                onClick={() => onSearchChange('')}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">{t('clearSearch')}</span>
              </Button>
            )}
          </div>
          <DataTableViewOptions table={table} columnLabels={columnLabels} />
          {actionSlot}
        </div>
      </div>

      {/* Row 2: Sorting indicator + filters */}
      {(sortingLabel || filterSlot) && (
        <div className="flex items-center gap-2">
          {sortingLabel && (
            <>
              <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground/70">{sortedByLabel ?? t('sortedBy')}</span>
                <span className="text-foreground font-medium">{sortingLabel}</span>
              </span>
              {filterSlot && <Separator orientation="vertical" className="mx-1 h-4" />}
            </>
          )}
          {filterSlot}
        </div>
      )}
    </div>
  );
}
