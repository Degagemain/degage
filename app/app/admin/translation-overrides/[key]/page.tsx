'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

import { TranslationCatalog } from '@/domain/translation-catalog.model';
import { ContentLocale, contentLocales, defaultContentLocale, uiLocales } from '@/i18n/locales';
import { validateOverrideVariables } from '@/i18n/message-utils';
import { Button } from '@/app/components/ui/button';
import { Skeleton } from '@/app/components/ui/skeleton';
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/app/components/ui/field';
import { Textarea } from '@/app/components/ui/textarea';
import { AdminLocaleTabsControl } from '@/app/components/form/admin-locale-tabs-control';
import { emptyContentLocaleRecord } from '@/app/components/form/empty-content-locale-record';
import { type TranslationCatalogEntry, formatTranslationKeyPath } from '../translation-overrides-utils';
import { AdminPageToolbar } from '@/app/admin/components/admin-page-toolbar';

const TRANSLATION_OVERRIDE_FORM_ID = 'translation-override-editor-form';

interface DetailState {
  catalog: TranslationCatalog | null;
  isLoading: boolean;
  error: string | null;
}

interface TranslationOverrideFormValues {
  translations: Record<ContentLocale, string>;
}

const getActiveLocale = (locale: string): ContentLocale =>
  uiLocales.includes(locale as ContentLocale) ? (locale as ContentLocale) : defaultContentLocale;

const getInitialTranslations = (entry: TranslationCatalogEntry | null): Record<ContentLocale, string> => {
  const translations = emptyContentLocaleRecord();
  if (!entry) return translations;
  contentLocales.forEach((locale) => {
    translations[locale] = entry.values[locale].override ?? '';
  });
  return translations;
};

export default function TranslationOverrideDetailPage() {
  const t = useTranslations('admin.translationOverrides');
  const params = useParams<{ key: string }>();
  const key = decodeURIComponent(params.key);
  const [activeLocale, setActiveLocale] = useState<ContentLocale>(getActiveLocale(useLocale()));
  const [state, setState] = useState<DetailState>({ catalog: null, isLoading: true, error: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TranslationOverrideFormValues>({
    defaultValues: { translations: emptyContentLocaleRecord() },
  });

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

  const entry = useMemo(() => state.catalog?.entries.find((candidate) => candidate.key === key) ?? null, [key, state.catalog]);

  useEffect(() => {
    form.reset({ translations: getInitialTranslations(entry) });
  }, [entry, form]);

  const translations = form.watch('translations');

  const translationErrors = useMemo(() => {
    if (!entry) return {};
    return Object.fromEntries(
      contentLocales
        .map((locale) => {
          const draft = translations?.[locale] ?? '';
          const original = entry.values[locale].original;
          if (!draft) return [locale, undefined] as const;
          if (original == null) return [locale, { message: t('missingOriginal') }] as const;
          const invalidVariables = validateOverrideVariables(original, draft);
          if (invalidVariables.length === 0) return [locale, undefined] as const;
          return [locale, { message: t('invalidVariables', { variables: invalidVariables.join(', ') }) }] as const;
        })
        .filter(([, error]) => error != null),
    ) as Partial<Record<ContentLocale, { message?: string }>>;
  }, [entry, t, translations]);

  const hasErrors = Object.keys(translationErrors).length > 0;
  const activeOriginal = entry?.values[activeLocale].original ?? '';

  const saveOverrides = form.handleSubmit(async (values) => {
    if (!entry || hasErrors) return;
    setIsSubmitting(true);
    try {
      for (const locale of contentLocales) {
        const value = values.translations[locale] ?? '';
        const existing = entry.values[locale].override ?? '';
        if (value === existing) continue;

        if (value === '') {
          const response = await fetch(`/api/translation-overrides?${new URLSearchParams({ key: entry.key, locale }).toString()}`, {
            method: 'DELETE',
          });
          if (!response.ok) throw new Error(t('deleteError'));
          continue;
        }

        const response = await fetch('/api/translation-overrides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: entry.key, locale, value }),
        });
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.errors?.[0]?.message ?? t('saveError'));
        }
      }
      await loadCatalog();
      toast.success(t('saveSuccess'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('saveError'));
    } finally {
      setIsSubmitting(false);
    }
  });

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
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminPageToolbar>
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/admin/translation-overrides">
            <ArrowLeft className="size-3.5" />
            {t('backToList')}
          </Link>
        </Button>
        <Button
          type="submit"
          form={TRANSLATION_OVERRIDE_FORM_ID}
          disabled={state.isLoading || isSubmitting || !entry || hasErrors}
          variant="outline"
          size="sm"
        >
          <Save className="size-3.5" />
          {isSubmitting ? t('saving') : t('saveOverride')}
        </Button>
      </AdminPageToolbar>

      <div className="min-h-0 flex-1 overflow-auto">
        {state.isLoading ? (
          <div className="space-y-6 px-4 py-6 md:px-6 md:py-8">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !entry ? (
          <div className="flex h-40 items-center justify-center px-4 text-center">
            <p className="text-muted-foreground">{t('notFound')}</p>
          </div>
        ) : (
          <form id={TRANSLATION_OVERRIDE_FORM_ID} onSubmit={saveOverrides} className="px-4 py-6 md:px-6 md:py-8">
            <FieldGroup className="gap-6">
              <div>
                <p className="text-muted-foreground text-sm">{t('detailEyebrow')}</p>
                <h1 className="mt-1 text-xl font-semibold">{formatTranslationKeyPath(entry.segments)}</h1>
                <p className="text-muted-foreground mt-2 font-mono text-xs">{entry.key}</p>
              </div>

              <div>
                <div className="mb-1 text-sm font-medium">{t('original')}</div>
                <p className="text-muted-foreground max-w-2xl text-sm whitespace-pre-wrap">{activeOriginal || t('missingOriginal')}</p>
              </div>

              <Field data-invalid={Boolean(translationErrors[activeLocale])} className="max-w-2xl">
                <FieldContent>
                  <div className="flex items-center justify-between gap-3">
                    <FieldLabel className="mb-0">{t('override')}</FieldLabel>
                    <AdminLocaleTabsControl
                      locales={contentLocales}
                      activeLocale={activeLocale}
                      onLocaleChange={setActiveLocale}
                      errorLocales={contentLocales.filter((locale) => Boolean(translationErrors[locale]))}
                      disabled={isSubmitting}
                    />
                  </div>
                  <Controller
                    name="translations"
                    control={form.control}
                    render={({ field }) => (
                      <Textarea
                        value={field.value?.[activeLocale] ?? ''}
                        onChange={(event) =>
                          field.onChange({
                            ...(field.value ?? emptyContentLocaleRecord()),
                            [activeLocale]: event.target.value,
                          })
                        }
                        placeholder={t('overridePlaceholderForLocale', { locale: activeLocale.toUpperCase() })}
                        aria-invalid={Boolean(translationErrors[activeLocale])}
                        disabled={isSubmitting}
                        rows={4}
                      />
                    )}
                  />
                  <FieldError>{translationErrors[activeLocale]?.message}</FieldError>
                  <FieldDescription>{t('detailHelp')}</FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </form>
        )}
      </div>
    </div>
  );
}
