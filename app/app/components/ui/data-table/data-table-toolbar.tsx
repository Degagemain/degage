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
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterSlot?: React.ReactNode;
  /** Optional map of column id -> display label for the column picker */
  columnLabels?: Record<string, string>;
}

export function DataTableToolbar<TData>({
  table,
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filterSlot,
  columnLabels,
}: DataTableToolbarProps<TData>) {
  const t = useTranslations('dataTable.toolbar');
  const isFiltered = searchValue.length > 0;
  const placeholder = searchPlaceholder ?? t('searchPlaceholder');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-72">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input placeholder={placeholder} value={searchValue} onChange={(e) => onSearchChange(e.target.value)} className="pr-9 pl-9" />
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0"
                onClick={() => onSearchChange('')}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">{t('clearSearch')}</span>
              </Button>
            )}
          </div>
          <DataTableViewOptions table={table} columnLabels={columnLabels} />
        </div>
      </div>
      {filterSlot && <div className="flex items-center gap-2">{filterSlot}</div>}
    </div>
  );
}
