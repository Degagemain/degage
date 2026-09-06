'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Download, RotateCcw, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { TranslationCatalog } from '@/domain/translation-catalog.model';
import { type UILocale, defaultUILocale, uiLocales } from '@/i18n/locales';
import { AdminTablePage } from '@/app/components/ui/data-table';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Badge } from '@/app/components/ui/badge';
import {
  formatTranslationKeyPath,
  getEffectiveTranslationValue,
  getHighlightedTextParts,
  getTranslationSearchValues,
} from './translation-overrides-utils';

interface TranslationOverridesState {
  catalog: TranslationCatalog | null;
  isLoading: boolean;
  error: string | null;
}

const getCurrentLocale = (locale: string): UILocale => (uiLocales.includes(locale as UILocale) ? (locale as UILocale) : defaultUILocale);

const HighlightedValue = ({ value, query }: { value: string; query: string }) => (
  <>
    {getHighlightedTextParts(value, query).map((part, index) =>
      part.isMatch ? (
        <mark key={`${part.text}-${index}`} className="bg-yellow-200 px-0.5 text-inherit">
          {part.text}
        </mark>
      ) : (
        <span key={`${part.text}-${index}`}>{part.text}</span>
      ),
    )}
  </>
);

export default function TranslationOverridesPage() {
  const t = useTranslations('admin.translationOverrides');
  const currentLocale = getCurrentLocale(useLocale());
  const [state, setState] = useState<TranslationOverridesState>({ catalog: null, isLoading: true, error: null });
  const [query, setQuery] = useState('');

  const loadCatalog = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch('/api/translation-overrides');
      if (!response.ok) throw new Error(t('loadError'));
      setState({ catalog: await response.json(), isLoading: false, error: null });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false, error: error instanceof Error ? error.message : t('loadError') }));
    }
  }, [t]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const filteredEntries = useMemo(() => {
    if (!state.catalog) return [];
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return state.catalog.entries;
    return state.catalog.entries.filter((entry) =>
      getTranslationSearchValues(entry).some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [query, state.catalog]);

  const overrideCount = useMemo(() => {
    if (!state.catalog) return 0;
    return state.catalog.entries.reduce(
      (total, entry) => total + state.catalog!.locales.filter((locale) => entry.values[locale].override != null).length,
      0,
    );
  }, [state.catalog]);

  const clearOverrides = async () => {
    if (!window.confirm(t('clearConfirm'))) return;
    try {
      const response = await fetch('/api/translation-overrides?scope=all', { method: 'DELETE' });
      if (!response.ok) throw new Error(t('clearError'));
      await loadCatalog();
      toast.success(t('clearSuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('clearError'));
    }
  };

  if (state.error) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive font-medium">{state.error}</p>
          <Button variant="link" onClick={loadCatalog}>
            {t('tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  const toolbar = (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
      <div className="relative w-full sm:max-w-64">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('searchPlaceholder')}
          className="h-9 pr-3 pl-9"
        />
      </div>
      <Button variant="outline" size="sm" asChild>
        <a href="/api/translation-overrides/patch" download>
          <Download className="size-3.5" />
          {t('downloadPatch')}
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={clearOverrides} disabled={overrideCount === 0}>
        <RotateCcw className="size-3.5" />
        {t('clearAll')}
      </Button>
    </div>
  );

  const tableArea =
    state.isLoading || !state.catalog ? (
      <div className="divide-y">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="grid grid-cols-[minmax(0,45%)_minmax(0,1fr)_6rem] gap-4 px-4 py-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-5 w-20 justify-self-end rounded-full" />
          </div>
        ))}
      </div>
    ) : filteredEntries.length === 0 ? (
      <div className="flex h-40 items-center justify-center px-4 text-center">
        <p className="text-muted-foreground">{t('empty')}</p>
      </div>
    ) : (
      <table className="w-full text-sm">
        <thead className="bg-background sticky top-0 z-10">
          <tr className="border-b">
            <th className="text-muted-foreground w-[45%] px-4 py-3 text-left text-xs font-medium tracking-wide uppercase">
              {t('columns.key')}
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wide uppercase">{t('columns.value')}</th>
            <th className="text-muted-foreground w-24 px-4 py-3 text-right text-xs font-medium tracking-wide uppercase">
              {t('columns.status')}
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.map((entry) => {
            const currentValue = entry.values[currentLocale];
            const hasOverride = state.catalog!.locales.some((locale) => entry.values[locale].override != null);
            const effectiveValue = getEffectiveTranslationValue(entry, currentLocale);
            return (
              <tr key={entry.key} className="hover:bg-muted/40 border-b transition-colors last:border-b-0">
                <td className="px-4 py-3 align-top">
                  <Link
                    href={`/app/admin/translation-overrides/${encodeURIComponent(entry.key)}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {formatTranslationKeyPath(entry.segments)}
                  </Link>
                  <div className="text-muted-foreground mt-1 font-mono text-xs">{entry.key}</div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="line-clamp-3 whitespace-pre-wrap">
                    <HighlightedValue value={effectiveValue} query={query} />
                  </div>
                  {currentValue.override != null && <div className="text-muted-foreground mt-1 text-xs">{t('currentLanguageOverride')}</div>}
                </td>
                <td className="px-4 py-3 text-right align-top">{hasOverride ? <Badge variant="outline">{t('overridden')}</Badge> : null}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );

  return (
    <AdminTablePage
      toolbar={toolbar}
      tableArea={tableArea}
      pagination={
        <div className="text-muted-foreground text-sm">
          {t('resultCount', { count: filteredEntries.length, total: state.catalog?.entries.length ?? 0, overrides: overrideCount })}
        </div>
      }
    />
  );
}
