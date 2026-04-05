'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Table } from '@tanstack/react-table';
import { ChevronDown, Search, X } from 'lucide-react';

import { AdminExportDialog, type AdminExportFormat } from '@/app/admin/components/admin-export-dialog';
import { Button } from '@/app/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { Input } from '@/app/components/ui/input';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  /** Slot rendered to the left of the search input */
  leadingSlot?: React.ReactNode;
  filterSlot?: React.ReactNode;
  /** Rendered after facet filters, before view options (e.g. “More” menu). */
  postFilterSlot?: React.ReactNode;
  exportEndpoint?: string;
  exportFormatParamName?: string;
  /** Optional map of column id -> display label for the column picker */
  columnLabels?: Record<string, string>;
  /** Slot for action buttons (shown after view options) */
  actionSlot?: React.ReactNode;
  showSearch?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  leadingSlot,
  filterSlot,
  postFilterSlot,
  exportEndpoint,
  exportFormatParamName = 'exportFormat',
  columnLabels,
  actionSlot,
  showSearch = true,
}: DataTableToolbarProps<TData>) {
  const t = useTranslations('dataTable.toolbar');
  const tExport = useTranslations('admin.common.export');
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const isFiltered = searchValue.length > 0;
  const placeholder = searchPlaceholder ?? t('searchPlaceholder');
  const buildExportUrl = React.useCallback(
    (format: AdminExportFormat) => {
      if (!exportEndpoint) return '';
      const params = new URLSearchParams(window.location.search);
      params.delete('skip');
      params.delete('take');
      params.set(exportFormatParamName, format);
      return `${exportEndpoint}?${params.toString()}`;
    },
    [exportEndpoint, exportFormatParamName],
  );

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
      {leadingSlot}
      {showSearch ? (
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
      ) : null}
      {filterSlot}
      {exportEndpoint ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {tExport('more')}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>{tExport('openExport')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AdminExportDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen} buildExportUrl={buildExportUrl} />
        </>
      ) : null}
      {postFilterSlot}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <DataTableViewOptions table={table} columnLabels={columnLabels} />
        {actionSlot}
      </div>
    </div>
  );
}
