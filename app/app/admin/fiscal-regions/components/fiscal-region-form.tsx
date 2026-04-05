'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { FiscalRegion } from '@/domain/fiscal-region.model';
import { ContentLocale, contentLocales, defaultContentLocale } from '@/i18n/locales';
import { FieldGroup } from '@/app/components/ui/field';
import { AdminSwitchFieldControl } from '@/app/components/form/admin-switch-field-control';
import { AdminTextFieldControl } from '@/app/components/form/admin-text-field-control';
import { AdminTranslatedStringField } from '@/app/components/form/admin-translated-string-field';
import { emptyContentLocaleRecord } from '@/app/components/form/empty-content-locale-record';

export const FISCAL_REGION_FORM_ID = 'fiscal-region-editor-form';

interface FiscalRegionFormProps {
  initialFiscalRegion?: FiscalRegion;
  formId?: string;
  isSubmitting?: boolean;
  onSubmit: (fiscalRegion: FiscalRegion) => Promise<void>;
}

interface FiscalRegionFormValues {
  code: string;
  isDefault: boolean;
  translations: Record<ContentLocale, string>;
}

const getInitialState = (fiscalRegion?: FiscalRegion): FiscalRegionFormValues => {
  const translations = emptyContentLocaleRecord();
  if (fiscalRegion?.translations) {
    for (const translation of fiscalRegion.translations) {
      if (translation.locale in translations) {
        translations[translation.locale as ContentLocale] = translation.name ?? '';
      }
    }
  }
  return {
    code: fiscalRegion?.code ?? '',
    isDefault: fiscalRegion?.isDefault ?? false,
    translations,
  };
};

const createFiscalRegionFormSchema = (tCommon: (key: string) => string) =>
  z.object({
    code: z.string().trim().min(1, tCommon('validation.required')).max(50),
    isDefault: z.boolean(),
    translations: z.object({
      en: z.string().trim().min(1, tCommon('validation.required')),
      nl: z.string().trim().min(1, tCommon('validation.required')),
      fr: z.string().trim().min(1, tCommon('validation.required')),
    }),
  });

export function FiscalRegionForm({
  initialFiscalRegion,
  formId = FISCAL_REGION_FORM_ID,
  isSubmitting = false,
  onSubmit,
}: FiscalRegionFormProps) {
  const t = useTranslations('admin.fiscalRegions');
  const tCommon = useTranslations('admin.common');
  const schema = useMemo(() => createFiscalRegionFormSchema(tCommon), [tCommon]);
  const [activeLocale, setActiveLocale] = useState<ContentLocale>(defaultContentLocale);
  const initialState = useMemo(() => getInitialState(initialFiscalRegion), [initialFiscalRegion]);
  const initialStateKey = useMemo(() => JSON.stringify(initialState), [initialState]);
  const lastResetKeyRef = useRef<string | null>(null);

  const form = useForm<FiscalRegionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialState,
  });

  useEffect(() => {
    if (lastResetKeyRef.current === initialStateKey) return;
    form.reset(initialState);
    lastResetKeyRef.current = initialStateKey;
    setActiveLocale(defaultContentLocale);
  }, [form, initialState, initialStateKey]);

  const translationErrors = form.formState.errors.translations;

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: FiscalRegion = {
      id: initialFiscalRegion?.id ?? null,
      code: values.code.trim(),
      name: values.translations[activeLocale].trim(),
      isDefault: values.isDefault,
      translations: contentLocales.map((locale) => ({
        locale,
        name: values.translations[locale].trim(),
      })),
      createdAt: initialFiscalRegion?.createdAt ?? null,
      updatedAt: initialFiscalRegion?.updatedAt ?? null,
    };
    await onSubmit(payload);
  });

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 py-6 md:px-6 md:py-8">
      <FieldGroup className="max-w-2xl gap-6">
        <Controller
          name="code"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminTextFieldControl
              label={t('columns.code')}
              value={field.value}
              onChange={field.onChange}
              placeholder={t('form.placeholders.code')}
              description={t('form.help.code')}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />

        <Controller
          name="isDefault"
          control={form.control}
          render={({ field }) => (
            <AdminSwitchFieldControl
              id="fiscal-region-is-default"
              label={t('columns.default')}
              checked={field.value}
              onChange={field.onChange}
              description={t('form.help.default')}
              disabled={isSubmitting}
            />
          )}
        />

        <AdminTranslatedStringField<FiscalRegionFormValues>
          control={form.control}
          activeLocale={activeLocale}
          onActiveLocaleChange={setActiveLocale}
          label={t('columns.name')}
          getPlaceholder={(locale) => t('form.placeholders.translationName', { locale: locale.toUpperCase() })}
          disabled={isSubmitting}
          errors={translationErrors}
        />
      </FieldGroup>
    </form>
  );
}
