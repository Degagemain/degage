'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Table } from '@tanstack/react-table';
import { Columns3, Search } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { getHighlightedTextParts } from '@/app/lib/highlight-text';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  /** Optional map of column id -> display label (e.g. translated column names) */
  columnLabels?: Record<string, string>;
}

const HighlightedLabel = ({ value, query }: { value: string; query: string }) => (
  <span>
    {getHighlightedTextParts(value, query).map((part, index) =>
      part.isMatch ? (
        <span key={`${part.text}-${index}`} className="bg-yellow-200 text-inherit dark:bg-yellow-800/70">
          {part.text}
        </span>
      ) : (
        <span key={`${part.text}-${index}`}>{part.text}</span>
      ),
    )}
  </span>
);

export function DataTableViewOptions<TData>({ table, columnLabels }: DataTableViewOptionsProps<TData>) {
  const t = useTranslations('dataTable.viewOptions');
  const tToolbar = useTranslations('dataTable.toolbar');
  const tFaceted = useTranslations('dataTable.facetedFilter');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const columns = useMemo(
    () =>
      table
        .getAllColumns()
        .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
        .map((column) => ({
          column,
          label: columnLabels?.[column.id] ?? column.id,
        })),
    [table, columnLabels],
  );

  const filteredColumns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return columns;
    return columns.filter(({ label }) => label.toLowerCase().includes(normalizedQuery));
  }, [columns, query]);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery('');
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-9 shrink-0">
          <Columns3 className="mr-2 h-4 w-4" />
          {t('columns')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('toggleColumns')}</DropdownMenuLabel>
        <div className="px-2 pb-2" onKeyDown={(event) => event.stopPropagation()}>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={tToolbar('searchPlaceholder')}
              className="h-8 pl-7"
              autoFocus
            />
          </div>
        </div>
        <DropdownMenuSeparator />
        {filteredColumns.length === 0 ? (
          <div className="text-muted-foreground px-2 py-1.5 text-sm">{tFaceted('noResults')}</div>
        ) : (
          filteredColumns.map(({ column, label }) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
              onSelect={(event) => event.preventDefault()}
            >
              {query.trim() ? <HighlightedLabel value={label} query={query} /> : label}
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
