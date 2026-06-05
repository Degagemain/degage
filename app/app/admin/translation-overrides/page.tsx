'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Download, RotateCcw, Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { TranslationCatalog } from '@/domain/translation-catalog.model';
import { type UILocale, defaultUILocale, uiLocales } from '@/i18n/locales';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Badge } from '@/app/components/ui/badge';
import { formatTranslationKeyPath, getEffectiveTranslationValue, getTranslationSearchValues } from './translation-overrides-utils';

interface TranslationOverridesState {
  catalog: TranslationCatalog | null;
  isLoading: boolean;
  error: string | null;
}

const getCurrentLocale = (locale: string): UILocale => (uiLocales.includes(locale as UILocale) ? (locale as UILocale) : defaultUILocale);

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

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
      <div className="bg-card rounded-lg border p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-semibold">{t('title')}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{t('listDescription')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a href="/api/translation-overrides/patch" download>
                <Download className="size-4" />
                {t('downloadPatch')}
              </a>
            </Button>
            <Button variant="outline" onClick={clearOverrides} disabled={overrideCount === 0}>
              <RotateCcw className="size-4" />
              {t('clearAll')}
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchPlaceholder')} className="pl-9" />
          </div>
          <div className="text-muted-foreground text-sm">
            {t('resultCount', { count: filteredEntries.length, total: state.catalog?.entries.length ?? 0, overrides: overrideCount })}
          </div>
        </div>
      </div>

      <div className="bg-card min-h-0 flex-1 overflow-auto rounded-lg border shadow-xs">
        {state.isLoading || !state.catalog ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-12 rounded-md" />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-muted-foreground">{t('empty')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/60 sticky top-0 z-10">
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
                      <div className="line-clamp-3 whitespace-pre-wrap">{getEffectiveTranslationValue(entry, currentLocale)}</div>
                      {currentValue.override != null && (
                        <div className="text-muted-foreground mt-1 text-xs">{t('currentLanguageOverride')}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right align-top">
                      {hasOverride ? <Badge variant="outline">{t('overridden')}</Badge> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
