'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SortingState, VisibilityState, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { BookOpen, Check, Database, FileText, Loader2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

import type { Documentation } from '@/domain/documentation.model';
import { documentationFormatValues, documentationSourceValues } from '@/domain/documentation.model';
import { Page } from '@/domain/page.model';
import { type UILocale, defaultContentLocale, defaultUILocale, getContentLocale, uiLocales } from '@/i18n/locales';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Button } from '@/app/components/ui/button';
import {
  DataTable,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableToolbar,
  type FacetedFilterOption,
} from '@/app/components/ui/data-table';
import { createColumns } from './columns';

const DEFAULT_PAGE_SIZE = 20;

interface DocState {
  data: Documentation[];
  total: number;
  isLoading: boolean;
  error: string | null;
}

const SORT_COLUMN_MAP: Record<string, string> = {
  externalId: 'externalId',
  source: 'source',
  isFaq: 'isFaq',
  updatedAt: 'updatedAt',
};

export default function DocumentationAdminPage() {
  const t = useTranslations('admin.documentation');
  const uiLocale = useLocale();
  const contentLocale = useMemo(() => {
    const l = uiLocales.includes(uiLocale as UILocale) ? (uiLocale as UILocale) : defaultUILocale;
    return getContentLocale(l);
  }, [uiLocale]);

  const getTitle = useCallback(
    (doc: Documentation) =>
      doc.translations.find((tr) => tr.locale === contentLocale)?.title ??
      doc.translations.find((tr) => tr.locale === defaultContentLocale)?.title ??
      doc.translations[0]?.title ??
      doc.externalId,
    [contentLocale],
  );

  const [state, setState] = useState<DocState>({
    data: [],
    total: 0,
    isLoading: true,
    error: null,
  });

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'updatedAt', desc: true }]);
  const [isFaqFilter, setIsFaqFilter] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [formatFilter, setFormatFilter] = useState<string[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    externalId: false,
  });
  const [isSyncingEmbeddings, setIsSyncingEmbeddings] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPageIndex(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSort = useCallback((columnId: string, desc: boolean) => {
    setSorting([{ id: columnId, desc }]);
    setPageIndex(0);
  }, []);

  const handleIsFaqFilterChange = useCallback((values: string[]) => {
    setIsFaqFilter(values);
    setPageIndex(0);
  }, []);

  const handleSourceFilterChange = useCallback((values: string[]) => {
    setSourceFilter(values);
    setPageIndex(0);
  }, []);

  const handleFormatFilterChange = useCallback((values: string[]) => {
    setFormatFilter(values);
    setPageIndex(0);
  }, []);

  const fetchDocs = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('query', debouncedQuery);
      if (isFaqFilter.length === 1) params.set('isFaq', isFaqFilter[0]!);
      for (const s of sourceFilter) {
        params.append('source', s);
      }
      for (const fmt of formatFilter) {
        params.append('format', fmt);
      }
      params.set('skip', String(pageIndex * pageSize));
      params.set('take', String(pageSize));
      if (sorting.length > 0) {
        const sortColumn = SORT_COLUMN_MAP[sorting[0].id];
        if (sortColumn) {
          params.set('sortBy', sortColumn);
          params.set('sortOrder', sorting[0].desc ? 'desc' : 'asc');
        }
      }
      const response = await fetch(`/api/documentation?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication required');
        if (response.status === 403) throw new Error('Access denied');
        throw new Error('Failed to fetch documentation');
      }
      const result: Page<Documentation> = await response.json();
      setState({ data: result.records, total: result.total, isLoading: false, error: null });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [debouncedQuery, isFaqFilter, sourceFilter, formatFilter, pageIndex, pageSize, sorting]);

  const handleEmbeddingSync = useCallback(async () => {
    setIsSyncingEmbeddings(true);
    try {
      const response = await fetch('/api/documentation/embeddings', { method: 'POST' });
      if (!response.ok) {
        if (response.status === 401) throw new Error('Authentication required');
        if (response.status === 403) throw new Error('Access denied');
        throw new Error('Embedding sync failed');
      }

      const result: {
        totalDocumentation: number;
        updatedDocumentation: number;
        skippedDocumentation: number;
        failedDocumentation: number;
      } = await response.json();

      toast.success(
        t('embeddings.syncSuccess', {
          total: result.totalDocumentation,
          updated: result.updatedDocumentation,
          skipped: result.skippedDocumentation,
          failed: result.failedDocumentation,
        }),
      );
      await fetchDocs();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('embeddings.syncError'));
    } finally {
      setIsSyncingEmbeddings(false);
    }
  }, [fetchDocs, t]);

  useEffect(() => {
    void fetchDocs();
  }, [fetchDocs]);

  const columns = useMemo(
    () =>
      createColumns({
        t,
        getTitle,
        onSort: handleSort,
      }),
    [t, getTitle, handleSort],
  );

  const columnLabels = useMemo(
    () => ({
      externalId: t('columns.externalId'),
      title: t('columns.title'),
      source: t('columns.source'),
      isFaq: t('columns.isFaq'),
      tags: t('columns.tags'),
      audienceRoles: t('columns.roles'),
      format: t('columns.format'),
      updatedAt: t('columns.updated'),
    }),
    [t],
  );

  const isFaqOptions: FacetedFilterOption[] = useMemo(
    () => [
      { value: 'true', label: t('yes'), icon: Check },
      { value: 'false', label: t('no'), icon: X },
    ],
    [t],
  );

  const sourceOptions: FacetedFilterOption[] = useMemo(() => {
    const icons = { repository: Database, notion: BookOpen, manual: FileText } as const;
    const labelKey = {
      repository: 'filters.sourceRepository',
      notion: 'filters.sourceNotion',
      manual: 'filters.sourceManual',
    } as const;
    return documentationSourceValues.map((src) => ({
      value: src,
      label: t(labelKey[src]),
      icon: icons[src],
    }));
  }, [t]);

  const formatOptions: FacetedFilterOption[] = useMemo(() => {
    const labelKey = { markdown: 'filters.formatMarkdown', text: 'filters.formatText' } as const;
    return documentationFormatValues.map((fmt) => ({
      value: fmt,
      label: t(labelKey[fmt]),
    }));
  }, [t]);

  const table = useReactTable({
    data: state.data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(state.total / pageSize),
    state: { sorting, columnVisibility },
  });

  if (state.error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{state.error}</p>
          <button type="button" onClick={() => void fetchDocs()} className="text-muted-foreground mt-2 text-sm underline hover:no-underline">
            {t('tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const filterSlot = (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 shrink-0 gap-1.5"
        onClick={() => void handleEmbeddingSync()}
        disabled={isSyncingEmbeddings}
        title={t('embeddings.syncTitle')}
        aria-busy={isSyncingEmbeddings}
      >
        {isSyncingEmbeddings ? (
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="size-4 shrink-0" aria-hidden />
        )}
        <span className="max-w-[10ch] truncate">{isSyncingEmbeddings ? t('embeddings.syncing') : t('embeddings.sync')}</span>
      </Button>
      <DataTableFacetedFilter
        title={t('filters.isFaq')}
        options={isFaqOptions}
        selectedValues={isFaqFilter}
        onSelectedChange={handleIsFaqFilterChange}
      />
      <DataTableFacetedFilter
        title={t('filters.source')}
        options={sourceOptions}
        selectedValues={sourceFilter}
        onSelectedChange={handleSourceFilterChange}
      />
      <DataTableFacetedFilter
        title={t('filters.format')}
        options={formatOptions}
        selectedValues={formatFilter}
        onSelectedChange={handleFormatFilterChange}
      />
    </>
  );

  return (
    <div className="flex flex-col gap-3 pt-2 pb-3 md:pt-3 md:pb-4">
      <div className="px-3 md:px-4">
        <DataTableToolbar
          table={table}
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder={t('searchPlaceholder')}
          filterSlot={filterSlot}
          columnLabels={columnLabels}
        />
      </div>

      {state.isLoading ? (
        <div className="border-y">
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <DataTable table={table} columns={columns} />
          <div className="px-3 md:px-4">
            <DataTablePagination
              pageIndex={pageIndex}
              pageSize={pageSize}
              pageCount={Math.ceil(state.total / pageSize)}
              totalItems={state.total}
              selectedCount={0}
              onPageChange={setPageIndex}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPageIndex(0);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
