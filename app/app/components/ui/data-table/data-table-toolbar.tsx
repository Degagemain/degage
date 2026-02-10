'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Table } from '@tanstack/react-table';
import { Search, X } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterSlot?: React.ReactNode;
  /** Optional map of column id -> display label for the column picker */
  columnLabels?: Record<string, string>;
  /** Slot for action buttons (shown after view options) */
  actionSlot?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filterSlot,
  columnLabels,
  actionSlot,
}: DataTableToolbarProps<TData>) {
  const t = useTranslations('dataTable.toolbar');
  const isFiltered = searchValue.length > 0;
  const placeholder = searchPlaceholder ?? t('searchPlaceholder');

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
      <div className="relative w-full sm:max-w-64">
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
      {filterSlot}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <DataTableViewOptions table={table} columnLabels={columnLabels} />
        {actionSlot}
      </div>
    </div>
  );
}
