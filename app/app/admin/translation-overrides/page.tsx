'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Languages, RotateCcw, Save, Search, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { TranslationCatalog } from '@/domain/translation-catalog.model';
import { type UILocale, localeDisplayNames } from '@/i18n/locales';
import { extractTemplateVariables, validateOverrideVariables } from '@/i18n/message-utils';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';

type CatalogEntry = TranslationCatalog['entries'][number];

interface TranslationOverridesState {
  catalog: TranslationCatalog | null;
  isLoading: boolean;
  error: string | null;
}

const fieldId = (key: string, locale: UILocale) => `${locale}:${key}`;

const getSearchableValues = (entry: CatalogEntry) =>
  Object.values(entry.values)
    .flatMap((value) => [value.original, value.override])
    .filter((value): value is string => typeof value === 'string');

export default function TranslationOverridesPage() {
  const t = useTranslations('admin.translationOverrides');
  const [state, setState] = useState<TranslationOverridesState>({ catalog: null, isLoading: true, error: null });
  const [query, setQuery] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const loadCatalog = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch('/api/translation-overrides');
      if (!response.ok) throw new Error(t('loadError'));
      const catalog: TranslationCatalog = await response.json();
      setState({ catalog, isLoading: false, error: null });
      setDrafts(
        Object.fromEntries(
          catalog.entries.flatMap((entry) =>
            catalog.locales.map((locale) => [fieldId(entry.key, locale), entry.values[locale].override ?? ''] as const),
          ),
        ),
      );
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
    return state.catalog.entries.filter((entry) => getSearchableValues(entry).some((value) => value.toLowerCase().includes(normalizedQuery)));
  }, [query, state.catalog]);

  const groupedEntries = useMemo(() => {
    const groups = new Map<string, CatalogEntry[]>();
    filteredEntries.forEach((entry) => {
      const groupName = entry.segments[0] ?? t('rootGroup');
      groups.set(groupName, [...(groups.get(groupName) ?? []), entry]);
    });
    return [...groups.entries()];
  }, [filteredEntries, t]);

  const overrideCount = useMemo(() => {
    if (!state.catalog) return 0;
    return state.catalog.entries.reduce(
      (total, entry) => total + state.catalog!.locales.filter((locale) => entry.values[locale].override != null).length,
      0,
    );
  }, [state.catalog]);

  const updateCatalogValue = (key: string, locale: UILocale, override: string | null, updatedAt: string | null) => {
    setState((prev) => {
      if (!prev.catalog) return prev;
      return {
        ...prev,
        catalog: {
          ...prev.catalog,
          entries: prev.catalog.entries.map((entry) =>
            entry.key === key
              ? {
                  ...entry,
                  values: {
                    ...entry.values,
                    [locale]: {
                      ...entry.values[locale],
                      override,
                      updatedAt,
                    },
                  },
                }
              : entry,
          ),
        },
      };
    });
  };

  const saveOverride = async (entry: CatalogEntry, locale: UILocale) => {
    const id = fieldId(entry.key, locale);
    const value = drafts[id] ?? '';
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await fetch('/api/translation-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: entry.key, locale, value }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.errors?.[0]?.message ?? t('saveError'));
      }
      const saved = await response.json();
      updateCatalogValue(entry.key, locale, saved.value, saved.updatedAt ?? new Date().toISOString());
      toast.success(t('saveSuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('saveError'));
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  const deleteOverride = async (entry: CatalogEntry, locale: UILocale) => {
    const id = fieldId(entry.key, locale);
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      const params = new URLSearchParams({ key: entry.key, locale });
      const response = await fetch(`/api/translation-overrides?${params.toString()}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(t('deleteError'));
      setDrafts((prev) => ({ ...prev, [id]: '' }));
      updateCatalogValue(entry.key, locale, null, null);
      toast.success(t('deleteSuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('deleteError'));
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

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

  const locales = state.catalog?.locales ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
      <div className="bg-card rounded-lg border p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold">
              <Languages className="size-5" />
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">{t('description')}</p>
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

      <div className="min-h-0 flex-1 overflow-auto">
        {state.isLoading || !state.catalog ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : groupedEntries.length === 0 ? (
          <div className="bg-card rounded-lg border p-10 text-center">
            <p className="text-muted-foreground">{t('empty')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedEntries.map(([groupName, entries]) => (
              <section key={groupName} className="space-y-2">
                <div
                  className={
                    'text-muted-foreground bg-background/95 sticky top-0 z-10 py-2 text-xs font-semibold ' +
                    'tracking-wide uppercase backdrop-blur'
                  }
                >
                  {groupName}
                </div>
                {entries.map((entry) => (
                  <div key={entry.key} className="bg-card rounded-lg border p-4 shadow-xs">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {entry.segments.map((segment, index) => (
                        <Badge key={`${entry.key}-${index}`} variant={index === entry.segments.length - 1 ? 'default' : 'secondary'}>
                          {segment}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid gap-3 xl:grid-cols-3">
                      {locales.map((locale) => {
                        const value = entry.values[locale];
                        const id = fieldId(entry.key, locale);
                        const draft = drafts[id] ?? '';
                        const original = value.original ?? '';
                        const invalidVariables = value.original ? validateOverrideVariables(value.original, draft) : [];
                        const hasChanged = draft !== (value.override ?? '');
                        const isBusy = saving[id] === true;
                        const canEdit = value.original != null;
                        return (
                          <div key={locale} className="rounded-md border p-3">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold">{localeDisplayNames[locale]}</span>
                              {value.override != null && <Badge variant="outline">{t('overridden')}</Badge>}
                            </div>
                            <div className="space-y-2">
                              <div>
                                <div className="text-muted-foreground mb-1 text-xs font-medium">{t('original')}</div>
                                <div className="bg-muted/50 min-h-16 rounded-md p-2 text-sm whitespace-pre-wrap">
                                  {original || t('missingOriginal')}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs font-medium">
                                  <span>{t('override')}</span>
                                  {value.variables.length > 0 && <span>{t('variables', { variables: value.variables.join(', ') })}</span>}
                                </div>
                                <Textarea
                                  value={draft}
                                  onChange={(event) =>
                                    setDrafts((prev) => ({
                                      ...prev,
                                      [id]: event.target.value,
                                    }))
                                  }
                                  placeholder={t('overridePlaceholder')}
                                  disabled={!canEdit || isBusy}
                                  aria-invalid={invalidVariables.length > 0}
                                  className="min-h-24 resize-y"
                                />
                                {extractTemplateVariables(draft).length > 0 && invalidVariables.length === 0 && (
                                  <p className="text-muted-foreground mt-1 text-xs">
                                    {t('draftVariables', { variables: extractTemplateVariables(draft).join(', ') })}
                                  </p>
                                )}
                                {invalidVariables.length > 0 && (
                                  <p className="text-destructive mt-1 text-xs">
                                    {t('invalidVariables', { variables: invalidVariables.join(', ') })}
                                  </p>
                                )}
                              </div>
                              <div className="flex justify-end gap-2">
                                {value.override != null && (
                                  <Button size="sm" variant="ghost" onClick={() => deleteOverride(entry, locale)} disabled={isBusy}>
                                    <Trash2 className="size-4" />
                                    {t('removeOverride')}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => saveOverride(entry, locale)}
                                  disabled={!canEdit || !hasChanged || invalidVariables.length > 0 || isBusy}
                                >
                                  <Save className="size-4" />
                                  {value.override == null ? t('createOverride') : t('saveOverride')}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
